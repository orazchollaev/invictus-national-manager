import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { isPlaceholder } from "../competition/placeholders"
import { leagueRanking } from "../competition/defs/nationsLeague"
import { competitionDef } from "../competition/defs"

/**
 * Finals drawn before the last play-offs: the places still open are drawn as
 * placeholders and filled by the play-off winners — never by teams from the ranking.
 */
describe("play-off places", { timeout: 600000 }, () => {
  const w = createWorld(
    { seed: 31, start: "2026-09-01", managerName: "P", nationality: "TUR", nationId: "TUR" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  w.state.career.nationId = null
  const until = (date: string) => {
    while (w.state.date < date) w.nextDay()
  }
  const teamsOf = (id: string) => w.state.competitions[id].stages[0].groups!.flatMap((g) => g.teams)

  it("draws Euro 2028 with placeholders for the March play-off winners", () => {
    until("2027-12-10")
    const teams = teamsOf("euro-2028")
    expect(teams).toHaveLength(24)
    expect(teams.filter(isPlaceholder)).toHaveLength(2)
  })

  it("builds the Euro play-off paths from Nations League leagues", () => {
    until("2028-03-01")
    const q = w.state.competitions["euroq-2028"]
    const ties = q.stages.find((s) => s.key === "playoff")!.rounds![0].ties
    const nl = leagueRanking(w.state.competitions["unl-2026"], w.ctx())
    const letterOf = (t: string) => nl.find((x) => x.team === t)?.letter
    // Path A's semi-finals are League A teams wherever League A has enough left.
    const pathA = [ties[0].home, ties[0].away, ties[1].home, ties[1].away] as string[]
    expect(pathA.filter((t) => letterOf(t) === "A").length).toBeGreaterThanOrEqual(2)
  })

  it("fills the Euro placeholders with the play-off winners", () => {
    until("2028-04-15")
    const teams = teamsOf("euro-2028")
    expect(teams.some(isPlaceholder)).toBe(false)
    for (const t of w.state.competitions["euroq-2028"].outcome.qualified!)
      expect(teams).toContain(t)
    const fixtures = Object.values(w.state.fixtures).filter((f) => f.compId === "euro-2028")
    for (const f of fixtures) expect(isPlaceholder(f.home) || isPlaceholder(f.away)).toBe(false)
  })

  it("plays Asia's five rounds, and Asian Cup qualifying for the rest", () => {
    until("2029-12-01")
    const q = w.state.competitions["wcq-afc-2030"]
    const stage = (k: string) => q.stages.find((s) => s.key === k)!
    expect(q.status).toBe("done")
    expect(stage("r1").rounds![0].ties.filter((t) => t.fixtures.length === 2)).toHaveLength(10)
    expect(stage("r2").groups!.map((g) => g.teams.length)).toEqual(Array(9).fill(4))
    expect(stage("r3").groups!.map((g) => g.teams.length)).toEqual([6, 6, 6])
    expect(stage("r4").groups!.map((g) => g.teams.length)).toEqual([3, 3])
    expect(stage("r5").rounds![0].ties).toHaveLength(1)
    expect(q.outcome.qualified).toHaveLength(8)
    expect(q.outcome.interconf).toHaveLength(1)

    // Everyone the second round left behind plays Asian Cup qualifying.
    const acq = w.state.competitions["asian-cupq-2031"]
    expect(acq.status).toBe("active")
    const third = acq.stages.find((s) => s.key === "groups")!.groups!
    const inThird = third.flatMap((g) => g.teams)
    for (const g of stage("r2").groups!) {
      const table = g.teams
      expect(table.filter((t) => inThird.includes(t))).toHaveLength(2)
    }
    expect(third).toHaveLength(6)
  })

  it("draws the 2030 World Cup with qualifiers and placeholders only", () => {
    until("2029-12-20")
    const teams = teamsOf("wc-2030")
    expect(teams).toHaveLength(48)
    expect(teams.filter(isPlaceholder).length).toBeGreaterThanOrEqual(2)
    // Everyone drawn has earned a place (or is a placeholder): nobody from the ranking.
    const earned = new Set<string>(w.state.competitions["wc-2030"].hosts)
    const ctx = w.ctx()
    for (const id of ["uefa", "caf", "afc", "concacaf", "conmebol", "ofc", "ic"]) {
      const q = w.state.competitions[`wcq-${id}-2030`]
      for (const t of competitionDef(q.defId).provisional?.(q, ctx) ?? q.outcome.qualified ?? [])
        earned.add(t)
    }
    for (const t of teams) expect(earned.has(t), t).toBe(true)
    // The six hosts head groups A to F; Uruguay's centenary match opens alone.
    const groups = w.state.competitions["wc-2030"].stages[0].groups!
    expect(groups.slice(0, 6).map((g) => g.teams[0])).toEqual([
      "URU",
      "ARG",
      "PAR",
      "ESP",
      "POR",
      "MAR",
    ])
    const fixtures = groups.flatMap((g) => g.fixtures).map((id) => w.state.fixtures[id])
    const opener = fixtures.filter((f) => f.date === "2030-06-11")
    expect(opener).toHaveLength(1)
    expect(opener[0].home).toBe("URU")
  })

  it("fills the Asian Cup 2031 from the second round and Asian Cup qualifying", () => {
    until("2030-03-31")
    const acq = w.state.competitions["asian-cupq-2031"]
    expect(acq.status).toBe("done")
    expect(acq.outcome.qualified).toHaveLength(6)
  })

  it("lets a Nations League group winner into the UEFA play-offs", () => {
    const q = w.state.competitions["wcq-uefa-2030"]
    const ties = q.stages.find((s) => s.key === "playoff")!.rounds![0].ties
    const inPlayoffs = ties.flatMap((t) => [t.home, t.away])
    const nl = leagueRanking(w.state.competitions["unl-2028"], w.ctx())
    const nlWinners = nl.filter((x) => x.pos === 0).map((x) => x.team)
    expect(inPlayoffs.some((t) => t && nlWinners.includes(t))).toBe(true)
  })

  it("puts the play-off winners into the World Cup in March", () => {
    until("2030-04-10")
    const teams = teamsOf("wc-2030")
    expect(teams.some(isPlaceholder)).toBe(false)
    for (const id of ["wcq-uefa-2030", "wcq-ic-2030"]) {
      for (const t of w.state.competitions[id].outcome.qualified!) expect(teams).toContain(t)
    }
    expect(new Set(teams).size).toBe(48)
  })
})
