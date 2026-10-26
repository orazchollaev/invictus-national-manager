/**
 * Milestones of a manager's career, the achievements the career page lists: first
 * win, first trophy, a hundred matches, a thousand goals, a player with a hundred
 * caps. Each is earned once, recorded with the date and nation, and announced in
 * the inbox.
 */
import type { World } from "../world/world"
import { daysBetween } from "../calendar/dates"
import { msg, nationText, type Text } from "../text"

export type AchievementGroup =
  "matches" | "wins" | "goals" | "clean" | "debuts" | "trophies" | "tenure" | "players" | "moments"

/** One row of the achievements page. */
export interface Achievement {
  id: string
  group: AchievementGroup
  text: Text
  /** What counts towards it (a streak, a number of wins); 1 for a single deed. */
  target: number
  progress: number
  /** The count is worth showing; a single deed (a hat-trick) has none. */
  counting: boolean
  done: boolean
  date?: string
}

interface Counter {
  group: AchievementGroup
  prefix: string
  key: string
  tiers: number[]
  value: (world: World) => number
}

const played = (w: World) => w.state.career.history.reduce((a, h) => a + h.played, 0)
const won = (w: World) => w.state.career.history.reduce((a, h) => a + h.won, 0)

/** The best of the user's nation's players, by what `pick` reads from each. */
function bestPlayer(w: World, pick: (p: { caps: number; goals: number }) => number): number {
  const id = w.state.career.nationId
  return id ? w.pool(id).reduce((a, p) => Math.max(a, pick(p)), 0) : 0
}

const COUNTERS: Counter[] = [
  {
    group: "matches",
    prefix: "matches",
    key: "ms.matches",
    tiers: [25, 50, 100, 200, 300, 500, 1000],
    value: played,
  },
  {
    group: "wins",
    prefix: "wins",
    key: "ms.wins",
    tiers: [10, 25, 50, 100, 250],
    value: won,
  },
  {
    group: "goals",
    prefix: "goals",
    key: "ms.goals",
    tiers: [50, 100, 250, 500, 1000],
    value: (w) => w.state.career.tally?.gf ?? 0,
  },
  {
    group: "clean",
    prefix: "clean",
    key: "ms.clean",
    tiers: [10, 25, 50, 100],
    value: (w) => w.state.career.tally?.clean ?? 0,
  },
  {
    group: "debuts",
    prefix: "debuts",
    key: "ms.debuts",
    tiers: [10, 25, 50],
    value: (w) => w.state.career.debuts ?? 0,
  },
  {
    group: "trophies",
    prefix: "trophies",
    key: "ms.trophies",
    tiers: [3, 5, 10],
    value: (w) => w.state.career.history.reduce((a, h) => a + h.trophies.length, 0),
  },
  {
    group: "tenure",
    prefix: "seasons",
    key: "ms.seasons",
    tiers: [3, 5, 10, 20],
    value: (w) => {
      const from = w.state.career.history[0]?.from
      return from ? Math.floor(daysBetween(from, w.state.date) / 365) : 0
    },
  },
  {
    group: "tenure",
    prefix: "nations",
    key: "ms.nations",
    tiers: [2, 3, 5],
    value: (w) => new Set(w.state.career.history.map((h) => h.nationId)).size,
  },
  {
    group: "players",
    prefix: "player-goals",
    key: "ms.playerGoals",
    tiers: [25, 50, 100],
    value: (w) => bestPlayer(w, (p) => p.goals),
  },
  {
    group: "players",
    prefix: "player-caps",
    key: "ms.playerCaps",
    tiers: [50, 100, 150],
    value: (w) => bestPlayer(w, (p) => p.caps),
  },
]

/** Single deeds, earned where they happen: the id, and the message that tells of it. */
const DEEDS: { group: AchievementGroup; id: string; key: string }[] = [
  { group: "moments", id: "rout", key: "ms.rout" },
  { group: "moments", id: "comeback", key: "ms.comeback" },
  { group: "moments", id: "shootout", key: "ms.shootout" },
  { group: "moments", id: "hat-trick", key: "ms.hatTrick" },
]

/** Record a milestone unless it was earned before. Returns whether it is new. */
export function award(world: World, id: string, text: Text): boolean {
  const c = world.state.career
  const list = (c.milestones ??= [])
  if (list.some((m) => m.id === id)) return false
  list.push({ id, date: world.state.date, nationId: c.nationId, text })
  world.news("career", msg("news.milestone"), text, true, "/career")
  return true
}

/**
 * The counting milestones. `ranking` also checks the FIFA ranking, which is only
 * worth doing once a month.
 */
export function checkMilestones(world: World, ranking = false) {
  const c = world.state.career
  if (won(world) >= 1) award(world, "first-win", msg("ms.firstWin"))
  for (const k of COUNTERS) {
    const v = k.value(world)
    for (const n of k.tiers) if (v >= n) award(world, `${k.prefix}-${n}`, msg(k.key, { n }))
  }
  if ((c.youthDebuts ?? 0) >= 5) award(world, "youth-debuts-5", msg("ms.youthDebuts"))
  if ((c.unbeaten ?? 0) >= 10) award(world, "unbeaten-10", msg("ms.unbeaten"))
  if (ranking && c.nationId) {
    const rank = world.fifaRank(c.nationId)
    const name = nationText(c.nationId)
    if (rank && rank <= 10) award(world, "top-10", msg("ms.top10", { nation: name }))
    if (rank === 1) award(world, "world-no-1", msg("ms.no1", { nation: name }))
  }
}

/**
 * Every achievement, earned or not, for the achievements page: the counting ones
 * with how far along they are, then the deeds, then any other milestone earned (a
 * first World Cup, a trophy) with the words it was recorded in.
 */
export function achievementList(world: World): Achievement[] {
  const c = world.state.career
  const earned = new Map((c.milestones ?? []).map((m) => [m.id, m]))
  const out: Achievement[] = []
  const add = (
    id: string,
    group: AchievementGroup,
    text: Text,
    target: number,
    value: number,
    counting: boolean
  ) => {
    const m = earned.get(id)
    out.push({
      id,
      group,
      text: m?.text ?? text,
      target,
      progress: m ? target : Math.min(target, value),
      counting,
      done: !!m,
      date: m?.date,
    })
  }
  add("first-win", "wins", msg("ms.firstWin"), 1, won(world), false)
  for (const k of COUNTERS)
    for (const n of k.tiers)
      add(`${k.prefix}-${n}`, k.group, msg(k.key, { n }), n, k.value(world), true)
  add("youth-debuts-5", "debuts", msg("ms.youthDebuts"), 5, c.youthDebuts ?? 0, true)
  add("unbeaten-10", "moments", msg("ms.unbeaten"), 10, c.unbeaten ?? 0, true)
  for (const d of DEEDS) add(d.id, d.group, msg(d.key), 1, 0, false)
  const listed = new Set(out.map((a) => a.id))
  for (const m of c.milestones ?? [])
    if (!listed.has(m.id))
      out.push({
        id: m.id,
        group: "moments",
        text: m.text,
        target: 1,
        progress: 1,
        counting: false,
        done: true,
        date: m.date,
      })
  return out
}
