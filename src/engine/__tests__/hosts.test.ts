import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { roundRobin } from "../competition/draw"
import type { World } from "../world/world"

function newWorld(seed = 5) {
  const w = createWorld(
    { seed, start: "2026-09-01", managerName: "H", nationality: "TUR", nationId: "TUR" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  w.state.career.nationId = null
  return w
}

/** Hosts head groups A, B, C… in order, and the first opens the tournament alone. */
function expectHostedDraw(w: World, compId: string) {
  const inst = w.state.competitions[compId]
  const groups = inst.stages[0].groups!
  const present = inst.hosts.filter((h) => groups.some((g) => g.teams.includes(h)))
  expect(present.length).toBeGreaterThan(0)
  present.forEach((h, i) => expect(groups[i].teams[0], `${compId} ${h}`).toBe(h))

  const fixtures = groups.flatMap((g) => g.fixtures).map((id) => w.state.fixtures[id])
  const first = fixtures.reduce((a, b) => (a.date <= b.date ? a : b))
  expect([first.home, first.away]).toContain(present[0])
  expect(fixtures.filter((f) => f.date === first.date)).toHaveLength(1)
}

describe("hosts", () => {
  it("never rests the first team of an odd group in the first round", () => {
    for (const n of [3, 5, 7]) {
      const teams = Array.from({ length: n }, (_, i) => `T${i}`)
      expect(roundRobin(teams, 1)[0].flat()).toContain("T0")
    }
  })

  it("puts the Asian Cup 2027 host in group A, opening alone", () => {
    expectHostedDraw(newWorld(), "asian-cup-2027")
  })

  it(
    "puts the three AFCON 2027 hosts in groups A, B and C, and only a host group's best other team qualifies",
    { timeout: 300000 },
    () => {
      const w = newWorld()
      while (w.state.date < "2027-05-01") w.nextDay()
      expectHostedDraw(w, "afcon-2027")
      const q = w.state.competitions["afconq-2027"]
      expect(q.outcome.qualified).toHaveLength(21)
      for (const h of ["KEN", "TAN", "UGA"]) expect(q.outcome.qualified).not.toContain(h)
    }
  )
})
