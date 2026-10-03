import type { ISODate, Player } from "../types"
import type { CompetitionInstance, Fixture, InvitationalFormat } from "../competition/types"
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
  /** The head coach's name, for display ("" while the job is vacant). */
  coach: string
  /**
   * The head coach: a `Coach` id, `USER_COACH` for the user, or null while the job
   * is vacant. Missing only in saves from before coaches were people.
   */
  coachId?: string | null
  /** When the job fell vacant. */
  vacantSince?: ISODate
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
  /** Every match played since the game began: totals and landmarks. */
  record?: NationRecord
}

/** A match worth remembering: the biggest win, the heaviest defeat. */
export interface RecordMatch {
  fixture: string
  date: ISODate
  opp: string
  gf: number
  ga: number
}

/** A nation's all-time record in the game, kept as matches are played. */
export interface NationRecord {
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  /** Matches without conceding. */
  cleanSheets: number
  biggestWin?: RecordMatch
  heaviestDefeat?: RecordMatch
  /** Best and worst FIFA ranking position at a month's end, with when. */
  bestRank?: [number, ISODate]
  worstRank?: [number, ISODate]
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
  | "fans"

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
  assists?: number
  cleanSheets?: number
  retired: ISODate
}

/** One job a coach held. */
export interface CoachStint {
  nationId: string
  from: ISODate
  to: ISODate | null
  played: number
  won: number
  drawn: number
  lost: number
  left?: "sacked" | "retired"
}

/** A head coach of the AI world: hired, judged, sacked, ageing and retiring. */
export interface Coach {
  id: string
  first: string
  last: string
  nationality: string
  born: ISODate
  /** 1–100: how the football world rates him; it decides which jobs he gets. */
  reputation: number
  /** The job he holds, or null when out of work. */
  nationId: string | null
  /** 0–100: his federation's patience; at the bottom he is sacked. */
  confidence: number
  history: CoachStint[]
  /** First day he can take a job (a former player finishing his badges). */
  available?: ISODate
  retired?: ISODate
  /** Key his face is drawn from: a former player keeps the face he played with. */
  face: string
  /** A former international: what he did as a player. */
  player?: { caps: number; goals: number; pos: string }
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
  /** The fans' support (saves from before it existed have none). */
  support?: number
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
  /**
   * 0–100: the fans' support. Quicker to move than the board's confidence and
   * quicker to forget: results, the manner of them and derbies count most.
   */
  support?: number
  /** 1–100: how the wider football world rates the manager. */
  reputation: number
  since: ISODate
  objectives: BoardObjective[]
  offers: { nationId: string; expires: ISODate }[]
  /** When the last offer came: a manager in work is not approached again for a while. */
  lastOffer?: ISODate
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
  /** Another federation invites the user's nation to its tournament. */
  | { kind: "invite" }
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
  /** Every AI head coach: in work, out of work or retired. */
  coaches?: Record<string, Coach>
  nextCoachId?: number
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
  /** An invitation to another federation's tournament, waiting for an answer. */
  invite?: TournamentInvite | null
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

/** Another federation's invitational tournament, offered to the user's nation. */
export interface TournamentInvite {
  /** The window it would be played in (its id). */
  window: string
  format: InvitationalFormat
  /** The host first, the user's nation among them. */
  teams: string[]
  /** The answer is needed by then. */
  expires: ISODate
  /** Shown to the user once; it still waits for his answer. */
  seen?: boolean
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
