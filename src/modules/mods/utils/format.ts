/**
 * A mod is a whole dataset beside the bundled one: every nation, club and starting
 * player, with the grounds and towns of each nation. It is written once from the
 * bundled data and then edited; a new career can start from it instead.
 */
import { CONFEDS, POSITIONS, type Confed, type NationDef, type Position } from "@/engine/types"
import type { ClubRow, PlayerRow } from "@/engine/world/create"

export const MOD_FORMAT = "invictus-mod"
export const MOD_VERSION = 1

export interface ModData {
  format: typeof MOD_FORMAT
  version: number
  id: string
  name: string
  author: string
  createdAt: number
  updatedAt: number
  nations: NationDef[]
  clubs: ClubRow[]
  players: Record<string, PlayerRow[]>
}

/** What the mod list shows without loading a whole mod. */
export interface ModMeta {
  id: string
  name: string
  author: string
  updatedAt: number
  players: number
  clubs: number
}

export const PERSONALITY = [
  "professionalism",
  "ambition",
  "temperament",
  "consistency",
  "bigMatch",
  "injuryProne",
  "loyalty",
] as const

/** A player row opened for editing. */
export interface PlayerEdit {
  id: string
  nationId: string
  first: string
  last: string
  born: string
  pos: Position
  alt: Position[]
  foot: "L" | "R" | "B"
  ca: number
  pa: number
  pers: number[]
  clubId: string
}

export interface ClubEdit {
  id: string
  name: string
  nationId: string
  tier: number
}

export function metaOf(mod: ModData): ModMeta {
  return {
    id: mod.id,
    name: mod.name,
    author: mod.author,
    updatedAt: mod.updatedAt,
    players: Object.values(mod.players).reduce((a, rows) => a + rows.length, 0),
    clubs: mod.clubs.length,
  }
}

export function newModId(): string {
  return `mod-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

export function editFromRow(nationId: string, row: PlayerRow): PlayerEdit {
  const [id, first, last, born, pos, alt, foot, ca, pa, pers, clubId] = row
  return {
    id,
    nationId,
    first,
    last,
    born,
    pos,
    alt: alt ? (alt.split(",") as Position[]) : [],
    foot: foot as PlayerEdit["foot"],
    ca,
    pa,
    pers: pers.split(",").map(Number),
    clubId,
  }
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo))

export function rowFromEdit(p: PlayerEdit): PlayerRow {
  const ca = Math.round(clamp(p.ca, 1, 99) * 10) / 10
  // A player known by one name keeps it as his surname, where every list reads it.
  const first = p.first.trim()
  const last = p.last.trim()
  return [
    p.id,
    last ? first : "",
    last || first,
    p.born,
    p.pos,
    p.alt.filter((x) => x !== p.pos).join(","),
    p.foot,
    ca,
    Math.round(clamp(p.pa, Math.ceil(ca), 99)),
    PERSONALITY.map((_, i) => Math.round(clamp(p.pers[i] ?? 10, 1, 20))).join(","),
    p.clubId,
  ]
}

/** Age in whole years on a date. */
export function ageOn(born: string, date: string): number {
  const [by, bm, bd] = born.split("-").map(Number)
  const [y, m, d] = date.split("-").map(Number)
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0)
}

/** FIFA ranking position by points; teams outside FIFA and banned ones have none. */
export function rankings(nations: NationDef[]): Map<string, number> {
  const ranked = nations.filter((n) => !n.nonFifa && !n.banned).sort((a, b) => b.points - a.points)
  return new Map(ranked.map((n, i) => [n.id, i + 1]))
}

const isStr = (v: unknown): v is string => typeof v === "string"
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)
const DATE = /^\d{4}-\d{2}-\d{2}$/

export class ModError extends Error {}

/**
 * Check and tidy a mod read from a file. The nations are those of the game: a
 * nation the game does not know is dropped (no competition would have it), one the
 * file lacks comes from the bundled data. Clubs and players are kept where they make
 * sense; a player at a club that does not exist moves to one in his country.
 */
export function normalizeMod(raw: unknown, base: NationDef[]): ModData {
  const m = raw as Partial<ModData> | null
  if (!m || typeof m !== "object" || m.format !== MOD_FORMAT) throw new ModError("format")
  if (!Array.isArray(m.nations) || !Array.isArray(m.clubs) || typeof m.players !== "object")
    throw new ModError("shape")

  const given = new Map(m.nations.filter((n) => n && isStr(n.id)).map((n) => [n.id, n]))
  const nations: NationDef[] = base.map((b) => {
    const n = given.get(b.id)
    if (!n) return structuredClone(b)
    return {
      ...b,
      name: isStr(n.name) && n.name.trim() ? n.name.trim() : b.name,
      flag: isStr(n.flag) ? n.flag : b.flag,
      confed: CONFEDS.includes(n.confed as Confed) ? n.confed : b.confed,
      subFeds: Array.isArray(n.subFeds) ? n.subFeds.filter(isStr) : b.subFeds,
      color: isStr(n.color) && /^#[0-9a-fA-F]{6}$/.test(n.color) ? n.color : b.color,
      youthLevel: isNum(n.youthLevel) ? clamp(n.youthLevel, 1, 100) : b.youthLevel,
      points: isNum(n.points) ? clamp(n.points, 0, 3000) : b.points,
      banned: n.banned ? true : undefined,
      nonFifa: n.nonFifa === "confederation" || n.nonFifa === "regional" ? n.nonFifa : undefined,
      cultures: Array.isArray(n.cultures) && n.cultures.length ? n.cultures : b.cultures,
      grounds: Array.isArray(n.grounds)
        ? n.grounds
            .filter((g) => g && isStr(g.city) && isStr(g.name) && isNum(g.capacity))
            .map((g) => ({ city: g.city, name: g.name, capacity: clamp(g.capacity, 500, 200000) }))
        : undefined,
      cities: Array.isArray(n.cities) ? n.cities.filter(isStr) : undefined,
    }
  })
  const known = new Set(nations.map((n) => n.id))

  const clubIds = new Set<string>()
  const clubs: ClubRow[] = []
  for (const c of m.clubs as unknown[]) {
    if (!Array.isArray(c)) continue
    const [id, name, nationId, tier] = c
    if (!isStr(id) || !isStr(name) || !known.has(nationId) || clubIds.has(id)) continue
    clubIds.add(id)
    clubs.push([id, name, nationId, clamp(Math.round(Number(tier)), 1, 5)])
  }
  if (!clubs.length) throw new ModError("clubs")
  const clubOf = (nationId: string) =>
    clubs.filter((c) => c[2] === nationId).sort((a, b) => b[3] - a[3])[0]?.[0] ?? clubs[0][0]

  const ids = new Set<string>()
  const players: Record<string, PlayerRow[]> = {}
  for (const [nationId, rows] of Object.entries(m.players as Record<string, unknown>)) {
    if (!known.has(nationId) || !Array.isArray(rows)) continue
    const out: PlayerRow[] = []
    for (const r of rows) {
      if (!Array.isArray(r) || r.length < 11) continue
      const [id, first, last, born, pos, alt, foot, ca, pa, pers, clubId] = r
      if (!isStr(id) || ids.has(id) || !isStr(first) || !isStr(last)) continue
      if (!isStr(born) || !DATE.test(born) || !POSITIONS.includes(pos)) continue
      ids.add(id)
      out.push(
        rowFromEdit({
          id,
          nationId,
          first,
          last,
          born,
          pos,
          alt: isStr(alt)
            ? (alt.split(",").filter((x) => POSITIONS.includes(x as Position)) as Position[])
            : [],
          foot: foot === "L" || foot === "B" ? foot : "R",
          ca: Number(ca),
          pa: Number(pa),
          pers: isStr(pers) ? pers.split(",").map(Number) : [],
          clubId: isStr(clubId) && clubIds.has(clubId) ? clubId : clubOf(nationId),
        })
      )
    }
    players[nationId] = out
  }

  const now = Date.now()
  return {
    format: MOD_FORMAT,
    version: MOD_VERSION,
    id: isStr(m.id) && m.id ? m.id : newModId(),
    name: isStr(m.name) && m.name.trim() ? m.name.trim().slice(0, 40) : "Mod",
    author: isStr(m.author) ? m.author.slice(0, 40) : "",
    createdAt: isNum(m.createdAt) ? m.createdAt : now,
    updatedAt: isNum(m.updatedAt) ? m.updatedAt : now,
    nations,
    clubs,
    players,
  }
}

/** File name for an exported mod. */
export function exportName(mod: ModData): string {
  const slug = mod.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `invictus-mod-${slug || "mod"}.json`
}
