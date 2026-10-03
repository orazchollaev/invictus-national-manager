/**
 * Rivalries between national teams (data/rivalries.ts). A derby moves the fans
 * twice as far as an ordinary match and the board's confidence a little, both ways:
 * a thrill to win, a sting to lose — never enough on its own to cost the job.
 */
import { RIVALRIES } from "@/data/rivalries"

export type Intensity = 0 | 1 | 2

const BY_PAIR = new Map<string, 1 | 2>()
const BY_NATION = new Map<string, { id: string; intensity: 1 | 2 }[]>()
for (const [a, b, v] of RIVALRIES) {
  BY_PAIR.set(`${a}|${b}`, v)
  BY_PAIR.set(`${b}|${a}`, v)
  for (const [x, y] of [
    [a, b],
    [b, a],
  ]) {
    const list = BY_NATION.get(x)
    if (list) list.push({ id: y, intensity: v })
    else BY_NATION.set(x, [{ id: y, intensity: v }])
  }
}

/** How fierce the rivalry between two nations is: 0 for none. */
export function rivalry(a: string, b: string): Intensity {
  return BY_PAIR.get(`${a}|${b}`) ?? 0
}

/** A nation's rivals, fiercest first. */
export function rivalsOf(id: string): { id: string; intensity: 1 | 2 }[] {
  return [...(BY_NATION.get(id) ?? [])].sort((x, y) => y.intensity - x.intensity)
}

/** What a derby adds to the board's confidence, by result and intensity (kept small). */
export const DERBY_CONFIDENCE = { win: 2, loss: -2, perIntensity: 1 } as const

/** Confidence for a derby result: +3/−3 for the great derbies, +2/−2 otherwise. */
export function derbyConfidence(intensity: Intensity, result: "W" | "D" | "L"): number {
  if (!intensity || result === "D") return 0
  const extra = DERBY_CONFIDENCE.perIntensity * (intensity - 1)
  return result === "W" ? DERBY_CONFIDENCE.win + extra : DERBY_CONFIDENCE.loss - extra
}
