import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { competitionDef } from "../competition/defs"
import { isPlaceholder } from "../competition/placeholders"
import { groupStandings } from "../competition/tables"
import type { CompetitionInstance, Fixture, StageState } from "../competition/types"

/**
 * Plays the world to the summer of 2034 and checks every competition it ran for the
 * mistakes a format can hide: teams drawn twice or lost between rounds, the wrong
 * side advancing, confederations meeting in a World Cup group, long runs of away
 * matches.
 */
describe("tournament integrity", { timeout: 600000 }, () => {
  const w = createWorld(
    { seed: 17, start: "2026-09-01", managerName: "I", nationality: "TUR", nationId: "TUR" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  w.state.career.nationId = null
  while (w.state.date < "2034-08-15") w.nextDay()
  const comps = Object.values(w.state.competitions)
  const fixtures = w.state.fixtures

  const standings = (inst: CompetitionInstance, stage: StageState) => {
    const ctx = w.ctx()
    const rule =
      competitionDef(inst.defId)
        .plan(inst, ctx)
        .find((p) => p.key === stage.key)?.groups?.tiebreak ?? "gd"
    return stage.groups!.map((g) => groupStandings(g, ctx.fixture, rule, ctx.points))
  }

  const teamsOf = (s: StageState) =>
    s.groups
      ? s.groups.flatMap((g) => g.teams)
      : (s.rounds?.[0]?.ties ?? []).flatMap((t) => [t.home, t.away]).filter((t): t is string => !!t)

  it("draws no team twice, and never against itself", () => {
    const problems: string[] = []
    for (const inst of comps)
      for (const s of inst.stages) {
        const teams = teamsOf(s)
        for (const t of teams)
          if (teams.indexOf(t) !== teams.lastIndexOf(t)) problems.push(`${inst.id}/${s.key} ${t}`)
      }
    for (const f of Object.values(fixtures)) if (f.home === f.away) problems.push(f.id)
    expect(problems).toEqual([])
  })

  it("draws groups of even size: they differ by one team at most", () => {
    const problems: string[] = []
    // Nations Leagues have leagues of different group sizes by design.
    for (const inst of comps.filter((c) => c.kind !== "nations-league" && c.status !== "upcoming"))
      for (const s of inst.stages) {
        const sizes = (s.groups ?? []).map((g) => g.teams.length)
        if (sizes.length && Math.max(...sizes) - Math.min(...sizes) > 1)
          problems.push(`${inst.id}/${s.key} ${sizes}`)
      }
    expect(problems).toEqual([])
  })

  it("keeps prelim losers out of the groups that follow", () => {
    const problems: string[] = []
    for (const inst of comps) {
      const prelim = inst.stages.find((s) => s.key === "prelim")
      const groups = inst.stages.find((s) => s.key === "groups")
      if (!prelim?.rounds?.length || !groups?.groups) continue
      const winners = prelim.rounds[0].ties.map((t) => t.winner)
      const inGroups = new Set(teamsOf(groups))
      for (const t of teamsOf(prelim))
        if (inGroups.has(t) !== winners.includes(t)) problems.push(`${inst.id} ${t}`)
    }
    expect(problems).toEqual([])
  })

  it("advances the side that won, on goals or on penalties", () => {
    const problems: string[] = []
    let ties = 0
    for (const inst of comps)
      for (const s of inst.stages)
        for (const t of [
          ...(s.rounds ?? []).flatMap((r) => r.ties),
          ...(s.thirdPlace ? [s.thirdPlace] : []),
        ]) {
          if (!t.home || !t.away || !t.winner) continue
          const played = t.fixtures.map((id) => fixtures[id])
          if (!played.every((f) => f?.result)) continue
          ties++
          const goals = (team: string) =>
            played.reduce((n, f) => n + (f.home === team ? f.result!.h : f.result!.a), 0)
          const last = played[played.length - 1]
          let expected: string | undefined
          if (goals(t.home) !== goals(t.away))
            expected = goals(t.home) > goals(t.away) ? t.home : t.away
          else if (last.result!.pens)
            expected = last.result!.pens[0] > last.result!.pens[1] ? last.home : last.away
          if (!expected || expected !== t.winner) problems.push(`${t.id} ${expected} ${t.winner}`)
        }
    expect(ties).toBeGreaterThan(300)
    expect(problems).toEqual([])
  })

  it("sends the group winners and the best of the rest through to the knockout stage", () => {
    let checked = 0
    for (const inst of comps.filter((c) => c.kind !== "qualifier" && c.status === "done")) {
      const g = inst.stages.find((s) => s.key === "groups")
      const k = inst.stages.find((s) => s.key === "knockout")
      if (!g?.groups || !k?.rounds?.length) continue
      const tables = standings(inst, g)
      const into = new Set(teamsOf(k))
      checked++
      // The winner, or one dead level with it on points, difference and goals: such a
      // tie fell to the ranking on the day of the draw, which has moved on since.
      for (const t of tables) {
        const level = t.filter((r) => r.pts === t[0].pts && r.gd === t[0].gd && r.gf === t[0].gf)
        expect(
          level.some((r) => into.has(r.team)),
          `${inst.id} winner ${t[0].team}`
        ).toBe(true)
      }
      // Of the third-placed teams (or runners-up), those that went on beat those that did not.
      for (const pos of [1, 2]) {
        const row = tables.map((t) => t[pos]).filter(Boolean)
        const through = row.filter((r) => into.has(r.team))
        const out = row.filter((r) => !into.has(r.team))
        for (const a of through)
          for (const b of out)
            expect(
              a.pts - b.pts || a.gd - b.gd || a.gf - b.gf,
              `${inst.id} ${a.team} v ${b.team}`
            ).toBeGreaterThanOrEqual(0)
      }
    }
    expect(checked).toBeGreaterThan(30)
  })

  it("keeps confederations apart in World Cup groups, play-off winners included", () => {
    for (const id of ["wc-2030", "wc-2034"]) {
      const inst = w.state.competitions[id]
      const confed = (t: string) => w.def(t).confed
      for (const g of inst.stages[0].groups!) {
        expect(g.teams.some(isPlaceholder), `${id} ${g.name} placeholder left`).toBe(false)
        const count = new Map<string, number>()
        for (const t of g.teams) count.set(confed(t), (count.get(confed(t)) ?? 0) + 1)
        for (const [c, n] of count)
          expect(n, `${id} ${g.name} ${c}: ${g.teams}`).toBeLessThanOrEqual(c === "UEFA" ? 2 : 1)
      }
    }
  })

  it("never gives a team more than three home or away matches in a row in a group", () => {
    const problems: string[] = []
    for (const inst of comps)
      for (const s of inst.stages) {
        // A tournament on neutral ground has no home or away to balance.
        const plan = competitionDef(inst.defId)
          .plan(inst, w.ctx())
          .find((p) => p.key === s.key)
        if (plan?.groups?.venue === "neutral") continue
        for (const g of s.groups ?? []) {
          const list = g.fixtures.map((id) => fixtures[id]).sort(byDate)
          for (const team of g.teams) {
            let prev = ""
            let run = 0
            for (const f of list) {
              if (f.home !== team && f.away !== team) continue
              const venue = f.home === team ? "H" : "A"
              run = venue === prev ? run + 1 : 1
              prev = venue
              if (run > 3) problems.push(`${inst.id}/${s.key}/${g.name} ${team}`)
            }
          }
        }
      }
    expect(problems).toEqual([])
  })
})

function byDate(a: Fixture, b: Fixture) {
  return a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1
}
