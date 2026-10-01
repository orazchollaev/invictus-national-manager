import type { Standing } from "@/engine/competition/types"
import type { Zone } from "./zones"

/** Where a team stands in its group's race: through, out, or still to be settled. */
export type Outlook = "qualified" | "eliminated" | null

/** Positions that settle a place the moment they are secured. */
const DEFINITE = new Set<Zone>(["through", "advance", "qf", "host", "wc-ac", "next"])
/** Positions that keep a team in the race, at least for a place in the best-placed list. */
const ALIVE = new Set<Zone>([
  ...DEFINITE,
  "third",
  "maybe",
  "playoff",
  "ic",
  "host-group",
  "champion",
])

const MATCH = 3

/**
 * Who has gone through and who is out, from the table, the matches each team has
 * left and what each position leads to.
 *
 *  - While the stage is on, a team is through once no more than `k - 1` rivals can
 *    still reach its points (`k` positions are secure ones), and out once enough
 *    rivals are already beyond what it can reach. Ties are counted against the team,
 *    so this never promises a place a tie-break could take away.
 *  - Positions that depend on other groups (best third-placed teams) stay open until
 *    the stage is over; then `advanced` — the teams that went on — decides.
 *
 * `advanced` is undefined while the stage is being played, and a set once it is
 * over and the next stage is known (null when it is over but not yet known).
 */
export function outlookOf(
  rows: Standing[],
  left: number[],
  zones: (Zone | null)[],
  advanced?: Set<string> | null
): Outlook[] {
  const out: Outlook[] = rows.map(() => null)
  const secure = leading(zones, (z) => DEFINITE.has(z))
  const alive = leading(zones, (z) => ALIVE.has(z))
  if (!alive) return out

  if (advanced !== undefined) {
    rows.forEach((r, i) => {
      const zone = zones[i]
      if (zone && DEFINITE.has(zone)) out[i] = "qualified"
      else if (advanced?.has(r.team)) out[i] = "qualified"
      else if (advanced) out[i] = "eliminated"
    })
    return out
  }

  const max = rows.map((r, i) => r.pts + left[i] * MATCH)
  rows.forEach((r, i) => {
    const others = rows.map((_, j) => j).filter((j) => j !== i)
    if (secure && others.filter((j) => max[j] >= r.pts).length <= secure - 1) out[i] = "qualified"
    else if (others.filter((j) => rows[j].pts > max[i]).length >= alive) out[i] = "eliminated"
  })
  return out
}

/** How many positions from the top satisfy `test`, counted until the first that does not. */
function leading(zones: (Zone | null)[], test: (z: Zone) => boolean): number {
  let n = 0
  while (n < zones.length && zones[n] && test(zones[n]!)) n++
  return n
}
