/**
 * Who gets on with whom. A bond between two players is worked out from their ids and
 * their club, so it is the same every time and needs no saved state:
 *
 * - **Club mates** play together every week and understand each other.
 * - **Friends** are a matter of chance, as friendships are.
 * - **Feuds** are rarer, and likelier between two hot-headed players.
 *
 * On the pitch each bond with a team mate moves a player by a point or so, up to a cap,
 * so a side of friends plays above a side at war without either deciding a match alone.
 */
import type { Player } from "../types"
import { deriveSeed, makeRng } from "../rng"

export type BondKind = "clubmates" | "friends" | "feud"

export interface Bond {
  a: string
  b: string
  kind: BondKind
}

/** Ability points each bond adds to (or takes from) both players while they share the pitch. */
export const BOND_POINTS: Record<BondKind, number> = { clubmates: 0.5, friends: 0.8, feud: -1 }

/** Most a player can gain or lose from his team mates. */
export const BOND_LIMITS = { min: -2.5, max: 2 }

const FRIEND_CHANCE = 0.02
const FEUD_CHANCE = 0.012
/** Two players this hot-headed fall out far more easily. */
const HOT = 14
const HOT_FEUD_CHANCE = 0.05

export const BOND_LABELS: Record<BondKind, string> = {
  clubmates: "Club mates",
  friends: "Friends",
  feud: "Feud",
}

/** The bond between two players, if they have one. Symmetric. */
export function bondBetween(a: Player, b: Player): BondKind | null {
  if (a.id === b.id) return null
  if (a.clubId && a.clubId === b.clubId) return "clubmates"
  const [low, high] = a.id < b.id ? [a.id, b.id] : [b.id, a.id]
  const roll = makeRng(deriveSeed(0, "bond", low, high))()
  const hot = a.pers.temperament >= HOT && b.pers.temperament >= HOT
  if (roll < (hot ? HOT_FEUD_CHANCE : FEUD_CHANCE)) return "feud"
  if (roll > 1 - FRIEND_CHANCE) return "friends"
  return null
}

/** Every bond among a group of players. */
export function bondsAmong(players: Player[]): Bond[] {
  const out: Bond[] = []
  for (let i = 0; i < players.length; i++)
    for (let j = i + 1; j < players.length; j++) {
      const kind = bondBetween(players[i], players[j])
      if (kind) out.push({ a: players[i].id, b: players[j].id, kind })
    }
  return out
}

const clampBond = (v: number) => Math.max(BOND_LIMITS.min, Math.min(BOND_LIMITS.max, v))

/** What a player's team mates do for him: the ability points from his bonds with them. */
export function chemistryOf(player: Player, mates: Player[]): number {
  let total = 0
  for (const m of mates) {
    const kind = bondBetween(player, m)
    if (kind) total += BOND_POINTS[kind]
  }
  return clampBond(total)
}

/** A side's spirit: the average of what each of its players gets from the others. */
export function spiritOf(players: Player[]): number {
  if (!players.length) return 0
  let sum = 0
  for (const p of players)
    sum += chemistryOf(
      p,
      players.filter((x) => x !== p)
    )
  return sum / players.length
}

/** The spirit in a word. */
export function spiritLabel(spirit: number): string {
  if (spirit >= 1) return "Tight-knit"
  if (spirit >= 0.3) return "Good"
  if (spirit > -0.3) return "Neutral"
  if (spirit > -1) return "Uneasy"
  return "Divided"
}
