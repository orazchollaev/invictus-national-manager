import { i18n } from "@/i18n"
import type { ISODate, Player, Position } from "@/engine/types"
import { ageOn, positionGroup } from "@/engine/players/ability"

export function age(p: Pick<Player, "born">, on: ISODate): number {
  return ageOn(p.born, on)
}

/** Ability shown as a whole number. */
export function rating(v: number): string {
  return String(Math.round(v))
}

/** Colour band for an ability or match rating, as a CSS token name. */
export function abilityTone(v: number): string {
  if (v >= 82) return "var(--gold)"
  if (v >= 74) return "var(--success)"
  if (v >= 64) return "var(--accent)"
  if (v >= 52) return "var(--warning)"
  return "var(--text-muted)"
}

export function matchRatingTone(v: number): string {
  if (v >= 8) return "var(--success)"
  if (v >= 7) return "var(--accent)"
  if (v >= 6) return "var(--text)"
  return "var(--danger)"
}

export function positionTone(pos: Position): string {
  switch (positionGroup(pos)) {
    case "GK":
      return "var(--warning)"
    case "DEF":
      return "var(--pos-2)"
    case "MID":
      return "var(--success)"
    default:
      return "var(--danger)"
  }
}

/** The manager's view of a player's ceiling: a range, narrower as he matures. */
export function potentialRange(p: Player, on: ISODate): [number, number] {
  const a = ageOn(p.born, on)
  const spread = a <= 19 ? 7 : a <= 22 ? 5 : a <= 25 ? 3 : 1
  const seed = [...p.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) % 5
  const lo = Math.max(Math.round(p.ca), p.pa - spread + (seed % 3) - 1)
  return [lo, Math.min(99, lo + spread)]
}

const t = (key: string) => i18n.global.t(key)

export function formLabel(form: number): string {
  if (form >= 3) return t("form.excellent")
  if (form >= 1) return t("form.good")
  if (form > -1) return t("form.average")
  if (form > -3) return t("form.poor")
  return t("form.awful")
}

export function describeTrait(v: number): string {
  if (v >= 17) return t("trait.outstanding")
  if (v >= 14) return t("trait.strong")
  if (v >= 8) return t("trait.average")
  if (v >= 5) return t("trait.weak")
  return t("trait.veryWeak")
}

export function scoreline(h: number, a: number, pens?: [number, number]): string {
  return pens ? `${h}–${a} (${pens[0]}–${pens[1]} p)` : `${h}–${a}`
}

export function resultLetter(gf: number, ga: number, pens?: "W" | "L"): "W" | "D" | "L" {
  if (gf > ga || pens === "W") return "W"
  if (gf < ga || pens === "L") return "L"
  return "D"
}
