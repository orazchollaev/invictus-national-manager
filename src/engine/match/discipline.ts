/**
 * Fouls, cards and knocks, and the referee who rules on them. Every referee is a little
 * stricter or more lenient than the last; away sides get the benefit of the doubt a
 * little less often; a player already booked steadies himself; a foul that stops a
 * break or a serial offender's next one goes in the book far more often than a
 * clumsy challenge in midfield.
 */
import { clamp } from "../rng"
import { laneAffinity, laneOfSlot, mirror } from "./lanes"
import type { Lane, MatchEvent, Side } from "./types"
import { bestReplacement, bringOn, canChange } from "./changes"
import { DEFENDER_WEIGHT, FOUL_WEIGHT, ROLE_WEIGHTS, assign, rebond } from "./strength"
import {
  choose,
  emit,
  other,
  refreshOutfield,
  sideOf,
  type LivePlayer,
  type MatchState,
} from "./state"

const YELLOW_PER_FOUL = 0.135
const RED_PER_FOUL = 0.0012
/** A foul to stop a break is a booking about half the time. */
const TACTICAL_YELLOW = 0.5
/** Share of fouls that leave the fouled player hurt. */
const INJURY_PER_FOUL = 0.012

/** How strict tonight's referee is with his cards: 1 is average. */
export function refereeStrictness(rng: () => number): number {
  return 0.72 + 0.56 * rng()
}

const involved = (p: LivePlayer, lane: Lane | undefined) =>
  lane ? 0.3 + 0.7 * laneAffinity(laneOfSlot(p.slot), lane) : 1

export interface FoulOptions {
  /** The lane the play is in, from the side with the ball's point of view. */
  lane?: Lane
  /** Fouls to stop a break, which referees book more readily. */
  tactical?: boolean
}

/**
 * A foul by side `s` on the side with the ball. Books the culprit if the referee sees
 * fit and may leave the fouled player hurt. Returns the fouled player.
 */
export function foul(
  state: MatchState,
  out: MatchEvent[],
  s: Side,
  options: FoulOptions = {}
): LivePlayer | null {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const defendLane = options.lane ? mirror(options.lane) : undefined
  const culprit = choose(
    rng,
    side.outfield,
    (p) =>
      FOUL_WEIGHT[p.slot] *
      p.mod.foul *
      (p.temperament / 10) *
      (p.yellow ? 0.55 : 1) *
      involved(p, defendLane)
  )
  if (!culprit) return null
  const victim = choose(
    rng,
    opp.outfield,
    (p) =>
      (ROLE_WEIGHTS[p.slot][2] + 0.5 * ROLE_WEIGHTS[p.slot][1] + 0.2) * involved(p, options.lane)
  )
  side.stats.fouls++
  culprit.fouls++
  emit(state, out, "foul", s, { playerId: culprit.id, otherId: victim?.id })
  const repeat = culprit.fouls >= 3 ? 1.5 : 1
  const late = state.minute >= 75 ? 1.15 : 1
  const yellow =
    (options.tactical ? TACTICAL_YELLOW : YELLOW_PER_FOUL * repeat * late) * venue(state, s)
  cardRoll(state, out, s, culprit, yellow, RED_PER_FOUL)
  if (victim && !victim.injured && rng() < INJURY_PER_FOUL * (victim.injuryProne / 8))
    injure(state, out, other(s), victim)
  return victim
}

/** Home sides are booked a little less often than away ones, when there is a home side. */
function venue(state: MatchState, s: Side): number {
  if (!state.setup.homeAdvantage) return 1
  return s === "home" ? 0.92 : 1.08
}

/** Book a player, or send him off, with the referee's strictness and the player's temper. */
export function cardRoll(
  state: MatchState,
  out: MatchEvent[],
  s: Side,
  p: LivePlayer,
  yellow: number,
  red: number
) {
  const rng = state.rng
  const side = sideOf(state, s)
  const temper = p.temperament / 10
  const strict = state.strictness
  if (rng() < red * temper * strict) {
    sendOff(state, out, s, p, "red")
    return
  }
  if (rng() < clamp(yellow * temper * strict, 0, 0.9)) {
    p.yellow++
    side.stats.yellows++
    p.ratingAdj -= 0.3
    state.lost += 0.25
    if (p.yellow >= 2) sendOff(state, out, s, p, "second-yellow")
    else emit(state, out, "yellow", s, { playerId: p.id })
  }
}

export function sendOff(
  state: MatchState,
  out: MatchEvent[],
  s: Side,
  p: LivePlayer,
  kind: "red" | "second-yellow"
) {
  const side = sideOf(state, s)
  p.sentOff = true
  p.off = state.minute
  p.ratingAdj -= 1.5
  side.stats.reds++
  side.pitch = side.pitch.filter((x) => x !== p)
  rebond(side)
  state.lost += 0.6
  emit(state, out, kind, s, { playerId: p.id })
  // A side that loses its keeper puts an outfielder in goal.
  if (p.slot === "GK" && side.pitch.length) {
    const stand = side.pitch.reduce((a, b) =>
      DEFENDER_WEIGHT[a.slot] > DEFENDER_WEIGHT[b.slot] ? a : b
    )
    assign(stand, "GK", null)
  }
  refreshOutfield(side)
  // The AI coach fills a hole at the back (or in goal) with a defender off the bench.
  if (state.setup.managed !== s && (p.slot === "GK" || DEFENDER_WEIGHT[p.slot] >= 0.7))
    side.refill = p.slot
}

/** Injuries from wear and tear: one roll a side each minute, then who it was. */
export function knocks(state: MatchState, out: MatchEvent[]) {
  knock(state, out, "home")
  knock(state, out, "away")
}

const knockRisk = (p: LivePlayer) => (p.injured ? 0 : p.knock * (p.stamina < 35 ? 1.8 : 1))

function knock(state: MatchState, out: MatchEvent[], s: Side) {
  const side = sideOf(state, s)
  let risk = 0
  for (const p of side.pitch) risk += knockRisk(p)
  if (state.rng() >= risk) return
  const p = choose(state.rng, side.pitch, knockRisk)
  if (p && !p.injured) injure(state, out, s, p)
}

export function injure(state: MatchState, out: MatchEvent[], s: Side, p: LivePlayer) {
  p.injured = true
  state.lost += 0.8
  emit(state, out, "injury", s, { playerId: p.id })
  if (state.setup.managed === s) {
    state.pendingInjuries.push(p.id)
    return
  }
  const side = sideOf(state, s)
  const sub = bestReplacement(side, p.slot)
  if (sub && canChange(state, side)) bringOn(state, s, p, sub, out)
  else {
    // No change left: he limps off and the side plays on a man short.
    p.off = state.minute
    side.pitch = side.pitch.filter((x) => x !== p)
    refreshOutfield(side)
    rebond(side)
  }
}
