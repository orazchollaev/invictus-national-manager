import type { Confed } from "@/engine/types"
import type { CompetitionInstance } from "@/engine/competition/types"
import { hostLevelOf, type HostLevel } from "@/engine/world/stadiums"

const CONTINENTAL: Record<Confed, string> = {
  UEFA: "UEFA Euro",
  CONMEBOL: "Copa América",
  CONCACAF: "Gold Cup",
  CAF: "Africa Cup of Nations",
  AFC: "AFC Asian Cup",
  OFC: "OFC Nations Cup",
}

/** What a hosting level means for a nation of this confederation. */
export function levelName(level: HostLevel, confed: Confed): string {
  if (level === "world-cup") return "FIFA World Cup"
  if (level === "continental") return CONTINENTAL[confed]
  return "Regional cups"
}

export const seats = (n: number) => n.toLocaleString("en")

/** "40,000" → "40k" for tight spots. */
export const seatsShort = (n: number) =>
  n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n))

/** Upcoming tournaments a nation hosts, at a level. */
export function hostedAt(
  competitions: CompetitionInstance[],
  nationId: string,
  level: HostLevel,
  today: string
): CompetitionInstance[] {
  return competitions
    .filter((c) => c.hosts.includes(nationId) && c.end >= today && hostLevelOf(c.kind) === level)
    .sort((a, b) => (a.start < b.start ? -1 : 1))
}
