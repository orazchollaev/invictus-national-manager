import type { World } from "./world"
import { addDays } from "../calendar/dates"

/** How long the match-by-match record of a finished tournament is kept. */
export const KEEP_DAYS = 4 * 366

/**
 * Forget the individual matches of tournaments that ended long ago. A game left running
 * for decades would otherwise carry every fixture ever played, and every save, load and
 * scan would grow with it. What stays: the tournaments themselves (stages, outcomes,
 * hosts), honours, each nation's totals, player careers, and every match of the user's
 * own nation. Returns how many fixtures went.
 */
export function pruneOldFixtures(world: World): number {
  const s = world.state
  const cutoff = addDays(s.date, -KEEP_DAYS)
  const me = s.career.nationId
  let removed = 0
  for (const f of Object.values(s.fixtures)) {
    if (!f.result || f.date >= cutoff) continue
    if (f.home === me || f.away === me) continue
    const inst = s.competitions[f.compId]
    if (inst && inst.status !== "done") continue
    delete s.fixtures[f.id]
    delete s.reports[f.id]
    removed++
  }
  if (removed) world.reindex()
  return removed
}
