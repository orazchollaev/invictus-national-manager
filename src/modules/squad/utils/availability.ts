import type { ISODate, Player } from "@/engine/types"

/** Why a player cannot be picked right now, or null. */
export function unavailability(p: Player, date: ISODate): string | null {
  if (p.injury && p.injury.until > date)
    return `${p.first} ${p.last} is injured (${p.injury.label})`
  if (p.banned) return `${p.first} ${p.last} is suspended`
  return null
}

/** The reasons for every unavailable player in a selection. */
export function unavailableIn(players: (Player | undefined)[], date: ISODate): string[] {
  return players.map((p) => (p ? unavailability(p, date) : null)).filter((r): r is string => !!r)
}
