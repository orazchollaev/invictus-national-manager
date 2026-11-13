/**
 * The manager's standing with the clubs his players belong to, and what it buys.
 *
 * A club owes the national team its players for the FIFA windows' official matches, but
 * not for friendlies, and how it treats the manager the rest of the time shows. Goodwill
 * (0–100, 50 when the two have never dealt) rises when his players play for him and fall
 * when they come back hurt; it settles back to neutral with time. It decides whether a
 * club lets a player go for a friendly, and whether it listens when he asks for the
 * player to be given more minutes.
 */
import type { ClubRole, ISODate, Player } from "../types"
import type { Msg } from "../text"
import { clamp, streamFor } from "../rng"
import { daysBetween } from "../calendar/dates"

export const NEUTRAL = 50
/** Events kept per club, newest last. */
const LOG_LIMIT = 12
/** Days after which an event is no longer shown. */
const LOG_DAYS = 730

export interface ClubEvent {
  date: ISODate
  text: Msg
  /** Change in goodwill, as the manager saw it. */
  delta: number
}

export interface ClubTies {
  /** Goodwill by club; a club not listed is at NEUTRAL. */
  rel: Record<string, number>
  log: Record<string, ClubEvent[]>
  /** The last day the manager asked for each player to be given minutes. */
  asked: Record<string, ISODate>
}

export function emptyTies(): ClubTies {
  return { rel: {}, log: {}, asked: {} }
}

export function relOf(ties: ClubTies | undefined, clubId: string): number {
  return ties?.rel[clubId] ?? NEUTRAL
}

/** Move a club's goodwill, keep a note of why, and return the new value. */
export function adjust(
  ties: ClubTies,
  clubId: string,
  delta: number,
  date: ISODate,
  text?: Msg
): number {
  const next = Math.round(clamp(relOf(ties, clubId) + delta, 0, 100) * 10) / 10
  ties.rel[clubId] = next
  if (text) {
    const list = (ties.log[clubId] ??= [])
    list.push({ date, text, delta: Math.round(delta * 10) / 10 })
    if (list.length > LOG_LIMIT) list.shift()
  }
  return next
}

/** Month's end: goodwill drifts back to neutral, and old notes are dropped. */
export function settle(ties: ClubTies, date: ISODate) {
  for (const id of Object.keys(ties.rel)) {
    const v = ties.rel[id] + (NEUTRAL - ties.rel[id]) * 0.06
    // Within a point of neutral counts as neutral; a smaller step would round to nothing.
    if (Math.abs(v - NEUTRAL) < 1) delete ties.rel[id]
    else ties.rel[id] = Math.round(v * 10) / 10
  }
  for (const id of Object.keys(ties.log)) {
    const kept = ties.log[id].filter((e) => daysBetween(e.date, date) <= LOG_DAYS)
    if (kept.length) ties.log[id] = kept
    else delete ties.log[id]
  }
}

/** The mood of a club towards the manager, from 1 (hostile) to 5 (devoted). */
export function mood(rel: number): 1 | 2 | 3 | 4 | 5 {
  return rel >= 80 ? 5 : rel >= 62 ? 4 : rel >= 38 ? 3 : rel >= 20 ? 2 : 1
}

// ── Releasing players for friendlies ────────────────────────────────────────

/** How likely a club is to want a player kept, by how much it relies on him. */
const ROLE_RISK: Record<ClubRole, number> = {
  star: 0.24,
  starter: 0.11,
  rotation: 0.04,
  bench: 0.015,
  reserve: 0,
}

/**
 * The chance a club keeps a player back from a friendly. The bigger the club and the more
 * it leans on him, the likelier; goodwill with the manager cuts it, and a club in the
 * player's own country, who sees him anyway, is far less protective.
 */
export function refusalChance(
  role: ClubRole,
  reputation: number,
  rel: number,
  homeLeague: boolean
): number {
  const standing = 0.6 + (reputation / 100) * 0.8
  const goodwill = 1.8 - rel * 0.016
  return clamp(ROLE_RISK[role] * standing * goodwill * (homeLeague ? 0.5 : 1), 0, 0.7)
}

/**
 * Whether a club keeps a player back from the friendlies of one window. A draw of the
 * player and the window, so it is the same whenever it is asked, and the call-up screen
 * can say so before the squad is named.
 */
export function withholds(
  seed: number,
  p: Player,
  key: string,
  reputation: number,
  rel: number,
  homeLeague: boolean
): boolean {
  const chance = refusalChance(p.role, reputation, rel, homeLeague)
  if (chance <= 0) return false
  return streamFor(seed, "release", p.id, key)() < chance
}

// ── Asking for minutes ──────────────────────────────────────────────────────

/** Days before the manager may ask again about the same player. */
export const ASK_COOLDOWN = 90

const STEP_UP: Partial<Record<ClubRole, ClubRole>> = {
  reserve: "bench",
  bench: "rotation",
  rotation: "starter",
}

const ASK_BASE: Partial<Record<ClubRole, number>> = { rotation: 0.55, bench: 0.38, reserve: 0.22 }

export type AskBlock = "role" | "wait" | null

/** Whether the manager can ask for this player to play more, and if not why not. */
export function askBlock(p: Player, ties: ClubTies | undefined, date: ISODate): AskBlock {
  if (!STEP_UP[p.role]) return "role"
  const last = ties?.asked[p.id]
  if (last && daysBetween(last, date) < ASK_COOLDOWN) return "wait"
  return null
}

/** The chance a club agrees to give the player more football. */
export function askChance(role: ClubRole, reputation: number, rel: number): number {
  const base = ASK_BASE[role] ?? 0
  return clamp(base + (rel - NEUTRAL) * 0.006 - (reputation - 60) * 0.002, 0.05, 0.9)
}

export interface AskResult {
  granted: boolean
  /** The role the player now has when it was granted. */
  role?: ClubRole
  /** Change in goodwill. */
  delta: number
}

/** Settle a request: the draw, the player's new role and the cost in goodwill. */
export function ask(
  seed: number,
  p: Player,
  date: ISODate,
  reputation: number,
  rel: number
): AskResult {
  const up = STEP_UP[p.role]
  const chance = askChance(p.role, reputation, rel)
  if (up && streamFor(seed, "ask", p.id, date)() < chance)
    return { granted: true, role: up, delta: -2 }
  return { granted: false, delta: -4 }
}
