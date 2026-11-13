/**
 * The manager's dealings with clubs as they happen in the world: what a match does to
 * the goodwill of his players' clubs, and his requests that a player be given minutes.
 * The rules themselves are in ties.ts; this joins them to the world.
 */
import type { Fixture } from "../competition/types"
import type { MatchReport } from "../match/types"
import { daysBetween } from "../calendar/dates"
import { msg } from "../text"
import { fullName } from "../players/ability"
import type { World } from "../world/world"
import { adjust, ask, askBlock, emptyTies, relOf, type AskBlock, type ClubTies } from "./ties"

/** What a player who played a real part earns his club, per player and per match. */
const PLAYED = 0.6
const PLAYED_FRIENDLY = 0.3
const PLAYED_CAP = 1.5

export function ensureClubTies(world: World): ClubTies {
  return (world.state.clubTies ??= emptyTies())
}

/**
 * After one of the manager's matches: clubs whose players played a part are pleased, and
 * the club of a player who is hurt is not.
 */
export function clubsAfterMatch(world: World, f: Fixture, report: MatchReport) {
  const me = world.userNation
  if (!me) return
  const s = world.state
  const ties = ensureClubTies(world)
  const side = f.home === me ? "home" : "away"
  const each = f.compId === "friendly" ? PLAYED_FRIENDLY : PLAYED

  const played = new Map<string, { n: number; name: string; minutes: number }>()
  for (const line of report.lines) {
    if (line.side !== side || line.minutes < 45) continue
    const p = s.players[line.playerId]
    if (!p || p.nationId !== me || !world.clubs.has(p.clubId)) continue
    const seen = played.get(p.clubId)
    if (seen) seen.n++
    else played.set(p.clubId, { n: 1, name: fullName(p), minutes: line.minutes })
  }
  for (const [clubId, { n, name, minutes }] of played) {
    const text =
      n === 1 ? msg("clubLog.played", { name, minutes }) : msg("clubLog.playedMany", { n })
    adjust(ties, clubId, Math.min(PLAYED_CAP, each * n), f.date, text)
  }

  for (const e of report.events) {
    if (e.kind !== "injury" || e.side !== side || !e.playerId) continue
    const p = s.players[e.playerId]
    if (!p?.injury || p.nationId !== me || !world.clubs.has(p.clubId)) continue
    const days = daysBetween(f.date, p.injury.until)
    const cost = days >= 60 ? -9 : days >= 21 ? -6 : -3
    adjust(ties, p.clubId, cost, f.date, msg("clubLog.injured", { name: fullName(p), days }))
  }
}

export type AskOutcome =
  { status: "blocked"; why: AskBlock | "club" } | { status: "granted" | "refused"; club: string }

/**
 * The manager asks a club to give one of his players more football. A club that likes
 * him may agree, which lifts the player's role a step; one that does not takes offence.
 */
export function askForMinutes(world: World, playerId: string): AskOutcome {
  const s = world.state
  const p = s.players[playerId]
  if (!p || p.nationId !== world.userNation) return { status: "blocked", why: "club" }
  const ties = ensureClubTies(world)
  const why = askBlock(p, ties, s.date)
  if (why) return { status: "blocked", why }
  const club = world.clubs.get(p.clubId)
  if (!club) return { status: "blocked", why: "club" }

  const result = ask(s.seed, p, s.date, world.clubProfile(club.id).reputation, relOf(ties, club.id))
  ties.asked[p.id] = s.date
  if (result.granted && result.role) p.role = result.role
  const key = result.granted ? "granted" : "refused"
  adjust(ties, club.id, result.delta, s.date, msg(`clubLog.ask.${key}`, { name: fullName(p) }))
  world.news(
    "transfer",
    msg(`news.clubs.ask.${key}.title`, { name: fullName(p) }),
    msg(`news.clubs.ask.${key}.body`, { name: fullName(p), club: club.name }),
    true,
    `/club/${club.id}`
  )
  return { status: key, club: club.id }
}
