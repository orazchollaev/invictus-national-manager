/**
 * A mod is a whole dataset beside the bundled one: every nation, club and starting
 * player, with the grounds and towns of each nation. It is written once from the
 * bundled data and then edited; a new career can start from it instead.
 */
import {
  CONFEDS,
  POSITIONS,
  type Confed,
  type FaceEdit,
  type NationDef,
  type Position,
} from "@/engine/types"
import type { ClubRow, PlayerRow } from "@/engine/world/create"
import { sanitizeFaceEdit } from "@/lib/faces"
import { flagUrl } from "@/lib/flags"
import { NAME_ALIASES, NAME_POOLS } from "@/data/names"
import { attrsFromCsv, attrsToCsv, caFromAttrs, type Attrs } from "@/engine/players/attributes"

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
  /** Face features set in the editor; the rest is drawn from the id. */
  face?: FaceEdit
  /** Attributes set by hand; without them they are drawn from `ca` and the id. */
  attrs?: Attrs
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
  const [id, first, last, born, pos, alt, foot, ca, pa, pers, clubId, face, attrs] = row
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
    face,
    attrs: attrsFromCsv(attrs, pos),
  }
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo))

export function rowFromEdit(p: PlayerEdit): PlayerRow {
  // Hand-set attributes are what his overall is made of.
  const attrs = p.attrs && attrsFromCsv(attrsToCsv(p.attrs, p.pos), p.pos)
  const ca = attrs ? caFromAttrs(attrs, p.pos) : Math.round(clamp(p.ca, 1, 99) * 10) / 10
  // A player known by one name keeps it as his surname, where every list reads it.
  const first = p.first.trim()
  const last = p.last.trim()
  const row: PlayerRow = [
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
  // Rows keep their old eleven columns unless a face or attributes were edited.
  const face = sanitizeFaceEdit(p.face)
  if (Object.keys(face).length || attrs) row.push(face)
  if (attrs) row.push(attrsToCsv(attrs, p.pos))
  return row
}

/** Lower case without accents, for searching names. */
export const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

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

/** Players a nation a mod adds needs to field a squad. */
export const MIN_SQUAD = 20

const NATION_ID = /^[A-Z]{3}$/

/** Naming cultures a nation's players can be drawn from, for pickers. */
export const CULTURES = [
  ...new Set([...Object.keys(NAME_POOLS), ...Object.keys(NAME_ALIASES)]),
].sort()

/** Regional federations the game has competitions for. */
export function subFedsOf(base: NationDef[]): string[] {
  return [...new Set(base.flatMap((n) => n.subFeds))].sort()
}

/** The bundled nation ids: a mod cannot remove these, only the ones it added. */
export const isAdded = (id: string, base: NationDef[]) => !base.some((n) => n.id === id)

const validCentre = (c: unknown): c is [number, number] =>
  Array.isArray(c) &&
  c.length === 2 &&
  isNum(c[0]) &&
  isNum(c[1]) &&
  Math.abs(c[0]) <= 90 &&
  Math.abs(c[1]) <= 180

export type NationProblem =
  | "id"
  | "taken"
  | "name"
  | "flag"
  | "confed"
  | "subFeds"
  | "points"
  | "youth"
  | "centre"
  | "cultures"

/**
 * Why a nation a mod adds cannot be used, or null when it can. `taken` holds the ids
 * of every other nation of the mod. The coordinates are required: tournaments choose
 * co-hosts by distance, and a nation without a place on the map would never be one.
 */
export function nationProblem(
  n: Partial<NationDef>,
  base: NationDef[],
  taken: ReadonlySet<string>
): NationProblem | null {
  if (!isStr(n.id) || !NATION_ID.test(n.id)) return "id"
  if (taken.has(n.id)) return "taken"
  if (!isStr(n.name) || !n.name.trim()) return "name"
  if (!isStr(n.flag) || !flagUrl(n.flag)) return "flag"
  if (!CONFEDS.includes(n.confed as Confed)) return "confed"
  const feds = subFedsOf(base)
  if (!Array.isArray(n.subFeds) || !n.subFeds.every((f) => feds.includes(f))) return "subFeds"
  if (!isNum(n.points) || n.points < 0 || n.points > 3000) return "points"
  if (!isNum(n.youthLevel) || n.youthLevel < 1 || n.youthLevel > 100) return "youth"
  if (!validCentre(n.centre)) return "centre"
  if (
    !Array.isArray(n.cultures) ||
    !n.cultures.length ||
    !n.cultures.every(
      (c) => Array.isArray(c) && isStr(c[0]) && CULTURES.includes(c[0]) && isNum(c[1]) && c[1] > 0
    )
  )
    return "cultures"
  return null
}

/** A nation a mod adds, with only the fields the game reads. Call after `nationProblem`. */
function tidyAdded(n: NationDef): NationDef {
  return {
    id: n.id,
    name: n.name.trim().slice(0, 40),
    flag: n.flag,
    confed: n.confed,
    subFeds: [...new Set(n.subFeds)],
    color: isStr(n.color) && /^#[0-9a-fA-F]{6}$/.test(n.color) ? n.color : "#888888",
    youthLevel: clamp(n.youthLevel, 1, 100),
    points: clamp(n.points, 0, 3000),
    banned: n.banned ? true : undefined,
    nonFifa: n.nonFifa === "confederation" || n.nonFifa === "regional" ? n.nonFifa : undefined,
    cultures: n.cultures.map(([c, w]) => [c, w] as [string, number]),
    grounds: Array.isArray(n.grounds)
      ? n.grounds
          .filter((g) => g && isStr(g.city) && isStr(g.name) && isNum(g.capacity))
          .map((g) => ({ city: g.city, name: g.name, capacity: clamp(g.capacity, 500, 200000) }))
      : undefined,
    cities: Array.isArray(n.cities) ? n.cities.filter(isStr) : undefined,
    centre: [n.centre![0], n.centre![1]],
  }
}

/**
 * Check and tidy a mod read from a file. The bundled nations are all there: one the
 * file lacks comes from the bundled data. A nation the game does not ship is kept
 * when it is complete (valid, with a club and a squad) and dropped otherwise, with its
 * clubs and players. Clubs and players are kept where they make sense; a player at a
 * club that does not exist moves to one in his country.
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
      centre: validCentre(n.centre) ? [n.centre[0], n.centre[1]] : b.centre,
    }
  })
  const baseIds = new Set(nations.map((n) => n.id))
  const addedIds = new Set<string>()
  for (const n of m.nations) {
    if (!n || !isStr(n.id) || baseIds.has(n.id)) continue
    if (nationProblem(n, base, new Set([...baseIds, ...addedIds]))) continue
    addedIds.add(n.id)
    nations.push(tidyAdded(n))
  }
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
          face: r[11],
          attrs: attrsFromCsv(r[12], pos),
        })
      )
    }
    players[nationId] = out
  }

  // A nation added without a club or a squad could not play: it goes, with what it owns.
  const incomplete = [...addedIds].filter(
    (id) => !clubs.some((c) => c[2] === id) || (players[id]?.length ?? 0) < MIN_SQUAD
  )
  if (incomplete.length) {
    const gone = new Set(incomplete)
    const goneClubs = new Set(clubs.filter((c) => gone.has(c[2])).map((c) => c[0]))
    for (const id of gone) delete players[id]
    nations.splice(0, nations.length, ...nations.filter((n) => !gone.has(n.id)))
    clubs.splice(0, clubs.length, ...clubs.filter((c) => !gone.has(c[2])))
    for (const [nationId, rows] of Object.entries(players))
      for (const r of rows) if (goneClubs.has(r[10])) r[10] = clubOf(nationId)
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
