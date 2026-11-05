import type { U21Match } from "@/engine/world/types"

/** Each player's average under-21 rating over the matches kept, with how many it counts. */
export function u21Ratings(matches: U21Match[]): Map<string, { avg: number; n: number }> {
  const sums = new Map<string, [number, number]>()
  for (const m of matches) {
    for (const l of m.lines ?? []) {
      const [sum, n] = sums.get(l.playerId) ?? [0, 0]
      sums.set(l.playerId, [sum + l.rating, n + 1])
    }
  }
  const out = new Map<string, { avg: number; n: number }>()
  for (const [id, [sum, n]] of sums) out.set(id, { avg: Math.round((sum / n) * 10) / 10, n })
  return out
}

/** Wins, draws and defeats over the matches played. */
export function u21Record(matches: U21Match[]): { w: number; d: number; l: number } {
  const r = { w: 0, d: 0, l: 0 }
  for (const m of matches) {
    if (!m.result) continue
    if (m.result.gf > m.result.ga) r.w++
    else if (m.result.gf < m.result.ga) r.l++
    else r.d++
  }
  return r
}
