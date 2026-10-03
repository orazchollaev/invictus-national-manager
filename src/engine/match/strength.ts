/**
 * What each player and each side is worth on the pitch right now. Strength comes from
 * the eleven, not from a team rating: each player contributes to defence, midfield and
 * attack according to the slot he fills, shaded by how well he fits it, how tired he
 * is, what his role and team mates give him, and his nerve on a big night.
 *
 * Each player's strength is worked out once at the start of a minute (`refreshMinute`)
 * and read from there by everything that happens in it.
 */
import type { Position } from "../types"
import { clamp } from "../rng"
import { positionFit } from "../players/ability"
import { BOND_LIMITS } from "../players/bonds"
import { ROLE_SUIT_BONUS, combineStyle, suitsRole, validRole, type Role } from "./roles"
import { playOf } from "./matchup"
import { FORMATION_LIST } from "./formations"
import type { Side, Tactics } from "./types"
import {
  ROLE_WEIGHTS,
  refreshOutfield,
  sideOf,
  other,
  type LivePlayer,
  type LiveSide,
  type MatchState,
  type Units,
} from "./state"

export const HOME_BOOST = 2.5
/** Ability points a tournament host gains in its own tournament, on top of home advantage. */
export const HOST_BOOST = 0.75

export { ROLE_WEIGHTS } from "./state"
/** The same sums for a standard 4-2-3-1, so formations shift strength gently. */
const NORM: [number, number, number] = [4.77, 4.35, 4.34]

export const SCORER_WEIGHT: Record<Position, number> = {
  GK: 0.001,
  CB: 0.07,
  LB: 0.08,
  RB: 0.08,
  DM: 0.12,
  CM: 0.28,
  AM: 0.55,
  LW: 0.65,
  RW: 0.65,
  ST: 1,
}
/** Who tries his luck from distance. */
export const LONG_SHOT_WEIGHT: Record<Position, number> = {
  GK: 0.001,
  CB: 0.1,
  LB: 0.12,
  RB: 0.12,
  DM: 0.4,
  CM: 0.75,
  AM: 1,
  LW: 0.8,
  RW: 0.8,
  ST: 0.6,
}
export const HEADER_WEIGHT: Record<Position, number> = {
  GK: 0.001,
  CB: 0.85,
  LB: 0.15,
  RB: 0.15,
  DM: 0.4,
  CM: 0.3,
  AM: 0.2,
  LW: 0.2,
  RW: 0.2,
  ST: 1,
}
export const ASSIST_WEIGHT: Record<Position, number> = {
  GK: 0.02,
  CB: 0.12,
  LB: 0.5,
  RB: 0.5,
  DM: 0.35,
  CM: 0.75,
  AM: 1,
  LW: 0.85,
  RW: 0.85,
  ST: 0.5,
}
/** Who puts the ball into the box from wide: crosses and cut-backs. */
export const CROSS_WEIGHT: Record<Position, number> = {
  GK: 0,
  CB: 0.03,
  LB: 0.8,
  RB: 0.8,
  DM: 0.15,
  CM: 0.35,
  AM: 0.4,
  LW: 1,
  RW: 1,
  ST: 0.2,
}
export const FOUL_WEIGHT: Record<Position, number> = {
  GK: 0.05,
  CB: 1,
  LB: 0.8,
  RB: 0.8,
  DM: 1.1,
  CM: 0.8,
  AM: 0.5,
  LW: 0.45,
  RW: 0.45,
  ST: 0.5,
}
export const DEFENDER_WEIGHT: Record<Position, number> = {
  GK: 0,
  CB: 1,
  LB: 0.7,
  RB: 0.7,
  DM: 0.9,
  CM: 0.5,
  AM: 0.15,
  LW: 0.15,
  RW: 0.15,
  ST: 0.05,
}
/** Finishing relative to all-round ability. */
export const FINISH_BONUS: Record<Position, number> = {
  GK: -40,
  CB: -8,
  LB: -7,
  RB: -7,
  DM: -6,
  CM: -3,
  AM: 1,
  LW: 1,
  RW: 1,
  ST: 3,
}

// ── Players ─────────────────────────────────────────────────────────────────

/** Put a player in a slot with a role (or none) and work out what that does to him. */
export function assign(p: LivePlayer, slot: Position, role: Role | null | undefined) {
  p.slot = slot
  p.role = validRole(role, slot) ? role : null
  p.mod = combineStyle(p.arch, p.role)
  p.suited = suitsRole(p.arch, p.role)
}

export function effective(p: LivePlayer, bigMatch: boolean): number {
  if (p.fitFor !== p.slot) {
    p.fit = positionFit({ pos: p.natural, alt: p.alt }, p.slot)
    p.fitFor = p.slot
  }
  const fit = p.fit
  const fatigue = 0.88 + 0.12 * (p.stamina / 100)
  const nerve = bigMatch ? (p.bigMatch - 10) * 0.3 : 0
  const suit = (p.suited ? ROLE_SUIT_BONUS : 0) + p.bond // role and team mates
  const hurt = p.injured ? 0.5 : 1
  return Math.max(1, (p.base + nerve + suit) * fit * fatigue * hurt)
}

/** Finishing: all-round strength shaded by the slot and his style. */
export function finishing(p: LivePlayer): number {
  return p.eff + FINISH_BONUS[p.slot] + p.mod.finish
}

/** A keeper's shot-stopping: his all-round strength shaded by his style. */
export function keeperAbility(p: LivePlayer | undefined): number {
  if (!p) return 20
  return p.eff + (p.natural === "GK" ? p.mod.keeper : 0)
}

/** Work out again what each player on the pitch gets from the ones beside him. */
export function rebond(side: LiveSide) {
  for (const p of side.pitch) {
    let total = 0
    for (const q of side.pitch) if (q !== p) total += side.bondPoints(p.id, q.id)
    p.bond = clamp(total, BOND_LIMITS.min, BOND_LIMITS.max)
  }
}

// ── Sides ───────────────────────────────────────────────────────────────────

function homeLift(state: MatchState, s: Side): number {
  const setup = state.setup
  const edge = setup.edge
  return (
    (s === "home" && setup.homeAdvantage ? (setup.homeBoost ?? HOME_BOOST) : 0) +
    (edge && edge.side === s ? edge.value : 0) +
    (setup.hosts?.includes(s) ? HOST_BOOST : 0)
  )
}

function units(state: MatchState, s: Side): Units {
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  let d = 0
  let m = 0
  let a = 0
  let wd = 0
  let wm = 0
  let wa = 0
  let gk = 20
  // A keeper's style shades the whole side's defence and midfield; an outfielder
  // standing in goal after a red card brings no such style.
  let keeperUnit: readonly [number, number, number] = [1, 1, 1]
  for (const p of side.pitch) {
    const e = p.eff
    if (p.slot === "GK") {
      gk = p.natural === "GK" ? e + p.mod.keeper : e
      if (p.natural === "GK") keeperUnit = p.mod.unit
      continue
    }
    const w = ROLE_WEIGHTS[p.slot]
    const u = p.mod.unit
    d += w[0] * u[0] * e
    m += w[1] * u[1] * e
    a += w[2] * u[2] * e
    wd += w[0]
    wm += w[1]
    wa += w[2]
  }
  const short = 1 - (11 - side.pitch.length) * 0.06
  const mentality = side.tactics.mentality
  const press = side.tactics.pressing - 1
  const playFor = signature(side.tactics) * 2048 + signature(opp.tactics)
  if (side.playFor !== playFor) {
    side.play = playOf(side.tactics, opp.tactics)
    side.playFor = playFor
  }
  const play = side.play
  const home = homeLift(state, s)
  return {
    def: (unit(d, wd, NORM[0]) * keeperUnit[0] * (1 - 0.03 * mentality) * play.def + home) * short,
    mid: (unit(m, wm, NORM[1]) * keeperUnit[1] * (1 + 0.02 * press) * play.mid + home) * short,
    att: (unit(a, wa, NORM[2]) * keeperUnit[2] * (1 + 0.04 * mentality) * play.att + home) * short,
    gk: gk + home * 0.5,
  }
}

function unit(sum: number, weight: number, norm: number): number {
  return weight ? (sum / weight) * Math.pow(weight / norm, 0.35) : 10
}

const FORMATION_INDEX = new Map(FORMATION_LIST.map((f, i) => [f, i]))

/** Everything about a side's tactics that the matchups read, as one number. */
function signature(t: Tactics): number {
  const f = FORMATION_INDEX.get(t.formation) ?? 0
  return (
    ((((f * 3 + t.tempo) * 3 + t.pressing) * 3 + (t.line ?? 1)) * 3 + (t.width ?? 1)) * 2 +
    (t.counter ? 1 : 0)
  )
}

function refreshSide(side: LiveSide, bigMatch: boolean) {
  let stamina = 0
  for (const p of side.pitch) {
    p.eff = effective(p, bigMatch)
    stamina += p.stamina
  }
  side.freshness = side.pitch.length ? stamina / side.pitch.length : 100
  refreshOutfield(side)
}

/** Work out every player's and both sides' strength for the minute about to be played. */
export function refreshMinute(state: MatchState) {
  const bigMatch = !!state.setup.bigMatch
  refreshSide(state.home, bigMatch)
  refreshSide(state.away, bigMatch)
  state.units.home = units(state, "home")
  state.units.away = units(state, "away")
}

/** A side's strength in each part of the pitch right now (for tests and previews). */
export function teamUnits(state: MatchState, s: Side): Units {
  refreshMinute(state)
  return s === "home" ? state.units.home : state.units.away
}
