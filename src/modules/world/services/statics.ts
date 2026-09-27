import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import type { NationDef } from "@/engine/types"
import { clubsFromRows, type ClubRow, type PlayerRow } from "@/engine/world/create"
import type { WorldStatics } from "@/engine/world/world"

let cached: WorldStatics | null = null

/** Nations and clubs: small, bundled, never saved. */
export function statics(): WorldStatics {
  cached ??= { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  return cached
}

/** The 16,880 starting players, loaded only when a new game begins. */
export async function startingPlayers(): Promise<Record<string, PlayerRow[]>> {
  const mod = await import("@/data/players.json")
  return mod.default as unknown as Record<string, PlayerRow[]>
}

export const NATION_DEFS = nations as NationDef[]
