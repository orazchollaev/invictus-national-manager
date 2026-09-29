import { nationTop } from "@/engine/players/quality"
import type { Player } from "@/engine/types"

/**
 * A scout's 0.5–5 stars for a player's potential, measured against the best player
 * his nation's academies can produce: five stars is that level, one star is twenty
 * points below it.
 */
export function potentialStars(pa: number, youthLevel: number): number {
  const stars = 5 - (nationTop(youthLevel) - pa) / 5
  return Math.max(0.5, Math.min(5, Math.round(stars * 2) / 2))
}

/** A youngster the scouts would call a wonderkid. */
export function isWonderkid(pa: number, youthLevel: number): boolean {
  return pa >= nationTop(youthLevel) - 3
}

/** Ability gained since the last season's snapshot (0 for a new player). */
export function seasonGain(p: Player): number {
  const last = p.history.at(-1)
  return last ? Math.round((p.ca - last.ca) * 10) / 10 : 0
}
