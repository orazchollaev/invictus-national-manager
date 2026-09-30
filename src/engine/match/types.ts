import type { Position } from "../types"
import type { Role } from "./roles"

export type Side = "home" | "away"

export type Formation =
  | "4-4-2"
  | "4-3-3"
  | "4-2-3-1"
  | "4-1-4-1"
  | "4-4-1-1"
  | "4-3-1-2"
  | "3-5-2"
  | "3-4-3"
  | "5-3-2"
  | "5-4-1"

/** −2 very defensive … +2 very attacking. */
export type Mentality = -2 | -1 | 0 | 1 | 2
/** 0 low, 1 standard, 2 high. */
export type Level = 0 | 1 | 2

export interface Tactics {
  formation: Formation
  mentality: Mentality
  pressing: Level
  tempo: Level
  /** Defensive line: 0 deep, 1 standard, 2 high. Saves that predate it play standard. */
  line?: Level
  /** Width of the attack: 0 narrow, 1 standard, 2 wide. */
  width?: Level
  /** Sit back and hit the opponent on the break. */
  counter?: boolean
}

export interface SheetSlot {
  playerId: string
  /** The role the slot asks for, which may differ from the player's own position. */
  pos: Position
  /** What the manager asks of the slot; none is the plain version of the position. */
  role?: Role
}

export interface TeamSheet {
  nationId: string
  xi: SheetSlot[]
  bench: string[]
  tactics: Tactics
  captainId?: string
  penaltyTakerId?: string
  setPieceTakerId?: string
}

export type MatchEventKind =
  | "kickoff"
  | "half-time"
  | "second-half"
  | "full-time"
  | "et-start"
  | "et-half-time"
  | "et-second-half"
  | "et-end"
  | "attack"
  | "goal"
  | "own-goal"
  | "pen-goal"
  | "pen-miss"
  | "pen-saved"
  | "penalty-awarded"
  | "shot-saved"
  | "shot-wide"
  | "shot-blocked"
  | "woodwork"
  | "big-chance-missed"
  | "corner"
  | "free-kick"
  | "foul"
  | "yellow"
  | "second-yellow"
  | "red"
  | "offside"
  | "injury"
  | "sub"
  | "tactics"
  | "shootout-goal"
  | "shootout-miss"
  | "shootout-end"

/** Events that change the match state or deserve a line even in the short feed. */
export const KEY_EVENTS: ReadonlySet<MatchEventKind> = new Set([
  "goal",
  "own-goal",
  "pen-goal",
  "pen-miss",
  "pen-saved",
  "red",
  "second-yellow",
  "injury",
])

export interface MatchEvent {
  /** Match clock minute (1–120). Stoppage time repeats the last minute of the half. */
  minute: number
  /** Minutes into stoppage time, when `minute` is 45/90/105/120. */
  added?: number
  kind: MatchEventKind
  side: Side | null
  playerId?: string
  /** Assist provider, fouled player, player coming on, or the keeper who saved. */
  otherId?: string
  xg?: number
  /** Score after the event, for goals. */
  score?: [number, number]
}

export interface TeamStats {
  possession: number
  shots: number
  onTarget: number
  xg: number
  corners: number
  fouls: number
  yellows: number
  reds: number
  offsides: number
  saves: number
}

export interface PlayerLine {
  playerId: string
  side: Side
  pos: Position
  started: boolean
  minutes: number
  goals: number
  assists: number
  shots: number
  onTarget: number
  saves: number
  yellow: number
  red: number
  injured: boolean
  rating: number
}

export interface MatchResult {
  home: number
  away: number
  /** Score at half-time. */
  ht: [number, number]
  /** Score after 90 minutes, when the match went to extra time. */
  ft?: [number, number]
  pens?: [number, number]
  /** Winner of a tie that needed one (after aggregate, extra time or penalties). */
  winner?: Side
}

export interface MatchReport {
  result: MatchResult
  events: MatchEvent[]
  stats: [TeamStats, TeamStats]
  lines: PlayerLine[]
}
