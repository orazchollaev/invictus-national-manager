/**
 * Football itself: the ball moving up the pitch, being lost and won back, the chances
 * that come of it and the set pieces in between.
 *
 * A minute is a few ticks of play. Each tick the side on the ball tries to move it on
 * from where it is — its own third, the middle, the final third — against the side
 * without it, unit against unit: the build-up against the press, midfield against
 * midfield, the attack against the defence. Losing the ball hands it to the other side
 * where it was lost, so a ball given away at the back is a chance against a defence
 * that is not set, and a ball won deep against a side that has pushed up is a counter.
 * Possession, shots and goals are whatever those ticks add up to.
 *
 * What each side does with the ball shades with the game: a side chasing it takes
 * more risks and leaves more space behind, a side protecting a lead stops pressing.
 */
import { clamp, type Rng } from "../rng"
import { LANES, laneAffinity, laneOfSlot, mirror, widthBias } from "./lanes"
import { instructionsOf } from "./matchup"
import type { Lane, MatchEvent, Move, ShotType, Side } from "./types"
import { cardRoll, foul } from "./discipline"
import {
  ASSIST_WEIGHT,
  CROSS_WEIGHT,
  DEFENDER_WEIGHT,
  HEADER_WEIGHT,
  LONG_SHOT_WEIGHT,
  ROLE_WEIGHTS,
  SCORER_WEIGHT,
  finishing,
  keeperAbility,
} from "./strength"
import {
  choose,
  emit,
  goalDiff,
  keeper,
  other,
  score,
  sideOf,
  type Flow,
  type LivePlayer,
  type LiveSide,
  type MatchState,
  type Units,
} from "./state"

// ── Tuning ──────────────────────────────────────────────────────────────────
// Calibrated so two equal sides average about 12.5 shots (a third on target), 1.35
// goals, 5 corners, 11.5 fouls, 1.9 bookings and 1.8 offsides each, and so stronger
// sides win as often as they always have (see __tests__/realism.test.ts).

/** Ticks of play in a minute; a stoppage (a shot, a foul, a set piece) ends the minute. */
const TICKS = 3

/**
 * How much the gap between two units sways each contest. Losing the ball is the most
 * sensitive: a weaker side gives it away far more often, which is where possession
 * comes from; making chances out of it is less so.
 */
const SWAY_LOSE = 0.92
const SWAY_ON = 0.1
const SWAY_KEEP = 0.6
const SWAY_CHANCE = 0.24
const SWAY_BREAK = 0.32

// What can happen in a tick, as weights that share it out between them: for two equal
// sides in the standard set-up each set adds up to one.

/** Out of the back: lose it, move it on, keep it. */
const BUILD_LOSE = 0.075
const BUILD_ON = 0.5
const BUILD_KEEP = 0.425
/** Share of moves out of the back that go long, straight into the final third. */
const LONG_BALL = 0.1
/** In the middle of the pitch. */
const MID_LOSE = 0.15
const MID_ON = 0.42
const MID_KEEP = 0.43
/** In the final third: a chance, a lost ball, the ball played back into midfield, kept. */
const CHANCE = 0.215
const BREAKDOWN = 0.27
const BACK = 0.14
const KEEP = 0.371
const PENALTY = 0.004
const OFFSIDE = 0.07
const OWN_GOAL = 0.005
/** How far the average shooter's finishing sits above the keeper's: xG is for an average pair. */
const FINISHER = 3.5
/** A counter-attack from a ball won in midfield and from one won deep. */
const COUNTER_MID = 0.2
const COUNTER_DEEP = 0.12
/** A side caught on the break stops it with a foul. */
const TACTICAL_FOUL = 0.15

/** Fouls by the side without the ball, per tick, by where the ball is (1–3 for the side on it). */
const FOUL_DEF = [0, 0.055, 0.1, 0.06]
/** Fouls by the side on the ball (a forward's push, a careless challenge). */
const FOUL_ATT = 0.01

/** By level 0–2. */
const PRESS_LOSE = [0.72, 1, 1.38]
const PRESS_MID = [0.88, 1, 1.15]
const PRESS_FOUL = [0.8, 1, 1.3]
const TEMPO_RISK = [0.85, 1, 1.2]
const TEMPO_ON = [0.82, 1, 1.22]
const TEMPO_KEEP = [1.25, 1, 0.8]
/** Offsides against a deep, standard and high line. */
const LINE_OFFSIDE = [0.55, 1, 1.6]

interface ShotProfile {
  /** Share of these shots that are blocked. */
  block: number
  /** Share that hit the target, goals included. */
  target: number
  /** Expected goals: the lowest value and the spread above it. */
  xg: [number, number]
  /** Chance that somebody set it up. */
  assisted: number
}

/** What each kind of shot is, from the share of them that are blocked, saved and scored. */
const SHOT: Record<ShotType, ShotProfile> = {
  long: { block: 0.35, target: 0.22, xg: [0.02, 0.04], assisted: 0.3 },
  box: { block: 0.23, target: 0.34, xg: [0.045, 0.08], assisted: 0.6 },
  close: { block: 0.12, target: 0.47, xg: [0.17, 0.22], assisted: 0.88 },
  header: { block: 0.08, target: 0.3, xg: [0.03, 0.08], assisted: 0.9 },
  "one-on-one": { block: 0.03, target: 0.58, xg: [0.21, 0.17], assisted: 0.85 },
  "free-kick": { block: 0.3, target: 0.3, xg: [0.045, 0.025], assisted: 0 },
  rebound: { block: 0.2, target: 0.45, xg: [0.15, 0.25], assisted: 0 },
}

/** The kinds of shot open play produces, by how the ball was won. */
const OPEN_PLAY: ShotType[] = ["long", "box", "close", "header", "one-on-one"]
const MIX: Record<Flow, number[]> = {
  settled: [0.44, 0.37, 0.06, 0.08, 0.045],
  counter: [0.12, 0.36, 0.2, 0.04, 0.28],
  press: [0.14, 0.44, 0.18, 0.02, 0.22],
}

// ── Reading the game ────────────────────────────────────────────────────────

/**
 * The gap between two units in ability points as a contest edge: about points / scale
 * for a small gap, growing a little faster for a clear one and levelling off for a
 * mismatch, so a few points either way matter less than a real difference in class.
 */
function gap(points: number, scale: number): number {
  const t = Math.tanh(points / (1.4 * scale)) * 1.4
  return t * (1 + 0.6 * Math.abs(t))
}

const unitsOf = (state: MatchState, s: Side): Units =>
  s === "home" ? state.units.home : state.units.away

/** How hard a side is pushing for a goal: above 0 chasing the game, below 0 protecting it. */
export function urgency(state: MatchState, s: Side): number {
  const diff = goalDiff(state, s)
  if (!diff || state.phase === "shootout") return 0
  const t = Math.min(state.minute, 120) / 90
  return clamp(-diff, -2, 2) * (0.2 + 0.8 * t) * 0.7
}

/**
 * How the game state shades a side's play on the ball. Chasing the game it goes forward
 * sooner and keeps the ball less; protecting a lead it sits deep, moves up less and clears
 * its lines, so the side behind has more of the ball.
 */
function shading(push: number) {
  const chase = Math.max(0, push)
  const sit = Math.max(0, -push)
  return { lose: 1 + 0.1 * sit, on: 1 + 0.25 * push, keep: 1 - 0.15 * chase - 0.1 * sit }
}

/** How many players a side commits forward: the more, the more a lost ball hurts it. */
function commitment(state: MatchState, s: Side): number {
  const t = sideOf(state, s).tactics
  const ins = instructionsOf(t)
  return clamp(
    1 +
      0.15 * t.mentality +
      0.12 * (ins.line - 1) +
      0.6 * urgency(state, s) -
      (ins.counter ? 0.15 : 0),
    0.45,
    1.8
  )
}

/** How readily a side breaks when it wins the ball. */
function breakThreat(side: LiveSide): number {
  const t = side.tactics
  return (instructionsOf(t).counter ? 1.6 : 1) * (1 + 0.12 * (t.tempo - 1))
}

/** How hard a side presses right now: its instruction, its legs and the game state. */
function pressing(state: MatchState, s: Side): number {
  const side = sideOf(state, s)
  const legs = 0.7 + 0.3 * (side.freshness / 100)
  // A side protecting a lead drops off; one chasing the game hunts the ball.
  return PRESS_LOSE[side.tactics.pressing] * legs * Math.max(0.5, 1 + 0.3 * urgency(state, s))
}

/** Tired legs give the ball away. */
const fatigue = (side: LiveSide) => 1 + 0.004 * (100 - side.freshness)

const involvement = (p: LivePlayer, lane: Lane) => laneAffinity(laneOfSlot(p.slot), lane)

// ── The minute ──────────────────────────────────────────────────────────────

/** Play the ticks of one minute. */
export function playTicks(state: MatchState, out: MatchEvent[]) {
  for (let t = 0; t < TICKS; t++) if (tick(state, out)) break
}

/** One tick. Returns true when play stopped. */
function tick(state: MatchState, out: MatchEvent[]): boolean {
  const rng = state.rng
  const s = state.ball.side
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  side.possessionMinutes++
  if (!side.outfield.length) {
    lose(state, s, 2)
    return true
  }
  const depth = state.ball.depth

  // Fouls: mostly by the side without the ball, more from a side that presses.
  const r = rng()
  const pFoul =
    FOUL_DEF[depth] * PRESS_FOUL[opp.tactics.pressing] * (state.flow === "settled" ? 1 : 0.6)
  if (r < pFoul) return defendingFoul(state, out, s)
  if (r < pFoul + FOUL_ATT) {
    // The side on the ball fouls: lanes are the defending side's, who are the ones fouled.
    foul(state, out, s, { lane: mirror(state.ball.lane) })
    hand(state, other(s), (4 - depth) as 1 | 2 | 3, "settled")
    return true
  }

  if (depth === 1) return build(state, out, s)
  if (depth === 2) return midfield(state, out, s)
  return finalThird(state, out, s)
}

/** Give the ball to `s` at `depth` (its own point of view). */
function hand(state: MatchState, s: Side, depth: 1 | 2 | 3, flow: Flow, lane?: Lane) {
  const turned = state.ball.side !== s
  state.ball = {
    side: s,
    lane: lane ?? (turned ? mirror(state.ball.lane) : state.ball.lane),
    depth,
  }
  state.flow = flow
}

/** `s` loses the ball at `depth` (its own point of view): the other side has it there. */
function lose(state: MatchState, s: Side, depth: 1 | 2 | 3) {
  hand(state, other(s), (4 - depth) as 1 | 2 | 3, "settled")
}

/** The side without the ball fouls. Near the box that is a free kick worth having. */
function defendingFoul(state: MatchState, out: MatchEvent[], s: Side): boolean {
  const lane = state.ball.lane
  const victim = foul(state, out, other(s), { lane })
  if (state.ball.depth === 3) setPiece(state, out, s, victim)
  else hand(state, s, state.ball.depth, "settled", lane)
  return true
}

/** Playing out from the back against the press. */
function build(state: MatchState, out: MatchEvent[], s: Side): boolean {
  const rng = state.rng
  const side = sideOf(state, s)
  const u = unitsOf(state, s)
  const o = unitsOf(state, other(s))
  const x = gap(u.def + u.mid - o.att - o.mid, 28)
  const tempo = side.tactics.tempo
  const shade = shading(urgency(state, s))
  const pLose =
    BUILD_LOSE *
    Math.exp(-SWAY_LOSE * x) *
    pressing(state, other(s)) *
    TEMPO_RISK[tempo] *
    fatigue(side) *
    shade.lose
  const pOn = BUILD_ON * Math.exp(SWAY_ON * x) * TEMPO_ON[tempo] * shade.on
  const keep = BUILD_KEEP * Math.exp(SWAY_KEEP * x) * TEMPO_KEEP[tempo] * shade.keep
  const r = rng() * (pLose + pOn + keep)
  if (r < pLose) {
    // Caught in possession: the other side has it high up the pitch, the defence open.
    const loser = choose(
      rng,
      side.outfield,
      (p) => (ROLE_WEIGHTS[p.slot][0] + ROLE_WEIGHTS[p.slot][1]) * involvement(p, state.ball.lane)
    )
    state.culprit = loser
    regain(state, other(s))
    hand(state, other(s), 3, "press")
    return false
  }
  if (r < pLose + pOn) {
    const ins = instructionsOf(side.tactics)
    const long =
      LONG_BALL *
      (tempo === 2 ? 1.6 : tempo === 0 ? 0.5 : 1) *
      (ins.counter ? 1.3 : 1) *
      (1 + 0.25 * Math.max(0, urgency(state, s)))
    if (rng() < long) return enter(state, out, s, "settled", true)
    hand(state, s, 2, "settled")
  }
  return false
}

/** The fight for the middle of the pitch. */
function midfield(state: MatchState, out: MatchEvent[], s: Side): boolean {
  const rng = state.rng
  const side = sideOf(state, s)
  const u = unitsOf(state, s)
  const o = unitsOf(state, other(s))
  const x = gap(u.mid - o.mid, 14)
  const tempo = side.tactics.tempo
  const opp = sideOf(state, other(s))
  const shade = shading(urgency(state, s))
  const pLose =
    MID_LOSE *
    Math.exp(-SWAY_LOSE * x) *
    TEMPO_RISK[tempo] *
    PRESS_MID[opp.tactics.pressing] *
    fatigue(side) *
    shade.lose
  const pOn = MID_ON * Math.exp(SWAY_ON * x) * TEMPO_ON[tempo] * shade.on
  const keep = MID_KEEP * Math.exp(SWAY_KEEP * x) * TEMPO_KEEP[tempo] * shade.keep
  const r = rng() * (pLose + pOn + keep)
  if (r < pLose) {
    regain(state, other(s))
    const lane = mirror(state.ball.lane)
    if (
      rng() <
      COUNTER_MID * commitment(state, s) * breakThreat(opp) * paceAgainst(state, other(s))
    )
      return breakAway(state, out, other(s), lane)
    hand(state, other(s), 2, "settled", lane)
    return false
  }
  if (r < pLose + pOn) return enter(state, out, s, "settled", false)
  return false
}

/** A counter-attacking side's forwards against the defence they are running at. */
function paceAgainst(state: MatchState, s: Side): number {
  const strength = 1 + 0.4 * Math.tanh((unitsOf(state, s).att - unitsOf(state, other(s)).def) / 20)
  return strength * speedEdge(sideOf(state, s), sideOf(state, other(s)))
}

/** The runners' legs against the back line's: quick forwards beat a slow defence. */
function speedEdge(runners: LiveSide, backs: LiveSide): number {
  const mean = (side: LiveSide, weight: (p: LivePlayer) => number) => {
    let sum = 0
    let total = 0
    for (const p of side.outfield) {
      const w = weight(p)
      sum += w * p.mod.speed
      total += w
    }
    return total ? sum / total : 1
  }
  const run = mean(runners, (p) => SCORER_WEIGHT[p.slot] + 0.1)
  const back = mean(backs, (p) => DEFENDER_WEIGHT[p.slot] + 0.1)
  return clamp(run / back, 0.8, 1.25)
}

/** A defender (or anyone in the way) wins the ball for `s`. */
function regain(state: MatchState, s: Side) {
  const side = sideOf(state, s)
  const lane = mirror(state.ball.lane)
  const winner = choose(
    state.rng,
    side.outfield,
    (p) => DEFENDER_WEIGHT[p.slot] * p.mod.tackle * involvement(p, lane) + 0.05
  )
  if (winner) winner.tackles++
}

/**
 * `s` breaks at speed. The side caught out may stop it with a foul; otherwise the
 * break reaches the final third before the defence is set.
 */
function breakAway(state: MatchState, out: MatchEvent[], s: Side, lane: Lane): boolean {
  const caught = other(s)
  if (state.rng() < TACTICAL_FOUL * (1 - 0.3 * urgency(state, caught))) {
    foul(state, out, caught, { lane, tactical: true })
    hand(state, s, 2, "settled", lane)
    return true
  }
  return enter(state, out, s, "counter", false, lane)
}

/** `s` gets into the final third, unless the flag goes up. */
function enter(
  state: MatchState,
  out: MatchEvent[],
  s: Side,
  flow: Flow,
  direct: boolean,
  lane?: Lane
): boolean {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const into = lane ?? pickLane(state, side, opp)
  hand(state, s, 3, flow, into)
  const line = instructionsOf(opp.tactics).line
  const pOffside =
    OFFSIDE * LINE_OFFSIDE[line] * (flow === "counter" ? 1.35 : 1) * (direct ? 1.6 : 1)
  if (rng() < pOffside) {
    const runner = choose(rng, side.outfield, (p) => SCORER_WEIGHT[p.slot] * involvement(p, into))
    side.stats.offsides++
    emit(state, out, "offside", s, { playerId: runner?.id, lane: into })
    hand(state, other(s), 1, "settled")
    return true
  }
  return false
}

/**
 * The lane an attack comes down. It follows where the side's attacking players are and
 * how wide it is asked to play, and leans towards the flank where the opponent is
 * weakest on the day.
 */
function pickLane(state: MatchState, side: LiveSide, opp: LiveSide): Lane {
  const bias = widthBias(instructionsOf(side.tactics).width)
  const guards = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const defended = mirror(LANES[i])
    let sum = 0
    let weight = 0
    for (const p of opp.outfield) {
      const w = DEFENDER_WEIGHT[p.slot] * involvement(p, defended)
      sum += w * p.eff
      weight += w
    }
    guards[i] = weight ? sum / weight : 0
  }
  const mean = (guards[0] + guards[1] + guards[2]) / 3
  const weights = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const exposure = guards[i] ? clamp(mean / guards[i], 0.85, 1.2) : 1
    weights[i] = side.threat[i] * bias[LANES[i]] * exposure
  }
  return LANES[pickIndex(state.rng, weights)]
}

function pickIndex(rng: Rng, weights: readonly number[]): number {
  let total = 0
  for (const w of weights) total += Math.max(0, w)
  let roll = rng() * total
  for (let i = 0; i < weights.length; i++) {
    roll -= Math.max(0, weights[i])
    if (roll < 0) return i
  }
  return weights.length - 1
}

/** In and around the box: make a chance, lose it, or keep it and go again. */
function finalThird(state: MatchState, out: MatchEvent[], s: Side): boolean {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const flow = state.flow
  const u = unitsOf(state, s)
  const o = unitsOf(state, other(s))
  const open = flow !== "settled"
  // A defence caught out of shape defends like a weaker one; one sitting deep on a lead,
  // with bodies behind the ball, like a stronger one.
  const deep = open ? 0 : Math.max(0, -urgency(state, other(s)))
  const x = gap(u.att - o.def * (open ? 0.9 : 1 + 0.08 * deep), 18)
  const pChance =
    CHANCE *
    Math.exp(SWAY_CHANCE * x) *
    (flow === "counter" ? 1.9 : flow === "press" ? 1.7 : 1) *
    (1 + 0.05 * side.tactics.mentality) *
    (1 + 0.04 * Math.max(0, opp.tactics.mentality)) *
    (1 + 0.15 * urgency(state, s))
  const pPenalty = PENALTY * (1 + 0.5 * x) * Math.sqrt(state.strictness)
  const pBreak = BREAKDOWN * Math.exp(-SWAY_BREAK * x) * (open ? 0.8 : 1)
  // A side on the break has no time to go back or keep it; one in front keeps it more.
  const tempo = side.tactics.tempo
  const pBack = open ? 0 : BACK * TEMPO_KEEP[tempo]
  const keep =
    KEEP *
    Math.exp(SWAY_KEEP * x) *
    TEMPO_KEEP[tempo] *
    (open ? 0.4 : 1) *
    (1 - 0.15 * Math.max(0, urgency(state, s)))
  const lane = state.ball.lane
  const r = rng() * (pChance + pPenalty + pBreak + pBack + keep)
  state.flow = "settled"
  if (r < pChance) {
    // The quality of the chance tops out: a mismatch makes more chances, not impossible ones.
    chance(state, out, s, flow, clamp(x, -1.35, 1.35))
    return true
  }
  if (r < pChance + pPenalty) {
    penaltyAwarded(state, out, s)
    return true
  }
  if (r < pChance + pPenalty + pBreak) {
    const carrier = choose(
      rng,
      side.outfield,
      (p) => (ROLE_WEIGHTS[p.slot][1] + ROLE_WEIGHTS[p.slot][2]) * involvement(p, lane)
    )
    const tackler = choose(
      rng,
      opp.outfield,
      (p) => DEFENDER_WEIGHT[p.slot] * p.mod.tackle * involvement(p, mirror(lane))
    )
    if (tackler) tackler.tackles++
    emit(state, out, "attack", s, { playerId: carrier?.id, otherId: tackler?.id, lane })
    // Some moves end with the ball put out for a corner.
    if (rng() < 0.36) {
      corner(state, out, s)
      return true
    }
    return clearance(state, out, other(s), 1)
  }
  if (r < pChance + pPenalty + pBreak + pBack) hand(state, s, 2, "settled", lane)
  return false
}

/**
 * `s` wins the ball back at `depth` and looks to break against a side that pushed
 * players forward; otherwise it settles into possession.
 */
function clearance(state: MatchState, out: MatchEvent[], s: Side, depth: 1 | 2, push = 1): boolean {
  const lane = mirror(state.ball.lane)
  const side = sideOf(state, s)
  const pCounter =
    (depth === 1 ? COUNTER_DEEP : COUNTER_MID) *
    commitment(state, other(s)) *
    push *
    breakThreat(side) *
    paceAgainst(state, s)
  if (state.rng() < pCounter) return breakAway(state, out, s, lane)
  hand(state, s, depth, "settled", lane)
  return false
}

// ── Chances and shots ───────────────────────────────────────────────────────

function chance(state: MatchState, out: MatchEvent[], s: Side, flow: Flow, x: number) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const lane = state.ball.lane

  if (rng() < OWN_GOAL) {
    ownGoal(state, out, s)
    return
  }

  // What kind of chance: shaped by the move, the lane, the gap in quality and how the
  // defence lines up. A side sitting on a lead packs its box: shots from distance and
  // crosses, few clear chances.
  const w = MIX[flow].slice()
  const block = flow === "settled" ? Math.max(0, -urgency(state, other(s))) : 0
  const wide = lane !== "centre"
  const line = instructionsOf(opp.tactics).line
  const width = instructionsOf(side.tactics).width
  const tempo = side.tactics.tempo
  w[0] *=
    (wide ? 0.8 : 1.2) *
    (1 - 0.35 * x) *
    (tempo === 2 ? 1.15 : tempo === 0 ? 0.85 : 1) *
    (line === 0 ? 1.15 : 1) *
    (1 + block)
  w[2] *= (wide ? 1.3 : 0.8) * (1 + 0.6 * x) * (tempo === 0 ? 1.15 : 1) * (1 - 0.5 * block)
  w[3] *=
    (wide ? 1.6 : 0.5) *
    (width === 2 ? 1.2 : width === 0 ? 0.8 : 1) *
    (line === 0 ? 1.1 : 1) *
    (1 + 0.4 * block)
  w[4] *=
    (wide ? 0.6 : 1.4) *
    (1 + 0.6 * x) *
    (line === 2 ? 1.5 : line === 0 ? 0.6 : 1) *
    (1 - 0.7 * block)
  const type = OPEN_PLAY[pickIndex(rng, w)]

  const shooter = shooterFor(rng, side.outfield, type, lane)
  if (!shooter) return
  const profile = SHOT[type]
  const tempoCost = 1 - 0.05 * (tempo - 1)
  const xg = (profile.xg[0] + rng() * profile.xg[1]) * (1 + 0.15 * x) * tempoCost
  const assister =
    rng() < profile.assisted ? assisterFor(rng, side.outfield, type, lane, shooter) : null
  const move: Move | undefined = flow === "settled" ? undefined : flow
  shoot(state, out, s, shooter, assister, type, xg, lane, move)
}

function shooterFor(
  rng: Rng,
  players: readonly LivePlayer[],
  type: ShotType,
  lane: Lane
): LivePlayer | null {
  if (type === "header")
    return choose(
      rng,
      players,
      (p) =>
        HEADER_WEIGHT[p.slot] * p.mod.header * (p.eff / 70) * (0.5 + 0.5 * involvement(p, "centre"))
    )
  if (type === "long")
    return choose(
      rng,
      players,
      (p) =>
        LONG_SHOT_WEIGHT[p.slot] *
        Math.sqrt(p.mod.score) *
        (p.eff / 70) *
        (0.6 + 0.4 * involvement(p, lane))
    )
  // Tap-ins and loose balls in the six-yard box fall to the one with a goalscorer's
  // instinct, far more than other chances do.
  const instinct = type === "close" || type === "rebound" ? 2 : 1
  // Shots are taken from the middle more than from the flank, so the lane counts half.
  return choose(
    rng,
    players,
    (p) =>
      SCORER_WEIGHT[p.slot] *
      Math.pow(p.mod.score, instinct) *
      (p.eff / 70) *
      (0.5 + 0.5 * involvement(p, lane))
  )
}

function assisterFor(
  rng: Rng,
  players: readonly LivePlayer[],
  type: ShotType,
  lane: Lane,
  shooter: LivePlayer
): LivePlayer | null {
  if (type === "header")
    return choose(
      rng,
      players,
      (p) => CROSS_WEIGHT[p.slot] * p.mod.assist * involvement(p, lane),
      shooter
    )
  if (type === "close")
    return choose(
      rng,
      players,
      (p) => (CROSS_WEIGHT[p.slot] + ASSIST_WEIGHT[p.slot]) * p.mod.assist * involvement(p, lane),
      shooter
    )
  return choose(
    rng,
    players,
    (p) => ASSIST_WEIGHT[p.slot] * p.mod.assist * involvement(p, lane),
    shooter
  )
}

/**
 * A shot: blocked, scored, saved (perhaps parried into somebody's path) or off target.
 * `xg` is its chance of going in for an average finisher against an average keeper;
 * the finisher's and the keeper's quality shade it.
 */
function shoot(
  state: MatchState,
  out: MatchEvent[],
  s: Side,
  shooter: LivePlayer,
  assister: LivePlayer | null,
  type: ShotType,
  xg: number,
  lane: Lane | undefined,
  move: Move | undefined,
  followUp = false
) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const gk = keeper(opp)
  const gkAbility = keeperAbility(gk)
  const profile = SHOT[type]
  side.stats.shots++
  side.stats.xg += xg
  shooter.shots++
  if (assister) assister.keyPasses++
  const tags: { xg: number; shot: ShotType; lane?: Lane; move?: Move } = { xg, shot: type }
  if (lane) tags.lane = lane
  if (move) tags.move = move

  if (rng() < profile.block) {
    const blocker = choose(
      rng,
      opp.outfield,
      (p) => DEFENDER_WEIGHT[p.slot] * p.mod.tackle * (lane ? involvement(p, mirror(lane)) : 1)
    )
    if (blocker) blocker.tackles++
    emit(state, out, "shot-blocked", s, { playerId: shooter.id, otherId: blocker?.id, ...tags })
    const r = rng()
    if (r < 0.45) corner(state, out, s)
    else if (r < 0.68) hand(state, s, 3, "settled")
    else clearance(state, out, other(s), 1)
    return
  }

  const unblocked = 1 - profile.block
  const ff = clamp(1 + (finishing(shooter) - gkAbility - FINISHER) / 90, 0.7, 1.35)
  const pGoal = clamp((xg * ff) / unblocked, 0.005, 0.92)
  if (rng() < pGoal) {
    side.goals++
    side.stats.onTarget++
    shooter.goals++
    shooter.onTarget++
    if (assister) assister.assists++
    if (move === "press" && state.culprit) {
      state.culprit.errors++
      state.culprit.ratingAdj -= 0.6
    }
    emit(state, out, "goal", s, {
      playerId: shooter.id,
      otherId: assister?.id,
      ...tags,
      score: score(state),
    })
    scored(state, s)
    return
  }

  const onTarget = clamp((profile.target / unblocked - pGoal) / (1 - pGoal), 0.05, 0.95)
  if (rng() < onTarget) {
    side.stats.onTarget++
    opp.stats.saves++
    shooter.onTarget++
    if (gk) {
      gk.saves++
      if (xg >= 0.25) gk.ratingAdj += 0.2
    }
    emit(state, out, "shot-saved", s, { playerId: shooter.id, otherId: gk?.id, ...tags })
    const r = rng()
    // A save is not always held: a parry can fall to a forward following in.
    const parry = 0.13 * clamp(1 - (gkAbility - 70) / 60, 0.5, 1.5)
    if (!followUp && r < parry) {
      const rebound = shooterFor(rng, side.outfield, "rebound", lane ?? "centre")
      if (rebound) {
        const reboundXg = SHOT.rebound.xg[0] + rng() * SHOT.rebound.xg[1]
        shoot(state, out, s, rebound, null, "rebound", reboundXg, lane, move, true)
        return
      }
    }
    if (r < parry + 0.27) corner(state, out, s)
    else
      clearance(state, out, other(s), 1, gk && gk.natural === "GK" && gk.mod.unit[0] > 1 ? 1.2 : 1)
    return
  }

  if (xg > 0.04 && rng() < 0.09) emit(state, out, "woodwork", s, { playerId: shooter.id, ...tags })
  else if (xg >= 0.3) {
    shooter.ratingAdj -= 0.25
    emit(state, out, "big-chance-missed", s, { playerId: shooter.id, ...tags })
  } else emit(state, out, "shot-wide", s, { playerId: shooter.id, ...tags })
  hand(state, other(s), 1, "settled")
}

function concede(side: LiveSide) {
  for (const p of side.pitch) if (p.slot === "GK" || DEFENDER_WEIGHT[p.slot] >= 0.7) p.conceded++
}

/** After a goal: the conceding side kicks off, and the celebrations cost time. */
function scored(state: MatchState, s: Side) {
  concede(sideOf(state, other(s)))
  state.lost += 0.6
  state.culprit = null
  hand(state, other(s), 1, "settled", "centre")
}

function ownGoal(state: MatchState, out: MatchEvent[], s: Side) {
  const opp = sideOf(state, other(s))
  const culprit = choose(state.rng, opp.outfield, (p) => DEFENDER_WEIGHT[p.slot])
  if (!culprit) return
  sideOf(state, s).goals++
  culprit.ratingAdj -= 0.8
  emit(state, out, "own-goal", s, { playerId: culprit.id, score: score(state) })
  scored(state, s)
}

// ── Set pieces ──────────────────────────────────────────────────────────────

function setPieceValue(p: LivePlayer): number {
  return p.base * ASSIST_WEIGHT[p.slot] * p.mod.assist
}

function setPieceTaker(side: LiveSide, exclude?: LivePlayer | null): LivePlayer | null {
  const chosen = side.pitch.find((p) => p.id === side.sheet.setPieceTakerId && p !== exclude)
  if (chosen) return chosen
  let best: LivePlayer | null = null
  let bestValue = -1
  for (const p of side.outfield) {
    if (p === exclude) continue
    const v = setPieceValue(p)
    if (v > bestValue) {
      best = p
      bestValue = v
    }
  }
  return best
}

export function penaltyTaker(side: LiveSide): LivePlayer | null {
  const chosen = side.pitch.find((p) => p.id === side.sheet.penaltyTakerId)
  if (chosen) return chosen
  let best: LivePlayer | null = null
  for (const p of side.outfield) if (!best || finishing(p) > finishing(best)) best = p
  return best
}

/** Who wins a ball in the air from a set piece. */
function aerialTarget(rng: Rng, side: LiveSide): LivePlayer | null {
  return choose(rng, side.outfield, (p) => HEADER_WEIGHT[p.slot] * p.mod.header * (p.eff / 70))
}

function corner(state: MatchState, out: MatchEvent[], s: Side) {
  const rng = state.rng
  const side = sideOf(state, s)
  side.stats.corners++
  emit(state, out, "corner", s)
  const lane: Lane = rng() < 0.5 ? "left" : "right"
  hand(state, s, 3, "settled", lane)
  const r = rng()
  if (r < 0.17) {
    const header = aerialTarget(rng, side)
    if (header) {
      const xg = 0.04 + rng() * 0.09
      shoot(
        state,
        out,
        s,
        header,
        setPieceTaker(side, header),
        "header",
        xg,
        undefined,
        "set-piece"
      )
    }
    return
  }
  if (r < 0.21) {
    // The second ball, struck from the edge of the box.
    const striker = shooterFor(rng, side.outfield, "long", "centre")
    if (striker)
      shoot(state, out, s, striker, null, "long", 0.02 + rng() * 0.035, undefined, "set-piece")
    return
  }
  if (r < 0.214) {
    ownGoal(state, out, s)
    return
  }
  // Played short and kept, or cleared, with the centre-backs still upfield.
  if (r < 0.29) return
  clearance(state, out, other(s), rng() < 0.6 ? 1 : 2, 1.25)
}

/** A free kick in range: a shot, a ball into the box, or played short. */
function setPiece(state: MatchState, out: MatchEvent[], s: Side, victim: LivePlayer | null) {
  const rng = state.rng
  const side = sideOf(state, s)
  emit(state, out, "free-kick", s, { playerId: victim?.id })
  const r = rng()
  if (r < 0.16) {
    const taker = setPieceTaker(side)
    if (taker) {
      const skill = clamp(taker.mod.assist, 0.8, 1.5)
      const xg = (SHOT["free-kick"].xg[0] + rng() * SHOT["free-kick"].xg[1]) * skill
      shoot(state, out, s, taker, null, "free-kick", xg, undefined, "set-piece")
    }
    return
  }
  if (r < 0.6) {
    const header = rng() < 0.35 ? aerialTarget(rng, side) : null
    if (header) {
      shoot(
        state,
        out,
        s,
        header,
        setPieceTaker(side, header),
        "header",
        0.03 + rng() * 0.08,
        undefined,
        "set-piece"
      )
      return
    }
    clearance(state, out, other(s), 1, 1.1)
    return
  }
  hand(state, s, 3, "settled")
}

function penaltyAwarded(state: MatchState, out: MatchEvent[], s: Side) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const fouled = choose(rng, side.outfield, (p) => SCORER_WEIGHT[p.slot])
  const culprit = choose(rng, opp.outfield, (p) => DEFENDER_WEIGHT[p.slot])
  state.lost += 1
  emit(state, out, "penalty-awarded", s, { playerId: fouled?.id, otherId: culprit?.id })
  if (culprit) {
    opp.stats.fouls++
    culprit.fouls++
    cardRoll(state, out, other(s), culprit, 0.35, 0.05)
  }
  penalty(state, out, s)
}

function penalty(state: MatchState, out: MatchEvent[], s: Side) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const taker = penaltyTaker(side)
  if (!taker) return
  const gk = keeper(opp)
  side.stats.shots++
  side.stats.xg += 0.76
  taker.shots++
  const nerve = state.setup.bigMatch ? (taker.bigMatch - 10) * 0.006 : 0
  const p = clamp(0.77 + (finishing(taker) - keeperAbility(gk)) / 250 + nerve, 0.6, 0.92)
  if (rng() < p) {
    side.goals++
    side.stats.onTarget++
    taker.goals++
    taker.onTarget++
    emit(state, out, "pen-goal", s, { playerId: taker.id, xg: 0.76, score: score(state) })
    scored(state, s)
    return
  }
  if (rng() < 0.6) {
    side.stats.onTarget++
    opp.stats.saves++
    taker.onTarget++
    taker.ratingAdj -= 0.5
    if (gk) {
      gk.saves++
      gk.ratingAdj += 0.6
    }
    emit(state, out, "pen-saved", s, { playerId: taker.id, otherId: gk?.id, xg: 0.76 })
  } else {
    taker.ratingAdj -= 0.6
    emit(state, out, "pen-miss", s, { playerId: taker.id, xg: 0.76 })
  }
  hand(state, other(s), 1, "settled")
}
