import { describe, expect, it } from "vitest"
import type { Fixture } from "@/engine/competition/types"
import type { MatchReport } from "@/engine/match/types"
import { matchLog, seasonLabel, seasonOf, seasonRows } from "../utils/international"

describe("a player's international record", () => {
  it("counts what he won in each season from the records written as seasons end", () => {
    const rows = seasonRows(
      {
        caps: 12,
        goals: 5,
        clubId: "c3",
        ca: 70,
        history: [
          { season: 2026, ca: 64, clubId: "c1", caps: 4, goals: 1 },
          { season: 2027, ca: 67, clubId: "c2", caps: 9, goals: 4 },
        ],
      },
      2028
    )
    expect(rows.map((r) => [r.season, r.capsGained, r.goalsGained, r.current])).toEqual([
      [2028, 3, 1, true],
      [2027, 5, 3, false],
      [2026, 4, 1, false],
    ])
  })

  it("names seasons from July", () => {
    expect(seasonOf("2027-06-30")).toBe(2026)
    expect(seasonOf("2027-07-01")).toBe(2027)
    expect(seasonLabel(2026)).toBe("2026–27")
  })

  it("lists the matches he played in, newest first, against the other side", () => {
    const fx = (id: string, date: string) =>
      ({ id, date, home: "TUR", away: id === "a" ? "ITA" : "ESP", compId: "friendly" }) as Fixture
    const line = (playerId: string, minutes: number) => ({
      playerId,
      side: "home" as const,
      pos: "ST" as const,
      started: true,
      minutes,
      goals: 1,
      assists: 0,
      shots: 2,
      onTarget: 1,
      saves: 0,
      yellow: 0,
      red: 0,
      injured: false,
      rating: 7.2,
    })
    const report = (lines: ReturnType<typeof line>[]) => ({ lines }) as unknown as MatchReport
    const log = matchLog(
      "p1",
      { a: fx("a", "2027-03-25"), b: fx("b", "2027-06-10"), c: fx("c", "2027-09-01") },
      { a: report([line("p1", 90)]), b: report([line("p1", 30)]), c: report([line("p1", 0)]) }
    )
    expect(log.map((e) => [e.fixtureId, e.opp, e.minutes])).toEqual([
      ["b", "ESP", 30],
      ["a", "ITA", 90],
    ])
  })
})
