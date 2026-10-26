import type { Confed, ISODate, Position } from "../types"
import type { Side } from "../match/types"
import type { Text } from "../text"

/** Match weight in the FIFA ranking, and how much the public cares. */
export type Importance =
  | "friendly"
  | "nations-league"
  | "nations-league-finals"
  | "qualifier"
  | "regional"
  | "continental"
  | "continental-ko"
  | "world-cup"
  | "world-cup-ko"

export interface CompactResult {
  h: number
  a: number
  ht?: [number, number]
  ft?: [number, number]
  pens?: [number, number]
  /** Winner of a tie-deciding match. */
  w?: Side
}

/** Compact event kept for every match in the world: goals, cards, injuries. */
export interface FixtureEvent {
  m: number
  k: "g" | "og" | "pg" | "y" | "r" | "i"
  s: 0 | 1
  p?: string
  a?: string
}

export interface KnockoutLeg {
  tie: string
  leg: 1 | 2
  legs: 1 | 2
  /** The match must produce a winner: extra time and penalties if level. */
  decisive: boolean
}

export interface Fixture {
  id: string
  /** Competition instance id, or "friendly". */
  compId: string
  stage: string
  label: Text
  date: ISODate
  home: string
  away: string
  /** The home side plays at home; false on neutral ground. */
  atHome: boolean
  /** Where it is played, for neutral-venue tournaments. */
  venue?: string
  importance: Importance
  knockout?: KnockoutLeg
  result?: CompactResult
  events?: FixtureEvent[]
}

export interface GroupTable {
  name: string
  teams: string[]
  fixtures: string[]
}

export interface Tie {
  id: string
  home: string | null
  away: string | null
  fixtures: string[]
  winner?: string
  loser?: string
}

export interface KnockoutRound {
  name: string
  dates: ISODate[]
  ties: Tie[]
}

export type StageStatus = "waiting" | "active" | "done"

export interface StageState {
  key: string
  name: string
  kind: "groups" | "knockout"
  status: StageStatus
  groups?: GroupTable[]
  rounds?: KnockoutRound[]
  thirdPlace?: Tie
  /** A knockout whose ties were drawn (not set by the bracket): the only kind with a draw to watch. */
  drawn?: boolean
}

export interface CompetitionOutcome {
  winner?: string
  runnerUp?: string
  third?: string
  /** Teams that earned a place in another competition. */
  qualified?: string[]
  /** Teams sent on to the inter-confederation play-off. */
  interconf?: string[]
  /** Next edition's league composition (Nations Leagues). */
  tiers?: Record<string, string[]>
  /** Best-to-worst finishing order where it is meaningful. */
  placings?: string[]
}

export type CompetitionKind =
  | "world-cup"
  | "continental"
  | "qualifier"
  | "nations-league"
  | "regional"
  | "super-cup"
  | "invitational"

/** How an invitational tournament is played: 4 or 8 teams in one FIFA window. */
export type InvitationalFormat = "knockout" | "league" | "groups"

/** What an invitational tournament was set up with. */
export interface InvitationalSetup {
  /** The window it is played in (its id: the window's first day). */
  window: string
  format: InvitationalFormat
  /** Every team taking part, the host first. */
  teams: string[]
}

export interface CompetitionInstance {
  id: string
  defId: string
  name: string
  short: string
  year: number
  confed: Confed | "FIFA"
  kind: CompetitionKind
  hosts: string[]
  /** Played outside FIFA windows: clubs need not release players. */
  offWindow: boolean
  status: "upcoming" | "active" | "done"
  start: ISODate
  end: ISODate
  stages: StageState[]
  outcome: CompetitionOutcome
  /** An invitational tournament's teams and format. */
  invitational?: InvitationalSetup
  /** Each player's tally while it is on; dropped for `leaders` when it ends. */
  stats?: Record<string, PlayerTally>
  /** The charts and the team of the tournament, cut when it ended. */
  leaders?: CompetitionLeaders
}

/** One player's running figures in one competition. */
export interface PlayerTally {
  /** The position he first played there. */
  pos: Position
  /** Appearances, minutes, goals, assists. */
  a: number
  m: number
  g: number
  s: number
  /** Sum of ratings from games of 30 minutes or more, and how many there were. */
  r: number
  rn: number
  /** Clean sheets kept in goal. */
  cs: number
}

/** A line of a chart: one player's whole tournament. */
export interface LeaderRow {
  id: string
  name: string
  nation: string
  pos: Position
  apps: number
  goals: number
  assists: number
  rating: number
  clean: number
}

export interface CompetitionLeaders {
  /** The day they were worked out. */
  on: ISODate
  /** Appearances needed to be rated, kept or picked. */
  minApps: number
  scorers: LeaderRow[]
  assisters: LeaderRow[]
  ratings: LeaderRow[]
  keepers: LeaderRow[]
  young: LeaderRow[]
  /** The team of the tournament, goalkeeper first, then defenders, midfielders, forwards. */
  xi: LeaderRow[]
  /** The player of the tournament. */
  player: LeaderRow | null
}

export interface Standing {
  team: string
  p: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
}
