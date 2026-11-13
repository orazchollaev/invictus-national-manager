import { describe, expect, it } from "vitest"
import clubRows from "@/data/clubs.json"
import nations from "@/data/nations.json"
import playerRows from "@/data/players.json"
import { CLUB_FACTS, DERBIES } from "@/data/clubProfiles"
import type { Club, NationDef, Player } from "@/engine/types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "@/engine/world/create"
import { World } from "@/engine/world/world"
import type { Fixture } from "@/engine/competition/types"
import type { MatchReport } from "@/engine/match/types"
import { askForMinutes, clubsAfterMatch } from "../dealings"
import { band, profileOf } from "../profile"
import {
  ASK_COOLDOWN,
  NEUTRAL,
  adjust,
  ask,
  askBlock,
  askChance,
  emptyTies,
  mood,
  refusalChance,
  relOf,
  settle,
  withholds,
} from "../ties"

const clubs = clubsFromRows(clubRows as ClubRow[])
const byId = new Map(clubs.map((c) => [c.id, c]))
const statics = () => ({ nations: nations as NationDef[], clubs })

function newWorld(seed = 9) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "S", nationality: "TUR", nationId: "TUR" },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

describe("club profiles", () => {
  it("describes only clubs that exist, and rivals that exist", () => {
    for (const id of Object.keys(CLUB_FACTS)) expect(byId.has(id), id).toBe(true)
    for (const [a, b] of DERBIES) {
      expect(byId.has(a), a).toBe(true)
      expect(byId.has(b), b).toBe(true)
      expect(a).not.toBe(b)
    }
  })

  it("describes every elite and top-flight club by hand", () => {
    const missing = clubs.filter((c) => c.tier <= 2 && !CLUB_FACTS[c.id]).map((c) => c.id)
    expect(missing).toEqual([])
  })

  it("keeps ratings in range and is the same every time", () => {
    for (const c of clubs) {
      const a = profileOf(c)
      expect(profileOf(c)).toEqual(a)
      expect(a.reputation).toBeGreaterThanOrEqual(1)
      expect(a.reputation).toBeLessThanOrEqual(99)
      expect(a.budget).toBeGreaterThanOrEqual(1)
      expect(a.budget).toBeLessThanOrEqual(99)
      expect(a.academy).toBeGreaterThanOrEqual(1)
      expect(a.academy).toBeLessThanOrEqual(20)
      expect(a.city).toBeTruthy()
      expect(a.colors[0]).toMatch(/^#[0-9a-f]{6}$/)
      expect(a.colors[1]).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it("makes a bigger league mean bigger clubs", () => {
    const mean = (tier: number) => {
      const list = clubs.filter((c) => c.tier === tier).map((c) => profileOf(c).reputation)
      return list.reduce((a, b) => a + b, 0) / list.length
    }
    for (let t = 1; t < 5; t++) expect(mean(t)).toBeGreaterThan(mean(t + 1))
  })

  it("profiles a club a mod added", () => {
    const mod: Club = { id: "xyz-3-0", name: "Ç. Rize", nationId: "TUR", tier: 3 }
    const p = profileOf(mod)
    expect(p.known).toBe(false)
    expect(p.city).toBe("Rize")
  })

  it("names five bands", () => {
    expect([1, 29, 30, 49, 50, 69, 70, 84, 85, 99].map(band)).toEqual([
      1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
    ])
  })
})

describe("goodwill", () => {
  it("starts neutral, is kept in 0–100 and notes why it moved", () => {
    const ties = emptyTies()
    expect(relOf(ties, "a")).toBe(NEUTRAL)
    adjust(ties, "a", 80, "2026-09-01", { k: "clubLog.played" })
    expect(relOf(ties, "a")).toBe(100)
    adjust(ties, "a", -250, "2026-09-02")
    expect(relOf(ties, "a")).toBe(0)
    expect(ties.log.a).toHaveLength(1)
  })

  it("keeps the last dozen notes only", () => {
    const ties = emptyTies()
    for (let i = 0; i < 20; i++) adjust(ties, "a", 1, "2026-09-01", { k: "clubLog.played" })
    expect(ties.log.a).toHaveLength(12)
  })

  it("settles back to neutral and forgets old notes", () => {
    const ties = emptyTies()
    adjust(ties, "a", 40, "2026-09-01", { k: "clubLog.played" })
    let last = relOf(ties, "a")
    for (let m = 0; m < 80; m++) {
      settle(ties, "2026-09-01")
      const now = relOf(ties, "a")
      expect(now).toBeLessThanOrEqual(last)
      last = now
    }
    expect(ties.rel.a).toBeUndefined()
    settle(ties, "2030-01-01")
    expect(ties.log.a).toBeUndefined()
  })

  it("names five moods", () => {
    expect([0, 19, 20, 37, 38, 61, 62, 79, 80, 100].map(mood)).toEqual([
      1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
    ])
  })
})

describe("releasing players for friendlies", () => {
  it("is likelier for a star of a big club than for a reserve of a small one", () => {
    expect(refusalChance("star", 95, 50, false)).toBeGreaterThan(
      refusalChance("star", 30, 50, false)
    )
    expect(refusalChance("star", 80, 50, false)).toBeGreaterThan(
      refusalChance("bench", 80, 50, false)
    )
    expect(refusalChance("reserve", 99, 0, false)).toBe(0)
  })

  it("falls as the club likes the manager more, and at home", () => {
    expect(refusalChance("star", 80, 90, false)).toBeLessThan(refusalChance("star", 80, 50, false))
    expect(refusalChance("star", 80, 10, false)).toBeGreaterThan(
      refusalChance("star", 80, 50, false)
    )
    expect(refusalChance("star", 80, 50, true)).toBeLessThan(refusalChance("star", 80, 50, false))
    expect(refusalChance("star", 99, 0, false)).toBeLessThanOrEqual(0.7)
  })

  it("is one answer for one player and window", () => {
    const w = newWorld()
    const p = w.pool("TUR")[0]
    p.role = "star"
    const first = withholds(7, p, "2027-03-22", 90, 20, false)
    for (let i = 0; i < 5; i++) expect(withholds(7, p, "2027-03-22", 90, 20, false)).toBe(first)
  })

  it("refuses roughly as often as the odds say", () => {
    const w = newWorld()
    const p = { ...w.pool("TUR")[0], role: "star" as const }
    const chance = refusalChance("star", 90, 50, false)
    let n = 0
    const runs = 4000
    for (let i = 0; i < runs; i++)
      if (withholds(i, { ...p, id: `p${i}` }, "2027-03-22", 90, 50, false)) n++
    expect(n / runs).toBeGreaterThan(chance - 0.04)
    expect(n / runs).toBeLessThan(chance + 0.04)
  })

  it("never keeps a player back from a window with an official match", () => {
    const w = newWorld()
    const me = "TUR"
    let checked = 0
    for (let i = 0; i < 400 && checked < 3; i++) {
      const it = w.advance(30)
      if (w.settle(it)) continue
      if (it.kind === "callup" && it.nationId === me) {
        const official = w
          .fixturesOf(me, it.deadline, it.deadline)
          .some((f) => w.state.competitions[f.compId])
        if (official)
          for (const p of w.pool(me))
            expect(w.releaseBlock(p, undefined, it.squadFor)).not.toBe("friendly")
        checked++
        w.aiCallUp(it.nationId, it.squadFor)
      } else if (it.kind === "match") {
        w.state.fixtures[it.fixtureId].result = { h: 1, a: 1 }
      }
    }
    expect(checked).toBeGreaterThan(0)
  })
})

describe("asking for minutes", () => {
  it("cannot be asked of a regular, or twice in a quarter", () => {
    const w = newWorld()
    const p = w.pool("TUR")[0]
    p.role = "star"
    expect(askBlock(p, w.state.clubTies, w.state.date)).toBe("role")
    p.role = "bench"
    expect(askBlock(p, w.state.clubTies, w.state.date)).toBeNull()
    const out = askForMinutes(w, p.id)
    expect(out.status).not.toBe("blocked")
    expect(askBlock(p, w.state.clubTies, w.state.date)).toBe("wait")
    expect(askForMinutes(w, p.id)).toEqual({ status: "blocked", why: "wait" })
    const later = new Date(Date.parse(w.state.date) + (ASK_COOLDOWN + 1) * 86400000)
      .toISOString()
      .slice(0, 10)
    p.role = "bench"
    expect(askBlock(p, w.state.clubTies, later)).not.toBe("wait")
  })

  it("lifts the role by one step when it is agreed, and costs goodwill either way", () => {
    let granted = 0
    let refused = 0
    for (let seed = 1; seed <= 30; seed++) {
      const w = newWorld(seed)
      const p = w.pool("TUR")[0]
      p.role = "bench"
      const before = w.clubRel(p.clubId)
      const out = askForMinutes(w, p.id)
      if (out.status === "granted") {
        granted++
        expect(p.role).toBe("rotation")
      } else {
        refused++
        expect(p.role).toBe("bench")
      }
      expect(w.clubRel(p.clubId)).toBeLessThan(before)
      expect(w.state.clubTies!.log[p.clubId]).toHaveLength(1)
      expect(w.state.news[0].link).toBe(`/club/${p.clubId}`)
    }
    expect(granted).toBeGreaterThan(0)
    expect(refused).toBeGreaterThan(0)
  })

  it("is likelier with a friendly club, and with a lowly one", () => {
    expect(askChance("bench", 60, 90)).toBeGreaterThan(askChance("bench", 60, 50))
    expect(askChance("bench", 60, 10)).toBeLessThan(askChance("bench", 60, 50))
    expect(askChance("bench", 95, 50)).toBeLessThan(askChance("bench", 30, 50))
    expect(askChance("rotation", 60, 50)).toBeGreaterThan(askChance("reserve", 60, 50))
  })

  it("only ever agrees to a step, and never asks of a regular", () => {
    const w = newWorld()
    const p = w.pool("TUR")[0]
    p.role = "reserve"
    for (let i = 0; i < 40; i++) {
      const r = ask(i, p, "2026-09-01", 50, 50)
      if (r.granted) expect(r.role).toBe("bench")
      expect(r.delta).toBeLessThan(0)
    }
  })

  it("will not be asked about another nation's player", () => {
    const w = newWorld()
    const other = w.pool("ESP")[0]
    other.role = "bench"
    expect(askForMinutes(w, other.id).status).toBe("blocked")
  })
})

describe("after a match", () => {
  function setup() {
    const w = newWorld()
    const squad = w.pool("TUR").slice(0, 4)
    const f = {
      id: "t",
      home: "TUR",
      away: "ESP",
      date: w.state.date,
      compId: "friendly",
    } as Fixture
    return { w, squad, f }
  }
  const report = (lines: object[], events: object[] = []) =>
    ({ lines, events }) as unknown as MatchReport

  it("pleases the club of a player who played, a little less in a friendly", () => {
    const { w, squad, f } = setup()
    const [p] = squad
    clubsAfterMatch(w, f, report([{ playerId: p.id, side: "home", minutes: 90 }]))
    expect(w.clubRel(p.clubId)).toBeGreaterThan(NEUTRAL)
    expect(w.clubRel(p.clubId)).toBeLessThan(NEUTRAL + 1)
    const { w: w2, squad: s2, f: f2 } = setup()
    f2.compId = "wcq-uefa"
    clubsAfterMatch(w2, f2, report([{ playerId: s2[0].id, side: "home", minutes: 90 }]))
    expect(w2.clubRel(s2[0].clubId)).toBeGreaterThan(w.clubRel(p.clubId))
  })

  it("ignores a cameo, and the other side", () => {
    const { w, squad, f } = setup()
    clubsAfterMatch(
      w,
      f,
      report([
        { playerId: squad[0].id, side: "home", minutes: 20 },
        { playerId: squad[1].id, side: "away", minutes: 90 },
      ])
    )
    expect(w.state.clubTies!.rel).toEqual({})
  })

  it("holds an injury against the club's goodwill, the worse the longer", () => {
    const { w, squad, f } = setup()
    const [short, long] = [squad[0], squad[1]]
    short.injury = { until: "2026-09-08", label: { k: "injury.knock" } }
    long.injury = { until: "2026-12-01", label: { k: "injury.knock" } }
    clubsAfterMatch(
      w,
      f,
      report(
        [],
        [
          { kind: "injury", side: "home", playerId: short.id },
          { kind: "injury", side: "home", playerId: long.id },
        ]
      )
    )
    if (short.clubId !== long.clubId) {
      expect(w.clubRel(short.clubId)).toBeLessThan(NEUTRAL)
      expect(w.clubRel(long.clubId)).toBeLessThan(w.clubRel(short.clubId))
    } else expect(w.clubRel(short.clubId)).toBeLessThan(NEUTRAL - 3)
  })
})

describe("older saves", () => {
  it("open without any record of club dealings", () => {
    const w = newWorld()
    const state = JSON.parse(JSON.stringify(w.state))
    delete state.clubTies
    const loaded = new World(state, statics())
    expect(loaded.state.clubTies).toEqual(emptyTies())
    const p: Player = loaded.pool("TUR")[0]
    expect(loaded.clubRel(p.clubId)).toBe(NEUTRAL)
    expect(loaded.clubProfile(p.clubId).reputation).toBeGreaterThan(0)
  })
})
