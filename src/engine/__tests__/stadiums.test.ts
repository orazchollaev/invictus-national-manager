import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { makeOffers } from "../career/career"
import { openJob } from "../career/coaches"
import { sixMatchRounds } from "../competition/draw"
import { pickHosts } from "../competition/defs/helpers"
import { makeRng } from "../rng"
import {
  completeProjects,
  hostCheck,
  hostRequirement,
  prepareToHost,
  stadiumLevel,
  targetShowpiece,
  venueOf,
  withProjects,
  yearlyInvestment,
} from "../world/stadiums"
import type { NationState } from "../world/types"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId: string | null = "TUR", seed = 9) {
  const w = createWorld(
    {
      seed,
      start: "2026-09-01",
      managerName: "S",
      nationality: "TUR",
      nationId: nationId ?? "TUR",
    },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  if (!nationId) w.state.career.nationId = null
  return w
}

describe("stadiums at the start", () => {
  const w = newWorld()

  it("gives every nation at least one ground in a real city", () => {
    for (const n of Object.values(w.state.nations)) {
      expect(n.stadiums?.length, n.id).toBeGreaterThan(0)
      for (const s of n.stadiums!) {
        expect(s.city, n.id).toBeTruthy()
        expect(s.capacity, `${n.id} ${s.name}`).toBeGreaterThan(1000)
      }
      expect(n.stadium).toBe(stadiumLevel(n.stadiums!))
    }
    expect(w.state.nations.ESP.stadiums!.some((s) => s.name === "Santiago Bernabéu")).toBe(true)
    expect(w.state.nations.TUR.stadiums!.some((s) => s.city === "Istanbul")).toBe(true)
  })

  it("rates the big football nations above the small ones", () => {
    expect(w.state.nations.ENG.stadium).toBe(5)
    expect(w.state.nations.GER.stadium).toBe(5)
    expect(w.state.nations.SMR.stadium).toBe(1)
  })

  it("knows who could host what", () => {
    const eng = hostCheck(w.state.nations.ENG.stadiums!, hostRequirement("continental", "UEFA"))
    expect(eng.ready).toBe(true)
    const lux = hostCheck(w.state.nations.LUX.stadiums!, hostRequirement("continental", "UEFA"))
    expect(lux.ready).toBe(false)
    expect(lux.score).toBeLessThan(0.2)
    // The United States could stage a World Cup on their own.
    const usa = hostCheck(w.state.nations.USA.stadiums!, hostRequirement("world-cup", "CONCACAF"))
    expect(usa.ready).toBe(true)
  })

  it("has the grounds under construction on the start date open on time", () => {
    const k = newWorld(null, 3)
    expect(k.state.nations.KEN.projects!.some((p) => p.name === "Talanta Stadium")).toBe(true)
    while (k.state.date < "2027-03-02") k.nextDay()
    expect(k.state.nations.KEN.stadiums!.some((s) => s.name === "Talanta Stadium")).toBe(true)
    expect(k.state.nations.KEN.projects!.some((p) => p.name === "Talanta Stadium")).toBe(false)
  })
})

describe("investment", () => {
  const fresh = (): NationState => ({
    id: "XYZ",
    points: 1500,
    youthLevel: 50,
    coach: "",
    formation: "4-4-2",
    squad: [],
    squadFor: null,
    results: [],
    pointsHistory: [],
    reputation: 9,
    stadium: 1,
    stadiums: [{ id: "XYZ-s0", name: "National Stadium", city: "Capital", capacity: 12000 }],
    projects: [],
  })

  it("builds towards a showpiece and more grounds as a federation grows", () => {
    const n = fresh()
    const rng = makeRng(5)
    let date = "2027-01-01"
    for (let y = 0; y < 25; y++) {
      yearlyInvestment(n, 4, date, rng)
      date = `${2028 + y}-01-01`
      completeProjects(n, date)
    }
    const biggest = Math.max(...n.stadiums!.map((s) => s.capacity))
    expect(biggest).toBeGreaterThanOrEqual(targetShowpiece(9) * 0.85)
    expect(n.stadiums!.length).toBeGreaterThan(3)
    expect(n.stadium).toBeGreaterThanOrEqual(4)
  })

  it("never runs more projects than the federation can manage", () => {
    const n = fresh()
    n.reputation = 3
    const rng = makeRng(8)
    for (let y = 0; y < 10; y++) yearlyInvestment(n, 3, `${2027 + y}-01-01`, rng)
    expect(n.projects!.length).toBeLessThanOrEqual(1)
  })

  it("builds what a host still lacks before the tournament starts", () => {
    const n = fresh()
    const req = hostRequirement("continental", "AFC")
    expect(hostCheck(n.stadiums!, req).ready).toBe(false)
    const started = prepareToHost(
      [n],
      req,
      "2027-01-01",
      "2031-09-01",
      makeRng(2),
      "asian-cup-2031"
    )
    expect(started.length).toBeGreaterThan(0)
    expect(hostCheck(withProjects(n), req).ready).toBe(true)
    for (const p of started) {
      expect(p.done <= "2031-09-01").toBe(true)
      expect(p.forComp).toBe("asian-cup-2031")
    }
    completeProjects(n, "2031-09-01")
    expect(hostCheck(n.stadiums!, req).ready).toBe(true)
  })

  it("plays big matches at the showpiece", () => {
    const grounds = [
      { id: "a", name: "Big", city: "X", capacity: 80000 },
      { id: "b", name: "Mid", city: "Y", capacity: 40000 },
      { id: "c", name: "Small", city: "Z", capacity: 20000 },
    ]
    expect(venueOf(grounds, "wc-2030:knockout:r4t0:1", true)?.name).toBe("Big")
    const used = new Set(
      Array.from({ length: 30 }, (_, i) => venueOf(grounds, `friendly:${i}:X`, false)?.name)
    )
    expect(used.size).toBeGreaterThan(1)
  })
})

describe("hosting", () => {
  it("picks hosts that can stage the tournament, and bids count", () => {
    const w = newWorld(null)
    const ctx = w.ctx()
    const candidates = ctx.ranked((t) => ctx.confedOf(t) === "UEFA")
    let won = 0
    let wonWithBid = 0
    for (let i = 0; i < 40; i++) {
      const [host] = pickHosts(ctx, `test-${i}`, candidates, 1, "continental")
      expect(ctx.readiness([host], "continental")).toBeGreaterThanOrEqual(0.5)
      if (host === "TUR") won++
    }
    w.state.career.nationId = "TUR"
    w.state.career.bids = ["continental"]
    const bidding = w.ctx()
    for (let i = 0; i < 40; i++) {
      const [host] = pickHosts(bidding, `test-${i}`, candidates, 1, "continental")
      if (host === "TUR") wonWithBid++
    }
    expect(wonWithBid).toBeGreaterThan(won)
  })

  it("adds co-hosts when one nation's grounds fall short", () => {
    const w = newWorld(null)
    const ctx = w.ctx()
    const candidates = ctx.ranked((t) => ctx.confedOf(t) === "UEFA")
    for (let i = 0; i < 10; i++) {
      const hosts = pickHosts(ctx, `wc-test-${i}`, candidates, 1, "world-cup")
      const alone = ctx.readiness([hosts[0]], "world-cup")
      // Ready together, or as many co-hosts as a World Cup allows.
      expect(ctx.readiness(hosts, "world-cup") === 1 || hosts.length === 3).toBe(true)
      if (alone < 1) expect(hosts.length).toBeGreaterThan(1)
      else expect(hosts).toHaveLength(1)
    }
  })

  it("stops the calendar to tell the user his nation will host", () => {
    const w = newWorld("ESP")
    expect(w.state.pendingHosting).toBeTruthy()
    const i = w.advance(5)
    expect(i.kind).toBe("hosting")
    const date = w.state.date
    expect(w.advance(5).kind).toBe("hosting")
    expect(w.state.date).toBe(date)
    w.clearHosting()
    expect(w.advance(1).kind).not.toBe("hosting")
  })
})

describe("job offers", () => {
  it("stops the calendar the day an offer arrives, even in a job", () => {
    const w = newWorld("TUR")
    w.clearHosting()
    w.state.career.reputation = 100
    // Offers come only from federations without a coach, and not in his first months.
    w.state.career.since = "2025-01-01"
    openJob(w, w.ctx().ranked()[8])
    for (let i = 0; i < 40 && !w.state.career.offers.length; i++) makeOffers(w)
    expect(w.state.career.offers.length).toBeGreaterThan(0)
    const offer = w.state.career.offers[0].nationId
    const i = w.advance(10)
    expect(i).toEqual({ kind: "offer", nationId: w.state.pendingOffer })
    expect(w.state.pendingOffer).toBeTruthy()
    w.clearOffer()
    // The offer still stands after the popup is closed.
    expect(w.state.career.offers.some((o) => o.nationId === offer)).toBe(true)
    expect(w.advance(1).kind).not.toBe("offer")
  })
})

describe("six-match groups", () => {
  for (const size of [6, 12]) {
    it(`gives each of ${size} teams six opponents, three at home, one match a round`, () => {
      const teams = Array.from({ length: size }, (_, i) => `T${i}`)
      const rounds = sixMatchRounds(teams)!
      expect(rounds).toHaveLength(6)
      for (const r of rounds) {
        const playing = r.flat()
        expect(new Set(playing).size).toBe(size)
      }
      for (const t of teams) {
        const games = rounds.flat().filter(([h, a]) => h === t || a === t)
        expect(games).toHaveLength(6)
        expect(games.filter(([h]) => h === t)).toHaveLength(3)
        // Two opponents from every pot, the player's own included.
        const potOf = (x: string) => Math.floor(teams.indexOf(x) / (size / 3))
        const opponents = games.map(([h, a]) => (h === t ? a : h))
        for (let p = 0; p < 3; p++) expect(opponents.filter((o) => potOf(o) === p)).toHaveLength(2)
      }
    })
  }

  it("refuses groups that cannot be split into three pots", () => {
    expect(sixMatchRounds(["a", "b", "c", "d", "e", "f", "g"])).toBeNull()
  })
})
