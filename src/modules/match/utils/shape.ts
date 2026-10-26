/**
 * Where things stand on the live pitch, in percent of its width and height, for the side
 * attacking to the right with its own left on the upper half. Pure: the pitch view turns
 * these into screen positions, mirroring them for the away side.
 */
import { FORMATIONS } from "@/engine/match/formations"
import type { Formation, MatchEvent, MatchEventKind, ShotType, Side } from "@/engine/match/types"
import type { Position } from "@/engine/types"

export interface Spot {
  x: number
  y: number
}

/** A player on the pitch and where his slot puts him. */
export interface Dot extends Spot {
  id: string
}

/** A shot, goal or save, put where it was taken. */
export interface ShotMark extends Spot {
  /** Index of the event, which is also its key. */
  key: number
  kind: MatchEventKind
  side: Side
  playerId?: string
  xg?: number
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

const SHOT_KINDS = new Set<MatchEventKind>([
  "goal",
  "pen-goal",
  "shot-saved",
  "shot-wide",
  "shot-blocked",
  "woodwork",
  "big-chance-missed",
  "pen-miss",
  "pen-saved",
])

/** How far from the goal line each kind of shot is taken. */
const REACH: Record<ShotType, number> = {
  long: 26,
  box: 15,
  close: 8,
  header: 11,
  "one-on-one": 10,
  "free-kick": 22,
  rebound: 9,
}

const PENALTY_REACH = 11

/** Every shot so far, at the end of the pitch its side attacks. */
export function shotMarks(events: readonly MatchEvent[]): ShotMark[] {
  return events.flatMap((e, key): ShotMark[] => {
    if (!e.side || !SHOT_KINDS.has(e.kind)) return []
    const penalty = e.kind === "pen-goal" || e.kind === "pen-miss" || e.kind === "pen-saved"
    const reach = penalty ? PENALTY_REACH : REACH[e.shot ?? "box"]
    const lane = e.lane === "left" ? 32 : e.lane === "right" ? 68 : 50
    // Marks from the same lane would pile up; a fixed nudge spreads them.
    const y = penalty ? 50 : lane + ((key * 37) % 11) - 5
    const home = e.side === "home"
    return [
      {
        key,
        kind: e.kind,
        side: e.side,
        playerId: e.playerId,
        xg: e.xg,
        x: home ? 100 - reach : reach,
        y: home ? y : 100 - y,
      },
    ]
  })
}
