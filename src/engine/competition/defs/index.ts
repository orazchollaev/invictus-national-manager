import type { CompetitionDef } from "../runtime"
import { FIFA_DEFS } from "./fifa"
import { EUROPE_DEFS } from "./europe"
import { CONTINENT_DEFS } from "./continents"
import { CONCACAF_DEFS } from "./concacaf"
import { REGIONAL_DEFS } from "./regional"
import { INVITATIONAL_DEFS } from "./invitational"

export const COMPETITION_DEFS: CompetitionDef[] = [
  ...FIFA_DEFS,
  ...EUROPE_DEFS,
  ...CONTINENT_DEFS,
  ...CONCACAF_DEFS,
  ...REGIONAL_DEFS,
  ...INVITATIONAL_DEFS,
]

const byId = new Map(COMPETITION_DEFS.map((d) => [d.id, d]))

export function competitionDef(id: string): CompetitionDef {
  const def = byId.get(id)
  if (!def) throw new Error(`Unknown competition ${id}`)
  return def
}
