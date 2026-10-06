/**
 * A player's life between international windows: weekly club form and fitness,
 * injuries, a yearly development step shaped by age, character and playing time,
 * retirement, and the youngsters who replace the retired.
 *
 * The nation's `youthLevel` anchors the long run: new players are drawn from the
 * same distribution the starting pool was, so a strong football nation stays strong
 * decades on and a small one stays small, while individual careers vary freely.
 */
import type { Club, ClubRole, ISODate, NationDef, Player, Position } from "../types"
import { clamp, gauss, pick, pickWeighted, randInt, type Rng } from "../rng"
import { addDays } from "../calendar/dates"
import { msg, type Msg } from "../text"
import { NAME_ALIASES, NAME_POOLS } from "@/data/names"
import { ageOn } from "./ability"
import { deriveAttrs, distributeDelta, ensureAttrs } from "./attributes"
import { findClub, roleAt, type ClubIndex } from "./clubs"
import { nationTop, peakAt } from "./quality"

export const POOL_TARGET = 80

// ── Weekly club tick ────────────────────────────────────────────────────────

const ROLE_SHARPNESS: Record<ClubRole, number> = {
  star: 95,
  starter: 90,
  rotation: 74,
  bench: 55,
  reserve: 38,
}

const INJURIES: [string, number, number, number][] = [
  // label, min days, max days, weight
  ["Knock", 4, 10, 30],
  ["Hamstring strain", 14, 35, 18],
  ["Ankle sprain", 10, 28, 16],
  ["Calf strain", 12, 30, 12],
  ["Groin strain", 14, 30, 9],
  ["Thigh strain", 14, 35, 8],
  ["Knee injury", 30, 90, 4],
  ["Broken foot", 45, 100, 2],
  ["Cruciate ligament rupture", 180, 280, 1],
]

/** The message of an injury, from its English name. */
const injuryText = (name: string): Msg =>
  msg(`injury.${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)

export function clubWeek(p: Player, date: ISODate, age: number, rng: Rng): Msg | null {
  // Form wanders and settles; a player's role pulls it a little.
  const roleBias = p.role === "star" ? 0.3 : p.role === "reserve" ? -0.3 : 0
  p.form = Math.round(clamp(p.form * 0.8 + gauss(rng, roleBias, 1), -5, 5) * 10) / 10
  const target = p.injury ? 20 : ROLE_SHARPNESS[p.role]
  p.sharp = Math.round(clamp(p.sharp + (target - p.sharp) * 0.25 + gauss(rng, 0, 3), 0, 100))
  // Morale drifts back to content.
  p.morale = Math.round(clamp(p.morale + (65 - p.morale) * 0.1, 0, 100))

  if (p.injury && p.injury.until <= date) p.injury = null
  if (p.injury) return null
  const risk =
    0.011 *
    (1 + (p.pers.injuryProne - 8) * 0.1) *
    (age >= 31 ? 1.3 : 1) *
    (p.role === "star" || p.role === "starter" ? 1.1 : 0.8)
  if (rng() < risk) {
    const [name, min, max] = pickWeighted(rng, INJURIES, ([, , , w]) => w)
    const label = injuryText(name)
    p.injury = { until: addDays(date, randInt(rng, min, max)), label }
    return label
  }
  return null
}

/** An injury picked up on international duty, from the match engine's event. */
export function matchInjury(p: Player, date: ISODate, rng: Rng) {
  const [name, min, max] = pickWeighted(rng, INJURIES, ([, , , w]) => w)
  const until = addDays(date, randInt(rng, min, max))
  if (!p.injury || p.injury.until < until) p.injury = { until, label: injuryText(name) }
}

// ── Yearly development ──────────────────────────────────────────────────────

const TIER_GROWTH = [1.15, 1.08, 1, 0.9, 0.8]
const ROLE_GROWTH: Record<ClubRole, number> = {
  star: 1.1,
  starter: 1.08,
  rotation: 1,
  bench: 0.85,
  reserve: 0.72,
}

/**
 * International minutes that earn a youngster the full boost: about six whole
 * matches a season make him develop a quarter faster.
 */
export const INTL_MINUTES_FULL = 540
const INTL_BOOST = 0.25

/**
 * One season of development, applied each 1 July. Returns the change in ability.
 * `boost` speeds up growth towards potential (0.15 = 15% faster) — the user's nation
 * gets one.
 */
export function developSeason(
  p: Player,
  age: number,
  tier: number,
  intlMinutes: number,
  rng: Rng,
  boost = 0
): number {
  const a = p.pos === "GK" ? age - 2 : age
  const prof = p.pers.professionalism
  const gap = Math.max(0, p.pa - p.ca)
  let delta: number
  if (a <= 23) {
    const base = a <= 18 ? 0.36 : a <= 21 ? 0.3 : 0.24
    const rate =
      base *
      (0.6 + prof / 25) *
      TIER_GROWTH[tier - 1] *
      ROLE_GROWTH[p.role] *
      (1 + INTL_BOOST * Math.min(1, intlMinutes / INTL_MINUTES_FULL)) *
      (1 + boost)
    delta = gap * clamp(rate + gauss(rng, 0, 0.06), 0, 0.7)
  } else if (a <= 27) {
    delta = gap * 0.18 * (0.6 + prof / 25) * (1 + boost) + gauss(rng, 0, 0.7)
  } else if (a <= 30) {
    delta = gauss(rng, -0.3, 0.8)
  } else {
    // The same care keeps veterans going a little longer.
    delta = -(0.8 + (a - 30) * 0.7) * (1.15 - prof / 40) * (1 - boost) + gauss(rng, 0, 0.6)
  }
  // Late bloomers and those who never kick on.
  if (a <= 22 && rng() < 0.03) p.pa = Math.min(96, p.pa + randInt(rng, 2, 6))
  // Trusted with real international football, some youngsters find another level.
  if (a <= 21 && intlMinutes >= 270 && rng() < 0.05) p.pa = Math.min(96, p.pa + randInt(rng, 2, 5))
  if (a >= 21 && a <= 26 && rng() < 0.12)
    p.pa = Math.max(Math.round(p.ca), p.pa - randInt(rng, 2, 5))
  const before = p.ca
  p.ca = Math.round(clamp(p.ca + delta, 15, 95) * 10) / 10
  ensureAttrs(p)
  p.ca = distributeDelta(p, p.ca - before, age)
  if (p.ca > p.pa) p.pa = Math.round(p.ca)
  return p.ca - before
}

// ── Retirement ──────────────────────────────────────────────────────────────

/** Chance a player hangs up his boots this summer. */
export function retirementChance(p: Player, age: number, tier: number): number {
  if (age >= 40) return 1
  const peakLast = 34 + (p.ca - 60) / 15 + (p.pos === "GK" ? 2 : 0) - (tier - 3) * 0.4
  if (age < 30) return p.ca < 30 && age >= 27 ? 0.08 : 0
  return clamp(1 / (1 + Math.exp(-(age - peakLast) * 0.9)), 0, 0.95)
}

/** Veterans who stop answering the call. */
export function intlRetirementChance(p: Player, age: number, monthsSinceCall: number): number {
  if (p.intlRetired || age < 31) return 0
  if (p.caps >= 30 && monthsSinceCall >= 12) return 0.3
  if (age >= 33 && p.caps >= 50) return 0.12
  return 0
}

// ── Youth intake ────────────────────────────────────────────────────────────

const POOL_SHAPE: [Position, number][] = [
  ["GK", 8],
  ["CB", 14],
  ["LB", 6],
  ["RB", 6],
  ["DM", 8],
  ["CM", 12],
  ["AM", 8],
  ["LW", 5],
  ["RW", 5],
  ["ST", 8],
]

const ALT: Record<Position, [Position, number][]> = {
  GK: [],
  CB: [
    ["DM", 0.2],
    ["RB", 0.12],
    ["LB", 0.08],
  ],
  LB: [
    ["LW", 0.25],
    ["CB", 0.15],
    ["RB", 0.1],
  ],
  RB: [
    ["RW", 0.25],
    ["CB", 0.15],
    ["LB", 0.1],
  ],
  DM: [
    ["CM", 0.6],
    ["CB", 0.2],
  ],
  CM: [
    ["DM", 0.45],
    ["AM", 0.4],
  ],
  AM: [
    ["CM", 0.45],
    ["LW", 0.2],
    ["RW", 0.2],
    ["ST", 0.15],
  ],
  LW: [
    ["RW", 0.4],
    ["AM", 0.25],
    ["ST", 0.2],
    ["LB", 0.08],
  ],
  RW: [
    ["LW", 0.4],
    ["AM", 0.25],
    ["ST", 0.2],
    ["RB", 0.08],
  ],
  ST: [
    ["LW", 0.15],
    ["RW", 0.15],
    ["AM", 0.15],
  ],
}

export function ageFactor(age: number, gk: boolean): number {
  const a = gk ? age - 2 : age
  if (a < 15) return 0.7
  if (a >= 24 && a <= 29) return 1
  if (a > 35) return 0.83
  const table: Record<number, number> = {
    15: 0.72,
    16: 0.75,
    17: 0.78,
    18: 0.82,
    19: 0.86,
    20: 0.9,
    21: 0.93,
    22: 0.95,
    23: 0.97,
    30: 0.99,
    31: 0.97,
    32: 0.95,
    33: 0.92,
    34: 0.89,
    35: 0.86,
  }
  return table[a]
}

function trait(rng: Rng, mean = 11) {
  return Math.round(clamp(gauss(rng, mean, 3.5), 1, 20))
}

export function cultureOf(entries: [string, number][], rng: Rng): string {
  const [c] = pickWeighted(rng, entries, ([, w]) => w)
  const alias = NAME_ALIASES[c]
  return alias ? cultureOf(alias, rng) : c
}

export function nameFrom(culture: string, rng: Rng): [string, string] {
  const pool = NAME_POOLS[culture] ?? NAME_POOLS.english
  const first = pick(rng, pool.first.split(" ")).replace(/_/g, " ")
  const last = pick(rng, pool.last.split(" ")).replace(/_/g, " ")
  return [first, last]
}

/** The position the pool is shortest of, against the standard 80-man shape. */
function neededPosition(pool: Player[], rng: Rng): Position {
  const counts = new Map<Position, number>()
  for (const p of pool) counts.set(p.pos, (counts.get(p.pos) ?? 0) + 1)
  const scale = Math.max(pool.length, 1) / POOL_TARGET
  return pickWeighted(rng, POOL_SHAPE, ([pos, n]) =>
    Math.max(0.3, n * Math.max(scale, 1) - (counts.get(pos) ?? 0) + 1)
  )[0]
}

export function newgen(
  id: string,
  nation: NationDef,
  pool: Player[],
  date: ISODate,
  clubIndex: ClubIndex,
  rng: Rng
): Player {
  const age = randInt(rng, 16, 18)
  const born = addDays(date, -(age * 365 + randInt(rng, 0, 364)))
  const pos = neededPosition(pool, rng)
  // Same distribution as the starting pool: a rank within an 80-man generation.
  // African academies produce a touch fewer world-class players than their level suggests.
  const top = nationTop(nation.youthLevel) - (nation.confed === "CAF" ? 1.5 : 0)
  const rank = rng() * POOL_TARGET
  const wonder = rng() < 0.04 ? randInt(rng, 5, 10) : 0
  const peak = clamp(peakAt(top, rank) + gauss(rng, 0, 2.5) + wonder, 25, 96)
  const ca = Math.round(clamp(peak * ageFactor(age, pos === "GK"), 18, 90) * 10) / 10
  const pa = Math.round(clamp(peak + gauss(rng, -1, 2.5), ca, 96))
  const [first, last] = nameFrom(cultureOf(nation.cultures, rng), rng)
  const clubTier = ca >= 70 ? 3 : ca >= 60 ? 4 : 5
  const clubId = findClub(clubIndex, nation.id, nation.confed, clubTier, age, rng)
  const p: Player = {
    id,
    nationId: nation.id,
    first,
    last,
    born,
    pos,
    alt: ALT[pos].filter(([, pr]) => rng() < pr).map(([a]) => a),
    foot: pos === "LB" || pos === "LW" ? (rng() < 0.75 ? "L" : "R") : rng() < 0.2 ? "L" : "R",
    ca,
    pa,
    attrs: deriveAttrs({ id, pos, ca }),
    pers: {
      professionalism: trait(rng),
      ambition: trait(rng),
      temperament: trait(rng),
      consistency: trait(rng),
      bigMatch: trait(rng),
      injuryProne: trait(rng, 8),
      loyalty: trait(rng),
    },
    clubId,
    role: "reserve",
    form: 0,
    sharp: 50,
    morale: 65,
    injury: null,
    caps: 0,
    goals: 0,
    assists: 0,
    history: [],
  }
  return p
}

/** How many youngsters come through this summer. */
export function intakeSize(poolSize: number, rng: Rng): number {
  return clamp(POOL_TARGET - poolSize + randInt(rng, 1, 3), 3, 14)
}

export function ageOf(p: Player, date: ISODate): number {
  return ageOn(p.born, date)
}

export function clubTier(p: Player, clubs: Map<string, Club>): number {
  return clubs.get(p.clubId)?.tier ?? 5
}

export { roleAt }
