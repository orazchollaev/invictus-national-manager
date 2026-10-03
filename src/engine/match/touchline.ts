/**
 * The AI coach: every side the user does not run. He chases a game he is losing late
 * on and protects one he is winning; makes his changes in two or three windows, the
 * way coaches do, taking off the tired, the booked and the poor first; throws on a
 * striker and goes to two up front when he needs a goal; shores up with a defender
 * when he holds a narrow lead late; and fills a hole that a red card leaves at the back.
 */
import type { Position } from "../types"
import { positionFit } from "../players/ability"
import { randInt, type Rng } from "../rng"
import type { Formation, Level, MatchEvent, Mentality, Side } from "./types"
import { bringOn, canChange, changeFormation, maxSubs } from "./changes"
import { FOUL_WEIGHT } from "./strength"
import {
  emit,
  goalDiff,
  sideOf,
  type LivePlayer,
  type LiveSide,
  type MatchState,
  type SubWindow,
} from "./state"

/** The shape a coach goes to when he needs a goal: another forward. */
const CHASE: Partial<Record<Formation, Formation>> = {
  "4-2-3-1": "4-4-2",
  "4-1-4-1": "4-4-2",
  "4-4-1-1": "4-4-2",
  "4-3-3": "4-4-2",
  "5-4-1": "4-4-2",
  "5-3-2": "3-5-2",
  "4-4-2": "3-4-3",
  "4-3-1-2": "3-4-3",
  "3-5-2": "3-4-3",
}
/** The shape he goes to when he wants to see a lead out: another body at the back. */
const PROTECT: Partial<Record<Formation, Formation>> = {
  "4-4-2": "4-1-4-1",
  "4-3-3": "4-1-4-1",
  "4-2-3-1": "5-4-1",
  "4-1-4-1": "5-4-1",
  "4-4-1-1": "5-4-1",
  "3-4-3": "5-4-1",
  "3-5-2": "5-3-2",
  "4-3-1-2": "5-3-2",
}

const FORWARD: ReadonlySet<Position> = new Set(["ST", "AM", "LW", "RW"])
const BACK: ReadonlySet<Position> = new Set(["CB", "DM"])
/** Who makes way for an extra forward: a holding midfielder or a full-back. */
const SPARE: ReadonlySet<Position> = new Set(["DM", "CM", "LB", "RB"])

/** The coach's plan for the second half: how many changes, in which windows. */
export function planChanges(rng: Rng, bench: number, max: number): SubWindow[] {
  const total = Math.min(bench, max, randInt(rng, 3, max))
  if (total <= 0) return []
  const windows = Math.min(total, total >= 4 && rng() < 0.6 ? 3 : 2)
  const minutes =
    windows === 3
      ? [randInt(rng, 56, 66), randInt(rng, 67, 77), randInt(rng, 78, 86)]
      : windows === 2
        ? [randInt(rng, 58, 70), randInt(rng, 73, 85)]
        : [randInt(rng, 62, 80)]
  const plan: SubWindow[] = []
  let left = total
  for (let i = 0; i < windows; i++) {
    const count = Math.ceil(left / (windows - i))
    plan.push({ minute: minutes[i], count })
    left -= count
  }
  return plan
}

/** Every minute the AI side is in play. */
export function aiManage(state: MatchState, s: Side, out: MatchEvent[]) {
  const side = sideOf(state, s)
  shade(state, s, out)
  if (side.refill) refill(state, s, out)
  while (side.plan.length && side.plan[0].minute <= state.minute) {
    const window = side.plan.shift()!
    for (let i = 0; i < window.count && canChange(state, side); i++) change(state, s, out)
  }
}

/** Half-time and the breaks before and during extra time: free changes for the worn out. */
export function aiBreak(state: MatchState, s: Side, out: MatchEvent[]) {
  const side = sideOf(state, s)
  const extra = state.phase !== "half-time"
  const behind = goalDiff(state, s) <= -2
  let made = 0
  for (const p of [...side.outfield]) {
    if (side.subsUsed >= maxSubs(state) || !side.bench.length || made >= 2) break
    const booked = p.yellow > 0 && FOUL_WEIGHT[p.slot] >= 0.8 && p.temperament >= 12
    const spent = extra && p.stamina < 55
    if (!booked && !spent) continue
    const sub = replacement(side, p.slot, 0)
    if (!sub) break
    bringOn(state, s, p, sub, out)
    made++
  }
  // A coach two down at half-time makes a change whatever.
  if (!extra && behind && !made && side.subsUsed < maxSubs(state)) {
    const weakest = weakestOf(side.outfield)
    const sub = weakest && replacement(side, weakest.slot, 1)
    if (weakest && sub) {
      bringOn(state, s, weakest, sub, out)
      made++
    }
  }
  // Changes made now come off the plan for later.
  for (let i = 0; i < made && side.plan.length; i++) {
    const last = side.plan[side.plan.length - 1]
    if (--last.count <= 0) side.plan.pop()
  }
}

/** Chase a game late on; sit on a lead. Returns to the manager's own settings otherwise. */
function shade(state: MatchState, s: Side, out: MatchEvent[]) {
  const side = sideOf(state, s)
  const minute = state.minute
  const diff = goalDiff(state, s)
  const extra = state.phase === "et-first" || state.phase === "et-second"
  let mentality: Mentality = side.baseMentality
  let tempo: Level = side.baseTempo
  let pressing: Level = side.basePressing
  let line: Level = side.baseLine
  if (diff < 0 && (minute >= 60 || extra)) {
    mentality = Math.max(mentality, diff <= -2 || minute >= 75 ? 2 : 1) as Mentality
    if (minute >= 70) {
      tempo = 2
      pressing = 2
    }
  } else if (diff > 0 && (minute >= 70 || extra)) {
    mentality = Math.min(mentality, -1) as Mentality
    if (minute >= 80 && diff === 1) {
      pressing = Math.min(pressing, 0) as Level
      line = Math.min(line, 0) as Level
    }
  }
  const t = side.tactics
  if (
    t.mentality === mentality &&
    t.tempo === tempo &&
    t.pressing === pressing &&
    (t.line ?? 1) === line
  )
    return
  t.mentality = mentality
  t.tempo = tempo
  t.pressing = pressing
  // Sheets that predate the line instruction keep it unset until the coach moves it.
  if (t.line !== undefined || line !== 1) t.line = line
  emit(state, out, "tactics", s)
}

/** How much a player needs taking off: tired, booked, poor, or not the type the game needs. */
function needsOff(state: MatchState, p: LivePlayer, lean: number): number {
  if (p.slot === "GK" || !p.started) return -Infinity
  let v = (100 - p.stamina) / 100
  if (p.injured) v += 2
  if (p.yellow) v += 0.25 * FOUL_WEIGHT[p.slot] * (p.temperament / 10)
  v -= p.ratingAdj * 0.15 + p.goals * 0.2
  v -= (p.base - 70) / 60
  if (lean > 0 && SPARE.has(p.slot)) v += 0.15
  if (lean < 0 && FORWARD.has(p.slot)) v += 0.15
  return v + state.rng() * 0.15
}

/** The player among `players` who most needs taking off. */
function mostNeedsOff(state: MatchState, players: readonly LivePlayer[], lean: number) {
  let leaving: LivePlayer | null = null
  let score = -Infinity
  for (const p of players) {
    const v = needsOff(state, p, lean)
    if (v > score) {
      score = v
      leaving = p
    }
  }
  return leaving
}

/** The bench player for `slot`, leaning to attackers when chasing and defenders when protecting. */
function replacement(side: LiveSide, slot: Position, lean: number): LivePlayer | null {
  let best: LivePlayer | null = null
  let bestValue = -1
  for (const b of side.bench) {
    if (b.natural === "GK" && slot !== "GK") continue
    let v = b.base * positionFit({ pos: b.natural, alt: b.alt }, slot)
    if (lean > 0 && FORWARD.has(b.natural)) v *= 1.06
    if (lean < 0 && BACK.has(b.natural)) v *= 1.06
    if (v > bestValue) {
      best = b
      bestValue = v
    }
  }
  return best
}

function weakestOf(players: readonly LivePlayer[]): LivePlayer | null {
  let worst: LivePlayer | null = null
  for (const p of players) if (p.started && (!worst || p.eff < worst.eff)) worst = p
  return worst
}

/** One change in a window: reshape to chase or protect the game, or like for like. */
function change(state: MatchState, s: Side, out: MatchEvent[]) {
  const side = sideOf(state, s)
  const diff = goalDiff(state, s)
  const minute = state.minute
  const lean = diff < 0 && minute >= 60 ? 1 : diff === 1 && minute >= 75 ? -1 : 0
  const formation = side.tactics.formation

  if (!side.reshaped && lean !== 0) {
    const shape = lean > 0 ? CHASE[formation] : PROTECT[formation]
    const wanted = lean > 0 ? FORWARD : BACK
    const joining = shape ? side.bench.find((b) => wanted.has(b.natural)) : undefined
    const leaving =
      shape && joining
        ? mostNeedsOff(
            state,
            side.outfield.filter((p) => (lean > 0 ? SPARE : FORWARD).has(p.slot)),
            lean
          )
        : null
    if (shape && joining && leaving) {
      side.reshaped = true
      bringOn(state, s, leaving, joining, out)
      changeFormation(state, s, shape)
      emit(state, out, "tactics", s)
      return
    }
  }

  const leaving = mostNeedsOff(state, side.outfield, lean)
  if (!leaving) return
  const joining = replacement(side, leaving.slot, lean)
  if (joining) bringOn(state, s, leaving, joining, out)
}

/** After a red card at the back: a defender on for a forward, or the spare keeper in goal. */
function refill(state: MatchState, s: Side, out: MatchEvent[]) {
  const side = sideOf(state, s)
  const slot = side.refill!
  side.refill = null
  if (state.minute >= 85 || !canChange(state, side)) return
  if (slot === "GK") {
    const standIn = side.pitch.find((p) => p.slot === "GK" && p.natural !== "GK")
    const spare = side.bench.find((b) => b.natural === "GK")
    if (standIn && spare) bringOn(state, s, standIn, spare, out)
    return
  }
  const forwards = side.outfield.filter((p) => FORWARD.has(p.slot))
  if (forwards.length < 2) return
  const leaving = weakestOf(forwards) ?? forwards[0]
  const joining = replacement(side, slot, -1)
  if (joining) bringOn(state, s, leaving, joining, out, slot, null)
}
