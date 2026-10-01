import { i18n } from "@/i18n"
import { resolveText } from "@/i18n/text"
import type { ISODate, Player } from "@/engine/types"

/**
 * Why a player cannot be picked right now, or null. A suspension only rules him
 * out of a match: he can still be named in a squad (`forMatch` false) and serve it.
 */
export function unavailability(p: Player, date: ISODate, forMatch = true): string | null {
  if (p.injury && p.injury.until > date)
    return i18n.global.t("squad.unavailable.injured", {
      name: `${p.first} ${p.last}`,
      label: resolveText(p.injury.label),
    })
  if (forMatch && p.banned)
    return i18n.global.t("squad.unavailable.suspended", { name: `${p.first} ${p.last}` })
  return null
}

/** The reasons for every unavailable player in a selection. */
export function unavailableIn(
  players: (Player | undefined)[],
  date: ISODate,
  forMatch = true
): string[] {
  return players
    .map((p) => (p ? unavailability(p, date, forMatch) : null))
    .filter((r): r is string => !!r)
}
