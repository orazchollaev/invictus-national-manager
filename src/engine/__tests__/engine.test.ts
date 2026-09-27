import { describe, expect, it } from "vitest"
import { createMatch, playMatch, step, substitute, buildReport } from "../match/engine"
import type { MatchReport } from "../match/types"
import type { Player } from "../types"
import { makeTeam } from "./helpers"

function setupFor(homeCa: number, awayCa: number, seed: number, extra = {}) {
  const home = makeTeam("h", homeCa)
  const away = makeTeam("a", awayCa)
  const byId = new Map<string, Player>([...home.players, ...away.players].map((p) => [p.id, p]))
  return {
    id: `m${seed}`,
    date: "2026-09-24",
    home: home.sheet,
    away: away.sheet,
    player: (id: string) => byId.get(id)!,
    homeAdvantage: false,
    seed,
    ...extra,
  }
}

function playMany(homeCa: number, awayCa: number, n: number, extra = {}): MatchReport[] {
  return Array.from({ length: n }, (_, i) => playMatch(setupFor(homeCa, awayCa, i + 1, extra)))
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

describe("match engine", () => {
  it("is deterministic for a seed", () => {
    const a = playMatch(setupFor(70, 70, 42))
    const b = playMatch(setupFor(70, 70, 42))
    expect(a).toEqual(b)
  })

  it("plays an even match to realistic totals", () => {
    const reports = playMany(70, 70, 400)
    const goals = mean(reports.map((r) => r.result.home + r.result.away))
    const shots = mean(reports.map((r) => r.stats[0].shots))
    const onTarget = mean(reports.map((r) => r.stats[0].onTarget))
    const corners = mean(reports.map((r) => r.stats[0].corners))
    const fouls = mean(reports.map((r) => r.stats[0].fouls))
    const yellows = mean(reports.map((r) => r.stats[0].yellows))
    const draws = reports.filter((r) => r.result.home === r.result.away).length / reports.length
    expect(goals).toBeGreaterThan(2.2)
    expect(goals).toBeLessThan(3.0)
    expect(shots).toBeGreaterThan(9)
    expect(shots).toBeLessThan(16)
    expect(onTarget).toBeGreaterThan(3)
    expect(onTarget).toBeLessThan(6.5)
    expect(corners).toBeGreaterThan(3)
    expect(corners).toBeLessThan(7)
    expect(fouls).toBeGreaterThan(8)
    expect(fouls).toBeLessThan(15)
    expect(yellows).toBeGreaterThan(1)
    expect(yellows).toBeLessThan(3)
    expect(draws).toBeGreaterThan(0.18)
    expect(draws).toBeLessThan(0.34)
  })

  it("lets a much stronger side win big but not every time", () => {
    const reports = playMany(88, 45, 200)
    const wins = reports.filter((r) => r.result.home > r.result.away).length / reports.length
    const margin = mean(reports.map((r) => r.result.home - r.result.away))
    expect(wins).toBeGreaterThan(0.9)
    expect(margin).toBeGreaterThan(3)
    expect(margin).toBeLessThan(8)
  })

  it("gives a modest edge a modest win rate", () => {
    const reports = playMany(75, 70, 400)
    const wins = reports.filter((r) => r.result.home > r.result.away).length / reports.length
    const losses = reports.filter((r) => r.result.home < r.result.away).length / reports.length
    expect(wins).toBeGreaterThan(0.4)
    expect(wins).toBeLessThan(0.65)
    expect(losses).toBeGreaterThan(0.1)
  })

  it("gives the real home side an edge", () => {
    const neutral = playMany(70, 70, 400)
    const home = playMany(70, 70, 400, { homeAdvantage: true })
    const hw = (rs: MatchReport[]) => rs.filter((r) => r.result.home > r.result.away).length
    expect(hw(home)).toBeGreaterThan(hw(neutral))
  })

  it("always produces a winner in a knockout tie", () => {
    const reports = playMany(70, 70, 150, { knockout: { extraTime: true } })
    for (const r of reports) expect(r.result.winner).toBeDefined()
    expect(reports.some((r) => r.result.pens)).toBe(true)
    expect(reports.some((r) => r.result.ft && !r.result.pens)).toBe(true)
  })

  it("respects the aggregate in a second leg", () => {
    // 3-0 up from the first leg: a 0-1 defeat still goes through without extra time.
    const reports = playMany(70, 70, 60, { knockout: { extraTime: true, aggregate: [3, 0] } })
    for (const r of reports) {
      if (r.result.away - r.result.home < 3) expect(r.result.winner).toBe("home")
    }
  })

  it("keeps the score consistent with goal events", () => {
    for (const r of playMany(72, 68, 100)) {
      const goals = r.events.filter(
        (e) => e.kind === "goal" || e.kind === "pen-goal" || e.kind === "own-goal"
      )
      expect(goals.filter((e) => e.side === "home").length).toBe(r.result.home)
      expect(goals.filter((e) => e.side === "away").length).toBe(r.result.away)
    }
  })

  it("can be stepped and changed by a manager", () => {
    const state = createMatch({ ...setupFor(70, 70, 7), managed: "home" })
    while (state.minute < 60) step(state)
    const ev = substitute(state, "home", "h10", "hb6")
    expect(ev?.kind).toBe("sub")
    expect(state.home.pitch.some((p) => p.id === "hb6")).toBe(true)
    while (state.phase !== "done") step(state)
    const report = buildReport(state)
    expect(report.lines.find((l) => l.playerId === "hb6")?.started).toBe(false)
  })
})
