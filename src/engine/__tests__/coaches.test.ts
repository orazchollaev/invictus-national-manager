import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import {
  coachesSeason,
  coachOf,
  fillVacancies,
  maybeFormerPlayer,
  USER_COACH,
  vacate,
} from "../career/coaches"
import { makeOffers } from "../career/career"
import { addDays } from "../calendar/dates"

function newWorld(nationId: string | null, seed = 7) {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test Manager", nationality: "TUR", nationId },
    statics,
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

describe("coaches", () => {
  it("gives every nation a coach of its own, the user's nation the user", () => {
    const w = newWorld("TUR")
    const all = Object.values(w.state.nations)
    expect(w.state.nations.TUR.coachId).toBe(USER_COACH)
    expect(w.state.nations.TUR.coach).toBe("Test Manager")
    const filled = all.filter((n) => n.coachId && n.coachId !== USER_COACH)
    // A few jobs are still open after the World Cup; the rest have a person in them.
    expect(filled.length).toBeGreaterThan(all.length * 0.85)
    for (const n of filled) {
      const c = coachOf(w, n.id)!
      expect(c.nationId).toBe(n.id)
      expect(n.coach).toBe(`${c.first} ${c.last}`)
    }
    // And a market of coaches out of work.
    expect(Object.values(w.state.coaches!).filter((c) => !c.nationId).length).toBeGreaterThan(30)
  })

  it("is the same world for the same seed", () => {
    const a = newWorld("TUR", 3)
    const b = newWorld("TUR", 3)
    expect(a.state.nations.ESP.coach).toBe(b.state.nations.ESP.coach)
    expect(Object.keys(a.state.coaches!).length).toBe(Object.keys(b.state.coaches!).length)
  })

  it("leaves a sacked coach's job open for weeks, then fills it", () => {
    const w = newWorld("TUR")
    const before = coachOf(w, "ESP")!
    vacate(w, "ESP", "sacked")
    expect(w.state.nations.ESP.coachId).toBeNull()
    expect(before.nationId).toBeNull()
    expect(before.history.at(-1)?.left).toBe("sacked")
    fillVacancies(w)
    expect(w.state.nations.ESP.coachId).toBeNull()
    w.state.date = addDays(w.state.date, 45)
    fillVacancies(w)
    const after = coachOf(w, "ESP")
    expect(after).toBeTruthy()
    expect(after!.id).not.toBe(before.id)
  })

  it("only offers the user jobs that are vacant", () => {
    const w = newWorld(null)
    // A new game out of work opens a few jobs in his reach.
    expect(w.state.career.offers.length).toBeGreaterThan(0)
    for (const o of w.state.career.offers) expect(w.state.nations[o.nationId].coachId).toBeNull()
    w.state.career.offers = []
    for (const n of Object.values(w.state.nations)) if (n.coachId === null) n.coachId = "c1"
    makeOffers(w, true)
    expect(w.state.career.offers).toHaveLength(0)
  })

  it("holds a vacancy while the user thinks about its offer", () => {
    const w = newWorld(null)
    const offer = w.state.career.offers[0].nationId
    w.state.date = addDays(w.state.date, 20)
    fillVacancies(w)
    expect(w.state.nations[offer].coachId).toBeNull()
  })

  it("retires old coaches, opening their jobs", () => {
    const w = newWorld("TUR")
    const c = coachOf(w, "GER")!
    c.born = "1950-01-01"
    coachesSeason(w)
    expect(c.retired).toBe(w.state.date)
    expect(w.state.nations.GER.coachId).toBeNull()
  })

  it("brings some retired internationals back as coaches, with their face", () => {
    const w = newWorld("TUR")
    const players = Object.values(w.state.players)
      .filter((p) => p.caps >= 0)
      .slice(0, 400)
    let made = 0
    for (const p of players) {
      const before = w.state.nextCoachId
      maybeFormerPlayer(w, { ...p, caps: 60, ca: 75, pers: { professionalism: 20 } })
      if (w.state.nextCoachId !== before) {
        made++
        const c = w.state.coaches![`c${before}`]
        expect(c.face).toBe(p.id)
        expect(c.player?.caps).toBe(60)
        expect(c.available! > w.state.date).toBe(true)
      }
    }
    expect(made).toBeGreaterThan(20)
    expect(made).toBeLessThan(400)
  })

  it("sacks and replaces coaches as a season is played", { timeout: 300000 }, () => {
    const w = newWorld("TUR")
    w.state.career.nationId = null
    w.state.nations.TUR.coachId = null
    const start = new Set(Object.values(w.state.nations).map((n) => `${n.id}:${n.coachId ?? ""}`))
    const until = "2027-07-02"
    while (w.state.date < until) w.nextDay()
    const changed = Object.values(w.state.nations).filter(
      (n) => !start.has(`${n.id}:${n.coachId ?? ""}`)
    )
    expect(changed.length).toBeGreaterThan(10)
    const sacked = Object.values(w.state.coaches!).filter((c) =>
      c.history.some((h) => h.left === "sacked")
    )
    expect(sacked.length).toBeGreaterThan(3)
    // Nobody holds two jobs.
    const holders = Object.values(w.state.nations)
      .map((n) => n.coachId)
      .filter((id) => id && id !== USER_COACH)
    expect(new Set(holders).size).toBe(holders.length)
  })
})
