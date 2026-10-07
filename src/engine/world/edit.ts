/**
 * Edits to a running game. The save editor works on a plain copy of the nations,
 * clubs and players (the same rows a mod holds) and hands it back here; everything
 * that could break the game is refused or clamped on the way in:
 *
 * - nobody is deleted: squads, call-ups, records and history point at players and clubs;
 * - a player never changes nation, a club never changes league, ids never change;
 * - confederation, status and grounds of a nation are left alone (competitions and
 *   fixtures were built from them);
 * - every value is clamped to the range the engine assumes.
 */
import type { Club, FaceEdit, NationDef, Player, Position } from "../types"
import { POSITIONS } from "../types"
import { deriveSeed, makeRng } from "../rng"
import { ageOn } from "../players/ability"
import { roleAt } from "../players/clubs"
import { attrsFromCsv, attrsToCsv, caFromAttrs, deriveAttrs } from "../players/attributes"
import { playersFromRows, type ClubRow, type PlayerRow } from "./create"
import type { World } from "./world"

export interface EditData {
  nations: NationDef[]
  clubs: ClubRow[]
  players: Record<string, PlayerRow[]>
}

export const EDIT_MIN_AGE = 16
export const EDIT_MAX_AGE = 45

const DATE = /^\d{4}-\d{2}-\d{2}$/
const COLOR = /^#[0-9a-fA-F]{6}$/
const PERSONALITY = [
  "professionalism",
  "ambition",
  "temperament",
  "consistency",
  "bigMatch",
  "injuryProne",
  "loyalty",
] as const

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo))

/** A copy of the game as it stands, in the shape the editor works on. */
export function snapshotEdits(world: World): EditData {
  const s = world.state
  const nations = [...world.defs.values()].map((def) => {
    const st = s.nations[def.id]
    return {
      ...structuredClone(def),
      points: st?.points ?? def.points,
      youthLevel: st?.youthLevel ?? def.youthLevel,
    }
  })
  const clubs: ClubRow[] = [...world.clubs.values()].map((c) => [c.id, c.name, c.nationId, c.tier])
  const players: Record<string, PlayerRow[]> = {}
  for (const p of Object.values(s.players)) {
    const row = rowOf(p)
    ;(players[p.nationId] ??= []).push(row)
  }
  return { nations, clubs, players }
}

/** A row made safe, or null when it cannot be made safe (a new player with bad data). */
function cleanRow(row: PlayerRow, world: World, base?: Player): PlayerRow | null {
  const [id, first, last, born, pos, alt, foot, ca, pa, pers, clubId, face, attrsCsv] = row
  if (typeof id !== "string" || !id) return null
  const surname = String(last ?? "")
    .trim()
    .slice(0, 30)
  const given = String(first ?? "")
    .trim()
    .slice(0, 30)
  if (!surname && !given) return base ? cleanRow(snapshotRow(base), world) : null

  const date = world.state.date
  let bornOk = base?.born ?? ""
  if (typeof born === "string" && DATE.test(born)) {
    const age = ageOn(born, date)
    if (age >= EDIT_MIN_AGE && age <= EDIT_MAX_AGE) bornOk = born
  }
  if (!bornOk) return null

  const position: Position | undefined = POSITIONS.includes(pos) ? pos : base?.pos
  if (!position) return null
  const club = world.clubs.has(clubId) ? clubId : base?.clubId
  if (!club) return null

  const attrs = attrsFromCsv(attrsCsv, position)
  const ability = attrs
    ? caFromAttrs(attrs, position)
    : Math.round(clamp(Number(ca), 1, 99) * 10) / 10
  const persValues = String(pers ?? "")
    .split(",")
    .map(Number)
  const out: PlayerRow = [
    id,
    surname ? given : "",
    surname || given,
    bornOk,
    position,
    String(alt ?? "")
      .split(",")
      .filter((x) => x !== position && POSITIONS.includes(x as Position))
      .join(","),
    foot === "L" || foot === "B" ? foot : "R",
    ability,
    Math.round(clamp(Number(pa), Math.ceil(ability), 99)),
    PERSONALITY.map((_, i) => Math.round(clamp(persValues[i] ?? 10, 1, 20))).join(","),
    club,
  ]
  const faceEdit = face && typeof face === "object" ? (face as FaceEdit) : undefined
  if ((faceEdit && Object.keys(faceEdit).length) || attrs) out.push(faceEdit ?? {})
  if (attrs) out.push(attrsToCsv(attrs, position))
  return out
}

/** A player as the editor shows him, attributes and face included. */
function rowOf(p: Player): PlayerRow {
  const row = snapshotRow(p)
  if (p.face || p.attrs) row.push(p.face ?? {})
  if (p.attrs) row.push(attrsToCsv(p.attrs, p.pos))
  return row
}

function snapshotRow(p: Player): PlayerRow {
  return [
    p.id,
    p.first,
    p.last,
    p.born,
    p.pos,
    p.alt.join(","),
    p.foot,
    p.ca,
    p.pa,
    PERSONALITY.map((k) => p.pers[k]).join(","),
    p.clubId,
  ]
}

export interface EditResult {
  /** Nations or clubs changed, so the save must carry its own copy of them. */
  statics: boolean
}

/** Apply an edited copy to the game. Safe to call with anything: bad rows are skipped. */
export function applyEdits(world: World, data: EditData): EditResult {
  const s = world.state
  let statics = false

  for (const n of data.nations) {
    const def = world.defs.get(n.id)
    const st = s.nations[n.id]
    if (!def) continue
    const name =
      String(n.name ?? "")
        .trim()
        .slice(0, 40) || def.name
    const flag = typeof n.flag === "string" && n.flag ? n.flag : def.flag
    const color = COLOR.test(n.color) ? n.color : def.color
    const youth = Math.round(clamp(Number(n.youthLevel), 1, 100) * 10) / 10
    if (
      name !== def.name ||
      flag !== def.flag ||
      color !== def.color ||
      (st && youth !== st.youthLevel)
    ) {
      world.defs.set(def.id, {
        ...def,
        name,
        flag,
        color,
        youthLevel: st && youth !== st.youthLevel ? youth : def.youthLevel,
      })
      statics = true
    }
    if (st) {
      st.points = Math.round(clamp(Number(n.points), 0, 3000) * 100) / 100
      st.youthLevel = youth
    }
  }

  for (const [id, name, nationId, tier] of data.clubs) {
    const label = String(name ?? "")
      .trim()
      .slice(0, 40)
    const level = Math.round(clamp(Number(tier), 1, 5))
    const club = world.clubs.get(id)
    if (club) {
      if ((label && label !== club.name) || level !== club.tier) {
        world.clubs.set(id, { ...club, name: label || club.name, tier: level } satisfies Club)
        statics = true
      }
    } else if (typeof id === "string" && id && label && world.defs.has(nationId)) {
      world.clubs.set(id, { id, name: label, nationId, tier: level })
      statics = true
    }
  }

  const rng = makeRng(deriveSeed(s.seed, "edit", s.date))
  for (const [nationId, rows] of Object.entries(data.players)) {
    for (const row of rows) {
      const p = s.players[row[0]]
      // A row the editor never touched must leave the player exactly as he is.
      if (p && JSON.stringify(row) === JSON.stringify(rowOf(p))) continue
      const clean = cleanRow(row, world, p)
      if (!clean) continue
      if (p) updatePlayer(p, clean, row, world, rng)
      else if (s.nations[nationId]) {
        const [fresh] = playersFromRows(
          { [nationId]: [clean] },
          world.clubs,
          deriveSeed(s.seed, "edit-new", clean[0])
        )
        if (fresh) s.players[fresh.id] = fresh
      }
    }
  }

  world.refreshAfterEdit()
  return { statics }
}

function updatePlayer(p: Player, row: PlayerRow, raw: PlayerRow, world: World, rng: () => number) {
  const [, first, last, born, pos, alt, foot, ca, pa, pers, clubId, face, attrsCsv] = row
  // Ability, potential and attributes the editor did not change keep their exact values.
  const before = rowOf(p)
  const sameAbility =
    raw[4] === before[4] && raw[7] === before[7] && raw[8] === before[8] && raw[12] === before[12]
  const moved = clubId !== p.clubId || (!sameAbility && ca !== p.ca)
  const values = pers.split(",").map(Number)
  p.first = first
  p.last = last
  p.born = born
  p.pos = pos
  p.alt = alt ? (alt.split(",") as Position[]) : []
  p.foot = foot as Player["foot"]
  if (!sameAbility) {
    p.ca = ca
    p.pa = pa
  }
  p.pers = {
    professionalism: values[0],
    ambition: values[1],
    temperament: values[2],
    consistency: values[3],
    bigMatch: values[4],
    injuryProne: values[5],
    loyalty: values[6],
  }
  p.clubId = clubId
  if (face && Object.keys(face).length) p.face = face
  else delete p.face
  if (!sameAbility) p.attrs = attrsFromCsv(attrsCsv, pos) ?? deriveAttrs(p)
  if (moved) p.role = roleAt(ca, world.clubs.get(clubId)?.tier ?? 5, rng)
}
