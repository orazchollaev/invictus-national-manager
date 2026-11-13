/**
 * What a club is beyond its level: where it is, when it was founded, its colours, how
 * big the name is, how much it can spend and how well it brings youngsters through.
 *
 * The elite and top-flight clubs are known by hand (src/data/clubProfiles.ts). Every
 * other club — including one a mod adds — gets a profile worked out from its id, its
 * level and its nation, so the same club looks the same in every game.
 */
import type { Club, NationDef } from "../types"
import { CLUB_FACTS, DERBIES } from "@/data/clubProfiles"
import { clamp, deriveSeed, gauss, makeRng } from "../rng"

export interface ClubProfile {
  city: string
  founded: number
  /** Home and away colours as `#rrggbb`. */
  colors: [string, string]
  ground?: { name: string; capacity: number }
  /** How big the name is, 1–100. It makes the club harder to ask favours of. */
  reputation: number
  /** What the club can spend, 1–100. */
  budget: number
  /** How well it brings youngsters through, 1–20. */
  academy: number
  /** The club it most hates to lose to, when there is one. */
  rival?: string
  /** Described by hand rather than worked out. */
  known: boolean
}

const BASE_REPUTATION = [90, 72, 54, 38, 24]
const BASE_ACADEMY = [14, 12, 10, 8, 6]

/** Leagues where clubs outspend their standing. */
const RICH: Record<string, number> = { ENG: 10, KSA: 14, QAT: 12, UAE: 12, USA: 4, CHN: 4, GER: 4 }

const PALETTE: [string, string][] = [
  ["#c8102e", "#ffffff"],
  ["#003a8f", "#ffffff"],
  ["#0a7d3b", "#ffffff"],
  ["#000000", "#ffffff"],
  ["#f5c400", "#000000"],
  ["#6a1b9a", "#ffffff"],
  ["#e87722", "#000000"],
  ["#0095da", "#ffffff"],
  ["#7a1f2b", "#f0c14b"],
  ["#1b3a5c", "#e30613"],
  ["#2e8b57", "#f5c400"],
  ["#ffffff", "#c8102e"],
  ["#ffffff", "#003a8f"],
  ["#d6336c", "#1b1b1b"],
]

const RIVALS = (() => {
  const map = new Map<string, string>()
  for (const [a, b] of DERBIES) {
    if (!map.has(a)) map.set(a, b)
    if (!map.has(b)) map.set(b, a)
  }
  return map
})()

/** A name such as "Ç. Rize" stands for the town "Rize". */
function townOf(name: string): string {
  return name.replace(/^\p{L}\.\s+/u, "")
}

export function profileOf(club: Club, nation?: Pick<NationDef, "youthLevel">): ClubProfile {
  const tier = clamp(club.tier, 1, 5)
  const rng = makeRng(deriveSeed(0x6b1d, "club", club.id))
  const youth = nation?.youthLevel ?? 50
  const known = CLUB_FACTS[club.id]
  const rival = RIVALS.get(club.id)

  // Drawn in the same order whether or not the club is known, so one's profile does not
  // shift when another is described.
  const repNoise = gauss(rng, 0, 4)
  const budgetNoise = gauss(rng, 0, 5)
  const academyNoise = gauss(rng, 0, 2)
  const foundedRoll = rng()
  const palette = PALETTE[Math.floor(rng() * PALETTE.length)]

  const reputation = known
    ? known[6]
    : Math.round(clamp(BASE_REPUTATION[tier - 1] + repNoise + (youth - 50) * 0.12, 1, 99))
  const academy =
    known?.[7] ??
    Math.round(clamp(BASE_ACADEMY[tier - 1] + (youth - 50) * 0.08 + academyNoise, 1, 20))
  const budget = Math.round(clamp(reputation + (RICH[club.nationId] ?? 0) + budgetNoise, 1, 99))

  if (known) {
    const [city, founded, primary, secondary, name, capacity] = known
    return {
      city,
      founded,
      colors: [primary, secondary],
      ground: { name, capacity },
      reputation,
      budget,
      academy,
      rival,
      known: true,
    }
  }
  return {
    city: townOf(club.name),
    founded: 1875 + Math.floor(foundedRoll * (tier <= 2 ? 50 : 110)),
    colors: palette,
    reputation,
    budget,
    academy,
    rival,
    known: false,
  }
}

/** The word for a rating on the 1–100 scale. Five bands, named in the language files. */
export function band(value: number): 1 | 2 | 3 | 4 | 5 {
  return value >= 85 ? 5 : value >= 70 ? 4 : value >= 50 ? 3 : value >= 30 ? 2 : 1
}
