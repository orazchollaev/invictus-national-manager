/**
 * A starting squad for a nation the game does not ship (one a mod adds): names drawn
 * from its naming cultures, ability from the same curve as every other pool
 * (quality.ts), written as the compact rows a mod keeps. Seeded, so a nation always
 * gets the same squad.
 */
import type { ISODate, NationDef, Position } from "../types"
import { addDays } from "../calendar/dates"
import { clamp, gauss, pick, pickWeighted, randInt, streamFor } from "../rng"
import type { PlayerRow } from "../world/create"
import { nationTop, peakAt } from "./quality"
import { ageFactor, cultureOf, nameFrom } from "./lifecycle"

/** Three keepers and a spread of outfield players, as many as a squad list names. */
const SHAPE: [Position, number][] = [
  ["GK", 3],
  ["CB", 4],
  ["LB", 2],
  ["RB", 2],
  ["DM", 2],
  ["CM", 3],
  ["AM", 2],
  ["LW", 2],
  ["RW", 2],
  ["ST", 4],
]

export const SQUAD_SIZE = SHAPE.reduce((n, [, k]) => n + k, 0)

const AGES: [number, number][] = [
  [19, 2],
  [20, 3],
  [21, 4],
  [22, 5],
  [23, 6],
  [24, 7],
  [25, 8],
  [26, 8],
  [27, 8],
  [28, 7],
  [29, 6],
  [30, 5],
  [31, 4],
  [32, 3],
  [33, 2],
  [34, 1],
]

const trait = (rng: () => number, mean = 11) => Math.round(clamp(gauss(rng, mean, 3.5), 1, 20))

/**
 * `clubIds` are the nation's clubs, best first: the better half of the squad goes to
 * the first and the rest to the others. `date` is the game date ages are counted on.
 */
export function generateSquad(
  nation: NationDef,
  clubIds: string[],
  date: ISODate,
  seed: number
): PlayerRow[] {
  const rng = streamFor(seed, "mod-squad", nation.id)
  const positions = SHAPE.flatMap(([pos, n]) => Array<Position>(n).fill(pos))
  const ages = positions.map(() => pickWeighted(rng, AGES, ([, w]) => w)[0])
  // The best ranks go mostly to players in their prime.
  const order = ages
    .map((age, i) => ({ i, score: Math.abs(age - 27) + gauss(rng, 0, 3.5) }))
    .sort((a, b) => a.score - b.score)
  const ranks: number[] = []
  order.forEach((o, rank) => (ranks[o.i] = rank))

  const top = nationTop(nation.youthLevel) - (nation.confed === "CAF" ? 1.5 : 0)
  const rows = positions.map((pos, i) => {
    const age = ages[i]
    const peak = clamp(peakAt(top, ranks[i]) + gauss(rng, 0, 2.2), 25, 96)
    const ca = Math.round(clamp(peak * ageFactor(age, pos === "GK"), 20, 96) * 10) / 10
    // Potential is a whole number and never below the ability it rounds up from.
    const pa = Math.ceil(age <= 23 ? clamp(ca + (24 - age) * 1.6, ca, 96) : ca)
    const [first, last] = nameFrom(cultureOf(nation.cultures, rng), rng)
    const foot = pos === "LB" || pos === "LW" ? (rng() < 0.75 ? "L" : "R") : rng() < 0.2 ? "L" : "R"
    const pers = [
      trait(rng),
      trait(rng),
      trait(rng),
      trait(rng),
      trait(rng),
      trait(rng, 8),
      trait(rng),
    ].join(",")
    return {
      ca,
      row: [
        `mod-${nation.id.toLowerCase()}-${i + 1}`,
        first,
        last,
        addDays(date, -(age * 365 + randInt(rng, 0, 364))),
        pos,
        "",
        foot,
        ca,
        pa,
        pers,
        "",
      ] as PlayerRow,
    }
  })

  const byAbility = [...rows].sort((a, b) => b.ca - a.ca)
  const home = clubIds.length > 1 ? Math.ceil(byAbility.length / 2) : byAbility.length
  byAbility.forEach((r, k) => {
    r.row[10] = k < home ? clubIds[0] : pick(rng, clubIds.slice(1))
  })
  return rows.map((r) => r.row)
}
