/**
 * The abstract club market: where a player of a given ability plays, and how his
 * role there shapes his sharpness and development. Clubs are never simulated; only
 * their level (tier 1 elite … 5 semi-professional) and the player's role matter.
 */
import type { Club, ClubRole, Confed, Player } from "../types"
import { gauss, pick, pickWeighted, type Rng } from "../rng"

export type ClubIndex = Map<string, string[][]>

/** clubs by league nation, then by tier (index 0 = tier 1). */
export function indexClubs(clubs: Iterable<Club>): ClubIndex {
  const index: ClubIndex = new Map()
  for (const c of clubs) {
    let tiers = index.get(c.nationId)
    if (!tiers) index.set(c.nationId, (tiers = [[], [], [], [], []]))
    tiers[c.tier - 1].push(c.id)
  }
  return index
}

/** Where players from each confederation go when their own league has no room. */
export const ABROAD: Record<Confed, [string, number][]> = {
  UEFA: [
    ["ENG", 30],
    ["ESP", 14],
    ["GER", 16],
    ["ITA", 14],
    ["FRA", 10],
    ["POR", 4],
    ["NED", 5],
    ["BEL", 5],
    ["TUR", 8],
    ["KSA", 4],
    ["USA", 3],
    ["SUI", 3],
    ["AUT", 3],
    ["SCO", 3],
    ["GRE", 3],
    ["CYP", 2],
    ["DEN", 2],
    ["POL", 2],
    ["QAT", 1],
    ["CZE", 1],
    ["HUN", 1],
    ["ROU", 1],
    ["RUS", 1],
  ],
  CONMEBOL: [
    ["ESP", 16],
    ["ITA", 10],
    ["ENG", 12],
    ["POR", 10],
    ["BRA", 12],
    ["ARG", 10],
    ["MEX", 8],
    ["USA", 8],
    ["FRA", 4],
    ["GER", 4],
    ["TUR", 3],
    ["KSA", 3],
  ],
  CONCACAF: [
    ["USA", 35],
    ["MEX", 20],
    ["ENG", 10],
    ["ESP", 4],
    ["NED", 4],
    ["BEL", 3],
    ["GER", 4],
    ["SCO", 3],
    ["POR", 3],
    ["ITA", 2],
    ["TUR", 2],
    ["GRE", 2],
    ["CRO", 1],
  ],
  CAF: [
    ["FRA", 22],
    ["ENG", 12],
    ["BEL", 8],
    ["POR", 8],
    ["TUR", 8],
    ["KSA", 7],
    ["EGY", 5],
    ["MAR", 4],
    ["TUN", 3],
    ["RSA", 4],
    ["ITA", 5],
    ["GER", 4],
    ["ESP", 4],
    ["QAT", 3],
    ["UAE", 3],
    ["SUI", 2],
    ["DEN", 2],
    ["NOR", 2],
    ["SWE", 2],
    ["RUS", 1],
    ["USA", 2],
  ],
  AFC: [
    ["KSA", 18],
    ["QAT", 12],
    ["UAE", 12],
    ["JPN", 10],
    ["KOR", 8],
    ["CHN", 6],
    ["AUS", 5],
    ["ENG", 5],
    ["GER", 5],
    ["ESP", 3],
    ["BEL", 4],
    ["NED", 3],
    ["POR", 3],
    ["FRA", 3],
    ["SCO", 2],
    ["TUR", 2],
  ],
  OFC: [
    ["AUS", 40],
    ["ENG", 10],
    ["USA", 10],
    ["SCO", 6],
    ["GER", 4],
    ["NED", 4],
    ["JPN", 4],
    ["KOR", 2],
  ],
}

/** The level a player of this ability plays at, with a little luck either way. */
export function tierForAbility(ca: number, rng: Rng): number {
  const x = ca + gauss(rng, 0, 2.5)
  if (x >= 82) return 1
  if (x >= 74) return 2
  if (x >= 66) return 3
  if (x >= 57) return 4
  return 5
}

/** Ability a club of each tier expects from a regular starter. */
const TIER_CENTRE = [84, 77, 70, 62, 52]

export function roleAt(ca: number, tier: number, rng: Rng): ClubRole {
  const d = ca - TIER_CENTRE[tier - 1] + gauss(rng, 0, 2)
  if (d > 5) return "star"
  if (d > 0) return "starter"
  if (d > -4) return "rotation"
  if (d > -8) return "bench"
  return "reserve"
}

export function findClub(
  index: ClubIndex,
  nationId: string,
  confed: Confed,
  tier: number,
  age: number,
  rng: Rng
): string {
  const home = index.get(nationId) ?? [[], [], [], [], []]
  const stayHome = age <= 19 ? 0.85 : tier >= 4 ? 0.75 : 0.4
  if (home[tier - 1].length && rng() < stayHome) return pick(rng, home[tier - 1])
  for (let t = tier; t <= 5; t++) {
    const options = ABROAD[confed].filter(
      ([id]) => id !== nationId && index.get(id)?.[t - 1].length
    )
    if (options.length) {
      const [league] = pickWeighted(rng, options, ([, w]) => w)
      return pick(rng, index.get(league)![t - 1])
    }
    if (home[t - 1].length) return pick(rng, home[t - 1])
  }
  for (let t = 4; t >= 0; t--) if (home[t].length) return pick(rng, home[t])
  // A nation with no league of its own: anywhere at the bottom.
  const anyLeague = [...index.values()].find((tiers) => tiers[4].length)!
  return pick(rng, anyLeague[4])
}

/** Summer move: players whose level has drifted from their club's move on. */
export function summerMove(
  p: Player,
  clubs: Map<string, Club>,
  index: ClubIndex,
  confed: Confed,
  age: number,
  rng: Rng
): boolean {
  const current = clubs.get(p.clubId)
  const ideal = tierForAbility(p.ca, rng)
  const tier = current?.tier ?? 5
  const moving = tier !== ideal && rng() < (ideal < tier ? 0.55 : 0.4)
  const restless = rng() < 0.06
  if (moving || restless || !current) {
    const target = moving ? ideal : tier
    p.clubId = findClub(index, p.nationId, confed, target, age, rng)
  }
  const now = clubs.get(p.clubId)
  p.role = roleAt(p.ca, now?.tier ?? 5, rng)
  return moving || restless
}
