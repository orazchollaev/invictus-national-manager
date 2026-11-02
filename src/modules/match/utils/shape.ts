/**
 * Where things stand on the live pitch, in percent of its width and height, for the side
 * attacking to the right with its own left on the upper half. Pure: the pitch view turns
 * these into screen positions, mirroring them for the away side.
 */
import { FORMATIONS } from "@/engine/match/formations"
import type { Formation } from "@/engine/match/types"
import type { Position } from "@/engine/types"

export interface Spot {
  x: number
  y: number
}

/** A player on the pitch and where his slot puts him. */
export interface Dot extends Spot {
  id: string
}

const LEFT = new Set<Position>(["LB", "LW"])
const RIGHT = new Set<Position>(["RB", "RW"])
const lateral = (p: Position) => (LEFT.has(p) ? 0 : RIGHT.has(p) ? 2 : 1)

/** How wide a row of n players spreads, in percent of the pitch's height. */
const spread = (n: number) => (n === 1 ? 0 : Math.min(76, 14 + n * 16))

/** Where each slot of a formation stands, in the order of `FORMATIONS`. */
export function layout(formation: Formation): Spot[] {
  const roles = FORMATIONS[formation]
  const rows = formation.split("-").map(Number)
  const spots: Spot[] = [{ x: 6, y: 50 }]
  let at = 1
  rows.forEach((n, r) => {
    const x = 19 + (rows.length === 1 ? 0 : (r / (rows.length - 1)) * 34)
    const row = roles
      .slice(at, at + n)
      .map((role, i) => ({ role, i }))
      .sort((a, b) => lateral(a.role) - lateral(b.role) || a.i - b.i)
    const span = spread(n)
    row.forEach((s, k) => {
      spots[at + s.i] = { x, y: n === 1 ? 50 : 50 - span / 2 + (k * span) / (n - 1) }
    })
    at += n
  })
  return spots
}

/** The players on the pitch put in their formation's places; a missing man leaves a gap. */
export function dotsFor(formation: Formation, pitch: readonly { id: string; slot: Position }[]) {
  const spots = layout(formation)
  const used = new Set<string>()
  return FORMATIONS[formation].flatMap((role, i): Dot[] => {
    const p = pitch.find((x) => x.slot === role && !used.has(x.id))
    if (!p) return []
    used.add(p.id)
    return [{ id: p.id, ...spots[i] }]
  })
}
