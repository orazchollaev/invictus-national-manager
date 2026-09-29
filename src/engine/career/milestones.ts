/**
 * Milestones of a manager's career: first win, first trophy, a hundred matches,
 * debuts handed out. Each is earned once, recorded with the date and nation, and
 * announced in the inbox.
 */
import type { World } from "../world/world"

const MATCHES = [25, 50, 100, 200, 300]
const DEBUTS = [10, 25, 50]

/** Record a milestone unless it was earned before. Returns whether it is new. */
export function award(world: World, id: string, text: string): boolean {
  const c = world.state.career
  const list = (c.milestones ??= [])
  if (list.some((m) => m.id === id)) return false
  list.push({ id, date: world.state.date, nationId: c.nationId, text })
  world.news("career", "Milestone reached", text, true, "/career")
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
  if (won >= 1) award(world, "first-win", "Your first win as an international head coach.")
  for (const m of MATCHES)
    if (played >= m) award(world, `matches-${m}`, `${m} matches as an international head coach.`)
  for (const d of DEBUTS)
    if ((c.debuts ?? 0) >= d)
      award(world, `debuts-${d}`, `${d} players have won their first cap under you.`)
  if ((c.youthDebuts ?? 0) >= 5)
    award(world, "youth-debuts-5", "Five players aged 21 or under blooded at international level.")
  if ((c.unbeaten ?? 0) >= 10) award(world, "unbeaten-10", "Ten competitive matches unbeaten.")
  if (ranking && c.nationId) {
    const rank = world.fifaRank(c.nationId)
    const name = world.def(c.nationId).name
    if (rank && rank <= 10) award(world, "top-10", `${name} are in the FIFA top ten under you.`)
    if (rank === 1) award(world, "world-no-1", `${name} are the best team in the world.`)
  }
}
