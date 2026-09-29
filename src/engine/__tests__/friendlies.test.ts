import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { World } from "../world/world"
import type { WorldState } from "../world/types"
import { playMatch } from "../match/engine"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId = "TUR", seed = 21) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

function opponents(w: World, id: string) {
  return Object.values(w.state.fixtures)
    .filter((f) => f.compId === "friendly" && (f.home === id || f.away === id))
    .map((f) => (f.home === id ? f.away : f.home))
}

describe("friendly opponents", () => {
  it("vary from window to window", { timeout: 300000 }, () => {
    const w = newWorld("TUR")
    w.state.career.nationId = null
    for (let i = 0; i < 4 * 365; i++) w.nextDay()
    const ratios: number[] = []
    for (const id of ["TUR", "JPN", "BRA", "MAR", "USA", "NZL", "SCO", "EGY"]) {
      const opps = opponents(w, id)
      if (opps.length < 4) continue
      ratios.push(new Set(opps).size / opps.length)
    }
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length
    expect(ratios.length).toBeGreaterThan(4)
    expect(mean).toBeGreaterThanOrEqual(0.7)
  })

  it("are arranged for the user without asking him", { timeout: 300000 }, () => {
    const w = newWorld("TUR")
    const kinds = new Set<string>()
    for (let g = 0; g < 400 && w.state.date < "2028-09-01"; g++) {
      w.state.career.confidence = 80
      const i = w.advance(30)
      kinds.add(i.kind)
      if (w.settle(i)) continue
      if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
      else if (i.kind === "match") {
        const f = w.state.fixtures[i.fixtureId]
        w.applyReport(
          f,
          playMatch(w.matchSetup(f, w.aiSheet(f.home, f), w.aiSheet(f.away, f))),
          true
        )
      }
    }
    expect(kinds.has("friendly")).toBe(false)
    expect(w.state.pendingFriendly).toBeUndefined()
    const opps = opponents(w, "TUR")
    expect(opps.length).toBeGreaterThanOrEqual(3)
    expect(new Set(opps).size / opps.length).toBeGreaterThanOrEqual(0.7)
  })

  it("left waiting for a pick in an old save are booked on load", () => {
    const w = newWorld("TUR")
    const state = JSON.parse(JSON.stringify(w.state)) as WorldState
    const slot = "2027-03-25"
    state.pendingFriendly = [
      {
        slot,
        options: ["AUT", "BRA", "BHR", "URU"].map((id, i) => ({
          nationId: id,
          tag: "Evenly matched",
          home: i === 0,
        })),
      },
    ]
    const loaded = new World(state, statics())
    expect(loaded.state.pendingFriendly).toBeUndefined()
    const mine = loaded.fixturesOn(slot).find((f) => f.home === "TUR" || f.away === "TUR")
    expect(mine && [mine.home, mine.away].sort()).toEqual(["AUT", "TUR"])
    // Two of those passed over still play each other.
    const others = ["BRA", "BHR", "URU"].filter((id) =>
      loaded.fixturesOn(slot).some((f) => f.home === id || f.away === id)
    )
    expect(others).toHaveLength(2)
  })
})
