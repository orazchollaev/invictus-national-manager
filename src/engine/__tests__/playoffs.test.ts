import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { isPlaceholder } from "../competition/placeholders"
import { leagueRanking } from "../competition/defs/nationsLeague"
import { competitionDef } from "../competition/defs"
import { finishers, standingsOf } from "../competition/runtime"

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

  it("plays Euro 2028 qualifying in twelve groups, hosts apart, and draws placeholders", () => {
    until("2027-12-10")
    const q = w.state.competitions["euroq-2028"]
    const groups = q.stages.find((s) => s.key === "groups")!.groups!
    expect(groups).toHaveLength(12)
    expect(groups.map((g) => g.teams.length).sort()).toEqual([
      ...Array(6).fill(4),
      ...Array(6).fill(5),
    ])
    const hosts = ["ENG", "SCO", "WAL", "IRL"]
    for (const g of groups)
      expect(g.teams.filter((t) => hosts.includes(t)).length).toBeLessThanOrEqual(1)
    // Winners, eight best runners-up and up to two hosts; the rest are placeholders.
    const teams = teamsOf("euro-2028")
    expect(teams).toHaveLength(24)
    const open = teams.filter(isPlaceholder).length
    expect(open).toBeGreaterThanOrEqual(2)
    expect(open).toBeLessThanOrEqual(4)
  })

  it("sends the four worst runners-up and Nations League winners to the Euro play-offs", () => {
    until("2028-03-01")
    const q = w.state.competitions["euroq-2028"]
    const ties = q.stages.find((s) => s.key === "playoff")!.rounds![0].ties
    const inPlayoffs = ties.flatMap((t) => [t.home, t.away])
    const ctx = w.ctx()
    const tables = standingsOf(q, "groups", ctx, "h2h")
    const hosts = w.state.competitions["euro-2028"].hosts
    const worst = finishers(tables, 1)
      .slice(8)
      .map((r) => r.team)
      .filter((t) => !hosts.includes(t))
    for (const t of worst) expect(inPlayoffs).toContain(t)
    const nl = leagueRanking(w.state.competitions["unl-2026"], ctx)
    const nlWinners = nl.filter((x) => x.pos === 0).map((x) => x.team)
    expect(inPlayoffs.some((t) => t && nlWinners.includes(t))).toBe(true)
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

  it("plays Europe's 2030 qualifying as League 1 (Swiss) and League 2", () => {
    const q = w.state.competitions["wcq-uefa-2030"]
    const stage = (k: string) => q.stages.find((s) => s.key === k)!
    const l1 = stage("l1").groups!
    expect(l1.map((g) => g.teams.length)).toEqual([12, 12, 12])
    for (const g of l1)
      for (const t of g.teams) {
        const games = g.fixtures
          .map((id) => w.state.fixtures[id])
          .filter((f) => f.home === t || f.away === t)
        expect(games).toHaveLength(6)
        expect(games.filter((f) => f.home === t)).toHaveLength(3)
      }
    expect(stage("l2").groups!.map((g) => g.teams.length)).toEqual([6, 6, 6])
    // Spain and Portugal play; five two-legged ties include League 2's winners.
    expect(l1.flatMap((g) => g.teams)).toContain("ESP")
    const ties = stage("playoff").rounds![0].ties
    expect(ties).toHaveLength(5)
    expect(ties.every((t) => t.fixtures.length === 2)).toBe(true)
    const inPlayoffs = ties.flatMap((t) => [t.home, t.away])
    const l2Winners = standingsOf(q, "l2", w.ctx()).map((t) => t[0].team)
    for (const t of l2Winners) expect(inPlayoffs).toContain(t)
  })

  it("puts the play-off winners into the World Cup in March", () => {
    until("2030-04-10")
    const teams = teamsOf("wc-2030")
    expect(teams.some(isPlaceholder)).toBe(false)
    for (const id of ["wcq-uefa-2030", "wcq-ic-2030"]) {
      for (const t of w.state.competitions[id].outcome.qualified!) expect(teams).toContain(t)
    }
    const uefa = w.state.competitions["wcq-uefa-2030"].outcome.qualified!
    expect(uefa).toHaveLength(14)
    expect(uefa).not.toContain("ESP")
    expect(new Set(teams).size).toBe(48)
  })
})
