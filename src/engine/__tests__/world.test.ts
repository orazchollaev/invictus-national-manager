import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"

function newWorld(seed = 1, nationId = "TUR") {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test Manager", nationality: "TUR", nationId },
    statics,
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

describe("world", () => {
  it("starts with the real draws in place", () => {
    const w = newWorld()
    const unl = w.state.competitions["unl-2026"]
    expect(unl).toBeDefined()
    expect(unl.stages[0].groups?.[0].teams).toEqual(["FRA", "ITA", "BEL", "TUR"])
    // The real groups, not the pots' rows.
    const byName = Object.fromEntries(unl.stages[0].groups!.map((g) => [g.name, g.teams]))
    expect(byName.B2).toEqual(["HUN", "UKR", "GEO", "NIR"])
    expect(byName.C4).toEqual(["ISL", "BUL", "EST", "LUX"])
    expect(byName.D1).toEqual(["MLT", "GIB", "AND"])
    const cnl = w.state.competitions["cnl-2026"].stages.find((s) => s.key === "league-c")!
    expect(cnl.groups!.map((g) => g.teams)).toEqual([
      ["MSR", "TCA", "VGB"],
      ["SMN", "ARU", "BAH"],
      ["ATG", "AIA", "VIR"],
    ])
    expect(w.state.competitions["afconq-2027"].stages[0].status).toBe("active")
    expect(w.state.competitions["asian-cup-2027"].stages[0].groups?.length).toBe(6)
  })

  it("plays a first window with the user taking the AI's place", () => {
    const w = newWorld()
    w.state.career.nationId = null
    for (let i = 0; i < 80; i++) w.nextDay()
    const played = Object.values(w.state.fixtures).filter((f) => f.result)
    expect(played.length).toBeGreaterThan(150)
    expect(w.state.nations.TUR.results.length).toBeGreaterThan(2)
  })
})

describe("Nations League 2026–27", () => {
  it(
    "plays quarter-finals, play-offs and finals, and moves teams between leagues",
    { timeout: 120000 },
    () => {
      const w = newWorld(3)
      w.state.career.nationId = null
      while (w.state.date < "2027-07-01") w.nextDay()
      const unl = w.state.competitions["unl-2026"]
      const stage = (k: string) => unl.stages.find((s) => s.key === k)!
      expect(unl.status).toBe("done")
      expect(stage("quarter-finals").rounds![0].ties).toHaveLength(4)
      expect(stage("quarter-finals").rounds![0].ties.every((t) => t.fixtures.length === 2)).toBe(
        true
      )
      // A's two best fourths and two worst thirds v B's runners-up; B's fourths v C's runners-up.
      expect(stage("playoffs").rounds![0].ties.length).toBe(8)
      expect(stage("finals").rounds![1].ties[0].winner).toBeDefined()
      // Rebalanced for 2028–29: three leagues of 18, League D gone.
      const tiers = unl.outcome.tiers!
      expect(Object.keys(tiers).sort()).toEqual(["A", "B", "C"])
      expect([tiers.A.length, tiers.B.length, tiers.C.length]).toEqual([18, 18, 18])
      for (const t of ["MLT", "GIB", "AND", "LTU", "AZE", "LIE"]) expect(tiers.C).toContain(t)
    }
  )
})

describe("Nations League from 2028–29", () => {
  it("plays three leagues of 18 in groups of six, six matches each", { timeout: 300000 }, () => {
    const w = newWorld(4)
    w.state.career.nationId = null
    while (w.state.date < "2028-12-01") w.nextDay()
    const unl = w.state.competitions["unl-2028"]
    const league = unl.stages.find((s) => s.key === "league")!
    expect(league.groups!.map((g) => g.name)).toEqual([
      "A1",
      "A2",
      "A3",
      "B1",
      "B2",
      "B3",
      "C1",
      "C2",
      "C3",
    ])
    for (const g of league.groups!) {
      expect(g.teams).toHaveLength(6)
      for (const t of g.teams) {
        const games = g.fixtures
          .map((id) => w.state.fixtures[id])
          .filter((f) => f.home === t || f.away === t)
        expect(games).toHaveLength(6)
        expect(games.filter((f) => f.home === t)).toHaveLength(3)
        expect(new Set(games.map((f) => (f.home === t ? f.away : f.home))).size).toBe(5)
      }
    }
  })
})
