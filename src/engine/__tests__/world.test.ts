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
    expect(unl.stages[0].groups?.[0].teams).toEqual(["BEL", "FRA", "TUR", "ITA"])
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
      expect(stage("playoffs").rounds![0].ties.length).toBe(10)
      expect(stage("finals").rounds![1].ties[0].winner).toBeDefined()
      const tiers = unl.outcome.tiers!
      expect([tiers.A.length, tiers.B.length, tiers.C.length, tiers.D.length]).toEqual([
        16, 16, 16, 6,
      ])
      // A league's fourth-placed sides are gone from A.
      const a1 = stage("league").groups![0]
      expect(a1.teams).toContain("TUR")
    }
  )
})
