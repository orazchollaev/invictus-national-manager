import type { ISODate, Player } from "../types"
import type { CompetitionInstance, Fixture } from "../competition/types"
import type { Formation, MatchReport, SheetSlot, Tactics } from "../match/types"
import type { Text } from "../text"

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
  /** Towns for new grounds when a mod named its own (else the bundled CITIES). */
  cities?: string[]
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
  | "career"

export interface NewsItem {
  id: number
  date: ISODate
  kind: NewsKind
  title: Text
  body: Text
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
  /** Competition definition this is about ("youth" for a debuts objective). */
  comp: string
  compInstance: string
  kind: "qualify" | "reach" | "win" | "avoid-relegation" | "promotion" | "debuts"
  /** For "reach": the knockout round to get to ("knockout", "Quarter-finals"…). */
  stage?: string
  /** For "qualify": qualification for another event than the usual one. */
  target?: "asian-cup" | "gold-cup"
  /** For "qualify": the manager promised to get there without losing. */
  unbeaten?: boolean
  /** For "debuts": how many youngsters to blood, how many so far, and by when. */
  count?: number
  progress?: number
  until?: ISODate
  /** For a Nations League objective: the league ("A", "B"…). */
  league?: string
  text: Text
  status: "open" | "met" | "failed"
  critical: boolean
  /** false while the board still waits for the manager's word on it. */
  agreed?: boolean
  /** What the manager promised: −1 lowered, 0 as asked, +1 raised. */
  ambition?: -1 | 0 | 1
  /** A raised objective as the board first set it: what stands if the promise breaks. */
  base?: Pick<BoardObjective, "kind" | "stage" | "unbeaten" | "text" | "critical">
  /** The manager promised more and fell short; the original target still stands. */
  broken?: boolean
  /** When it was settled. */
  resolved?: ISODate
}

/** Confidence, reputation and academy level at one moment, for a before/after. */
export interface CareerSnapshot {
  confidence: number
  reputation: number
  youth: number
}

export type ReviewVerdict = "delighted" | "satisfied" | "disappointed" | "ultimatum" | "sacked"

/** The federation's verdict when a competition the manager took part in ends. */
export interface CareerReview {
  /** The competition instance. */
  id: string
  name: Text
  nationId: string
  date: ISODate
  /** How far the team went: "Champions", "Semi-finals", "Qualified"… */
  reached: Text
  winner?: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  objectives: { text: Text; status: BoardObjective["status"]; critical: boolean }[]
  before: CareerSnapshot
  after: CareerSnapshot
  /** Best performers: appearances, goals, average rating. */
  stars: { id: string; name: string; apps: number; goals: number; rating: number }[]
  /** Players aged 21 or under who played. */
  youngsters: { id: string; name: string; age: number; apps: number }[]
  verdict: ReviewVerdict
  message: Text
  contract?: "renewed" | "extended" | "expired"
  contractUntil?: ISODate
}

export interface CareerMilestone {
  id: string
  date: ISODate
  nationId: string | null
  text: Text
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
    trophies: Text[]
    left?: "sacked" | "resigned" | "moved" | "expired"
  }[]
  sacked?: ISODate
  /** When the contract runs out, and the finals it runs to (if any). */
  contractUntil?: ISODate
  contractFor?: string
  /** On a final warning: competitive matches left to turn it round. */
  ultimatum?: { since: ISODate; matches: number } | null
  /** Before-snapshots of competitions under way, for their reviews. */
  snapshots?: Record<string, CareerSnapshot>
  reviews?: CareerReview[]
  milestones?: CareerMilestone[]
  /** Youngsters the manager keeps an eye on. */
  watchlist?: string[]
  /** International debuts handed out, and how many to players aged 21 or under. */
  debuts?: number
  youthDebuts?: number
  /** Competitive matches without defeat, running. */
  unbeaten?: number
  /** Tournament levels the federation bids to host (the user's nation). */
  bids?: ("world-cup" | "continental" | "regional")[]
}

/** Where the loop stopped and why: the UI's cue to take over. */
export type Interrupt =
  | {
      kind: "callup"
      nationId: string
      squadFor: string
      label: Text
      deadline: ISODate
      size: number
    }
  | { kind: "match"; fixtureId: string }
  | { kind: "draw"; compId: string; stageKey: string }
  /** A new offer (nationId), or offers waiting while out of work. */
  | { kind: "offer"; nationId?: string }
  | { kind: "hosting"; compId: string }
  /** The manager lost his job: the farewell is waiting. */
  | { kind: "sacked" }
  /** A competition ended: the federation's review is waiting. */
  | { kind: "review"; id: string }
  | { kind: "ultimatum" }
  /** The board wants the manager's word on a new objective. */
  | { kind: "board"; objectiveId: string }
  /** The year's youngsters have come through. */
  | { kind: "intake" }
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
  /** A competition review not yet read. */
  pendingReview?: string | null
  /** The manager lost his job (sacked or contract not renewed), not yet shown. */
  pendingSacked?: boolean
  /** A final warning not yet shown. */
  pendingUltimatum?: boolean
  /** The user's new youngsters, not yet shown. */
  pendingIntake?: { year: number; ids: string[] } | null
  /**
   * Only in saves from when the user picked friendly opponents: dates still
   * waiting for a pick, settled by the federation when the save is loaded.
   */
  pendingFriendly?: FriendlyChoice[]
  /** Friendlies the user asked for, keyed by date. */
  friendlyRequests: Record<ISODate, string>
  /** The user's own team selection and instructions, kept between matches. */
  userTeam: UserTeam | null
}

/** A friendly date held back for the user (old saves only). */
export interface FriendlyChoice {
  slot: ISODate
  options: { nationId: string; tag: string; home: boolean }[]
}

export interface UserTeam {
  tactics: Tactics
  xi: SheetSlot[]
  bench: string[]
  captainId?: string
  penaltyTakerId?: string
  setPieceTakerId?: string
}
