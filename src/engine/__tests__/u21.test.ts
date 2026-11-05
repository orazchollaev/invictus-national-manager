import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import type { World } from "../world/world"
import { playMatch } from "../match/engine"
import { ageOn } from "../players/ability"
import { developmentMinutes, ensureU21, U21_TUNING } from "../world/u21"

function newWorld(nationId: string, seed = 7) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

/** Play on as the AI would until `last`, the user's matches included. */
function playUntil(w: World, last: string) {
  for (let g = 0; g < 2000 && w.state.date < last; g++) {
    const i = w.advance(1)
    if (w.settle(i)) continue
    if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
    else if (i.kind === "match") {
      const f = w.state.fixtures[i.fixtureId]
      w.applyReport(f, playMatch(w.matchSetup(f, w.aiSheet(f.home, f), w.aiSheet(f.away, f))), true)
    }
  }
}

describe("the under-21s", () => {
  it("have their own coach and two friendlies booked for the first window", () => {
    const w = newWorld("TUR")
    const u = w.state.u21!
    expect(u.nationId).toBe("TUR")
    expect(u.coach.last).toBeTruthy()
    const first = u.matches.filter((m) => m.window === "2026-09-21")
    expect(first).toHaveLength(U21_TUNING.perWindow)
    expect(new Set(first.map((m) => m.opp)).size).toBe(first.length)
    expect(first.every((m) => m.opp !== "TUR")).toBe(true)
  })

  it("play their friendlies with youngsters left out of the senior squad", () => {
    const w = newWorld("TUR")
    playUntil(w, "2026-10-10")
    const played = w.state.u21!.matches.filter((m) => m.window === "2026-09-21" && m.result)
    expect(played.length).toBeGreaterThan(0)
    const senior = new Set(w.state.nations.TUR.squad)
    for (const m of played) {
      expect(m.lines!.length).toBeGreaterThanOrEqual(11)
      for (const l of m.lines!) {
        const p = w.state.players[l.playerId]
        expect(p.nationId).toBe("TUR")
        expect(ageOn(p.born, m.date)).toBeLessThanOrEqual(U21_TUNING.maxAge)
        expect(senior.has(p.id)).toBe(false)
        expect(p.u21Caps).toBeGreaterThan(0)
      }
      const goals = m.lines!.reduce((a, l) => a + l.goals, 0)
      expect(goals).toBeLessThanOrEqual(m.result!.gf)
      expect(m.oppScorers).toHaveLength(m.result!.ga)
    }
    expect(w.state.news.some((n) => n.link === "/u21")).toBe(true)
  })

  it("count half as much as senior football for development", () => {
    const w = newWorld("TUR")
    const p = w.pool("TUR")[0]
    p.intlMin = 100
    p.u21Min = 180
    expect(developmentMinutes(p)).toBe(100 + 180 * U21_TUNING.devShare)
  })

  it("follow the manager to a new job, and go when he is out of work", () => {
    const w = newWorld("TUR")
    w.state.career.nationId = "GER"
    const u = ensureU21(w)!
    expect(u.nationId).toBe("GER")
    expect(u.matches).toHaveLength(0)
    w.state.career.nationId = null
    expect(ensureU21(w)).toBeNull()
    expect(w.state.u21).toBeNull()
  })
})
