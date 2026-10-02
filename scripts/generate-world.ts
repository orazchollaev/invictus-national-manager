/**
 * Builds the static starting world, once: nations, clubs and 80 fictional players per
 * nation. Output is committed and never regenerated at runtime. The seed is fixed, so
 * running this twice produces byte-identical files.
 *
 *   pnpm gen:world
 *
 * Inputs (scripts/raw, fetched once):
 *  - fifa-ranking.json  api.fifa.com men's ranking, 2026-07-20 edition (211 members)
 *  - elo-world.tsv, elo-teams.tsv  eloratings.net, used as the strength signal
 *  - data/non-fifa.ts  confederation and regional members outside FIFA, appended
 *    after the FIFA members so their data never shifts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { NATION_META } from "./data/nation-meta"
import { NON_FIFA } from "./data/non-fifa"
import { NAME_ALIASES, NAME_POOLS } from "../src/data/names"
import { CLUBS, GENERIC_PATTERNS, LEAGUES } from "./data/leagues"
import { clamp, gauss, makeRng, pick, pickWeighted, randInt, type Rng } from "../src/engine/rng"
import type { Club, Confed, NationDef, Position } from "../src/engine/types"
import { nationTop, peakAt } from "../src/engine/players/quality"

const WORLD_SEED = 20260901
const POOL_SIZE = 80
const START = new Date(Date.UTC(2026, 8, 1))

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const raw = (f: string) => readFileSync(join(root, "scripts/raw", f), "utf8")

// ── Nations ─────────────────────────────────────────────────────────────────

interface FifaRow {
  IdCountry: string
  TeamName: { Description: string }[]
  ConfederationName: Confed
  DecimalTotalPoints: number
}
const fifa: FifaRow[] = JSON.parse(raw("fifa-ranking.json")).Results

const NAME_FIXES: Record<string, string> = {
  Türkiye: "Turkey",
  "IR Iran": "Iran",
  "Korea Republic": "South Korea",
  "DPR Korea": "North Korea",
  "China PR": "China",
  "Congo DR": "DR Congo",
  "Côte d'Ivoire": "Ivory Coast",
  "Cabo Verde": "Cape Verde",
  USA: "United States",
  "Kyrgyz Republic": "Kyrgyzstan",
  Czechia: "Czech Republic",
  "Republic of Ireland": "Ireland",
  "The Gambia": "Gambia",
  "St Kitts and Nevis": "Saint Kitts and Nevis",
  "St Lucia": "Saint Lucia",
  "St Vincent and the Grenadines": "Saint Vincent and the Grenadines",
  "Brunei Darussalam": "Brunei",
  "Hong Kong, China": "Hong Kong",
  "São Tomé and Príncipe": "Sao Tome and Principe",
  "Chinese Taipei": "Taiwan",
  Eswatini: "Swaziland",
  "North Macedonia": "North Macedonia",
  Curaçao: "Curacao",
  "US Virgin Islands": "United States Virgin Islands",
  "Timor-Leste": "East Timor",
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")

const eloByName = new Map<string, number>()
{
  const ratingByCode = new Map<string, number>()
  for (const line of raw("elo-world.tsv").split("\n")) {
    const c = line.split("\t")
    if (c.length > 3) ratingByCode.set(c[2], Number(c[3]))
  }
  for (const line of raw("elo-teams.tsv").split("\n")) {
    const [code, ...names] = line.trim().split("\t")
    const rating = ratingByCode.get(code)
    if (rating === undefined) continue
    for (const n of names) eloByName.set(norm(n), rating)
  }
}

// FIFA points → Elo fallback for the few names Elo lists differently.
function eloFromPoints(points: number): number {
  return 700 + (points - 700) * 1.18
}

/** The reverse, for teams outside FIFA: ranking-scale points from their Elo. */
function pointsFromElo(elo: number): number {
  return Math.round((700 + (elo - 700) / 1.18) * 100) / 100
}

const parseCultures = (list: string) =>
  list.split(",").map((c) => {
    const [name, w] = c.split(":")
    return [name, Number(w)] as [string, number]
  })

const meta = new Map<string, { flag: string; subFeds: string[]; cultures: [string, number][] }>()
for (const line of NATION_META.trim().split("\n")) {
  const [code, flag, subs, cultures] = line.trim().split(/\s+/)
  meta.set(code, {
    flag,
    subFeds: subs === "-" ? [] : subs.split(","),
    cultures: parseCultures(cultures),
  })
}

const refColors: Record<string, { color: string }> = JSON.parse(raw("ref-teams.json"))

interface BuiltNation extends NationDef {
  level: number
}

/**
 * Talent-pool correction to the strength signal, for the players only (not the
 * ranking). Elo just after a World Cup reflects a few months of form; how many good
 * players a country produces is steadier. Traditional talent factories get a push,
 * short-lived Elo peaks a trim.
 */
const TALENT: Record<string, number> = {
  BRA: 10,
  GER: 10,
  ITA: 8,
  FRA: 4,
  ENG: 2,
  POR: 2,
  NED: 2,
  URU: 2,
  USA: 2,
  KOR: 1,
  SRB: 3,
  POL: 2,
  SWE: 2,
  CHI: 2,
  UKR: 1,
  SEN: 2,
  NGA: 4,
  CIV: 3,
  GHA: 5,
  CMR: 4,
  ESP: -2,
  BEL: -2,
  COL: -4,
  MEX: -4,
  SUI: -4,
  NOR: -5,
  JPN: -4,
  ECU: -3,
  AUS: -3,
  PAR: -3,
  SCO: -2,
  WAL: -3,
}

/** Strength blends Elo (what wins matches) with ranking points (what the world sees). */
function levelOf(id: string, elo: number, points: number): number {
  const eloLevel = ((elo - 700) / (2280 - 700)) * 100
  const fifaLevel = ((points - 700) / (2000 - 700)) * 100
  return clamp(Math.round((eloLevel * 0.7 + fifaLevel * 0.3 + (TALENT[id] ?? 0)) * 10) / 10, 1, 100)
}

const missingElo: string[] = []
const nations: BuiltNation[] = fifa.map((row) => {
  const m = meta.get(row.IdCountry)
  if (!m) throw new Error(`No meta for ${row.IdCountry}`)
  const fifaName = row.TeamName[0].Description
  const name = NAME_FIXES[fifaName] ?? fifaName
  let elo = eloByName.get(norm(name)) ?? eloByName.get(norm(fifaName))
  if (elo === undefined) {
    missingElo.push(row.IdCountry)
    elo = eloFromPoints(row.DecimalTotalPoints)
  }
  const level = levelOf(row.IdCountry, elo, row.DecimalTotalPoints)
  return {
    id: row.IdCountry,
    name,
    flag: m.flag,
    confed: row.ConfederationName,
    subFeds: m.subFeds,
    color: refColors[m.flag]?.color ?? "#5b6b7a",
    youthLevel: Math.round(level),
    points: Math.round(row.DecimalTotalPoints * 100) / 100,
    banned: row.IdCountry === "RUS" ? true : undefined,
    level,
    cultures: m.cultures,
  }
})
if (missingElo.length) console.log("Elo fallback from FIFA points:", missingElo.join(" "))

for (const line of NON_FIFA.trim().split("\n")) {
  const [id, confed, kind, flag, subs, cultures, rawName] = line.trim().split(/\s+/)
  const name = rawName.replace(/_/g, " ")
  const elo = eloByName.get(norm(name))
  if (elo === undefined) throw new Error(`No Elo for ${name}`)
  const points = pointsFromElo(elo)
  const level = levelOf(id, elo, points)
  nations.push({
    id,
    name,
    flag,
    confed: confed as Confed,
    subFeds: subs === "-" ? [] : subs.split(","),
    color: refColors[flag]?.color ?? "#5b6b7a",
    youthLevel: Math.round(level),
    points,
    nonFifa: kind as NationDef["nonFifa"],
    level,
    cultures: parseCultures(cultures),
  })
}

// ── Clubs ───────────────────────────────────────────────────────────────────

const clubs: Club[] = []
/** clubs[nation][tier-1] → club ids */
const clubIndex = new Map<string, string[][]>()

function defaultTiers(level: number): [number, number, number, number, number] {
  if (level >= 60) return [0, 0, 1, 3, 4]
  if (level >= 40) return [0, 0, 0, 3, 4]
  if (level >= 20) return [0, 0, 0, 1, 5]
  return [0, 0, 0, 0, 5]
}

/** Clubs per tier, best first: placed by hand, or spread over the tiers the nation's strength allows. */
function clubsByTier(nation: BuiltNation): string[][] {
  const league = LEAGUES[nation.id]
  if (league) return league.map((t) => (t ? t.split("|") : []))
  const counts = defaultTiers(nation.level)
  const names =
    CLUBS[nation.id]?.split("|") ??
    counts
      .flatMap((n, t) => Array<number>(n).fill(t))
      .map(
        (_, i) =>
          GENERIC_PATTERNS[i % GENERIC_PATTERNS.length].replace("{c}", nation.name) +
          (i >= GENERIC_PATTERNS.length ? ` ${Math.floor(i / GENERIC_PATTERNS.length) + 1}` : "")
      )
  // The best club takes the best tier the nation runs; the rest follow down the ladder.
  const ladder = counts.flatMap((n, t) => Array<number>(n).fill(t))
  const byTier: string[][] = [[], [], [], [], []]
  names.forEach((name, i) =>
    byTier[ladder[Math.floor((i * ladder.length) / names.length)]].push(name)
  )
  return byTier
}

for (const nation of nations) {
  const used = new Set<string>()
  const byTier = clubsByTier(nation).map((names, t) =>
    names.map((name, i) => {
      if (used.has(name)) throw new Error(`${nation.id}: club "${name}" listed twice`)
      used.add(name)
      const id = `${nation.id.toLowerCase()}-${t + 1}-${i}`
      clubs.push({ id, name, nationId: nation.id, tier: t + 1 })
      return id
    })
  )
  clubIndex.set(nation.id, byTier)
}

// Where players from each confederation go when their own league is too small.
const ABROAD: Record<Confed, [string, number][]> = {
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

function tierForAbility(ca: number, r: Rng): number {
  const x = ca + gauss(r, 0, 2.5)
  if (x >= 82) return 1
  if (x >= 74) return 2
  if (x >= 66) return 3
  if (x >= 57) return 4
  return 5
}

function clubFor(nation: BuiltNation, ca: number, age: number, r: Rng): string {
  let tier = tierForAbility(ca, r)
  const home = clubIndex.get(nation.id)!
  // Teenagers are mostly still at their first club back home; lower tiers are
  // mostly domestic everywhere.
  const stayHome = age <= 19 ? 0.85 : tier >= 4 ? 0.75 : 0.4
  if (home[tier - 1].length && r() < stayHome) return pick(r, home[tier - 1])
  // Abroad: leagues that actually run this tier, weighted by the confederation's habits.
  for (; tier <= 5; tier++) {
    const options = ABROAD[nation.confed].filter(
      ([id]) => id !== nation.id && clubIndex.get(id)?.[tier - 1].length
    )
    if (options.length) {
      const [league] = pickWeighted(r, options, ([, w]) => w)
      return pick(r, clubIndex.get(league)![tier - 1])
    }
    if (home[tier - 1]?.length) return pick(r, home[tier - 1])
  }
  const lowest = home.findLast((t) => t.length)!
  return pick(r, lowest)
}

// ── Players ─────────────────────────────────────────────────────────────────

const POOL_POSITIONS: [Position, number][] = [
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

const AGE_WEIGHTS: [number, number][] = [
  [17, 2],
  [18, 3],
  [19, 4],
  [20, 5],
  [21, 6],
  [22, 6],
  [23, 7],
  [24, 7],
  [25, 7],
  [26, 7],
  [27, 7],
  [28, 6],
  [29, 6],
  [30, 5],
  [31, 4],
  [32, 3],
  [33, 2],
  [34, 2],
  [35, 1],
  [36, 1],
  [37, 0.5],
]

/** Share of peak ability a player of this age has reached (or kept). */
export function ageFactor(age: number, gk: boolean): number {
  const a = gk ? age - 2 : age
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
  if (a < 15) return 0.7
  if (a >= 24 && a <= 29) return 1
  if (a > 35) return 0.83
  return table[a]
}

function cultureOf(entries: [string, number][], r: Rng): string {
  const [c] = pickWeighted(r, entries, ([, w]) => w)
  const alias = NAME_ALIASES[c]
  return alias ? cultureOf(alias, r) : c
}

const splitNames = (s: string) =>
  s
    .split(" ")
    .filter(Boolean)
    .map((n) => n.replace(/_/g, " "))
const poolCache = new Map<string, { first: string[]; last: string[] }>()
function pool(culture: string) {
  let p = poolCache.get(culture)
  if (!p) {
    const src = NAME_POOLS[culture]
    if (!src) throw new Error(`No name pool: ${culture}`)
    p = { first: splitNames(src.first), last: splitNames(src.last) }
    poolCache.set(culture, p)
  }
  return p
}

function trait(r: Rng, mean = 11): number {
  return Math.round(clamp(gauss(r, mean, 3.5), 1, 20))
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Compact row: [id, first, last, born, pos, alt, foot, ca, pa, pers, clubId] */
type PlayerRow = [
  string,
  string,
  string,
  string,
  Position,
  string,
  string,
  number,
  number,
  string,
  string,
]

const playersByNation: Record<string, PlayerRow[]> = {}

for (const nation of nations) {
  const hash = [...nation.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7)
  const r = makeRng(WORLD_SEED ^ hash)
  // Clubs draw from a stream of their own, so editing the club lists never shifts the players.
  const rc = makeRng(WORLD_SEED ^ hash ^ 0x2c1b3c6d)
  // Peak ability of the nation's best player (engine/players/quality.ts).
  const top = nationTop(nation.level)
  const positions = POOL_POSITIONS.flatMap(([p, n]) => Array<Position>(n).fill(p))
  const ages = positions.map(() => pickWeighted(r, AGE_WEIGHTS, ([, w]) => w)[0])
  // The best ranks go mostly to players in their prime, some to young stars.
  const ranks: number[] = []
  positions
    .map((_, i) => ({ i, score: Math.abs(ages[i] - 27) + gauss(r, 0, 3.5) }))
    .sort((a, b) => a.score - b.score)
    .forEach((o, rank) => (ranks[o.i] = rank))
  const usedNames = new Set<string>()
  const rows: PlayerRow[] = []

  positions.forEach((pos, i) => {
    const gk = pos === "GK"
    const age = ages[i]
    const born = new Date(START)
    born.setUTCFullYear(START.getUTCFullYear() - age)
    born.setUTCDate(born.getUTCDate() - randInt(r, 0, 364))

    // Rank 0 is the nation's best prospect; peak falls off gently at the top.
    const rank = ranks[i]
    const peak = clamp(peakAt(top, rank) + gauss(r, 0, 2.2), 25, 96)
    const ca = Math.round(clamp(peak * ageFactor(age, gk), 20, 96) * 10) / 10
    const wonderkid = age <= 21 && r() < 0.04
    const pa =
      age <= 23
        ? Math.round(clamp(peak + gauss(r, 1, 3) + (wonderkid ? randInt(r, 5, 10) : 0), ca, 96))
        : Math.round(Math.max(ca, peak))

    const alt = ALT[pos].filter(([, p]) => r() < p).map(([a]) => a)
    const foot =
      pos === "LB" || pos === "LW"
        ? r() < 0.75
          ? "L"
          : "R"
        : r() < 0.2
          ? "L"
          : r() < 0.06
            ? "B"
            : "R"

    let first = ""
    let last = ""
    for (let tries = 0; tries < 20; tries++) {
      const p = pool(cultureOf(nation.cultures, r))
      first = pick(r, p.first)
      last = pick(r, p.last)
      if (!usedNames.has(`${first} ${last}`)) break
    }
    usedNames.add(`${first} ${last}`)

    const pers = [
      trait(r), // professionalism
      trait(r), // ambition
      trait(r), // temperament
      trait(r), // consistency
      trait(r), // bigMatch
      trait(r, 8), // injuryProne
      trait(r), // loyalty
    ].join(",")

    rows.push([
      `${nation.id.toLowerCase()}${i}`,
      first,
      last,
      iso(born),
      pos,
      alt.join(","),
      foot,
      ca,
      pa,
      pers,
      clubFor(nation, ca, age, rc),
    ])
  })
  playersByNation[nation.id] = rows
}

// ── Output ──────────────────────────────────────────────────────────────────

const out = join(root, "src/data")
mkdirSync(out, { recursive: true })

const nationDefs: NationDef[] = nations.map(({ level: _l, ...def }) => def)
writeFileSync(join(out, "nations.json"), JSON.stringify(nationDefs, null, 1) + "\n")
writeFileSync(
  join(out, "clubs.json"),
  JSON.stringify(clubs.map((c) => [c.id, c.name, c.nationId, c.tier])) + "\n"
)
writeFileSync(join(out, "players.json"), JSON.stringify(playersByNation) + "\n")

const total = Object.values(playersByNation).reduce((s, p) => s + p.length, 0)
console.log(
  `${nations.length} nations (${nations.filter((n) => n.nonFifa).length} outside FIFA), ${clubs.length} clubs, ${total} players (${POOL_SIZE}/nation)`
)
for (const id of ["ESP", "BRA", "FRA", "ARG", "TUR", "JPN", "USA", "NZL", "IND", "SMR"]) {
  const best = playersByNation[id].map((p) => p[7]).sort((a, b) => b - a)
  const n = nations.find((x) => x.id === id)!
  const avg23 = best.slice(0, 23).reduce((s, v) => s + v, 0) / 23
  console.log(
    id,
    "level",
    n.level,
    "top",
    best[0],
    "90+",
    best.filter((v) => v >= 90).length,
    "top-23 avg",
    avg23.toFixed(1),
    "median",
    best[40]
  )
}
