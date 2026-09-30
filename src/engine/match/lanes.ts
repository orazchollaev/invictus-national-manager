/**
 * Which side of the pitch an attack comes down. Left and right are the attacking team's
 * own, so a left-back always starts a move on his team's left whichever way the screen
 * is drawn. Formations list their players right to left, so the roles tell the side:
 * a LB or LW is on the left, a RB or RW on the right, everyone else through the middle.
 */
import type { Position } from "../types"
import type { Lane, MatchEvent, Side } from "./types"

export const LANES: readonly Lane[] = ["left", "centre", "right"]

export function laneOfSlot(pos: Position): Lane {
  if (pos === "LB" || pos === "LW") return "left"
  if (pos === "RB" || pos === "RW") return "right"
  return "centre"
}

/** The lane the other side defends: an attack down our left meets their right. */
export function mirror(lane: Lane): Lane {
  return lane === "left" ? "right" : lane === "right" ? "left" : "centre"
}

/** How much a player in `own` lane is involved in an attack down `lane`. */
export function laneAffinity(own: Lane, lane: Lane): number {
  if (own === lane) return 1
  // The middle supports both flanks, and a flank player drifts inside; the far flank is away.
  if (own === "centre" || lane === "centre") return 0.35
  return 0.1
}

/** A share of the attack for each lane, from the width the manager asks for. */
export function widthBias(width: number): Record<Lane, number> {
  const f = 0.25 * (width - 1)
  return { left: 1 + f, centre: 1 - f, right: 1 + f }
}

export interface LaneShares {
  home: Record<Lane, number>
  away: Record<Lane, number>
}

const empty = (): Record<Lane, number> => ({ left: 0, centre: 0, right: 0 })

/** How many attacks each side made down each lane, from the events of a match. */
export function laneCounts(events: readonly MatchEvent[]): LaneShares {
  const out: LaneShares = { home: empty(), away: empty() }
  for (const ev of events) if (ev.lane && ev.side) out[ev.side as Side][ev.lane]++
  return out
}

/** The same as percentages that add up to 100 (zeros when there were no attacks). */
export function lanePercent(counts: Record<Lane, number>): Record<Lane, number> {
  const total = counts.left + counts.centre + counts.right
  if (!total) return empty()
  const left = Math.round((counts.left / total) * 100)
  const right = Math.round((counts.right / total) * 100)
  return { left, centre: 100 - left - right, right }
}
