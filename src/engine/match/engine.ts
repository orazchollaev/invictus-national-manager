/**
 * The match engine. A match is played one minute at a time, from kick-off to the
 * last minute of stoppage time: every minute somebody has the ball, may build an
 * attack, may get a shot away, may foul, may get hurt. The score is whatever those
 * events add up to — nothing is decided up front.
 *
 * The same engine plays the managed match (stepped by the UI, with the manager
 * changing tactics and players between minutes) and every other match in the world
 * (played straight through by `playMatch`).
 *
 * Strength comes from the eleven on the pitch, not from a team rating: each player
 * contributes to defence, midfield and attack according to the slot he fills, shaded
 * by how well he fits it and by how tired he is.
 */
import type { ISODate, Player, Position } from "../types"
import { clamp, makeRng, pickWeighted, randInt, type Rng } from "../rng"
import { ageOn, matchAbility, positionFit } from "../players/ability"
import {
  ARCHETYPES,
  TIRES_EARLY_AGE,
  archetypeOf,
  type Archetype,
  type Modifiers,
} from "../players/archetypes"
import { ROLE_SUIT_BONUS, combineStyle, suitsRole, validRole, type Role } from "./roles"
import { instructionsOf, meet, styleOf } from "./matchup"
import { BOND_LIMITS, BOND_POINTS, bondBetween } from "../players/bonds"
import { LANES, laneAffinity, laneOfSlot, mirror, widthBias } from "./lanes"
import { FORMATIONS } from "./formations"
import type {
  Formation,
  Lane,
  MatchEvent,
  MatchEventKind,
  MatchReport,
  MatchResult,
  Mentality,
  PlayerLine,
  Side,
  TeamSheet,
  Tactics,
  TeamStats,
} from "./types"

// ── Tuning ──────────────────────────────────────────────────────────────────
// Calibrated so two equal sides average ~12 shots and ~1.3 goals each
// (see __tests__/engine.test.ts, which pins these).

const ATTACK_BASE = 0.4
const BREAKDOWN = 0.35
const OFFSIDE = 0.07
const PENALTY = 0.011
const OWN_GOAL = 0.004
const FOUL_BASE = 0.12
const YELLOW_PER_FOUL = 0.12
const RED_PER_FOUL = 0.003
const INJURY_PER_MINUTE = 0.00011
const STAMINA_DRAIN = 0.42
const HOME_BOOST = 2.5
/** Ability points a tournament host gains in its own tournament, on top of home advantage. */
const HOST_BOOST = 0.75

/** Share of each role's work that goes to defence, midfield and attack. */
const ROLE_WEIGHTS: Record<Position, [number, number, number]> = {
  GK: [0, 0, 0],
  CB: [1, 0.15, 0.02],
  LB: [0.7, 0.35, 0.25],
  RB: [0.7, 0.35, 0.25],
  DM: [0.55, 0.8, 0.1],
  CM: [0.25, 1, 0.35],
  AM: [0.05, 0.75, 0.8],
  LW: [0.1, 0.4, 0.9],
  RW: [0.1, 0.4, 0.9],
  ST: [0.02, 0.2, 1],
}
/** The same sums for a standard 4-2-3-1, so formations shift strength gently. */
const NORM: [number, number, number] = [4.77, 4.35, 4.34]

const SCORER_WEIGHT: Record<Position, number> = {
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
const HEADER_WEIGHT: Record<Position, number> = {
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
const ASSIST_WEIGHT: Record<Position, number> = {
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
const FOUL_WEIGHT: Record<Position, number> = {
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
const DEFENDER_WEIGHT: Record<Position, number> = {
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
const FINISH_BONUS: Record<Position, number> = {
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

// ── State ───────────────────────────────────────────────────────────────────

export interface LivePlayer {
  id: string
  natural: Position
  alt: Position[]
  arch: Archetype
  /** What the manager asks of his slot, if anything. */
  role: Role | null
  /** Archetype and role together, worked out again whenever either changes. */
  mod: Modifiers
  /** His role suits his archetype, so he plays above himself. */
  suited: boolean
  /** What his team mates on the pitch give him, from his bonds with them. */
  bond: number
  slot: Position
  base: number
  age: number
  stamina: number
  temperament: number
  injuryProne: number
  consistency: number
  bigMatch: number
  started: boolean
  on: number
  off: number | null
  yellow: number
  sentOff: boolean
  injured: boolean
  goals: number
  assists: number
  shots: number
  onTarget: number
  saves: number
  tackles: number
  conceded: number
  ratingAdj: number
}

export interface LiveSide {
  sheet: TeamSheet
  /** The manager's chosen tactics; the AI may shade mentality around them late on. */
  tactics: Tactics
  baseMentality: Mentality
  pitch: LivePlayer[]
  bench: LivePlayer[]
  appeared: LivePlayer[]
  subsUsed: number
  plannedSubs: number[]
  goals: number
  stats: TeamStats
  possessionMinutes: number
  /** Ability points two team mates give each other: friends, club mates and feuds. */
  bondPoints: (a: string, b: string) => number
}

export type Phase =
  | "first-half"
  | "half-time"
  | "second-half"
  | "et-break"
  | "et-first"
  | "et-half-time"
  | "et-second"
  | "shootout"
  | "done"

export interface MatchSetup {
  id: string
  date: ISODate
  home: TeamSheet
  away: TeamSheet
  player: (id: string) => Player
  /** The home side really is at home (false on neutral ground). */
  homeAdvantage: boolean
  /** Size of that advantage in ability points (bigger stadiums, bigger lift). */
  homeBoost?: number
  /** A small lift in ability points for one side: the user's, for the manager's touch. */
  edge?: { side: Side; value: number }
  /** Sides that host the tournament this match belongs to: each gets a small lift. */
  hosts?: Side[]
  /** Ties that need a winner. `aggregate` is earlier legs, from this match's home side. */
  knockout?: { aggregate?: [number, number]; extraTime: boolean }
  /** Finals, deciders: players' big-match temperament comes into play. */
  bigMatch?: boolean
  seed: number
  /** The side the user runs; the AI never touches its players or tactics. */
  managed?: Side | null
  maxSubs?: number
}

export interface MatchState {
  setup: MatchSetup
  rng: Rng
  phase: Phase
  /** Last minute played on the match clock. */
  minute: number
  /** Stoppage minutes played so far in the current half. */
  added: number
  /** Stoppage minutes announced for the current half. */
  addedTotal: number
  home: LiveSide
  away: LiveSide
  events: MatchEvent[]
  ht?: [number, number]
  ft?: [number, number]
  pens?: [number, number]
  /** Injured players on the managed side waiting for the manager to act. */
  pendingInjuries: string[]
}

// ── Setup ───────────────────────────────────────────────────────────────────

function emptyStats(): TeamStats {
  return {
    possession: 50,
    shots: 0,
    onTarget: 0,
    xg: 0,
    corners: 0,
    fouls: 0,
    yellows: 0,
    reds: 0,
    offsides: 0,
    saves: 0,
  }
}

function livePlayer(
  p: Player,
  slot: Position,
  date: ISODate,
  started: boolean,
  minute: number,
  role?: Role
): LivePlayer {
  const arch = archetypeOf(p)
  const live: LivePlayer = {
    id: p.id,
    natural: p.pos,
    alt: p.alt,
    arch,
    role: null,
    mod: ARCHETYPES[arch],
    suited: false,
    bond: 0,
    slot,
    base: matchAbility(p),
    age: ageOn(p.born, date),
    stamina: 100 - (p.injury ? 30 : 0),
    temperament: p.pers.temperament,
    injuryProne: p.pers.injuryProne,
    consistency: p.pers.consistency,
    bigMatch: p.pers.bigMatch,
    started,
    on: minute,
    off: null,
    yellow: 0,
    sentOff: false,
    injured: false,
    goals: 0,
    assists: 0,
    shots: 0,
    onTarget: 0,
    saves: 0,
    tackles: 0,
    conceded: 0,
    ratingAdj: 0,
  }
  assign(live, slot, role)
  return live
}

function bondPointsFor(setup: MatchSetup): LiveSide["bondPoints"] {
  const cache = new Map<string, number>()
  return (a, b) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    let v = cache.get(key)
    if (v === undefined) {
      const kind = bondBetween(setup.player(a), setup.player(b))
      v = kind ? BOND_POINTS[kind] : 0
      cache.set(key, v)
    }
    return v
  }
}

/** Work out again what each player on the pitch gets from the ones beside him. */
function rebond(side: LiveSide) {
  for (const p of side.pitch) {
    let total = 0
    for (const q of side.pitch) if (q !== p) total += side.bondPoints(p.id, q.id)
    p.bond = clamp(total, BOND_LIMITS.min, BOND_LIMITS.max)
  }
}

function buildSide(sheet: TeamSheet, setup: MatchSetup, rng: Rng): LiveSide {
  const pitch = sheet.xi.map((s) =>
    livePlayer(setup.player(s.playerId), s.pos, setup.date, true, 0, s.role)
  )
  const bench = sheet.bench.map((id) => {
    const p = setup.player(id)
    return livePlayer(p, p.pos, setup.date, false, 0)
  })
  const maxSubs = setup.maxSubs ?? 5
  const count = Math.min(bench.length, maxSubs, randInt(rng, 3, maxSubs))
  const plannedSubs = Array.from({ length: count }, () => randInt(rng, 55, 84)).sort(
    (a, b) => a - b
  )
  const side: LiveSide = {
    sheet,
    bondPoints: bondPointsFor(setup),
    tactics: { ...sheet.tactics },
    baseMentality: sheet.tactics.mentality,
    pitch,
    bench,
    appeared: [...pitch],
    subsUsed: 0,
    plannedSubs,
    goals: 0,
    stats: emptyStats(),
    possessionMinutes: 0,
  }
  rebond(side)
  return side
}

export function createMatch(setup: MatchSetup): MatchState {
  const rng = makeRng(setup.seed)
  const state: MatchState = {
    setup,
    rng,
    phase: "first-half",
    minute: 0,
    added: 0,
    addedTotal: randInt(rng, 1, 4),
    home: buildSide(setup.home, setup, rng),
    away: buildSide(setup.away, setup, rng),
    events: [],
    pendingInjuries: [],
  }
  state.events.push({ minute: 0, kind: "kickoff", side: null })
  return state
}

// ── Strength ────────────────────────────────────────────────────────────────

const style = (p: LivePlayer): Modifiers => p.mod

/** Put a player in a slot with a role (or none) and work out what that does to him. */
function assign(p: LivePlayer, slot: Position, role: Role | null | undefined) {
  p.slot = slot
  p.role = validRole(role, slot) ? role : null
  p.mod = combineStyle(p.arch, p.role)
  p.suited = suitsRole(p.arch, p.role)
}

function effective(p: LivePlayer, bigMatch: boolean): number {
  const fit = positionFit({ pos: p.natural, alt: p.alt }, p.slot)
  const fatigue = 0.88 + 0.12 * (p.stamina / 100)
  const nerve = bigMatch ? (p.bigMatch - 10) * 0.3 : 0
  const suit = (p.suited ? ROLE_SUIT_BONUS : 0) + p.bond // role and team mates
  const hurt = p.injured ? 0.5 : 1
  return Math.max(1, (p.base + nerve + suit) * fit * fatigue * hurt)
}

export interface Units {
  def: number
  mid: number
  att: number
  gk: number
}

function units(state: MatchState, side: LiveSide, opp: LiveSide, isHome: boolean): Units {
  const bigMatch = !!state.setup.bigMatch
  const sum = [0, 0, 0]
  const wsum = [0, 0, 0]
  let gk = 20
  // A keeper's style shades the whole side's defence and midfield; an outfielder
  // standing in goal after a red card brings no such style.
  let keeperUnit: [number, number, number] = [1, 1, 1]
  for (const p of side.pitch) {
    const e = effective(p, bigMatch)
    if (p.slot === "GK") {
      gk = p.natural === "GK" ? e + style(p).keeper : e
      if (p.natural === "GK") keeperUnit = style(p).unit
      continue
    }
    const w = ROLE_WEIGHTS[p.slot]
    const u = style(p).unit
    for (let i = 0; i < 3; i++) {
      sum[i] += w[i] * u[i] * e
      wsum[i] += w[i]
    }
  }
  const unit = (i: number) =>
    wsum[i] ? (sum[i] / wsum[i]) * Math.pow(wsum[i] / NORM[i], 0.35) : 10
  const missing = 11 - side.pitch.length
  const short = 1 - missing * 0.06
  const m = side.tactics.mentality
  const press = side.tactics.pressing - 1
  const play = meet(styleOf(side.tactics), styleOf(opp.tactics))
  const edge = state.setup.edge
  const home =
    (isHome && state.setup.homeAdvantage ? (state.setup.homeBoost ?? HOME_BOOST) : 0) +
    (edge && edge.side === (isHome ? "home" : "away") ? edge.value : 0) +
    (state.setup.hosts?.includes(isHome ? "home" : "away") ? HOST_BOOST : 0)
  return {
    def: (unit(0) * keeperUnit[0] * (1 - 0.03 * m) * play.def + home) * short,
    mid: (unit(1) * keeperUnit[1] * (1 + 0.02 * press) * play.mid + home) * short,
    att: (unit(2) * keeperUnit[2] * (1 + 0.04 * m) * play.att + home) * short,
    gk: gk + home * 0.5,
  }
}

/** A side's strength in each part of the pitch right now (for tests and previews). */
export function teamUnits(state: MatchState, s: Side): Units {
  return units(state, sideOf(state, s), sideOf(state, other(s)), s === "home")
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const other = (s: Side): Side => (s === "home" ? "away" : "home")

function sideOf(state: MatchState, s: Side): LiveSide {
  return s === "home" ? state.home : state.away
}

function score(state: MatchState): [number, number] {
  return [state.home.goals, state.away.goals]
}

function emit(
  state: MatchState,
  out: MatchEvent[],
  kind: MatchEventKind,
  side: Side | null,
  extra: Partial<MatchEvent> = {}
) {
  const ev: MatchEvent = { minute: state.minute, kind, side, ...extra }
  if (state.added > 0) ev.added = state.added
  state.events.push(ev)
  out.push(ev)
  return ev
}

function choose(
  rng: Rng,
  players: LivePlayer[],
  weight: (p: LivePlayer) => number,
  exclude?: LivePlayer
): LivePlayer | null {
  const pool = exclude ? players.filter((p) => p !== exclude) : players
  if (!pool.length) return null
  return pickWeighted(rng, pool, weight)
}

function finishing(p: LivePlayer, bigMatch: boolean): number {
  return effective(p, bigMatch) + FINISH_BONUS[p.slot] + style(p).finish
}

/** A keeper's shot-stopping: his all-round ability shaded by his style. */
function keeperAbility(p: LivePlayer): number {
  return effective(p, false) + (p.natural === "GK" ? style(p).keeper : 0)
}

function keeper(side: LiveSide): LivePlayer | undefined {
  return side.pitch.find((p) => p.slot === "GK")
}

// ── The minute ──────────────────────────────────────────────────────────────

/** Play one minute (or one stoppage minute, or a whole shootout). Returns its events. */
export function step(state: MatchState): MatchEvent[] {
  const out: MatchEvent[] = []
  switch (state.phase) {
    case "done":
      return out
    case "half-time":
      state.phase = "second-half"
      state.minute = 45
      state.added = 0
      state.addedTotal = 0
      emit(state, out, "second-half", null)
      return out
    case "et-break":
      state.phase = "et-first"
      state.minute = 90
      state.added = 0
      state.addedTotal = 0
      emit(state, out, "et-start", null)
      return out
    case "et-half-time":
      state.phase = "et-second"
      state.minute = 105
      state.added = 0
      state.addedTotal = 0
      emit(state, out, "et-second-half", null)
      return out
    case "shootout":
      playShootout(state, out)
      return out
  }

  const periodEnd = { "first-half": 45, "second-half": 90, "et-first": 105, "et-second": 120 }[
    state.phase
  ]
  if (state.minute < periodEnd) state.minute++
  else state.added++

  playMinute(state, out)

  // The stoppage announced at the end of each half depends on how eventful it was.
  if (state.minute === periodEnd && state.added === 0 && state.addedTotal === 0) {
    state.addedTotal =
      state.phase === "first-half"
        ? randInt(state.rng, 1, 4)
        : state.phase === "second-half"
          ? randInt(state.rng, 3, 7)
          : randInt(state.rng, 0, 2)
  }
  if (state.minute === periodEnd && state.added >= state.addedTotal) endPeriod(state, out)
  return out
}

function endPeriod(state: MatchState, out: MatchEvent[]) {
  state.added = 0
  switch (state.phase) {
    case "first-half":
      state.ht = score(state)
      state.phase = "half-time"
      emit(state, out, "half-time", null)
      break
    case "second-half": {
      const ko = state.setup.knockout
      if (ko?.extraTime && tieLevel(state)) {
        state.ft = score(state)
        state.phase = "et-break"
        emit(state, out, "full-time", null)
        refresh(state, 12)
      } else {
        finish(state, out)
      }
      break
    }
    case "et-first":
      state.phase = "et-half-time"
      emit(state, out, "et-half-time", null)
      break
    case "et-second":
      if (tieLevel(state)) {
        state.phase = "shootout"
        emit(state, out, "et-end", null)
      } else finish(state, out)
      break
  }
}

function refresh(state: MatchState, amount: number) {
  for (const p of [...state.home.pitch, ...state.away.pitch])
    p.stamina = Math.min(100, p.stamina + amount)
}

function tieLevel(state: MatchState): boolean {
  const agg = state.setup.knockout?.aggregate ?? [0, 0]
  return state.home.goals + agg[0] === state.away.goals + agg[1]
}

function finish(state: MatchState, out: MatchEvent[]) {
  state.phase = "done"
  emit(state, out, "full-time", null)
}

function playMinute(state: MatchState, out: MatchEvent[]) {
  const rng = state.rng
  for (const s of ["home", "away"] as Side[]) {
    const side = sideOf(state, s)
    if (state.setup.managed !== s) aiManage(state, s, out)
    for (const p of side.pitch) {
      const drain =
        STAMINA_DRAIN *
        (1 + 0.25 * (side.tactics.pressing - 1)) *
        (1 + 0.1 * (side.tactics.tempo - 1)) *
        (p.age >= TIRES_EARLY_AGE ? 1.12 : 1) *
        (p.slot === "GK" ? 0.3 : 1)
      p.stamina = Math.max(0, p.stamina - drain)
    }
  }

  const H = units(state, state.home, state.away, true)
  const A = units(state, state.away, state.home, false)

  // Who has the ball this minute.
  const pHome = clamp(1 / (1 + Math.exp(-(H.mid - A.mid) / 16)), 0.22, 0.78)
  const attacking: Side = rng() < pHome ? "home" : "away"
  sideOf(state, attacking).possessionMinutes++

  const att = attacking === "home" ? H : A
  const def = attacking === "home" ? A : H
  const atkSide = sideOf(state, attacking)
  const defSide = sideOf(state, other(attacking))

  const edge = Math.tanh((att.att - def.def) / 22)
  const pAttack =
    ATTACK_BASE *
    (1 + 0.5 * edge) *
    (1 + 0.1 * (atkSide.tactics.tempo - 1)) *
    (1 + 0.05 * atkSide.tactics.mentality) *
    (1 + 0.04 * Math.max(0, defSide.tactics.mentality))
  if (rng() < pAttack) attack(state, out, attacking, edge, def.gk)

  // Fouls happen whoever is on the ball, more from a pressing side.
  for (const s of ["home", "away"] as Side[]) {
    const side = sideOf(state, s)
    const pFoul =
      FOUL_BASE * (1 + 0.3 * (side.tactics.pressing - 1)) * (s === attacking ? 0.6 : 1.3)
    if (rng() < pFoul) foul(state, out, s, s !== attacking)
  }

  // Knocks.
  for (const s of ["home", "away"] as Side[]) {
    for (const p of sideOf(state, s).pitch) {
      if (p.injured) continue
      const risk = INJURY_PER_MINUTE * (1 + (p.injuryProne - 8) * 0.08) * (p.stamina < 35 ? 1.8 : 1)
      if (rng() < risk) injure(state, out, s, p)
    }
  }
}

// ── Attacks and shots ───────────────────────────────────────────────────────

const involvement = (p: LivePlayer, lane: Lane) => laneAffinity(laneOfSlot(p.slot), lane)

/**
 * The lane an attack comes down. It follows where the side's attacking players are and
 * how wide it is asked to play, and leans towards the flank where the opponent is
 * weakest on the day.
 */
function pickLane(state: MatchState, side: LiveSide, opp: LiveSide): Lane {
  const bigMatch = !!state.setup.bigMatch
  const bias = widthBias(instructionsOf(side.tactics).width)
  const defenders = opp.pitch.filter((p) => p.slot !== "GK")
  const guard = (lane: Lane) => {
    let sum = 0
    let weight = 0
    for (const p of defenders) {
      const w = DEFENDER_WEIGHT[p.slot] * involvement(p, mirror(lane))
      sum += w * effective(p, bigMatch)
      weight += w
    }
    return weight ? sum / weight : 0
  }
  const guards = LANES.map(guard)
  const mean = guards.reduce((a, b) => a + b, 0) / guards.length
  const weights = LANES.map((lane, i) => {
    let threat = 0
    for (const p of side.pitch) {
      if (p.slot === "GK") continue
      const w = ROLE_WEIGHTS[p.slot]
      threat += (w[2] + 0.5 * w[1]) * involvement(p, lane)
    }
    const exposure = guards[i] ? clamp(mean / guards[i], 0.85, 1.2) : 1
    return threat * bias[lane] * exposure
  })
  return pickWeighted(state.rng, LANES.slice(), (lane) => weights[LANES.indexOf(lane)])
}

function attack(state: MatchState, out: MatchEvent[], s: Side, edge: number, gkAbility: number) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const outfield = side.pitch.filter((p) => p.slot !== "GK")
  if (!outfield.length) return

  if (rng() < OWN_GOAL) {
    const culprit = choose(rng, opp.pitch, (p) => DEFENDER_WEIGHT[p.slot])
    if (culprit) {
      side.goals++
      culprit.ratingAdj -= 0.8
      emit(state, out, "own-goal", s, { playerId: culprit.id, score: score(state) })
      concede(opp)
    }
    return
  }

  const lane = pickLane(state, side, opp)

  if (rng() < BREAKDOWN * (1 - 0.3 * edge)) {
    const carrier = choose(
      rng,
      outfield,
      (p) => (ROLE_WEIGHTS[p.slot][1] + ROLE_WEIGHTS[p.slot][2]) * involvement(p, lane)
    )
    const tackler = choose(
      rng,
      opp.pitch,
      (p) => DEFENDER_WEIGHT[p.slot] * style(p).tackle * involvement(p, mirror(lane))
    )
    if (tackler) tackler.tackles++
    emit(state, out, "attack", s, { playerId: carrier?.id, otherId: tackler?.id, lane })
    // Some moves end with the ball put out for a corner.
    if (rng() < 0.22) corner(state, out, s, gkAbility)
    return
  }

  if (rng() < OFFSIDE) {
    const runner = choose(rng, outfield, (p) => SCORER_WEIGHT[p.slot] * involvement(p, lane))
    side.stats.offsides++
    emit(state, out, "offside", s, { playerId: runner?.id, lane })
    return
  }

  if (rng() < PENALTY * (1 + 0.5 * edge)) {
    const fouled = choose(rng, outfield, (p) => SCORER_WEIGHT[p.slot])
    const culprit = choose(rng, opp.pitch, (p) => DEFENDER_WEIGHT[p.slot])
    emit(state, out, "penalty-awarded", s, { playerId: fouled?.id, otherId: culprit?.id })
    if (culprit) cardRoll(state, out, other(s), culprit, 0.35, 0.05)
    penalty(state, out, s, gkAbility)
    return
  }

  const pClear = 0.1 * (1 + 0.8 * edge)
  const pHalf = 0.3 * (1 + 0.3 * edge)
  const roll = rng()
  const tempoPenalty = 1 - 0.05 * (side.tactics.tempo - 1)
  let xg: number
  let blockChance: number
  if (roll < pClear) {
    xg = 0.28 + rng() * 0.22
    blockChance = 0.05
  } else if (roll < pClear + pHalf) {
    xg = 0.09 + rng() * 0.11
    blockChance = 0.12
  } else {
    xg = 0.02 + rng() * 0.05
    blockChance = 0.22
  }
  xg *= tempoPenalty

  const shooter = choose(
    rng,
    outfield,
    (p) =>
      SCORER_WEIGHT[p.slot] *
      style(p).score *
      (effective(p, false) / 70) *
      // Shots are taken from the middle more than from the flank, so the lane counts half.
      (0.5 + 0.5 * involvement(p, lane))
  )!
  const assister =
    rng() < (xg > 0.08 ? 0.8 : 0.45)
      ? choose(
          rng,
          outfield,
          (p) => ASSIST_WEIGHT[p.slot] * style(p).assist * involvement(p, lane),
          shooter
        )
      : null
  shot(state, out, s, shooter, assister, xg, gkAbility, blockChance, lane)
}

function shot(
  state: MatchState,
  out: MatchEvent[],
  s: Side,
  shooter: LivePlayer,
  assister: LivePlayer | null,
  xg: number,
  gkAbility: number,
  blockChance: number,
  lane?: Lane
) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const gk = keeper(opp)
  side.stats.shots++
  side.stats.xg += xg
  shooter.shots++

  if (rng() < blockChance) {
    const blocker = choose(
      rng,
      opp.pitch,
      (p) => DEFENDER_WEIGHT[p.slot] * style(p).tackle * (lane ? involvement(p, mirror(lane)) : 1)
    )
    if (blocker) blocker.tackles++
    emit(state, out, "shot-blocked", s, { playerId: shooter.id, otherId: blocker?.id, xg, lane })
    if (rng() < 0.45) corner(state, out, s, gkAbility)
    return
  }

  const ff = clamp(1 + (finishing(shooter, !!state.setup.bigMatch) - gkAbility) / 90, 0.7, 1.35)
  const pGoal = clamp(xg * ff, 0.005, 0.85)
  if (rng() < pGoal) {
    side.goals++
    side.stats.onTarget++
    shooter.goals++
    shooter.onTarget++
    if (assister) assister.assists++
    emit(state, out, "goal", s, {
      playerId: shooter.id,
      otherId: assister?.id,
      xg,
      lane,
      score: score(state),
    })
    concede(opp)
    return
  }

  const r = rng()
  if (r < 0.45) {
    side.stats.onTarget++
    opp.stats.saves++
    shooter.onTarget++
    if (gk) gk.saves++
    emit(state, out, "shot-saved", s, { playerId: shooter.id, otherId: gk?.id, xg, lane })
    if (rng() < 0.3) corner(state, out, s, gkAbility)
  } else if (r < 0.5 && xg > 0.05) {
    emit(state, out, "woodwork", s, { playerId: shooter.id, xg, lane })
  } else if (xg >= 0.28) {
    shooter.ratingAdj -= 0.25
    emit(state, out, "big-chance-missed", s, { playerId: shooter.id, xg, lane })
  } else {
    emit(state, out, "shot-wide", s, { playerId: shooter.id, xg, lane })
  }
}

function concede(side: LiveSide) {
  for (const p of side.pitch) if (p.slot === "GK" || DEFENDER_WEIGHT[p.slot] >= 0.7) p.conceded++
}

function corner(state: MatchState, out: MatchEvent[], s: Side, gkAbility: number) {
  const rng = state.rng
  const side = sideOf(state, s)
  side.stats.corners++
  emit(state, out, "corner", s)
  if (rng() < 0.28) {
    const outfield = side.pitch.filter((p) => p.slot !== "GK")
    const header = choose(rng, outfield, (p) => HEADER_WEIGHT[p.slot] * style(p).header)
    const taker = setPieceTaker(side, header)
    if (header) shot(state, out, s, header, taker, 0.05 + rng() * 0.09, gkAbility, 0.15)
  }
}

function setPieceValue(p: LivePlayer): number {
  return p.base * ASSIST_WEIGHT[p.slot] * style(p).assist
}

function setPieceTaker(side: LiveSide, exclude?: LivePlayer | null): LivePlayer | null {
  const chosen = side.pitch.find((p) => p.id === side.sheet.setPieceTakerId && p !== exclude)
  if (chosen) return chosen
  let best: LivePlayer | null = null
  for (const p of side.pitch) {
    if (p === exclude || p.slot === "GK") continue
    const v = setPieceValue(p)
    if (!best || v > setPieceValue(best)) best = p
  }
  return best
}

function penaltyTaker(side: LiveSide): LivePlayer | null {
  const chosen = side.pitch.find((p) => p.id === side.sheet.penaltyTakerId)
  if (chosen) return chosen
  let best: LivePlayer | null = null
  for (const p of side.pitch) {
    if (p.slot === "GK") continue
    if (!best || finishing(p, false) > finishing(best, false)) best = p
  }
  return best
}

function penalty(state: MatchState, out: MatchEvent[], s: Side, gkAbility: number) {
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
  const p = clamp(0.77 + (finishing(taker, false) - gkAbility) / 250 + nerve, 0.6, 0.92)
  if (rng() < p) {
    side.goals++
    side.stats.onTarget++
    taker.goals++
    taker.onTarget++
    emit(state, out, "pen-goal", s, { playerId: taker.id, xg: 0.76, score: score(state) })
    concede(opp)
  } else if (rng() < 0.6) {
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
}

// ── Fouls, cards, injuries ──────────────────────────────────────────────────

function foul(state: MatchState, out: MatchEvent[], s: Side, defending: boolean) {
  const rng = state.rng
  const side = sideOf(state, s)
  const opp = sideOf(state, other(s))
  const culprit = choose(
    rng,
    side.pitch,
    (p) => FOUL_WEIGHT[p.slot] * style(p).foul * (p.temperament / 10)
  )
  const victim = choose(
    rng,
    opp.pitch.filter((p) => p.slot !== "GK"),
    (p) => ROLE_WEIGHTS[p.slot][2] + 0.3
  )
  if (!culprit) return
  side.stats.fouls++
  emit(state, out, "foul", s, { playerId: culprit.id, otherId: victim?.id })
  cardRoll(state, out, s, culprit, YELLOW_PER_FOUL, RED_PER_FOUL)

  // A foul by the defending side near its own box is a set piece for the other.
  if (defending && rng() < 0.18) {
    const attackers = sideOf(state, other(s))
    const gk = keeper(side)
    const gkAbility = gk ? keeperAbility(gk) : 20
    emit(state, out, "free-kick", other(s), { playerId: victim?.id })
    if (rng() < 0.35) {
      const taker = setPieceTaker(attackers)
      if (taker) shot(state, out, other(s), taker, null, 0.03 + rng() * 0.06, gkAbility, 0.3)
    } else if (rng() < 0.2) {
      const outfield = attackers.pitch.filter((p) => p.slot !== "GK")
      const header = choose(rng, outfield, (p) => HEADER_WEIGHT[p.slot] * style(p).header)
      if (header)
        shot(
          state,
          out,
          other(s),
          header,
          setPieceTaker(attackers, header),
          0.05 + rng() * 0.08,
          gkAbility,
          0.15
        )
    }
  }
}

function cardRoll(
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
  if (rng() < red * temper) {
    sendOff(state, out, s, p, "red")
    return
  }
  if (rng() < yellow * temper) {
    p.yellow++
    side.stats.yellows++
    p.ratingAdj -= 0.3
    if (p.yellow >= 2) sendOff(state, out, s, p, "second-yellow")
    else emit(state, out, "yellow", s, { playerId: p.id })
  }
}

function sendOff(
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
  emit(state, out, kind, s, { playerId: p.id })
  // A side that loses its keeper puts an outfielder in goal.
  if (p.slot === "GK" && side.pitch.length) {
    const stand = side.pitch.reduce((a, b) =>
      DEFENDER_WEIGHT[a.slot] > DEFENDER_WEIGHT[b.slot] ? a : b
    )
    assign(stand, "GK", null)
  }
}

function injure(state: MatchState, out: MatchEvent[], s: Side, p: LivePlayer) {
  p.injured = true
  emit(state, out, "injury", s, { playerId: p.id })
  if (state.setup.managed === s) {
    state.pendingInjuries.push(p.id)
    return
  }
  const side = sideOf(state, s)
  const sub = bestReplacement(side, p.slot)
  if (sub && side.subsUsed < (state.setup.maxSubs ?? 5)) substitute(state, s, p.id, sub.id, out)
  else {
    // No change left: he limps off and the side plays on a man short.
    p.off = state.minute
    side.pitch = side.pitch.filter((x) => x !== p)
    rebond(side)
  }
}

// ── Changes ─────────────────────────────────────────────────────────────────

function bestReplacement(side: LiveSide, slot: Position): LivePlayer | null {
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
  if (side.subsUsed >= (state.setup.maxSubs ?? 5)) return null
  const leaving = side.pitch.find((p) => p.id === outId)
  const joining = side.bench.find((p) => p.id === inId)
  if (!leaving || !joining) return null
  side.subsUsed++
  leaving.off = state.minute
  assign(joining, leaving.slot, leaving.role)
  joining.on = state.minute
  joining.started = false
  side.pitch = side.pitch.map((p) => (p === leaving ? joining : p))
  rebond(side)
  side.bench = side.bench.filter((p) => p !== joining)
  side.appeared.push(joining)
  state.pendingInjuries = state.pendingInjuries.filter((id) => id !== outId)
  return emit(state, out, "sub", s, { playerId: inId, otherId: outId })
}

/** Move a player on the pitch into another role (the manager's drag on the pitch view). */
export function setSlot(state: MatchState, s: Side, playerId: string, slot: Position) {
  const p = sideOf(state, s).pitch.find((x) => x.id === playerId)
  if (p) assign(p, slot, null)
}

export function setTactics(state: MatchState, s: Side, tactics: Partial<Tactics>) {
  const side = sideOf(state, s)
  side.tactics = { ...side.tactics, ...tactics }
  if (tactics.mentality !== undefined) side.baseMentality = tactics.mentality
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
    for (const p of free) {
      if (
        !best ||
        positionFit({ pos: p.natural, alt: p.alt }, role) * p.base >
          positionFit({ pos: best.natural, alt: best.alt }, role) * best.base
      )
        best = p
    }
    if (best) {
      assign(best, role, null)
      free.delete(best)
    }
  }
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

// ── The AI touchline ────────────────────────────────────────────────────────

function aiManage(state: MatchState, s: Side, out: MatchEvent[]) {
  const side = sideOf(state, s)
  const minute = state.minute
  const agg = state.setup.knockout?.aggregate ?? [0, 0]
  const own = side.goals + (s === "home" ? agg[0] : agg[1])
  const theirs = sideOf(state, other(s)).goals + (s === "home" ? agg[1] : agg[0])
  const diff = own - theirs
  const regulation = state.phase === "first-half" || state.phase === "second-half"

  // Chase a game late on; sit on a lead.
  let mentality: Mentality = side.baseMentality
  if (regulation && minute >= 60 && diff < 0)
    mentality = Math.max(mentality, diff <= -2 || minute >= 75 ? 2 : 1) as Mentality
  else if (regulation && minute >= 70 && diff > 0) mentality = Math.min(mentality, -1) as Mentality
  if (mentality !== side.tactics.mentality) {
    side.tactics.mentality = mentality
    emit(state, out, "tactics", s)
  }

  // Planned changes: the most tired or weakest on the pitch make way.
  while (side.plannedSubs.length && side.plannedSubs[0] <= minute && state.phase !== "half-time") {
    side.plannedSubs.shift()
    if (side.subsUsed >= (state.setup.maxSubs ?? 5)) break
    const candidates = side.pitch.filter((p) => p.slot !== "GK")
    if (!candidates.length) break
    const tired = candidates.reduce((a, b) =>
      a.base * (0.5 + a.stamina / 200) - (a.yellow ? 5 : 0) <
      b.base * (0.5 + b.stamina / 200) - (b.yellow ? 5 : 0)
        ? a
        : b
    )
    const sub = bestReplacement(side, tired.slot)
    if (sub) substitute(state, s, tired.id, sub.id, out)
  }
}

// ── Shootout ────────────────────────────────────────────────────────────────

function kickOrder(side: LiveSide): LivePlayer[] {
  const first = penaltyTaker(side)
  const rest = side.pitch
    .filter((p) => p !== first)
    .sort((a, b) => finishing(b, false) - finishing(a, false))
  return first ? [first, ...rest] : rest
}

function playShootout(state: MatchState, out: MatchEvent[]) {
  const rng = state.rng
  const order = { home: kickOrder(state.home), away: kickOrder(state.away) }
  const scored = { home: 0, away: 0 }
  const taken = { home: 0, away: 0 }
  const convert = (s: Side, taker: LivePlayer) => {
    const gk = keeper(sideOf(state, other(s)))
    const gkAbility = gk ? keeperAbility(gk) : 20
    const nerve = (taker.bigMatch - 10) * 0.008
    return rng() < clamp(0.74 + (finishing(taker, false) - gkAbility) / 200 + nerve, 0.55, 0.9)
  }
  // Best of five with the early finish, then sudden death in pairs.
  const decidedEarly = () =>
    scored.home + (5 - taken.home) < scored.away || scored.away + (5 - taken.away) < scored.home
  kicks: for (let round = 0; round < 30; round++) {
    for (const s of ["home", "away"] as Side[]) {
      const list = order[s]
      const taker = list[round % list.length]
      taken[s]++
      if (convert(s, taker)) {
        scored[s]++
        emit(state, out, "shootout-goal", s, { playerId: taker.id })
      } else {
        emit(state, out, "shootout-miss", s, { playerId: taker.id })
      }
      if (round < 5 && decidedEarly()) break kicks
    }
    if (round >= 4 && scored.home !== scored.away) break
  }
  state.pens = [scored.home, scored.away]
  emit(state, out, "shootout-end", scored.home > scored.away ? "home" : "away")
  state.phase = "done"
}

// ── Result ──────────────────────────────────────────────────────────────────

export function isFinished(state: MatchState): boolean {
  return state.phase === "done"
}

/** Play whatever is left of the match without stopping. */
export function playToEnd(state: MatchState): void {
  // A managed side left alone is looked after by the AI from here on.
  state.setup.managed = null
  state.pendingInjuries = []
  let guard = 0
  while (state.phase !== "done" && guard++ < 400) step(state)
}

function winnerOf(state: MatchState): Side | undefined {
  if (!state.setup.knockout) return undefined
  if (state.pens) return state.pens[0] > state.pens[1] ? "home" : "away"
  const agg = state.setup.knockout.aggregate ?? [0, 0]
  const h = state.home.goals + agg[0]
  const a = state.away.goals + agg[1]
  if (h === a) return undefined
  return h > a ? "home" : "away"
}

function rate(
  p: LivePlayer,
  side: Side,
  state: MatchState,
  won: boolean,
  lost: boolean,
  cleanSheet: boolean
): number {
  const minutes = Math.max(1, (p.off ?? Math.min(state.minute, 120)) - p.on)
  const group = p.slot
  let r = 6.3 + p.ratingAdj
  r += p.goals * (group === "CB" || group === "LB" || group === "RB" ? 1.2 : 1)
  r += p.assists * 0.6
  r += p.onTarget * 0.1 - (p.shots - p.onTarget) * 0.04
  r += p.tackles * 0.08
  if (group === "GK") r += p.saves * 0.25 - p.conceded * 0.35 + (cleanSheet ? 0.6 : 0)
  else if (DEFENDER_WEIGHT[group] >= 0.7) r += -p.conceded * 0.12 + (cleanSheet ? 0.4 : 0)
  r += won ? 0.3 : lost ? -0.2 : 0
  r += (p.base - 70) * 0.012
  // Consistent players land near what they earned; erratic ones swing.
  const swing = (21 - p.consistency) / 20
  r += (state.rng() - 0.5) * 0.8 * swing
  // A cameo is pulled back towards the middle.
  const weight = Math.min(1, minutes / 60)
  r = 6.3 + (r - 6.3) * weight
  void side
  return Math.round(clamp(r, 3, 10) * 10) / 10
}

export function buildReport(state: MatchState): MatchReport {
  const winner = winnerOf(state)
  const result: MatchResult = {
    home: state.home.goals,
    away: state.away.goals,
    ht: state.ht ?? score(state),
  }
  if (state.ft) result.ft = state.ft
  if (state.pens) result.pens = state.pens
  if (winner) result.winner = winner

  const total = state.home.possessionMinutes + state.away.possessionMinutes || 1
  state.home.stats.possession = Math.round((state.home.possessionMinutes / total) * 100)
  state.away.stats.possession = 100 - state.home.stats.possession
  for (const side of [state.home, state.away]) side.stats.xg = Math.round(side.stats.xg * 100) / 100

  const lines: PlayerLine[] = []
  for (const s of ["home", "away"] as Side[]) {
    const side = sideOf(state, s)
    const oppGoals = sideOf(state, other(s)).goals
    const won = side.goals > oppGoals
    const lost = side.goals < oppGoals
    for (const p of side.appeared) {
      const end = p.off ?? Math.min(state.minute, state.ft ? 120 : 90)
      lines.push({
        playerId: p.id,
        side: s,
        pos: p.slot,
        started: p.started,
        minutes: Math.max(1, end - p.on),
        goals: p.goals,
        assists: p.assists,
        shots: p.shots,
        onTarget: p.onTarget,
        saves: p.saves,
        yellow: p.yellow,
        red: p.sentOff ? 1 : 0,
        injured: p.injured,
        rating: rate(p, s, state, won, lost, oppGoals === 0),
      })
    }
  }
  return { result, events: state.events, stats: [state.home.stats, state.away.stats], lines }
}

/** Play a whole match in one call — every match the user is not watching. */
export function playMatch(setup: MatchSetup): MatchReport {
  const state = createMatch({ ...setup, managed: null })
  playToEnd(state)
  return buildReport(state)
}
