/**
 * Milestones of a manager's career: first win, first trophy, a hundred matches,
 * debuts handed out. Each is earned once, recorded with the date and nation, and
 * announced in the inbox.
 */
import type { World } from "../world/world"
import { msg, nationText, type Text } from "../text"

const MATCHES = [25, 50, 100, 200, 300]
const DEBUTS = [10, 25, 50]

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
  const played = c.history.reduce((a, h) => a + h.played, 0)
  const won = c.history.reduce((a, h) => a + h.won, 0)
  if (won >= 1) award(world, "first-win", msg("ms.firstWin"))
  for (const m of MATCHES)
    if (played >= m) award(world, `matches-${m}`, msg("ms.matches", { n: m }))
  for (const d of DEBUTS)
    if ((c.debuts ?? 0) >= d) award(world, `debuts-${d}`, msg("ms.debuts", { n: d }))
  if ((c.youthDebuts ?? 0) >= 5) award(world, "youth-debuts-5", msg("ms.youthDebuts"))
  if ((c.unbeaten ?? 0) >= 10) award(world, "unbeaten-10", msg("ms.unbeaten"))
  if (ranking && c.nationId) {
    const rank = world.fifaRank(c.nationId)
    const name = nationText(c.nationId)
    if (rank && rank <= 10) award(world, "top-10", msg("ms.top10", { nation: name }))
    if (rank === 1) award(world, "world-no-1", msg("ms.no1", { nation: name }))
  }
}
