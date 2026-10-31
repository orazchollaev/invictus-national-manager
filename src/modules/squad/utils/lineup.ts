import type { Position } from "@/engine/types"
import type { SheetSlot } from "@/engine/match/types"

/**
 * The eleven for a new shape: each slot keeps its player. Always one entry per slot,
 * empty ones without a player.
 */
export function carryFormation(xi: SheetSlot[], positions: Position[]): SheetSlot[] {
  return positions.map((pos, i) => ({ playerId: xi[i]?.playerId ?? "", pos }))
}

/** Put a player in a slot. If he is already in another, the two swap. */
export function placePlayer(
  xi: SheetSlot[],
  positions: Position[],
  index: number,
  playerId: string
): SheetSlot[] {
  const out = carryFormation(xi, positions)
  const from = out.findIndex((s) => s.playerId === playerId)
  if (from >= 0 && from !== index) out[from].playerId = out[index].playerId
  out[index].playerId = playerId
  return out
}
