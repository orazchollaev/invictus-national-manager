import { describe, expect, it } from "vitest"
import {
  LANES,
  laneAffinity,
  laneCounts,
  lanePercent,
  laneOfSlot,
  mirror,
  widthBias,
} from "../match/lanes"
import { FORMATIONS } from "../match/formations"
import type { Lane, MatchEvent } from "../match/types"
import { archetypesFor } from "../players/archetypes"
import { POSITIONS, type Position } from "../types"
import { playMany, sideOf } from "./helpers"

const first = (pos: Position) => archetypesFor(pos)[0]
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

describe("lanes", () => {
  it("puts left-sided roles on the left, right-sided on the right, the rest through the middle", () => {
    expect(laneOfSlot("LB")).toBe("left")
    expect(laneOfSlot("LW")).toBe("left")
    expect(laneOfSlot("RB")).toBe("right")
    expect(laneOfSlot("RW")).toBe("right")
    for (const pos of POSITIONS.filter((p) => !["LB", "LW", "RB", "RW"].includes(p)))
      expect(laneOfSlot(pos)).toBe("centre")
  })

  it("agrees with the order formations list their players in: right first, left last", () => {
    for (const roles of Object.values(FORMATIONS)) {
      const lines = roles.filter((r) => ["LB", "RB"].includes(r))
      if (lines.length === 2) expect(lines).toEqual(["RB", "LB"])
      const wide = roles.filter((r) => ["LW", "RW"].includes(r))
      if (wide.length === 2) expect(wide).toEqual(["RW", "LW"])
    }
  })

  it("mirrors a lane onto the side the other team defends", () => {
    expect(mirror("left")).toBe("right")
    expect(mirror("right")).toBe("left")
    expect(mirror("centre")).toBe("centre")
    for (const l of LANES) expect(mirror(mirror(l))).toBe(l)
  })

  it("involves a player most in his own lane, the middle a little in both, the far flank barely", () => {
    for (const l of LANES) expect(laneAffinity(l, l)).toBe(1)
    expect(laneAffinity("centre", "left")).toBe(laneAffinity("left", "centre"))
    expect(laneAffinity("left", "right")).toBeLessThan(laneAffinity("centre", "right"))
    for (const a of LANES)
      for (const b of LANES) {
        expect(laneAffinity(a, b)).toBeGreaterThan(0)
        expect(laneAffinity(a, b)).toBe(laneAffinity(b, a))
      }
  })

  it("asks a wide side to use the flanks more and a narrow one less", () => {
    expect(widthBias(1)).toEqual({ left: 1, centre: 1, right: 1 })
    expect(widthBias(2).left).toBeGreaterThan(1)
    expect(widthBias(2).centre).toBeLessThan(1)
    expect(widthBias(0).left).toBeLessThan(1)
    expect(widthBias(0).centre).toBeGreaterThan(1)
  })
})

describe("counting attacks", () => {
  const ev = (side: "home" | "away", lane?: Lane): MatchEvent => ({
    minute: 1,
    kind: "attack",
    side,
    lane,
  })

  it("counts each side's attacks by lane and ignores events with no lane", () => {
    const counts = laneCounts([
      ev("home", "left"),
      ev("home", "left"),
      ev("home", "centre"),
      ev("away", "right"),
      ev("away"),
      { minute: 2, kind: "kickoff", side: null },
    ])
    expect(counts.home).toEqual({ left: 2, centre: 1, right: 0 })
    expect(counts.away).toEqual({ left: 0, centre: 0, right: 1 })
  })

  it("turns counts into percentages that add up to a hundred", () => {
    for (const c of [
      { left: 1, centre: 1, right: 1 },
      { left: 7, centre: 2, right: 5 },
      { left: 0, centre: 9, right: 0 },
    ]) {
      const p = lanePercent(c)
      expect(p.left + p.centre + p.right).toBe(100)
    }
    expect(lanePercent({ left: 0, centre: 0, right: 0 })).toEqual({ left: 0, centre: 0, right: 0 })
    expect(lanePercent({ left: 1, centre: 2, right: 1 })).toEqual({
      left: 25,
      centre: 50,
      right: 25,
    })
  })
})

describe("lanes in the match engine", () => {
  const reports = () => playMany(sideOf("h", first), sideOf("a", first), 150)

  it("marks every attack and offside with a lane, and nothing that is not an attack", () => {
    for (const r of reports())
      for (const e of r.events) {
        if (e.kind === "attack" || e.kind === "offside") expect(e.lane).toBeDefined()
        if (["foul", "yellow", "red", "sub", "half-time", "corner", "pen-goal"].includes(e.kind))
          expect(e.lane).toBeUndefined()
        if (e.lane) expect(LANES).toContain(e.lane)
      }
  })

  it("has most shots and goals carry the lane of the move that made them", () => {
    let shots = 0
    let tagged = 0
    for (const r of reports())
      for (const e of r.events)
        if (["goal", "shot-saved", "shot-wide", "shot-blocked", "woodwork"].includes(e.kind)) {
          shots++
          if (e.lane) tagged++
        }
    expect(shots).toBeGreaterThan(500)
    // Set-piece shots come from a corner or a free kick, not a move down a lane.
    expect(tagged / shots).toBeGreaterThan(0.8)
  })

  it("sends a wide side down the flanks more than a narrow one", () => {
    const flanks = (width: 0 | 1 | 2) => {
      const rs = playMany(sideOf("h", first, { tactics: { width } }), sideOf("a", first), 200)
      const c = rs.map((r) => laneCounts(r.events).home)
      const side = sum(c.map((x) => x.left + x.right))
      return side / sum(c.map((x) => x.left + x.centre + x.right))
    }
    expect(flanks(2)).toBeGreaterThan(flanks(1))
    expect(flanks(1)).toBeGreaterThan(flanks(0))
  })

  it("puts the left-back and the left winger in the moves down the left", () => {
    const home = sideOf("h", first)
    const lb = home.sheet.xi.find((s) => s.pos === "LB")!.playerId
    const rb = home.sheet.xi.find((s) => s.pos === "RB")!.playerId
    const count = (id: string, lane: Lane) =>
      sum(
        playMany(home, sideOf("a", first), 150).map(
          (r) =>
            r.events.filter((e) => e.kind === "attack" && e.playerId === id && e.lane === lane)
              .length
        )
      )
    expect(count(lb, "left")).toBeGreaterThan(count(lb, "right") * 2)
    expect(count(rb, "right")).toBeGreaterThan(count(rb, "left") * 2)
  })

  it("leans towards the flank where the opponent is weakest", () => {
    // Their right-back is poor: our attacks down our left meet him.
    const weak = sideOf("a", first)
    weak.players.find((p) => p.id === weak.sheet.xi.find((s) => s.pos === "RB")!.playerId)!.ca = 35
    const strong = sideOf("b", first)
    const share = (opp: typeof weak) => {
      const rs = playMany(sideOf("h", first), opp, 250)
      const c = rs.map((r) => laneCounts(r.events).home)
      return sum(c.map((x) => x.left)) / sum(c.map((x) => x.left + x.centre + x.right))
    }
    expect(share(weak)).toBeGreaterThan(share(strong))
  })
})
