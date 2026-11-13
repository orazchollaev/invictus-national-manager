import { band } from "@/engine/clubs/profile"
import { mood } from "@/engine/clubs/ties"

const BANDS = ["vlow", "low", "mid", "high", "vhigh"] as const
const MOODS = ["hostile", "cold", "neutral", "warm", "devoted"] as const

/** The key of the word for a 1–100 rating: `clubs.band.<key>`. */
export function bandKey(value: number): (typeof BANDS)[number] {
  return BANDS[band(value) - 1]
}

/** The key of the word for a club's goodwill: `clubs.mood.<key>`. */
export function moodKey(rel: number): (typeof MOODS)[number] {
  return MOODS[mood(rel) - 1]
}

/** The colour a goodwill figure is drawn in. */
export function relTone(rel: number): string {
  if (rel >= 62) return "var(--success)"
  if (rel < 38) return "var(--danger)"
  return "var(--text-muted)"
}

/**
 * How much faster (+) or slower (−) youngsters grow at a club with this academy, in
 * percent. Mirrors the growth factor the engine applies (players/lifecycle.ts).
 */
export function academyEffect(academy: number): number {
  return Math.round((academy - 10) * 1.2)
}

export function seats(n: number): string {
  return n.toLocaleString("en")
}
