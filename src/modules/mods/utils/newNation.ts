/**
 * What a nation added to a mod starts with: two clubs and a squad drawn from its
 * naming cultures. All of it is plain mod data the editor can change afterwards.
 */
import type { NationDef } from "@/engine/types"
import type { ClubRow, PlayerRow } from "@/engine/world/create"
import { generateSquad } from "@/engine/players/squad"

/** A stable number for a nation id, so the same id always gets the same squad. */
export function seedOf(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return h >>> 0
}

export function startingClubs(def: NationDef): ClubRow[] {
  const tier = def.youthLevel >= 75 ? 2 : def.youthLevel >= 45 ? 3 : 4
  const key = def.id.toLowerCase()
  return [
    [`${key}-mod-1`, `${def.name} FC`, def.id, tier],
    [`${key}-mod-2`, `${def.name} United`, def.id, Math.min(5, tier + 1)],
  ]
}

export function startingSquad(def: NationDef, clubs: ClubRow[], today: string): PlayerRow[] {
  return generateSquad(
    def,
    clubs.map((c) => c[0]),
    today,
    seedOf(def.id)
  )
}
