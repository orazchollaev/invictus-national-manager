/**
 * The live state of a match: who is on the pitch, what each of them has done, where
 * the ball is. Nothing here plays football; the other files in this folder do.
 */
import type { ISODate, Player, Position } from "../types"
import { pickWeighted, type Rng } from "../rng"
import type { Archetype, Modifiers } from "../players/archetypes"
import type { Multipliers } from "./matchup"
import { LANES, laneAffinity, laneOfSlot } from "./lanes"
import type { Role } from "./roles"
import type {
  Lane,
  MatchEvent,
  MatchEventKind,
  Mentality,
  Side,
  TeamSheet,
  Tactics,
  TeamStats,
  Level,
} from "./types"

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
  /** His strength this minute: ability, fit, fatigue, nerve, role and bonds together. */
  eff: number
  /** How well he fits `fitFor`, the slot it was last worked out for. */
  fit: number
  fitFor: Position | null
  /** His chance of a knock in any minute before he tires. */
  knock: number
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
  /** Tackles, interceptions and blocks. */
  tackles: number
  /** Passes that set up a shot, the assists among them. */
  keyPasses: number
  fouls: number
  /** Mistakes that led straight to a goal against. */
  errors: number
  conceded: number
  ratingAdj: number
}

/** A change the AI coach plans: when, and how many players at once. */
export interface SubWindow {
  minute: number
  count: number
}

export interface LiveSide {
  sheet: TeamSheet
  /** The manager's chosen tactics; the AI may shade them around the game state late on. */
  tactics: Tactics
  baseMentality: Mentality
  /** The tempo, press and line the side started with, which the AI returns to. */
  baseTempo: Level
  basePressing: Level
  baseLine: Level
  pitch: LivePlayer[]
  /** The outfield players on the pitch, kept in step with `pitch`. */
  outfield: LivePlayer[]
  bench: LivePlayer[]
  appeared: LivePlayer[]
  subsUsed: number
  /** Stoppages in play used for changes (half-time and the extra-time breaks are free). */
  windows: number
  /** The minute and phase of the last change, so changes made together are one window. */
  lastChange: string
  /** The AI coach's planned changes, earliest first. */
  plan: SubWindow[]
  /** The AI coach has already switched shape to chase or protect the game. */
  reshaped: boolean
  /** A defensive slot lost to a red card that the AI coach wants filled. */
  refill: Position | null
  goals: number
  stats: TeamStats
  /** Time on the ball, in ticks of play; only the share between the sides matters. */
  possessionMinutes: number
  /** Average stamina of the players on the pitch, refreshed every minute. */
  freshness: number
  /** How much of the side's attacking weight works each lane, from the slots alone. */
  threat: [number, number, number]
  /** What the side's way of playing does against the opponent's, and the styles it is for. */
  play: Readonly<Multipliers>
  playFor: number
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

/**
 * How the side on the ball came by it. A counter or a high regain is played before the
 * defence is set; anything else is settled possession.
 */
export type Flow = "settled" | "counter" | "press"

export interface Units {
  def: number
  mid: number
  att: number
  gk: number
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
  /** Who has the ball, the lane they work and how far up the pitch (3 is the final third). */
  ball: { side: Side; lane: Lane; depth: 1 | 2 | 3 }
  /** How the side on the ball won it. */
  flow: Flow
  /** Who gave the ball away when it was won high up the pitch, in case it costs a goal. */
  culprit: LivePlayer | null
  /** How strictly the referee books players: 1 is an average referee. */
  strictness: number
  /** Time lost in the current half (goals, changes, injuries, cards), for the stoppage board. */
  lost: number
  /** Each side's strength this minute, worked out once at its start. */
  units: { home: Units; away: Units }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export const other = (s: Side): Side => (s === "home" ? "away" : "home")

export function sideOf(state: MatchState, s: Side): LiveSide {
  return s === "home" ? state.home : state.away
}

export function score(state: MatchState): [number, number] {
  return [state.home.goals, state.away.goals]
}

/** Goals for and against a side, counting earlier legs of a tie. */
export function goalDiff(state: MatchState, s: Side): number {
  const agg = state.setup.knockout?.aggregate ?? [0, 0]
  const h = state.home.goals + agg[0]
  const a = state.away.goals + agg[1]
  return s === "home" ? h - a : a - h
}

export function emit(
  state: MatchState,
  out: MatchEvent[],
  kind: MatchEventKind,
  side: Side | null,
  extra: Partial<MatchEvent> = {}
): MatchEvent {
  const ev: MatchEvent = { minute: state.minute, kind, side, ...extra }
  if (state.added > 0) ev.added = state.added
  state.events.push(ev)
  out.push(ev)
  return ev
}

export function choose(
  rng: Rng,
  players: readonly LivePlayer[],
  weight: (p: LivePlayer) => number,
  exclude?: LivePlayer | null
): LivePlayer | null {
  if (!players.length) return null
  if (!exclude) return pickWeighted(rng, players, weight)
  const pool = players.filter((p) => p !== exclude)
  return pool.length ? pickWeighted(rng, pool, weight) : null
}

export function keeper(side: LiveSide): LivePlayer | undefined {
  return side.pitch.find((p) => p.slot === "GK")
}

/** Share of each role's work that goes to defence, midfield and attack. */
export const ROLE_WEIGHTS: Record<Position, [number, number, number]> = {
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

/** Bring the outfield list back in step after anyone joins, leaves or changes slot. */
export function refreshOutfield(side: LiveSide) {
  side.outfield = side.pitch.filter((p) => p.slot !== "GK")
  const threat: [number, number, number] = [0, 0, 0]
  for (const p of side.outfield) {
    const w = ROLE_WEIGHTS[p.slot]
    const own = laneOfSlot(p.slot)
    for (let i = 0; i < 3; i++) threat[i] += (w[2] + 0.5 * w[1]) * laneAffinity(own, LANES[i])
  }
  side.threat = threat
}
