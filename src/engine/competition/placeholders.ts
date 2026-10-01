/**
 * Placeholders stand in for teams not known when a draw is made — "UEFA play-off
 * Path A winner" in a World Cup group drawn in December, filled in when the March
 * play-offs are over. The id names the competition that decides it and the slot:
 *
 *   ?wcq-uefa-2030:0   winner of the first play-off path of UEFA's qualifying
 *   ?wcq-ic-2030:1     second winner of the inter-confederation play-off tournament
 */
import type { Confed } from "../types"
import { msg, type Msg } from "../text"

export const PLACEHOLDER_PREFIX = "?"

export function isPlaceholder(id: string | null | undefined): id is string {
  return !!id && id.startsWith(PLACEHOLDER_PREFIX)
}

export function makePlaceholder(compId: string, slot: number): string {
  return `${PLACEHOLDER_PREFIX}${compId}:${slot}`
}

export function parsePlaceholder(id: string): {
  compId: string
  defId: string
  year: number
  slot: number
} {
  const [compId, slot] = id.slice(1).split(":")
  const dash = compId.lastIndexOf("-")
  return {
    compId,
    defId: compId.slice(0, dash),
    year: Number(compId.slice(dash + 1)),
    slot: Number(slot),
  }
}

const PATH = "ABCDEFGH"
/** Beyond the eight letters (europeanQualifiersDef's League format can draw up
 * to ten single-leg ties, not the four-team "paths" the letters were named for). */
const pathName = (slot: number) => PATH[slot] ?? String(slot + 1)

/** What the user reads in a group or a fixture. */
export function placeholderLabel(id: string): string {
  const { defId, slot } = parsePlaceholder(id)
  switch (defId) {
    case "wcq-uefa":
      return `UEFA play-off Path ${pathName(slot)} winner`
    case "euroq":
      return `Play-off Path ${pathName(slot)} winner`
    case "wcq-ic":
      return `Play-off Tournament winner ${slot + 1}`
    default:
      return `Qualifier ${slot + 1}`
  }
}

/** The competition a placeholder is the winner of, without the word "winner". */
export function placeholderBase(id: string): Msg {
  const { defId, slot } = parsePlaceholder(id)
  switch (defId) {
    case "wcq-uefa":
      return msg("placeholder.uefa", { path: pathName(slot) })
    case "euroq":
      return msg("placeholder.path", { path: pathName(slot) })
    case "wcq-ic":
      return msg("placeholder.tournament")
    default:
      return msg("placeholder.qualifier", { n: slot + 1 })
  }
}

/** The same label as `placeholderLabel`, in the language being played. */
export function placeholderText(id: string, short = false): Msg {
  const { defId, slot } = parsePlaceholder(id)
  if (short)
    return defId === "wcq-ic"
      ? msg("placeholder.shortIc", { n: slot + 1 })
      : msg("placeholder.shortPo", { path: pathName(slot) })
  if (defId === "wcq-ic") return msg("placeholder.tournamentWinner", { n: slot + 1 })
  if (defId === "wcq-uefa" || defId === "euroq")
    return msg("placeholder.winner", { base: placeholderBase(id) })
  return placeholderBase(id)
}

/** Short label for tight rows. */
export function placeholderShort(id: string): string {
  const { defId, slot } = parsePlaceholder(id)
  if (defId === "wcq-ic") return `IC ${slot + 1}`
  return `PO ${pathName(slot)}`
}

/**
 * The confederation a placeholder will turn into, for keeping confederations apart
 * in a draw. Inter-confederation winners get their own family so they are split up.
 */
export function placeholderConfed(id: string): Confed | "PLAYOFF" {
  const { defId } = parsePlaceholder(id)
  if (defId === "wcq-uefa" || defId === "euroq") return "UEFA"
  if (defId.startsWith("wcq-")) return defId.slice(4).toUpperCase() as Confed
  return "PLAYOFF"
}
