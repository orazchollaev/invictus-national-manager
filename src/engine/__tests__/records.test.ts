import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import type { Fixture } from "../competition/types"
import type { MatchReport, PlayerLine } from "../match/types"
import type { NationState } from "../world/types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import {
  emptyRecord,
  recordCleanSheets,
  recordHolders,
  recordMatch,
  recordRanks,
} from "../world/records"
import { makePlayer } from "./helpers"

const nation = (id: string) => ({ id }) as NationState

function fx(home: string, away: string, id = "f"): Fixture {
  return {
    id,
    compId: "friendly",
    stage: "friendly",
    label: "",
    date: "2027-03-25",
    home,
    away,
    atHome: true,
    importance: "friendly",
  }
}

describe("a nation's record", () => {
  it("counts results, goals and clean sheets", () => {
    const n = nation("AAA")
    recordMatch(n, fx("AAA", "BBB"), 2, 0)
    recordMatch(n, fx("BBB", "AAA"), 1, 1)
    recordMatch(n, fx("AAA", "CCC"), 0, 3)
    expect(n.record).toMatchObject({
      played: 3,
      won: 1,
      drawn: 1,
      lost: 1,
      gf: 3,
      ga: 4,
      cleanSheets: 1,
    })
  })

  it("keeps the biggest win and heaviest defeat, more goals breaking a tie", () => {
    const n = nation("AAA")
    recordMatch(n, fx("AAA", "BBB", "a"), 3, 0)
    recordMatch(n, fx("AAA", "CCC", "b"), 2, 1)
    recordMatch(n, fx("AAA", "DDD", "c"), 4, 1)
    expect(n.record!.biggestWin).toMatchObject({ fixture: "c", opp: "DDD", gf: 4, ga: 1 })
    recordMatch(n, fx("EEE", "AAA", "d"), 0, 2)
    recordMatch(n, fx("EEE", "AAA", "e"), 1, 3)
    expect(n.record!.heaviestDefeat).toMatchObject({ fixture: "e", opp: "EEE", gf: 1, ga: 3 })
  })

  it("keeps the best and worst ranking with their dates", () => {
    const nations: Record<string, NationState> = { A: nation("A"), B: nation("B") }
    recordRanks(["A", "B"], nations, "2026-10-01")
    recordRanks(["B", "A"], nations, "2026-11-01")
    recordRanks(["A", "B"], nations, "2026-12-01")
    expect(nations.A.record!.bestRank).toEqual([1, "2026-10-01"])
    expect(nations.A.record!.worstRank).toEqual([2, "2026-11-01"])
    expect(nations.B.record!.bestRank).toEqual([1, "2026-11-01"])
  })
})

describe("clean sheets", () => {
  const line = (playerId: string, side: "home" | "away", pos: "GK" | "CB", minutes: number) =>
    ({ playerId, side, pos, minutes }) as PlayerLine

  it("go to goalkeepers who played an hour without conceding", () => {
    const players = Object.fromEntries(
      ["g1", "g2", "g3", "d1"].map((id) => [
        id,
        makePlayer(id, id.startsWith("g") ? "GK" : "CB", 60),
      ])
    )
    const report = {
      result: { home: 2, away: 0 },
      lines: [
        line("g1", "home", "GK", 90),
        line("g3", "home", "GK", 0),
        line("d1", "home", "CB", 90),
        line("g2", "away", "GK", 90),
      ],
    } as unknown as MatchReport
    recordCleanSheets(report, (id) => players[id])
    expect(players.g1.cleanSheets).toBe(1)
    expect(players.g2.cleanSheets).toBeUndefined()
    expect(players.g3.cleanSheets).toBeUndefined()
    expect(players.d1.cleanSheets).toBeUndefined()
  })
})

describe("record holders", () => {
  it("list current and retired players together, best first", () => {
    const a = makePlayer("a", "ST", 70, { caps: 40, goals: 20, assists: 3 })
    const b = makePlayer("b", "GK", 70, { caps: 60, goals: 0, cleanSheets: 25 })
    const lists = recordHolders(
      [a, b],
      [
        {
          id: "r",
          nationId: "X",
          name: "Old Legend",
          pos: "ST",
          caps: 90,
          goals: 35,
          assists: 10,
          retired: "2027-01-01",
        },
      ]
    )
    expect(lists.goals.map((h) => h.id)).toEqual(["r", "a"])
    expect(lists.caps.map((h) => h.id)).toEqual(["r", "b", "a"])
    expect(lists.assists.map((h) => h.id)).toEqual(["r", "a"])
    expect(lists.cleanSheets.map((h) => h.id)).toEqual(["b"])
    expect(lists.goals[0].active).toBe(false)
  })

  it("break ties on goals by fewer caps", () => {
    const a = makePlayer("a", "ST", 70, { caps: 30, goals: 10 })
    const b = makePlayer("b", "ST", 70, { caps: 20, goals: 10 })
    expect(recordHolders([a, b], []).goals.map((h) => h.id)).toEqual(["b", "a"])
  })
})

describe("records in a running world", () => {
  it("add up for every nation as the matches are played", { timeout: 300000 }, () => {
    const w = createWorld(
      { seed: 9, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: null },
      { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    for (let i = 0; i < 120; i++) w.nextDay()
    let played = 0
    for (const n of Object.values(w.state.nations)) {
      const r = n.record ?? emptyRecord()
      expect(r.won + r.drawn + r.lost).toBe(r.played)
      const fixtures = Object.values(w.state.fixtures).filter(
        (f) => f.result && (f.home === n.id || f.away === n.id)
      )
      expect(r.played).toBe(fixtures.length)
      played += r.played
    }
    expect(played).toBeGreaterThan(100)
    // Month ends have ranked every FIFA member.
    expect(w.state.nations.ESP.record?.bestRank?.[0]).toBeGreaterThan(0)
    // Goalkeepers have kept clean sheets.
    expect(Object.values(w.state.players).some((p) => (p.cleanSheets ?? 0) > 0)).toBe(true)
  })
})
