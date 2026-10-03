import type { Fixture } from "@/engine/competition/types"

/** Two nations' meetings since the game began, from the first one's side. */
export interface HeadToHead {
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  /** The latest meeting, if any. */
  last: Fixture | null
}

/** Every finished match between `a` and `b` counted for `a` (a shoot-out is a draw). */
export function headToHead(fixtures: Iterable<Fixture>, a: string, b: string): HeadToHead {
  const out: HeadToHead = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, last: null }
  for (const f of fixtures) {
    if (!f.result) continue
    const home = f.home === a && f.away === b
    if (!home && !(f.home === b && f.away === a)) continue
    const gf = home ? f.result.h : f.result.a
    const ga = home ? f.result.a : f.result.h
    out.played++
    out.gf += gf
    out.ga += ga
    if (gf > ga) out.won++
    else if (gf < ga) out.lost++
    else out.drawn++
    if (!out.last || f.date > out.last.date) out.last = f
  }
  return out
}
