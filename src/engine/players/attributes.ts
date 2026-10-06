/**
 * What a player is made of: twelve outfield attributes (six for a goalkeeper), each 1–99.
 * His overall `ca` is their position-weighted mean, so the number the AI, the market and
 * the squad screens read is the sum of what the match engine reads.
 *
 * Attributes are not stored in the bundled data: they are drawn from the player's id,
 * natural position and `ca` the first time they are needed, so old saves and old mods
 * fill themselves and `ca` never moves when they do.
 */
import type { Player, Position } from "../types"
import { clamp, deriveSeed, gauss, makeRng } from "../rng"

export const OUTFIELD_ATTRS = [
  "pace",
  "acceleration",
  "strength",
  "stamina",
  "jumping",
  "shooting",
  "finishing",
  "passing",
  "dribbling",
  "heading",
  "tackling",
  "vision",
] as const

export const KEEPER_ATTRS = [
  "agility",
  "reflexes",
  "oneOnOne",
  "aerial",
  "distribution",
  "positioning",
] as const

export type OutfieldAttr = (typeof OUTFIELD_ATTRS)[number]
export type KeeperAttr = (typeof KEEPER_ATTRS)[number]
export type Attr = OutfieldAttr | KeeperAttr
export type Attrs = Partial<Record<Attr, number>>

export type AttrGroup = "physical" | "technical" | "mental" | "keeper"

export const ATTR_GROUP: Record<Attr, AttrGroup> = {
  pace: "physical",
  acceleration: "physical",
  strength: "physical",
  stamina: "physical",
  jumping: "physical",
  shooting: "technical",
  finishing: "technical",
  passing: "technical",
  dribbling: "technical",
  heading: "technical",
  tackling: "mental",
  vision: "mental",
  agility: "keeper",
  reflexes: "keeper",
  oneOnOne: "keeper",
  aerial: "keeper",
  distribution: "keeper",
  positioning: "keeper",
}

/** The groups a player card shows, in order. */
export const ATTR_GROUPS: { group: AttrGroup; keys: readonly Attr[] }[] = [
  { group: "physical", keys: OUTFIELD_ATTRS.filter((k) => ATTR_GROUP[k] === "physical") },
  { group: "technical", keys: OUTFIELD_ATTRS.filter((k) => ATTR_GROUP[k] === "technical") },
  { group: "mental", keys: OUTFIELD_ATTRS.filter((k) => ATTR_GROUP[k] === "mental") },
]

export function attrKeys(pos: Position): readonly Attr[] {
  return pos === "GK" ? KEEPER_ATTRS : OUTFIELD_ATTRS
}

type Weights = Record<Attr, number>

function outfield(w: Record<OutfieldAttr, number>): Weights {
  return { ...w, agility: 0, reflexes: 0, oneOnOne: 0, aerial: 0, distribution: 0, positioning: 0 }
}

const KEEPER_WEIGHTS: Weights = {
  pace: 0,
  acceleration: 0,
  strength: 0,
  stamina: 0,
  jumping: 0,
  shooting: 0,
  finishing: 0,
  passing: 0,
  dribbling: 0,
  heading: 0,
  tackling: 0,
  vision: 0,
  agility: 1.5,
  reflexes: 3,
  oneOnOne: 2,
  aerial: 1.5,
  distribution: 1,
  positioning: 2.5,
}

/** How much each attribute counts towards a natural position's overall. */
export const POS_WEIGHTS: Record<Position, Weights> = {
  GK: KEEPER_WEIGHTS,
  CB: outfield({
    pace: 1,
    acceleration: 0.6,
    strength: 2,
    stamina: 1,
    jumping: 1.5,
    shooting: 0.1,
    finishing: 0.1,
    passing: 0.8,
    dribbling: 0.2,
    heading: 2,
    tackling: 3,
    vision: 1.5,
  }),
  LB: outfield({
    pace: 2,
    acceleration: 1.5,
    strength: 1,
    stamina: 2,
    jumping: 0.5,
    shooting: 0.2,
    finishing: 0.1,
    passing: 1.2,
    dribbling: 1,
    heading: 0.4,
    tackling: 2,
    vision: 1,
  }),
  RB: outfield({
    pace: 2,
    acceleration: 1.5,
    strength: 1,
    stamina: 2,
    jumping: 0.5,
    shooting: 0.2,
    finishing: 0.1,
    passing: 1.2,
    dribbling: 1,
    heading: 0.4,
    tackling: 2,
    vision: 1,
  }),
  DM: outfield({
    pace: 0.6,
    acceleration: 0.5,
    strength: 1.5,
    stamina: 2,
    jumping: 0.8,
    shooting: 0.3,
    finishing: 0.1,
    passing: 1.8,
    dribbling: 0.7,
    heading: 0.8,
    tackling: 2.8,
    vision: 1.8,
  }),
  CM: outfield({
    pace: 0.8,
    acceleration: 0.8,
    strength: 1,
    stamina: 2,
    jumping: 0.5,
    shooting: 0.8,
    finishing: 0.4,
    passing: 2.5,
    dribbling: 1.5,
    heading: 0.5,
    tackling: 1.5,
    vision: 2.2,
  }),
  AM: outfield({
    pace: 1,
    acceleration: 1.3,
    strength: 0.5,
    stamina: 1.2,
    jumping: 0.3,
    shooting: 1.5,
    finishing: 1.2,
    passing: 2.5,
    dribbling: 2.2,
    heading: 0.3,
    tackling: 0.4,
    vision: 2.5,
  }),
  LW: outfield({
    pace: 2.5,
    acceleration: 2.2,
    strength: 0.5,
    stamina: 1.2,
    jumping: 0.3,
    shooting: 1.2,
    finishing: 1.4,
    passing: 1.4,
    dribbling: 2.8,
    heading: 0.3,
    tackling: 0.2,
    vision: 1.2,
  }),
  RW: outfield({
    pace: 2.5,
    acceleration: 2.2,
    strength: 0.5,
    stamina: 1.2,
    jumping: 0.3,
    shooting: 1.2,
    finishing: 1.4,
    passing: 1.4,
    dribbling: 2.8,
    heading: 0.3,
    tackling: 0.2,
    vision: 1.2,
  }),
  ST: outfield({
    pace: 1.5,
    acceleration: 1.5,
    strength: 1.5,
    stamina: 1,
    jumping: 1,
    shooting: 1.5,
    finishing: 3,
    passing: 0.7,
    dribbling: 1.3,
    heading: 1.5,
    tackling: 0.2,
    vision: 1.5,
  }),
}

const MIN_ATTR = 1
const MAX_ATTR = 99

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** A player's value of one attribute; `fallback` (his `ca`) when he has none yet. */
export function attrOf(attrs: Attrs | undefined, key: Attr, fallback: number): number {
  return attrs?.[key] ?? fallback
}

/** The overall his attributes add up to, one decimal. */
export function caFromAttrs(attrs: Attrs, pos: Position): number {
  const w = POS_WEIGHTS[pos]
  let sum = 0
  let total = 0
  for (const key of attrKeys(pos)) {
    sum += (attrs[key] ?? 0) * w[key]
    total += w[key]
  }
  return round1(sum / total)
}

const SPREAD = 10

/** What an attribute is expected to be for a player of this position and overall. */
export function expected(pos: Position, key: Attr, ca: number): number {
  const w = POS_WEIGHTS[pos]
  const keys = attrKeys(pos)
  const mean = keys.reduce((s, k) => s + w[k], 0) / keys.length
  return ca + (w[key] / mean - 1) * SPREAD
}

/**
 * How far an attribute sits above (or below) what his position and overall predict, in
 * points. This is his style: a quick centre-back or a slow winger. It averages to zero
 * over a squad, so the match engine can read it without moving the balance. 0 when he has
 * no attributes yet.
 */
export function deviation(p: Pick<Player, "pos" | "ca" | "attrs">, key: Attr): number {
  const v = p.attrs?.[key]
  return v === undefined ? 0 : v - expected(p.pos, key, p.ca)
}
const LATENT_SD = 4
const NOISE_SD = 4.5

/**
 * His attributes: the shape of his position (strong where the position counts most)
 * plus a style drawn from his id, shifted so they average to his `ca`. The same id,
 * position and `ca` always give the same numbers.
 */
export function deriveAttrs(p: Pick<Player, "id" | "pos" | "ca">): Attrs {
  const rng = makeRng(deriveSeed(0, "attrs", p.id))
  const keys = attrKeys(p.pos)
  const w = POS_WEIGHTS[p.pos]
  const mean = keys.reduce((s, k) => s + w[k], 0) / keys.length
  const athletic = gauss(rng, 0, LATENT_SD)
  const technical = gauss(rng, 0, LATENT_SD)
  const raw: Attrs = {}
  for (const key of keys) {
    const latent =
      p.pos === "GK"
        ? 0
        : ATTR_GROUP[key] === "physical"
          ? athletic
          : ATTR_GROUP[key] === "technical"
            ? technical
            : 0
    raw[key] = p.ca + (w[key] / mean - 1) * SPREAD + latent + gauss(rng, 0, NOISE_SD)
  }
  return fitTo(raw, p.pos, p.ca)
}

/** Shifts every attribute by the same amount until they average to `ca`, within 1–99. */
export function fitTo(attrs: Attrs, pos: Position, ca: number): Attrs {
  const keys = attrKeys(pos)
  const w = POS_WEIGHTS[pos]
  const total = keys.reduce((s, k) => s + w[k], 0)
  const out: Attrs = { ...attrs }
  for (let i = 0; i < 8; i++) {
    let sum = 0
    for (const k of keys) sum += (out[k] ?? 0) * w[k]
    const shift = ca - sum / total
    if (Math.abs(shift) < 0.02) break
    for (const k of keys) out[k] = clamp((out[k] ?? 0) + shift, MIN_ATTR, MAX_ATTR)
  }
  for (const k of keys) out[k] = round1(out[k] ?? ca)
  return out
}

/** His attributes as a row of numbers in `attrKeys` order, as a mod file keeps them. */
export function attrsToCsv(attrs: Attrs, pos: Position): string {
  return attrKeys(pos)
    .map((k) => round1(clamp(attrs[k] ?? 1, MIN_ATTR, MAX_ATTR)))
    .join(",")
}

/** The attributes a row of numbers holds, or nothing if it is not one for this position. */
export function attrsFromCsv(csv: unknown, pos: Position): Attrs | undefined {
  if (typeof csv !== "string") return undefined
  const keys = attrKeys(pos)
  const values = csv.split(",").map(Number)
  if (values.length !== keys.length || values.some((v) => !Number.isFinite(v))) return undefined
  const out: Attrs = {}
  keys.forEach((k, i) => (out[k] = round1(clamp(values[i], MIN_ATTR, MAX_ATTR))))
  return out
}

/** Gives a player attributes if he has none. Returns whether it changed anything. */
export function ensureAttrs(p: Player): boolean {
  if (p.attrs) return false
  p.attrs = deriveAttrs(p)
  return true
}

// ── Development ─────────────────────────────────────────────────────────────

/**
 * How much of a season's change in ability each attribute takes, by age. Athletes grow
 * and fade through their legs; the mind keeps improving into the late twenties and holds
 * on longest. A goalkeeper matures about two years later.
 */
function ageShare(key: Attr, age: number, rising: boolean): number {
  const group = ATTR_GROUP[key]
  if (group === "keeper") {
    if (key === "positioning" || key === "oneOnOne") return rising ? 1.1 : 0.4
    return rising ? 0.95 : 1.4
  }
  if (rising) {
    if (age <= 22) return group === "physical" ? 1.25 : group === "technical" ? 1 : 0.8
    return group === "physical" ? 0.6 : group === "technical" ? 1 : 1.35
  }
  if (group === "physical") return key === "strength" || key === "jumping" ? 1.4 : 1.9
  if (group === "technical") return 0.8
  return 0.3
}

/**
 * Spreads a season's change in ability over his attributes and returns his new `ca`.
 * The weighted mean of the changes is exactly `delta`, so `ca` follows the old model.
 */
export function distributeDelta(p: Player, delta: number, age: number): number {
  const attrs = p.attrs
  if (!attrs) return p.ca
  const keys = attrKeys(p.pos)
  const w = POS_WEIGHTS[p.pos]
  const a = p.pos === "GK" ? age - 2 : age
  const rising = delta >= 0
  let weighted = 0
  let total = 0
  for (const k of keys) {
    weighted += ageShare(k, a, rising) * w[k]
    total += w[k]
  }
  const norm = weighted / total
  for (const k of keys) {
    const share = ageShare(k, a, rising) / norm
    attrs[k] = round1(clamp((attrs[k] ?? p.ca) + delta * share, MIN_ATTR, MAX_ATTR))
  }
  return caFromAttrs(attrs, p.pos)
}

/** Moves every attribute by the same amount (the mod editor's "squad hint"). */
export function shiftAttrs(attrs: Attrs, pos: Position, by: number): Attrs {
  const out: Attrs = {}
  for (const k of attrKeys(pos)) out[k] = round1(clamp((attrs[k] ?? 0) + by, MIN_ATTR, MAX_ATTR))
  return out
}
