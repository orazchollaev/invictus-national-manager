import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { Confed, NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { generateSquad } from "../players/squad"
import { distanceKm, nearby } from "../competition/defs/helpers"
import { isPlaceholder } from "../competition/placeholders"
import { competitionDef } from "../competition/defs"
import { groupStandings } from "../competition/tables"
import type { World } from "../world/world"

/**
 * Nations a mod adds, in every confederation, played through the same competitions as
 * the rest: the formats must take an extra team (or six) without losing, doubling or
 * stranding any.
 */

const BASE = nations as NationDef[]

const nation = (
  id: string,
  name: string,
  confed: Confed,
  extra: Partial<NationDef> = {}
): NationDef => ({
  id,
  name,
  flag: "un",
  confed,
  subFeds: [],
  color: "#123456",
  youthLevel: 55,
  points: 1250,
  cultures: [["english", 100]],
  centre: [0, 0],
  ...extra,
})

/** One nation for each confederation and each way of belonging to one. */
const ADDED: NationDef[] = [
  nation("BSQ", "Basque Country", "UEFA", { points: 1350, centre: [43, -2.5] }),
  nation("CAT", "Catalonia", "UEFA", {
    nonFifa: "confederation",
    points: 1450,
    centre: [41.7, 1.8],
  }),
  nation("MAP", "Mapuche Nation", "CONMEBOL", {
    nonFifa: "regional",
    points: 1000,
    centre: [-38.7, -72.5],
  }),
  nation("GRL", "Greenland", "CONCACAF", {
    nonFifa: "regional",
    points: 950,
    centre: [72, -40],
  }),
  nation("QUE", "Quebec", "CONCACAF", {
    nonFifa: "confederation",
    points: 1150,
    centre: [52, -71],
  }),
  nation("SAH", "Western Sahara", "CAF", {
    nonFifa: "confederation",
    subFeds: ["UNAF"],
    points: 1050,
    centre: [24.2, -13.2],
  }),
  nation("TIB", "Tibet", "AFC", {
    nonFifa: "confederation",
    points: 900,
    centre: [31.6, 88.0],
  }),
  nation("HAW", "Hawaii", "OFC", { nonFifa: "regional", points: 800, centre: [20.8, -156.3] }),
]

function dataset(added: NationDef[]) {
  const clubs: ClubRow[] = []
  const players: Record<string, PlayerRow[]> = structuredClone(
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  for (const def of added) {
    const own: ClubRow[] = [
      [`${def.id.toLowerCase()}-mod-1`, `${def.name} FC`, def.id, 3],
      [`${def.id.toLowerCase()}-mod-2`, `${def.name} United`, def.id, 4],
    ]
    clubs.push(...own)
    players[def.id] = generateSquad(
      def,
      own.map((c) => c[0]),
      "2026-09-01",
      7
    )
  }
  return {
    statics: {
      nations: [...BASE, ...added.map((n) => structuredClone(n))],
      clubs: clubsFromRows([...(clubRows as ClubRow[]), ...clubs]),
    },
    players,
  }
}

function build(added: NationDef[], seed = 3) {
  const { statics, players } = dataset(added)
  const w = createWorld(
    { seed, start: "2026-09-01", managerName: "M", nationality: "TUR", nationId: "TUR" },
    statics,
    players
  )
  w.state.career.nationId = null
  return w
}

function playUntil(w: World, date: string) {
  while (w.state.date < date) w.nextDay()
}

/** Everything a competition must keep true, whoever is in it. */
function checkCompetitions(w: World, added: string[]) {
  const ctx = w.ctx()
  const problems: string[] = []
  for (const inst of Object.values(w.state.competitions)) {
    for (const stage of inst.stages) {
      if (!stage.groups) continue
      const seen = new Set<string>()
      for (const g of stage.groups)
        for (const t of g.teams) {
          if (!isPlaceholder(t) && seen.has(t)) problems.push(`${inst.id}/${stage.key}: ${t} twice`)
          seen.add(t)
        }
      if (stage.status !== "done") continue
      const rule =
        competitionDef(inst.defId)
          .plan(inst, ctx)
          .find((p) => p.key === stage.key)?.groups?.tiebreak ?? "gd"
      for (const g of stage.groups) {
        const table = groupStandings(g, ctx.fixture, rule, ctx.points)
        for (const row of table) {
          const games = row.w + row.d + row.l
          if (row.p !== games) problems.push(`${inst.id}/${stage.key}: ${row.team} played`)
        }
      }
    }
    if (inst.status === "done") {
      for (const f of Object.values(w.state.fixtures))
        if (f.compId === inst.id && !f.result) problems.push(`${inst.id}: unplayed ${f.id}`)
    }
  }
  for (const f of Object.values(w.state.fixtures)) {
    if (!isPlaceholder(f.home) && !w.defs.has(f.home)) problems.push(`unknown ${f.home}`)
    if (!isPlaceholder(f.away) && !w.defs.has(f.away)) problems.push(`unknown ${f.away}`)
    if (f.home === f.away) problems.push(`${f.id}: ${f.home} v itself`)
  }
  for (const n of Object.values(w.state.nations))
    if (!Number.isFinite(n.points)) problems.push(`${n.id}: points ${n.points}`)
  for (const id of added) if (!w.state.nations[id]) problems.push(`${id} missing`)
  return problems
}

describe("a nation's place on the map", () => {
  const w = build([nation("CAT", "Catalonia", "UEFA", { centre: [41.7, 1.8] })])
  const ctx = w.ctx()

  it("comes from the mod for a nation the game does not ship", () => {
    expect(ctx.centre("CAT")).toEqual([41.7, 1.8])
  })

  it("comes from the bundled table for the others", () => {
    expect(ctx.centre("ESP")).toBeDefined()
  })

  it("puts a new nation near its neighbours and away from far ones", () => {
    expect(distanceKm(ctx, "CAT", "ESP")).toBeLessThan(700)
    expect(nearby(ctx, "CAT", "FRA")).toBe(true)
    expect(nearby(ctx, "CAT", "AUS")).toBe(false)
    expect(distanceKm(ctx, "CAT", "AUS")).toBeGreaterThan(10000)
  })

  it("measures the same distance both ways", () => {
    expect(distanceKm(ctx, "CAT", "GER")).toBeCloseTo(distanceKm(ctx, "GER", "CAT"), 6)
  })

  it("keeps the bundled distances as they were", () => {
    const plain = build([]).ctx()
    expect(distanceKm(ctx, "ESP", "FRA")).toBe(distanceKm(plain, "ESP", "FRA"))
  })

  it("treats a nation with no known centre as out of reach, not nearby", () => {
    expect(ctx.centre("ZZZ")).toBeUndefined()
    expect(distanceKm(ctx, "ZZZ", "ESP")).toBe(Infinity)
    expect(nearby(ctx, "ZZZ", "ESP")).toBe(false)
  })
})

describe("a world with nations added to every confederation", { timeout: 900000 }, () => {
  const w = build(ADDED)
  playUntil(w, "2030-08-15")
  const ids = ADDED.map((n) => n.id)

  it("runs the competitions through the 2030 World Cup without a fault", () => {
    expect(checkCompetitions(w, ids)).toEqual([])
    expect(w.state.competitions["wc-2030"].status).toBe("done")
    expect(w.state.competitions["wc-2030"].stages[0].groups?.flatMap((g) => g.teams)).toHaveLength(
      48
    )
  })

  it("plays every added nation", () => {
    for (const id of ids) {
      const played = Object.values(w.state.fixtures).filter(
        (f) => (f.home === id || f.away === id) && f.result
      )
      expect(played.length, id).toBeGreaterThan(5)
    }
  })

  it("lets a FIFA member into World Cup qualifying, and keeps the others out of it", () => {
    const inQualifying = (id: string) =>
      Object.values(w.state.competitions).some(
        (c) =>
          c.defId.startsWith("wcq") &&
          c.stages.some((s) => s.groups?.some((g) => g.teams.includes(id)))
      )
    expect(inQualifying("BSQ")).toBe(true)
    for (const id of ["CAT", "MAP", "GRL", "QUE", "SAH", "TIB", "HAW"])
      expect(inQualifying(id), id).toBe(false)
  })

  it("lets a non-FIFA confederation member into its continental qualifying", () => {
    const inContinental = (id: string, prefix: string) =>
      Object.values(w.state.competitions).some(
        (c) => c.defId.startsWith(prefix) && JSON.stringify(c.stages).includes(`"${id}"`)
      )
    expect(inContinental("CAT", "euro")).toBe(true)
    expect(inContinental("CAT", "unl")).toBe(true)
  })

  it("keeps the ranking and every nation's points sane", () => {
    for (const id of ids) {
      expect(w.state.nations[id].points).toBeGreaterThan(300)
      expect(w.state.nations[id].points).toBeLessThan(2600)
    }
    expect(w.fifaRank("BSQ")).toBeGreaterThan(0)
    expect(w.fifaRank("CAT")).toBe(0)
  })

  it("keeps their youth pools alive", () => {
    for (const id of ids) {
      // Retired players leave `players`, so what is left is who can still be picked.
      const squad = Object.values(w.state.players).filter((p) => p.nationId === id)
      expect(squad.length, id).toBeGreaterThanOrEqual(20)
    }
  })
})

describe.each([
  ["UEFA", [ADDED[0], ADDED[1]]],
  ["CONMEBOL", [ADDED[2]]],
  ["CONCACAF", [ADDED[3], ADDED[4]]],
  ["CAF", [ADDED[5]]],
  ["AFC", [ADDED[6]]],
  ["OFC", [ADDED[7]]],
] as [string, NationDef[]][])("a nation added to %s alone", (_confed, added) => {
  it("leaves the competitions sound through to 2029", { timeout: 600000 }, () => {
    const w = build(added, 11)
    playUntil(w, "2029-09-01")
    expect(
      checkCompetitions(
        w,
        added.map((n) => n.id)
      )
    ).toEqual([])
    for (const n of added) {
      const played = Object.values(w.state.fixtures).some(
        (f) => (f.home === n.id || f.away === n.id) && f.result
      )
      expect(played, n.id).toBe(true)
    }
  })
})

describe("adding nations to a world", () => {
  it("changes nothing for the nations already in it: a world with none is the same world", () => {
    const a = build([], 5)
    const b = build([], 5)
    playUntil(a, "2027-06-01")
    playUntil(b, "2027-06-01")
    expect(Object.keys(a.state.fixtures)).toEqual(Object.keys(b.state.fixtures))
  })

  it("is deterministic with the added nations, too", { timeout: 300000 }, () => {
    const a = build(ADDED, 5)
    const b = build(ADDED, 5)
    playUntil(a, "2027-03-01")
    playUntil(b, "2027-03-01")
    expect(JSON.stringify(a.state.fixtures)).toBe(JSON.stringify(b.state.fixtures))
  })
})
