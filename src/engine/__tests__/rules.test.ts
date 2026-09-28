import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import {
  baselineReputation,
  homeBoost,
  reputationAfter,
  yearlyFederation,
} from "../world/federation"
import { acceptOffer, afterUserResult, makeOffers } from "../career/career"
import { commentaryLine, clock } from "../match/commentary"
import type { MatchEventKind } from "../match/types"
import { addDays } from "../calendar/dates"
import type { CompetitionInstance } from "../competition/types"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId = "TUR", seed = 21) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

/** Let the AI run the user's side too, so the calendar just flows. */
function hands_off(w: ReturnType<typeof newWorld>) {
  w.state.career.nationId = null
}

describe("suspensions and injuries", () => {
  it("serves a suspension even when the player is not called up", () => {
    const w = newWorld()
    hands_off(w)
    const outcast = w.pool("TUR").sort((a, b) => a.ca - b.ca)[0]
    outcast.banned = 1
    const firstTurkeyMatch = () => w.fixturesOf("TUR").find((f) => f.result)
    while (!firstTurkeyMatch() && w.state.date < "2026-12-31") w.nextDay()
    expect(firstTurkeyMatch()).toBeDefined()
    expect(w.state.nations.TUR.squad).not.toContain(outcast.id)
    expect(outcast.banned).toBe(0)
  })

  it("lets injured players recover once their date has passed", () => {
    const w = newWorld()
    hands_off(w)
    const p = w.pool("TUR")[0]
    p.injury = { until: addDays(w.state.date, 10), label: "Knock" }
    for (let i = 0; i < 20; i++) w.nextDay()
    expect(p.injury === null || p.injury.until > "2026-09-11").toBe(true)
  })

  it("keeps suspended and injured players out of AI elevens", () => {
    const w = newWorld()
    hands_off(w)
    while (!w.fixturesOf("TUR").some((f) => f.result)) w.nextDay()
    const next = w.fixturesOf("TUR").find((f) => !f.result)!
    const squad = w.state.nations.TUR.squad.map((id) => w.player(id))
    squad[0].banned = 1
    squad[1].injury = { until: "2099-01-01", label: "Knock" }
    const sheet = w.aiSheet("TUR", next)
    const ids = sheet.xi.map((s) => s.playerId)
    expect(ids).not.toContain(squad[0].id)
    expect(ids).not.toContain(squad[1].id)
  })
})

describe("world events", () => {
  it("announces tournament hosts in the news", () => {
    const w = newWorld()
    const titles = w.state.news.map((n) => n.title)
    expect(titles.some((t) => t.includes("to host the FIFA World Cup 2030"))).toBe(true)
    expect(titles.some((t) => t.includes("host the UEFA Euro 2028"))).toBe(true)
  })

  it("stops for the user's own draws, and only once each", () => {
    const w = newWorld("JPN")
    expect(w.state.pendingDraw ?? null).toBeNull()
    const seen: string[] = []
    while (w.state.date < "2028-01-01") {
      const i = w.advance(40)
      if (i.kind === "offer") w.clearOffer()
      if (i.kind === "hosting") w.clearHosting()
      if (i.kind === "draw") {
        seen.push(`${i.compId}:${i.stageKey}`)
        w.clearDraw()
      } else if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
      else if (i.kind === "match") {
        w.state.career.nationId = null
        break
      }
    }
    expect(new Set(seen).size).toBe(seen.length)
  })

  it("arranges friendlies for the first window", () => {
    const w = newWorld()
    const friendlies = Object.values(w.state.fixtures).filter((f) => f.compId === "friendly")
    expect(friendlies.length).toBeGreaterThan(40)
    for (const f of friendlies) expect(f.date >= "2026-09-21" && f.date <= "2026-10-06").toBe(true)
  })

  it("never books a nation twice on one day", () => {
    const w = newWorld()
    hands_off(w)
    for (let i = 0; i < 400; i++) w.nextDay()
    const seen = new Set<string>()
    for (const f of Object.values(w.state.fixtures)) {
      for (const n of [f.home, f.away]) {
        const key = `${n}|${f.date}`
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }
    }
  })
})

describe("federations", () => {
  it("rates federations from their ranking points", () => {
    expect(baselineReputation(1900)).toBeGreaterThan(baselineReputation(1300))
    expect(baselineReputation(700)).toBe(1)
    expect(baselineReputation(2200)).toBe(10)
    expect(homeBoost(5)).toBeGreaterThan(homeBoost(1))
  })

  it("rewards trophies and qualification", () => {
    const w = newWorld()
    const before = w.state.nations.MAR.reputation
    const inst = {
      kind: "world-cup",
      defId: "wc",
      outcome: { winner: "MAR", runnerUp: "ESP" },
    } as CompetitionInstance
    reputationAfter(inst, w.state.nations)
    expect(w.state.nations.MAR.reputation).toBeGreaterThan(before + 1)
  })

  it("lifts academies as reputation grows, within bounds", () => {
    const w = newWorld()
    const n = w.state.nations.CPV
    const def = w.def("CPV")
    n.reputation = 10
    n.points = 1900
    for (let y = 0; y < 30; y++) yearlyFederation(n, def)
    expect(n.youthLevel).toBeLessThanOrEqual(def.youthLevel + 6)
    expect(n.youthLevel).toBeGreaterThan(def.youthLevel)
  })
})

describe("career", () => {
  it("sets objectives for the user's nation", () => {
    const w = newWorld("TUR")
    expect(w.state.career.objectives.some((o) => o.compInstance === "unl-2026")).toBe(true)
    expect(w.state.career.reputation).toBeGreaterThan(50)
  })

  it("gives Asian nations separate World Cup and Asian Cup objectives", () => {
    const w = newWorld("KOR")
    while (w.state.date < "2027-09-01") {
      const i = w.advance(60)
      if (i.kind === "offer") w.clearOffer()
      if (i.kind === "hosting") w.clearHosting()
      if (i.kind === "draw") w.clearDraw()
      else if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
      else if (i.kind === "match") {
        w.state.career.nationId = "KOR"
        w.state.career.confidence = 100
        const f = w.state.fixtures[i.fixtureId]
        // Pretend it was a draw; objectives are what this test is about.
        f.result = { h: 1, a: 1 }
      }
    }
    const texts = w.state.career.objectives.map((o) => o.text)
    expect(texts).toContain("Qualify for the FIFA World Cup 2030")
    expect(texts).toContain("Qualify for the AFC Asian Cup 2031")
  })

  it("moves confidence with results against expectation", () => {
    const w = newWorld("SMR")
    const f = {
      id: "x",
      compId: "friendly",
      stage: "",
      label: "",
      date: w.state.date,
      home: "SMR",
      away: "ESP",
      atHome: true,
      importance: "qualifier" as const,
      result: { h: 1, a: 0 },
    }
    const before = w.state.career.confidence
    afterUserResult(w, f)
    expect(w.state.career.confidence).toBeGreaterThan(before)
  })

  it("makes and accepts job offers", () => {
    const w = newWorld("TUR")
    w.state.career.nationId = null
    makeOffers(w, true)
    const offer = w.state.career.offers[0]
    expect(offer).toBeDefined()
    acceptOffer(w, offer.nationId)
    expect(w.state.career.nationId).toBe(offer.nationId)
    expect(w.nation(offer.nationId).coach).toBe("Test")
  })
})

describe("commentary", () => {
  const names = {
    player: (id?: string) => (id ? `P${id}` : "?"),
    team: (s: "home" | "away") => (s === "home" ? "Home" : "Away"),
  }
  const kinds: MatchEventKind[] = [
    "kickoff",
    "goal",
    "own-goal",
    "pen-goal",
    "pen-saved",
    "shot-saved",
    "shot-wide",
    "woodwork",
    "corner",
    "foul",
    "yellow",
    "red",
    "sub",
    "injury",
    "offside",
    "full-time",
  ]

  it("writes a line for every kind of event, names filled in", () => {
    kinds.forEach((kind, i) => {
      const line = commentaryLine(
        { minute: 10, kind, side: "home", playerId: "1", otherId: "2" },
        i,
        names
      )
      expect(line.length).toBeGreaterThan(3)
      expect(line).not.toMatch(/\{[a-z]+\}/)
    })
  })

  it("formats stoppage time", () => {
    expect(clock({ minute: 45, added: 2 })).toBe("45+2'")
    expect(clock({ minute: 67 })).toBe("67'")
  })
})
