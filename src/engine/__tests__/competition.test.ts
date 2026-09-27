import { describe, expect, it } from "vitest"
import { bracketOrder, drawGroups, roundRobin, seedBracket } from "../competition/draw"
import { groupStandings, compareAcrossGroups } from "../competition/tables"
import type { Fixture, GroupTable } from "../competition/types"
import { makeRng } from "../rng"

function fixture(id: string, home: string, away: string, h: number, a: number): Fixture {
  return {
    id,
    compId: "t",
    stage: "g",
    label: "",
    date: "2026-01-01",
    home,
    away,
    atHome: true,
    importance: "qualifier",
    result: { h, a },
  }
}

describe("round robin", () => {
  it("pairs every team with every other once per leg", () => {
    const teams = ["A", "B", "C", "D", "E"]
    const rounds = roundRobin(teams, 2)
    expect(rounds).toHaveLength(10)
    const pairs = rounds.flat().map(([h, a]) => `${h}-${a}`)
    for (const x of teams)
      for (const y of teams)
        if (x !== y) expect(pairs.filter((p) => p === `${x}-${y}`)).toHaveLength(1)
    // Nobody plays twice in a round.
    for (const r of rounds) expect(new Set(r.flat()).size).toBe(r.length * 2)
  })

  it("keeps home and away roughly even", () => {
    const rounds = roundRobin(["A", "B", "C", "D"], 1)
    const home = new Map<string, number>()
    for (const [h] of rounds.flat()) home.set(h, (home.get(h) ?? 0) + 1)
    for (const n of home.values()) expect(n).toBeLessThanOrEqual(2)
  })
})

describe("group draw", () => {
  it("puts one team from each pot in every group", () => {
    const ranked = Array.from({ length: 16 }, (_, i) => `T${i}`)
    const groups = drawGroups(ranked, 4, makeRng(1))
    expect(groups.map((g) => g.length)).toEqual([4, 4, 4, 4])
    for (let pot = 0; pot < 4; pot++) {
      const potTeams = new Set(ranked.slice(pot * 4, pot * 4 + 4))
      for (const g of groups) expect(potTeams.has(g[pot])).toBe(true)
    }
  })

  it("keeps confederations apart where it can", () => {
    const ranked = Array.from({ length: 16 }, (_, i) => `T${i}`)
    const family = (t: string) => (Number(t.slice(1)) % 4 === 0 ? "X" : `F${t}`)
    const groups = drawGroups(ranked, 4, makeRng(9), { family, maxPerFamily: () => 1 })
    for (const g of groups) expect(g.filter((t) => family(t) === "X").length).toBeLessThanOrEqual(1)
  })

  it("places hosts first", () => {
    const groups = drawGroups(["H", "A", "B", "C", "D", "E", "F", "G"], 2, makeRng(2), {
      fixed: ["H"],
    })
    expect(groups[0][0]).toBe("H")
  })
})

describe("brackets", () => {
  it("keeps the top two seeds apart until the final", () => {
    expect(bracketOrder(8)).toEqual([0, 7, 3, 4, 1, 6, 2, 5])
    const ties = seedBracket(["1", "2", "3", "4", "5", "6", "7", "8"], () => false)
    expect(ties[0]).toEqual(["1", "8"])
    expect(ties[2][0]).toBe("2")
  })

  it("avoids a first-round rematch from the same group", () => {
    const group: Record<string, string> = { A1: "A", A2: "A", B1: "B", B2: "B" }
    const ties = seedBracket(["A1", "B1", "B2", "A2"], (a, b) => group[a] === group[b])
    for (const [a, b] of ties) expect(group[a]).not.toBe(group[b])
  })
})

describe("standings", () => {
  const group: GroupTable = { name: "A", teams: ["X", "Y", "Z"], fixtures: ["1", "2", "3"] }
  const fixtures: Record<string, Fixture> = {
    "1": fixture("1", "X", "Y", 1, 0),
    "2": fixture("2", "Y", "Z", 5, 0),
    "3": fixture("3", "Z", "X", 1, 0),
  }

  it("orders by points, then goal difference (FIFA)", () => {
    const rows = groupStandings(group, (id) => fixtures[id], "gd")
    expect(rows.map((r) => r.team)).toEqual(["Y", "X", "Z"])
    expect(rows[0]).toMatchObject({ p: 2, w: 1, l: 1, gf: 5, ga: 1, pts: 3 })
  })

  it("orders level teams by their head-to-head first (UEFA)", () => {
    const two: GroupTable = { name: "B", teams: ["P", "Q", "R"], fixtures: ["4", "5", "6", "7"] }
    const fx: Record<string, Fixture> = {
      "4": fixture("4", "P", "Q", 1, 0),
      "5": fixture("5", "Q", "R", 6, 0),
      "6": fixture("6", "R", "P", 0, 0),
      "7": fixture("7", "R", "Q", 0, 0),
    }
    // P and Q both have 4 points; Q has the better goal difference, P won the meeting.
    expect(groupStandings(two, (id) => fx[id], "gd")[0].team).toBe("Q")
    expect(groupStandings(two, (id) => fx[id], "h2h")[0].team).toBe("P")
  })

  it("compares finishers from groups of different sizes per game", () => {
    const a = { team: "a", p: 4, w: 2, d: 0, l: 2, gf: 4, ga: 4, gd: 0, pts: 6 }
    const b = { team: "b", p: 3, w: 2, d: 0, l: 1, gf: 3, ga: 2, gd: 1, pts: 6 }
    expect(compareAcrossGroups(a, b)).toBeGreaterThan(0)
  })
})
