/**
 * The under-21 side of the manager's nation. It has a coach of its own: the manager
 * watches it and calls its players up, but does not pick it. In each international
 * window it plays two friendlies against other nations' under-21s, played by
 * themselves on the day. Minutes there count half as much as senior minutes for a
 * youngster's development.
 *
 * Players are the nation's own pool: anyone 21 or under who is not in the senior
 * squad for the window. Other nations' under-21 sides exist only for these matches;
 * they do not play each other.
 */
import type { ISODate, Player } from "../types"
import type { MatchWindow } from "../calendar/windows"
import { aiMentality, aiTeamSheet, available, pickSquad, squadStrength } from "../ai/squad"
import { ageOn, surname } from "../players/ability"
import { cultureOf, nameFrom } from "../players/lifecycle"
import { playMatch } from "../match/engine"
import { deriveSeed, pick, streamFor } from "../rng"
import { msg, nationText } from "../text"
import type { U21Match, U21State } from "./types"
import type { World } from "./world"

export const U21_TUNING = {
  /** Oldest age (on the match day) a player can turn out for the under-21s. */
  maxAge: 21,
  squad: 23,
  /** A nation with fewer eligible players than this fields no under-21 side. */
  minPool: 16,
  /** Friendlies per window. */
  perWindow: 2,
  /** Played matches kept in the save. */
  keep: 40,
  /** An under-21 minute is worth this share of a senior one for development. */
  devShare: 0.5,
  homeBoost: 1,
}

export function u21Eligible(p: Player, date: ISODate): boolean {
  return !p.intlRetired && ageOn(p.born, date) <= U21_TUNING.maxAge
}

/** A nation's under-21 players free on a date: eligible, fit, not in the senior squad. */
export function u21Available(world: World, nationId: string, date: ISODate): Player[] {
  const senior = new Set(world.state.nations[nationId]?.squad ?? [])
  return world
    .pool(nationId)
    .filter((p) => u21Eligible(p, date) && !senior.has(p.id) && !p.banned && available(p, date))
}

/** Senior-equivalent international minutes for development: under-21 ones count half. */
export function developmentMinutes(p: Player): number {
  return (p.intlMin ?? 0) + (p.u21Min ?? 0) * U21_TUNING.devShare
}

/**
 * The under-21 side of the manager's current nation, set up when he takes a job (with a
 * coach of its own) and dropped when he leaves it.
 */
export function ensureU21(world: World): U21State | null {
  const s = world.state
  const me = s.career.nationId
  if (!me) {
    s.u21 = null
    return null
  }
  if (s.u21?.nationId === me) return s.u21
  const rng = streamFor(s.seed, "u21-coach", me, s.date)
  const cultures = world.def(me).cultures
  const [first, last] = nameFrom(cultures.length ? cultureOf(cultures, rng) : "english", rng)
  s.u21 = { nationId: me, coach: { first, last }, squad: [], matches: [] }
  return s.u21
}

/** Book the under-21 friendlies for a window: opponents close in strength, not met lately. */
export function planU21(world: World, w: MatchWindow) {
  const u = ensureU21(world)
  if (!u || u.matches.some((m) => m.window === w.id)) return
  const s = world.state
  const me = u.nationId
  const date = w.slots[0]
  const points = (id: string) => s.nations[id].points
  const confed = world.def(me).confed
  const recent = new Set(u.matches.slice(-6).map((m) => m.opp))
  const candidates = Object.keys(s.nations).filter(
    (id) =>
      id !== me && world.pool(id).filter((p) => u21Eligible(p, date)).length >= U21_TUNING.minPool
  )
  const rng = streamFor(s.seed, "u21", me, w.id)
  const used = new Set<string>()
  let home = rng() < 0.5
  for (const slot of w.slots.slice(0, U21_TUNING.perWindow)) {
    const options = candidates
      .filter((id) => !used.has(id))
      .map((id) => ({
        id,
        score:
          Math.abs(points(id) - points(me)) +
          (world.def(id).confed === confed ? 0 : 110) +
          (recent.has(id) ? 400 : 0) +
          rng() * 220,
      }))
      .sort((a, b) => a.score - b.score)
    if (!options.length) break
    const opp = pick(rng, options.slice(0, 5)).id
    used.add(opp)
    u.matches.push({ id: `u21:${slot}:${me}`, window: w.id, date: slot, opp, home })
    home = !home
  }
  trimU21(u)
}

/** Keep the friendlies still to come and the latest played ones. */
function trimU21(u: U21State) {
  const played = u.matches.filter((m) => m.result || m.cancelled)
  if (played.length <= U21_TUNING.keep) return
  const drop = new Set(played.slice(0, played.length - U21_TUNING.keep))
  u.matches = u.matches.filter((m) => !drop.has(m))
}

/** Play the manager's nation's under-21 friendlies due today (or left behind). */
export function playU21(world: World) {
  const s = world.state
  const u = s.u21
  if (!u || u.nationId !== s.career.nationId) return
  for (const m of u.matches) {
    if (m.result || m.cancelled || m.date > s.date) continue
    playOne(world, u, m)
  }
}

/** Enough for a team: eleven with a keeper among them and a couple to spare. */
function enough(players: Player[]): boolean {
  return players.length >= 13 && players.some((p) => p.pos === "GK")
}

function playOne(world: World, u: U21State, m: U21Match) {
  const s = world.state
  const me = u.nationId
  const date = m.date
  const mine = u21Available(world, me, date)
  const theirs = u21Available(world, m.opp, date)
  if (!enough(mine) || !enough(theirs)) {
    m.cancelled = true
    return
  }
  u.squad = pickSquad(mine, date, U21_TUNING.squad, u.squad)
  const squad = u.squad.map((id) => s.players[id])
  const oppSquad = pickSquad(theirs, date, U21_TUNING.squad).map((id) => s.players[id])
  const strength = squadStrength(squad, date)
  const oppStrength = squadStrength(oppSquad, date)
  const sheet = aiTeamSheet(me, squad, date, { mentality: aiMentality(strength, oppStrength) })
  const oppSheet = aiTeamSheet(m.opp, oppSquad, date, {
    mentality: aiMentality(oppStrength, strength),
  })
  const report = playMatch({
    id: m.id,
    date,
    home: m.home ? sheet : oppSheet,
    away: m.home ? oppSheet : sheet,
    player: (id: string) => s.players[id],
    homeAdvantage: true,
    homeBoost: U21_TUNING.homeBoost,
    seed: deriveSeed(s.seed, "u21", m.id),
  })
  const side = m.home ? "home" : "away"
  const r = report.result
  m.result = m.home ? { gf: r.home, ga: r.away } : { gf: r.away, ga: r.home }
  m.lines = report.lines
    .filter((l) => l.side === side && l.minutes > 0)
    .map((l) => ({
      playerId: l.playerId,
      minutes: l.minutes,
      goals: l.goals,
      assists: l.assists,
      rating: l.rating,
    }))
  m.oppScorers = report.lines
    .filter((l) => l.side !== side)
    .flatMap((l) => Array<string>(l.goals).fill(l.playerId))
  for (const l of m.lines) {
    const p = s.players[l.playerId]
    if (!p) continue
    p.u21Caps = (p.u21Caps ?? 0) + 1
    p.u21Goals = (p.u21Goals ?? 0) + l.goals
    p.u21Min = (p.u21Min ?? 0) + l.minutes
  }
  const scorers = m.lines
    .filter((l) => l.goals > 0)
    .map((l) => {
      const name = surname(s.players[l.playerId])
      return l.goals > 1 ? `${name} (${l.goals})` : name
    })
    .join(", ")
  const homeId = m.home ? me : m.opp
  const awayId = m.home ? m.opp : me
  world.news(
    "result",
    msg("news.u21.title", {
      home: nationText(homeId),
      away: nationText(awayId),
      score: `${r.home}–${r.away}`,
    }),
    scorers ? msg("news.u21.body", { scorers }) : msg("news.u21.bodyNone"),
    true,
    "/u21"
  )
}
