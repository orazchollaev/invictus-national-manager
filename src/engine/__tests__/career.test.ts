import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { buildReport, createMatch, step } from "../match/engine"
import { pickSquad } from "../ai/squad"

function newWorld(nationId: string) {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  return createWorld(
    { seed: 3, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics,
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

describe("a manager's first months", () => {
  it("names squads and plays his own matches minute by minute", { timeout: 120000 }, () => {
    const w = newWorld("TUR")
    let played = 0
    for (let guard = 0; guard < 60 && played < 8; guard++) {
      const i = w.advance(30)
      if (w.settle(i)) continue
      if (i.kind === "callup") {
        const squad = pickSquad(w.pool(i.nationId), w.state.date, 26, [], (p) =>
          w.released(p, w.state.competitions[i.squadFor]?.id)
        )
        w.setSquad(i.nationId, i.squadFor, squad)
      } else if (i.kind === "match") {
        const f = w.state.fixtures[i.fixtureId]
        const mine = f.home === "TUR" ? "home" : "away"
        const home = mine === "home" ? w.userSheet(f) : w.aiSheet(f.home, f)
        const away = mine === "away" ? w.userSheet(f) : w.aiSheet(f.away, f)
        const m = createMatch({ ...w.matchSetup(f, home, away), managed: mine })
        while (m.phase !== "done") {
          step(m)
          // The manager lets injured players carry on in this test.
          m.pendingInjuries = []
        }
        w.applyReport(f, buildReport(m), true)
        expect(w.state.reports[f.id]).toBeDefined()
        expect(JSON.stringify(w.state).length).toBeGreaterThan(1000)
        played++
      }
    }
    expect(played).toBeGreaterThanOrEqual(6)
    expect(w.state.career.history[0].played).toBe(played)
    // Nations League 2026–27: Türkiye's group is A1.
    const unl = w.state.competitions["unl-2026"]
    expect(unl.stages[0].groups?.find((g) => g.teams.includes("TUR"))?.name).toBe("A1")
  })
})

describe("call-ups", () => {
  it(
    "names one squad for a World Cup and the friendlies just before it",
    { timeout: 300000 },
    () => {
      const w = newWorld("BRA")
      const calls: string[] = []
      while (w.state.date < "2030-07-25") {
        // This test is about call-ups, not job security.
        w.state.career.confidence = 100
        const i = w.advance(60)
        if (w.settle(i)) continue
        if (i.kind === "callup") {
          if (w.state.date >= "2030-05-01") calls.push(`${w.state.date} ${i.squadFor}`)
          w.setSquad(i.nationId, i.squadFor, pickSquad(w.pool(i.nationId), w.state.date, 26))
        } else if (i.kind === "match") {
          const f = w.state.fixtures[i.fixtureId]
          const mine = f.home === "BRA" ? "home" : "away"
          const m = createMatch({
            ...w.matchSetup(
              f,
              mine === "home" ? w.userSheet(f) : w.aiSheet(f.home, f),
              mine === "away" ? w.userSheet(f) : w.aiSheet(f.away, f)
            ),
            managed: mine,
          })
          while (m.phase !== "done") {
            step(m)
            m.pendingInjuries = []
          }
          w.applyReport(f, buildReport(m), true)
        } else if (!w.state.career.nationId) break
      }
      const inWc = w.state.competitions["wc-2030"].stages[0].groups!.some((g) =>
        g.teams.includes("BRA")
      )
      if (inWc) expect(calls).toEqual([expect.stringContaining("wc-2030")])
    }
  )
})
