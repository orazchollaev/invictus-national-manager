import type { Player, Position } from "@/engine/types"
import type { SheetSlot } from "@/engine/match/types"
import { ARCHETYPES, archetypeOf } from "@/engine/players/archetypes"
import {
  ROLES,
  rolesFor,
  suggestedRole,
  suitsRole,
  validRole,
  type Role,
} from "@/engine/match/roles"

/** The role that suits a player in a slot, if one does. */
export function roleFor(player: Player | undefined, pos: Position): Role | undefined {
  return player ? suggestedRole(archetypeOf(player), pos) : undefined
}

/**
 * The eleven for a new shape: each slot keeps its player, and its role where the new
 * slot can still ask for it. Always one entry per slot, empty ones without a player.
 */
export function carryFormation(xi: SheetSlot[], positions: Position[]): SheetSlot[] {
  return positions.map((pos, i) => {
    const old = xi[i]
    return {
      playerId: old?.playerId ?? "",
      pos,
      role: validRole(old?.role, pos) ? old.role : undefined,
    }
  })
}

/**
 * Put a player in a slot. If he is already in another, the two swap; whoever lands in
 * a slot takes the role that suits him there, since the old role was picked for someone
 * else.
 */
export function placePlayer(
  xi: SheetSlot[],
  positions: Position[],
  index: number,
  playerId: string,
  lookup: (id: string) => Player | undefined
): SheetSlot[] {
  const out = carryFormation(xi, positions).map((s, i) => ({ ...s, role: xi[i]?.role ?? s.role }))
  const from = out.findIndex((s) => s.playerId === playerId)
  if (from >= 0 && from !== index) {
    out[from].playerId = out[index].playerId
    out[from].role = roleFor(lookup(out[from].playerId), out[from].pos)
  }
  out[index].playerId = playerId
  out[index].role = roleFor(lookup(playerId), out[index].pos)
  return out
}

/** The eleven with one slot's role changed. */
export function setSlotRole(
  xi: SheetSlot[],
  positions: Position[],
  index: number,
  role: Role | undefined
): SheetSlot[] {
  const out = carryFormation(xi, positions).map((s, i) => ({ ...s, role: xi[i]?.role ?? s.role }))
  out[index].role = validRole(role, out[index].pos) ? role : undefined
  return out
}

export interface RoleChoices {
  options: { id: Role; label: string; suits: boolean }[]
  current: Role | undefined
  blurb: string
  /** The player's archetype, for telling him his role does or does not suit him. */
  style: string | null
  suited: boolean
}

/** What the role picker shows for a slot and the player in it. */
export function roleChoices(
  pos: Position,
  player: Player | undefined,
  current: Role | undefined
): RoleChoices {
  const arch = player ? archetypeOf(player) : null
  return {
    options: rolesFor(pos).map((id) => ({
      id,
      label: ROLES[id].label,
      suits: !!arch && suitsRole(arch, id),
    })),
    current,
    blurb: current ? ROLES[current].blurb : "The plain version of the position.",
    style: arch ? ARCHETYPES[arch].label : null,
    suited: !!arch && suitsRole(arch, current),
  }
}
