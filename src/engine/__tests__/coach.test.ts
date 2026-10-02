import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { aiStyle, aiTeamSheet, pickRoles, pickXI } from "../ai/squad"
import { FORMATIONS } from "../match/formations"
import { ROLES, suggestedRole, validRole } from "../match/roles"
import { archetypeOf } from "../players/archetypes"

function newWorld() {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  return createWorld(
    { seed: 1, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
    statics,
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

describe("the AI coach", () => {
  const w = newWorld()
  const squad = w.pool("BRA")

  it("asks each slot for a role that suits the player in it", () => {
    const sheet = aiTeamSheet("BRA", squad, "2026-09-24")
    const byId = new Map(squad.map((p) => [p.id, p]))
    let roles = 0
    for (const s of sheet.xi) {
      if (!s.role) continue
      roles++
      expect(validRole(s.role, s.pos)).toBe(true)
      expect(ROLES[s.role].suits).toContain(archetypeOf(byId.get(s.playerId)!))
    }
    // A real squad has players whose style fits somewhere in the eleven.
    expect(roles).toBeGreaterThan(3)
  })

  it("leaves a slot plain when no role suits the player", () => {
    const xi = pickXI(squad, "4-2-3-1", "2026-09-24")
    const named = pickRoles(squad, xi)
    named.forEach((s, i) => {
      const p = squad.find((x) => x.id === s.playerId)!
      expect(s.role).toBe(suggestedRole(archetypeOf(p), xi[i].pos))
    })
  })

  it("names the same sheet twice", () => {
    expect(aiTeamSheet("BRA", squad, "2026-09-24")).toEqual(aiTeamSheet("BRA", squad, "2026-09-24"))
  })

  it("sits the weak deep and counters, and pushes the strong up", () => {
    for (const id of ["BRA", "TUR", "FRA", "ESP", "GER", "SUI", "JPN", "MAR"]) {
      const weak = aiStyle(id, -2)
      expect(weak.line).toBe(0)
      expect(weak.counter).toBe(true)
      const strong = aiStyle(id, 1)
      expect(strong.line).toBe(2)
      expect(strong.counter).toBeFalsy()
    }
  })

  it("gives a coach the same habit every time, and different coaches different ones", () => {
    const ids = Array.from({ length: 60 }, (_, i) => `N${i}`)
    const habits = new Set(ids.map((id) => JSON.stringify(aiStyle(id, 0))))
    expect(habits.size).toBeGreaterThan(2)
    for (const id of ids) expect(aiStyle(id, 0)).toEqual(aiStyle(id, 0))
  })

  it("lets a user's own tactics override the coach's habit", () => {
    const sheet = aiTeamSheet("BRA", squad, "2026-09-24", { line: 0, width: 0, counter: true })
    expect(sheet.tactics).toMatchObject({ line: 0, width: 0, counter: true })
  })

  it("fills the eleven the formation asks for", () => {
    const sheet = aiTeamSheet("BRA", squad, "2026-09-24")
    expect(sheet.xi.map((s) => s.pos)).toEqual(FORMATIONS[sheet.tactics.formation])
  })
})

describe("the user's sheet", () => {
  it("keeps the roles he chose and gives a stand-in the role that suits him", () => {
    const w = newWorld()
    const me = "TUR"
    const squad = w.pool(me)
    w.setSquad(
      me,
      "test",
      squad.slice(0, 26).map((p) => p.id)
    )
    const sheet = aiTeamSheet(
      me,
      w.state.nations[me].squad.map((id) => w.state.players[id]),
      w.state.date
    )
    const st = sheet.xi.findIndex((s) => s.pos === "ST")
    sheet.xi[st] = { ...sheet.xi[st], role: "target-man" }
    w.state.userTeam = {
      tactics: { ...sheet.tactics, line: 2, counter: true },
      xi: sheet.xi,
      bench: sheet.bench,
    }
    const fixture = { id: "x", date: w.state.date } as never
    const out = w.userSheet(fixture)
    expect(out.xi[st].role).toBe("target-man")
    expect(out.tactics).toMatchObject({ line: 2, counter: true })

    // An unavailable player's slot is refilled with someone else, and a role that suits him.
    const gone = out.xi[st].playerId
    w.state.players[gone].injury = { until: "2027-01-01", label: "Knock" }
    const again = w.userSheet(fixture)
    expect(again.xi[st].playerId).not.toBe(gone)
    const stand = w.state.players[again.xi[st].playerId]
    expect(again.xi[st].role).toBe(suggestedRole(archetypeOf(stand), again.xi[st].pos))
  })
})
