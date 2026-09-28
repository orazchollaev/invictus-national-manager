import type { ISODate, Player } from "../types"
import type { CompetitionInstance, Fixture } from "../competition/types"
import type { Formation, MatchReport, SheetSlot, Tactics } from "../match/types"

export interface RecentResult {
  fixture: string
  date: ISODate
  opp: string
  gf: number
  ga: number
  /** Won or lost a level tie on penalties. */
  pens?: "W" | "L"
  comp: string
}

export interface NationState {
  id: string
  points: number
  youthLevel: number
  coach: string
  formation: Formation
  /** The squad named for the current window or tournament. */
  squad: string[]
  /** What the squad was named for (window start or competition id). */
  squadFor: string | null
  results: RecentResult[]
  /** Month-end ranking points, oldest first. */
  pointsHistory: [ISODate, number][]
  /** Federation standing 1–10: success raises it, and with it the academies. */
  reputation: number
  /** Stadium level 1–5, from the grounds below: home advantage. */
  stadium: number
  /** Grounds city by city, biggest first. */
  stadiums?: Stadium[]
  /** Grounds being built or expanded. */
  projects?: StadiumProject[]
}

export interface Stadium {
  id: string
  name: string
  city: string
  capacity: number
  /** Year it opened, for grounds built in the game. */
  opened?: number
}

export interface StadiumProject {
  id: string
  kind: "build" | "expand"
  /** The ground being expanded. */
  stadiumId?: string
  name: string
  city: string
  /** Capacity once finished. */
  capacity: number
  started: ISODate
  done: ISODate
  /** The tournament it is being built for. */
  forComp?: string
}

export type NewsKind =
  | "result"
  | "injury"
  | "retirement"
  | "wonderkid"
  | "board"
  | "job"
  | "draw"
  | "tournament"
  | "callup"
  | "ranking"
  | "season"
  | "transfer"
  | "stadium"

export interface NewsItem {
  id: number
  date: ISODate
  kind: NewsKind
  title: string
  body: string
  /** Relevant to the user's nation (shown in the inbox, not just the world feed). */
  mine: boolean
  read?: boolean
  link?: string
}

export interface Honour {
  year: number
  comp: string
  winner: string
  runnerUp?: string
  third?: string
  hosts: string[]
}

export interface RetiredPlayer {
  id: string
  nationId: string
  name: string
  pos: string
  caps: number
  goals: number
  retired: ISODate
}

export interface BoardObjective {
  id: string
  /** Competition definition this is about. */
  comp: string
  compInstance: string
  kind: "qualify" | "reach" | "win" | "avoid-relegation" | "promotion"
  /** For "reach": the knockout round to get to ("knockout", "Quarter-finals"…). */
  stage?: string
  /** For "qualify": qualification for another event than the usual one. */
  target?: "asian-cup" | "gold-cup"
  text: string
  status: "open" | "met" | "failed"
  critical: boolean
}

export interface CareerState {
  managerName: string
  nationality: string
  nationId: string | null
  /** 0–100: the federation's patience. */
  confidence: number
  /** 1–100: how the wider football world rates the manager. */
  reputation: number
  since: ISODate
  objectives: BoardObjective[]
  offers: { nationId: string; expires: ISODate }[]
  history: {
    nationId: string
    from: ISODate
    to: ISODate | null
    played: number
    won: number
    drawn: number
    lost: number
    trophies: string[]
    left?: "sacked" | "resigned" | "moved"
  }[]
  sacked?: ISODate
  /** Tournament levels the federation bids to host (the user's nation). */
  bids?: ("world-cup" | "continental" | "regional")[]
}

/** Where the loop stopped and why: the UI's cue to take over. */
export type Interrupt =
  | {
      kind: "callup"
      nationId: string
      squadFor: string
      label: string
      deadline: ISODate
      size: number
    }
  | { kind: "match"; fixtureId: string }
  | { kind: "draw"; compId: string; stageKey: string }
  /** A new offer (nationId), or offers waiting while out of work. */
  | { kind: "offer"; nationId?: string }
  | { kind: "hosting"; compId: string }
  | { kind: "sacked" }
  | { kind: "news"; count: number }
  | { kind: "none" }

export interface WorldState {
  version: number
  seed: number
  date: ISODate
  nations: Record<string, NationState>
  players: Record<string, Player>
  nextId: number
  competitions: Record<string, CompetitionInstance>
  fixtures: Record<string, Fixture>
  reports: Record<string, MatchReport>
  news: NewsItem[]
  nextNewsId: number
  honours: Record<string, Honour[]>
  retired: RetiredPlayer[]
  career: CareerState
  /** Call-ups the user still has to make, by window/competition key. */
  pendingCallup: Interrupt | null
  /** A draw involving the user, waiting to be watched. */
  pendingDraw?: { compId: string; stageKey: string } | null
  /** A job offer that arrived and has not been seen yet. */
  pendingOffer?: string | null
  /** A tournament the user's nation was awarded, not yet announced to him. */
  pendingHosting?: string | null
  /** Friendlies the user asked for, keyed by date. */
  friendlyRequests: Record<ISODate, string>
  /** The user's own team selection and instructions, kept between matches. */
  userTeam: UserTeam | null
}

export interface UserTeam {
  tactics: Tactics
  xi: SheetSlot[]
  bench: string[]
  captainId?: string
  penaltyTakerId?: string
  setPieceTakerId?: string
}
