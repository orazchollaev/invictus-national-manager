import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef, Player, Position } from "../types"
import type { CompetitionInstance } from "../competition/types"
import type { MatchReport, PlayerLine } from "../match/types"
import { leadersOf, recordStats } from "../competition/stats"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { makePlayer } from "./helpers"

const inst = { start: "2027-06-01" } as CompetitionInstance

function line(id: string, pos: Position, extra: Partial<PlayerLine> = {}): PlayerLine {
  return {
    playerId: id,
    side: "home",
    pos,
    started: true,
    minutes: 90,
    goals: 0,
    assists: 0,
    shots: 0,
    onTarget: 0,
    saves: 0,
    yellow: 0,
    red: 0,
    injured: false,
    rating: 6.5,
    ...extra,
  }
}

function report(home: number, away: number, lines: PlayerLine[]): MatchReport {
  return {
    result: { home, away, ht: [0, 0] },
    events: [],
    stats: [],
    lines,
  } as unknown as MatchReport
}

describe("competition leaders", () => {
  const players: Record<string, Player> = Object.fromEntries(
    [
      makePlayer("gk", "GK", 120),
      makePlayer("cb", "CB", 120),
      makePlayer("st", "ST", 120),
      makePlayer("kid", "CM", 120, { born: "2008-03-01" }),
    ].map((p) => [p.id, p])
  )

  it("rank scorers, assisters and keepers from the matches played", () => {
    const c = { ...inst } as CompetitionInstance
    recordStats(c, report(2, 0, [line("gk", "GK"), line("st", "ST", { goals: 2, rating: 8 })]))
    recordStats(
      c,
      report(1, 0, [
        line("gk", "GK"),
        line("st", "ST", { goals: 1 }),
        line("cb", "CB", { assists: 1 }),
      ])
    )
    const l = leadersOf(c, players, "2027-06-20")
    expect(l.scorers.map((r) => [r.id, r.goals])).toEqual([["st", 3]])
    expect(l.assisters.map((r) => r.id)).toEqual(["cb"])
    expect(l.keepers[0]).toMatchObject({ id: "gk", clean: 2 })
    expect(l.ratings[0].id).toBe("st")
    expect(l.player?.id).toBe("st")
    // One of each in goal, defence and attack; a 4-3-3 takes what there is.
    expect(l.xi.map((r) => r.pos).sort()).toEqual(["CB", "GK", "ST"])
  })

  it("does not rate a player on a cameo, or give a keeper a clean sheet for it", () => {
    const c = { ...inst } as CompetitionInstance
    recordStats(
      c,
      report(3, 0, [line("st", "ST", { minutes: 90 }), line("gk", "GK", { minutes: 90 })])
    )
    recordStats(
      c,
      report(1, 0, [line("st", "ST"), line("cb", "CB", { minutes: 10, goals: 1, rating: 9.5 })])
    )
    recordStats(c, report(0, 0, [line("st", "ST"), line("gk", "GK", { minutes: 20 })]))
    const l = leadersOf(c, players, "2027-06-20")
    expect(l.ratings.map((r) => r.id)).toEqual(["st"])
    expect(l.scorers.map((r) => r.id)).toEqual(["cb"])
    expect(l.keepers[0].clean).toBe(1)
  })

  it("name the best young player among the regulars", () => {
    const c = { ...inst } as CompetitionInstance
    for (let i = 0; i < 2; i++)
      recordStats(c, report(1, 0, [line("kid", "CM", { rating: 7.4 }), line("st", "ST")]))
    const l = leadersOf(c, players, "2027-06-20")
    expect(l.young.map((r) => r.id)).toEqual(["kid"])
  })
})

describe("competitions in the world", () => {
  const w = createWorld(
    { seed: 3, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )

  it("keep tallies while on and cut the charts when over", { timeout: 120000 }, () => {
    while (w.state.date < "2027-04-01") {
      const i = w.advance(60)
      if (w.settle(i)) continue
      if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
      else if (i.kind === "match") w.state.fixtures[i.fixtureId].result = { h: 1, a: 1 }
    }
    const all = Object.values(w.state.competitions)
    const done = all.filter((c) => c.status === "done" && c.leaders)
    const live = all.filter((c) => c.status !== "done" && c.stats)
    expect(done.length).toBeGreaterThan(0)
    expect(live.length).toBeGreaterThan(0)
    for (const c of done) {
      expect(c.stats).toBeUndefined()
      expect(c.leaders!.scorers.length).toBeGreaterThan(0)
      expect(c.leaders!.xi.length).toBeLessThanOrEqual(11)
    }
    // Tallies match what the fixtures say.
    const c = live[0]
    const goals = Object.values(c.stats!).reduce((n, t) => n + t.g, 0)
    const scored = Object.values(w.state.fixtures)
      .filter((f) => f.compId === c.id && f.result)
      .reduce((n, f) => n + f.result!.h + f.result!.a, 0)
    expect(goals).toBeLessThanOrEqual(scored)
  })
})
