import { shallowRef } from "vue"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import type { NationDef } from "@/engine/types"
import { clubsFromRows, type ClubRow, type PlayerRow } from "@/engine/world/create"
import type { WorldStatics } from "@/engine/world/world"

let cached: WorldStatics | null = null

/** Nations and clubs of the bundled dataset: small, bundled, never saved. */
export function statics(): WorldStatics {
  cached ??= { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  return cached
}

/** The 16,880 starting players, loaded only when a new game begins. */
export async function startingPlayers(): Promise<Record<string, PlayerRow[]>> {
  const mod = await import("@/data/players.json")
  return mod.default as unknown as Record<string, PlayerRow[]>
}

/** The bundled nations, as shipped. */
export const NATION_DEFS = nations as NationDef[]
export const BASE_CLUB_ROWS = clubRows as ClubRow[]

/**
 * The nations of the dataset on screen: the bundled ones, or a mod's while a career
 * built on it is loaded (or while one is being picked). Names and flags follow it.
 */
const active = shallowRef<{ list: NationDef[]; byId: Map<string, NationDef> }>(index(NATION_DEFS))

function index(list: NationDef[]) {
  return { list, byId: new Map(list.map((n) => [n.id, n])) }
}

/** Show a mod's nations, or the bundled ones again with null. */
export function setActiveNations(list: NationDef[] | null) {
  active.value = index(list ?? NATION_DEFS)
}

export function activeNations(): NationDef[] {
  return active.value.list
}

export function nationDef(id: string | null | undefined): NationDef | undefined {
  return id ? active.value.byId.get(id) : undefined
}
