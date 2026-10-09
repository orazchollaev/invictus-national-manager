import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { Confed, NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { generateSquad } from "../players/squad"
import type { World } from "../world/world"

export const BASE = nations as NationDef[]
export const CONFEDS: Confed[] = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"]
const TAG: Record<Confed, string> = {
  UEFA: "U",
  CONMEBOL: "M",
  CONCACAF: "C",
  CAF: "F",
  AFC: "A",
  OFC: "O",
}

/** `n` made-up FIFA members of a confederation, from the strongest down. */
export function extraNations(confed: Confed, n: number, extra: Partial<NationDef> = {}) {
  return Array.from({ length: n }, (_, i): NationDef => {
    const id = `${TAG[confed]}X${String.fromCharCode(65 + i)}`
    return {
      id,
      name: `${confed} extra ${i}`,
      flag: "un",
      confed,
      subFeds: [],
      color: "#123456",
      youthLevel: 40,
      points: 1100 - i * 8,
      cultures: [["english", 100]],
      centre: [10 + i, 10 + i],
      ...extra,
    }
  })
}

/** A world of the bundled data plus the nations given, nobody managed. */
export function worldWith(added: NationDef[], seed = 3, start = "2026-09-01"): World {
  const clubs: ClubRow[] = []
  const players = structuredClone(playerRows as unknown as Record<string, PlayerRow[]>)
  for (const d of added) {
    const own: ClubRow[] = [
      [`${d.id}-1`, `${d.name} FC`, d.id, 3],
      [`${d.id}-2`, `${d.name} United`, d.id, 4],
    ]
    clubs.push(...own)
    players[d.id] = generateSquad(d, [own[0][0], own[1][0]], start, 7)
  }
  const w = createWorld(
    { seed, start, managerName: "M", nationality: "TUR", nationId: "TUR" },
    {
      nations: [...BASE, ...added.map((n) => structuredClone(n))],
      clubs: clubsFromRows([...(clubRows as ClubRow[]), ...clubs]),
    },
    players
  )
  w.state.career.nationId = null
  return w
}

export function playUntil(w: World, date: string) {
  while (w.state.date < date) w.nextDay()
}
