/**
 * Everything a coach can change during a match: players, slots, shape, instructions and
 * the half-time talk. The managed side's coach is the user (through these functions);
 * every other side's is the AI in `touchline.ts`, which uses the same ones.
 */
import type { Position } from "../types"
import { positionFit } from "../players/ability"
import type { Role } from "./roles"
import { FORMATIONS } from "./formations"
import type { Formation, MatchEvent, Side, Tactics } from "./types"
import { assign, effective, rebond } from "./strength"
import {
  emit,
  other,
  refreshOutfield,
  sideOf,
  type LivePlayer,
  type LiveSide,
  type MatchState,
} from "./state"

export function maxSubs(state: MatchState): number {
  return state.setup.maxSubs ?? 5
}

/** Stoppages in play a side may use for changes; half-time and the breaks are free. */
export const WINDOWS = 3

/** Whether a side can make a change now without breaking the laws on numbers or windows. */
export function canChange(state: MatchState, side: LiveSide): boolean {
  if (side.subsUsed >= maxSubs(state) || !side.bench.length) return false
  if (!inPlay(state)) return true
  return (
    side.windows < WINDOWS || side.lastChange === `${state.phase}:${state.minute}:${state.added}`
  )
}

/** Whether the ball is in play, so a change now uses one of the side's windows. */
function inPlay(state: MatchState): boolean {
  const p = state.phase
  return p === "first-half" || p === "second-half" || p === "et-first" || p === "et-second"
}

/** The bench player who would do best in `slot`. */
export function bestReplacement(side: LiveSide, slot: Position): LivePlayer | null {
  let best: LivePlayer | null = null
  let bestValue = -1
  for (const b of side.bench) {
    const v = b.base * positionFit({ pos: b.natural, alt: b.alt }, slot)
    if (v > bestValue) {
      best = b
      bestValue = v
    }
  }
  return best
}

/** Swap `leaving` for `joining`, who takes `slot` (the leaving player's, unless told otherwise). */
export function bringOn(
  state: MatchState,
  s: Side,
  leaving: LivePlayer,
  joining: LivePlayer,
  out: MatchEvent[],
  slot: Position = leaving.slot,
  role: Role | null = slot === leaving.slot ? leaving.role : null
): MatchEvent {
  const side = sideOf(state, s)
  side.subsUsed++
  const when = `${state.phase}:${state.minute}:${state.added}`
  if (inPlay(state) && side.lastChange !== when) {
    side.windows++
    state.lost += 0.5
  }
  side.lastChange = when
  leaving.off = state.minute
  assign(joining, slot, role)
  joining.on = state.minute
  joining.started = false
  joining.eff = effective(joining, !!state.setup.bigMatch)
  side.pitch = side.pitch.map((p) => (p === leaving ? joining : p))
  refreshOutfield(side)
  rebond(side)
  side.bench = side.bench.filter((p) => p !== joining)
  side.appeared.push(joining)
  state.pendingInjuries = state.pendingInjuries.filter((id) => id !== leaving.id)
  return emit(state, out, "sub", s, { playerId: joining.id, otherId: leaving.id })
}

/**
 * Bring `inId` on for `outId`, straight into the outgoing player's slot. Returns the
 * event, or null when the change is not allowed (no subs left, player not available).
 */
export function substitute(
  state: MatchState,
  s: Side,
  outId: string,
  inId: string,
  out: MatchEvent[] = []
): MatchEvent | null {
  const side = sideOf(state, s)
  if (side.subsUsed >= maxSubs(state)) return null
  const leaving = side.pitch.find((p) => p.id === outId)
  const joining = side.bench.find((p) => p.id === inId)
  if (!leaving || !joining) return null
  return bringOn(state, s, leaving, joining, out)
}

/** Move a player on the pitch into another role (the manager's drag on the pitch view). */
export function setSlot(state: MatchState, s: Side, playerId: string, slot: Position) {
  const side = sideOf(state, s)
  const p = side.pitch.find((x) => x.id === playerId)
  if (!p) return
  assign(p, slot, null)
  refreshOutfield(side)
}

export function setTactics(state: MatchState, s: Side, tactics: Partial<Tactics>) {
  const side = sideOf(state, s)
  side.tactics = { ...side.tactics, ...tactics }
  if (tactics.mentality !== undefined) side.baseMentality = tactics.mentality
  if (tactics.tempo !== undefined) side.baseTempo = tactics.tempo
  if (tactics.pressing !== undefined) side.basePressing = tactics.pressing
  if (tactics.line !== undefined) side.baseLine = tactics.line
}

/**
 * Switch shape mid-match: the keeper stays in goal and the outfield roles of the new
 * formation go to whoever fits them best. A side down to ten loses its most
 * advanced role first.
 */
export function changeFormation(state: MatchState, s: Side, formation: Formation) {
  const side = sideOf(state, s)
  side.tactics.formation = formation
  const gk = side.pitch.find((p) => p.slot === "GK")
  const outfield = side.pitch.filter((p) => p !== gk)
  const roles = FORMATIONS[formation].filter((r) => r !== "GK").slice(0, outfield.length)
  const free = new Set(outfield)
  for (const role of roles) {
    let best: LivePlayer | null = null
    let bestValue = -1
    for (const p of free) {
      const v = positionFit({ pos: p.natural, alt: p.alt }, role) * p.base
      if (v > bestValue) {
        best = p
        bestValue = v
      }
    }
    if (best) {
      assign(best, role, null)
      free.delete(best)
    }
  }
  refreshOutfield(side)
}

export type TeamTalk = "calm" | "praise" | "demand"

/**
 * The half-time talk. What works depends on the score: praise a side that is
 * ahead, demand more from one that is behind. Hot-headed players can take a
 * rollicking badly. Returns the average change in ability.
 */
export function teamTalk(state: MatchState, s: Side, talk: TeamTalk): number {
  const side = sideOf(state, s)
  const diff = side.goals - sideOf(state, other(s)).goals
  const effect: Record<TeamTalk, number> =
    diff > 0
      ? { praise: 1, calm: 0.6, demand: -0.4 }
      : diff < 0
        ? { praise: -0.5, calm: 0.2, demand: 1.4 }
        : { praise: 0.3, calm: 0.5, demand: 0.8 }
  let total = 0
  const everyone = [...side.pitch, ...side.bench]
  for (const p of everyone) {
    let d = effect[talk]
    if (talk === "demand" && p.temperament <= 6 && state.rng() < 0.35) d = -1
    p.base = Math.max(1, p.base + d)
    total += d
  }
  return everyone.length ? total / everyone.length : 0
}

/** Let an injured managed player carry on (at half strength) rather than replace him. */
export function dismissInjury(state: MatchState, playerId: string) {
  state.pendingInjuries = state.pendingInjuries.filter((id) => id !== playerId)
}
