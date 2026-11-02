import { describe, it, expect } from "vitest"
import { buildReport, createMatch, isFinished, step } from "../match/engine"
import { makeTeam } from "./helpers"

describe("sim match", () => {
  it("produces a result when managed (home)", { timeout: 60000 }, () => {
    const home = makeTeam("h", 70)
    const away = makeTeam("a", 70)
    const byId = new Map([...home.players, ...away.players].map((p) => [p.id, p]))
    const m = createMatch({
      id: "test",
      date: "2026-09-01",
      home: home.sheet,
      away: away.sheet,
      player: (id) => byId.get(id)!,
      homeAdvantage: false,
      seed: 42,
      managed: "home",
    })

    let steps = 0
    while (!isFinished(m) && steps++ < 300) {
      step(m)
      m.pendingInjuries = []
    }

    console.log(`Steps: ${steps}, Phase: ${m.phase}, Minute: ${m.minute}`)
    expect(m.phase).toBe("done")
    const r = buildReport(m).result
    console.log(`Score: ${r.home}-${r.away}`)
    expect(m.minute).toBeGreaterThan(85)
    expect(r.home + r.away).toBeGreaterThanOrEqual(0)
  })

  it("advances through half-time properly", { timeout: 30000 }, () => {
    const home = makeTeam("h", 70)
    const away = makeTeam("a", 70)
    const byId = new Map([...home.players, ...away.players].map((p) => [p.id, p]))
    const m = createMatch({
      id: "test2",
      date: "2026-09-01",
      home: home.sheet,
      away: away.sheet,
      player: (id) => byId.get(id)!,
      homeAdvantage: false,
      seed: 99,
      managed: "home",
    })

    const phases: string[] = []
    let steps = 0
    let lastPhase = m.phase
    while (!isFinished(m) && steps++ < 300) {
      step(m)
      m.pendingInjuries = []
      if (m.phase !== lastPhase) {
        phases.push(m.phase)
        lastPhase = m.phase
      }
    }

    console.log("Phase transitions:", phases)
    console.log(`Final: phase=${m.phase}, minute=${m.minute}`)
    expect(phases).toContain("half-time")
    expect(phases).toContain("second-half")
    expect(phases).toContain("done")
    expect(m.phase).toBe("done")
  })
})
