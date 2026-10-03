import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import { RIVALRIES } from "@/data/rivalries"
import type { NationDef } from "../types"
import type { Fixture, Importance } from "../competition/types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import type { World } from "../world/world"
import { derbyConfidence, rivalry, rivalsOf } from "../world/rivals"
import {
  crowdBoost,
  monthlySupport,
  nudgeSupport,
  SUPPORT_TUNING,
  supportForResult,
  supportOf,
} from "../career/support"
import { afterUserResult, monthlyDrift } from "../career/career"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId = "TUR") {
  return createWorld(
    { seed: 5, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

function fx(
  home: string,
  away: string,
  h: number,
  a: number,
  importance: Importance = "qualifier"
) {
  const f: Fixture = {
    id: `t:${home}:${away}:${h}${a}`,
    compId: "friendly",
    stage: "friendly",
    label: "",
    date: "2026-09-05",
    home,
    away,
    atHome: true,
    importance,
    result: { h, a },
  }
  return f
}

describe("rivalries", () => {
  it("know their derbies both ways", () => {
    expect(rivalry("TUR", "GRE")).toBe(2)
    expect(rivalry("GRE", "TUR")).toBe(2)
    expect(rivalry("TUR", "BRA")).toBe(0)
    expect(rivalsOf("TUR").map((r) => r.id)).toContain("GRE")
    expect(rivalsOf("TUR")[0].intensity).toBe(2)
  })

  it("only name nations that exist, never twice", () => {
    const ids = new Set((nations as NationDef[]).map((n) => n.id))
    const seen = new Set<string>()
    for (const [a, b] of RIVALRIES) {
      expect(ids.has(a), a).toBe(true)
      expect(ids.has(b), b).toBe(true)
      expect(a).not.toBe(b)
      const key = [a, b].sort().join("|")
      expect(seen.has(key), key).toBe(false)
      seen.add(key)
    }
  })

  it("move the board's confidence only a little", () => {
    expect(derbyConfidence(2, "W")).toBe(3)
    expect(derbyConfidence(2, "L")).toBe(-3)
    expect(derbyConfidence(1, "W")).toBe(2)
    expect(derbyConfidence(1, "D")).toBe(0)
    expect(derbyConfidence(0, "L")).toBe(0)
  })
})

describe("fans' support", () => {
  it("rises with wins, falls with defeats", () => {
    expect(supportForResult(fx("TUR", "AUT", 2, 0), "TUR", 2, 0, 1, 0.5)).toBeGreaterThan(0)
    expect(supportForResult(fx("TUR", "AUT", 0, 2), "TUR", 0, 2, 0, 0.5)).toBeLessThan(0)
  })

  it("cares more about a derby, a home match and a big margin", () => {
    const plain = supportForResult(fx("AUT", "TUR", 0, 1), "TUR", 1, 0, 1, 0.5)
    const derby = supportForResult(fx("GRE", "TUR", 0, 1), "TUR", 1, 0, 1, 0.5)
    const home = supportForResult(fx("TUR", "AUT", 1, 0), "TUR", 1, 0, 1, 0.5)
    const big = supportForResult(fx("AUT", "TUR", 0, 4), "TUR", 4, 0, 1, 0.5)
    expect(derby).toBeGreaterThan(plain * 2)
    expect(home).toBeGreaterThan(plain)
    expect(big).toBeGreaterThan(plain)
    const derbyLoss = supportForResult(fx("GRE", "TUR", 1, 0), "TUR", 0, 1, 0, 0.5)
    const loss = supportForResult(fx("AUT", "TUR", 1, 0), "TUR", 0, 1, 0, 0.5)
    expect(derbyLoss).toBeLessThan(loss * 2)
  })

  it("cares less about friendlies than finals", () => {
    const friendly = supportForResult(fx("TUR", "AUT", 1, 0, "friendly"), "TUR", 1, 0, 1, 0.5)
    const ko = supportForResult(fx("TUR", "AUT", 1, 0, "world-cup-ko"), "TUR", 1, 0, 1, 0.5)
    expect(ko).toBeGreaterThan(friendly * 3)
  })

  it("fades towards the middle each month and nudges the board", () => {
    const w = newWorld()
    w.state.career.support = 100
    const pull = monthlySupport(w)
    expect(w.state.career.support).toBe(100 - SUPPORT_TUNING.driftPerMonth)
    expect(pull).toBe(SUPPORT_TUNING.boardPullMax)
    w.state.career.support = 30
    expect(monthlySupport(w)).toBeLessThan(0)
    expect(w.state.career.support).toBe(33)
  })

  it("lifts the board in a good month and weighs on it in a bad one", () => {
    const run = (support: number) => {
      const w = newWorld()
      w.state.career.confidence = 50
      w.state.career.support = support
      monthlyDrift(w)
      return w.state.career.confidence
    }
    expect(run(95)).toBeGreaterThan(50)
    expect(run(5)).toBeLessThan(50)
    expect(run(50)).toBe(50)
  })

  it("makes news when the mood turns", () => {
    const w = newWorld()
    w.state.career.support = 30
    nudgeSupport(w, -10)
    expect(w.state.news[0].title).toEqual({ k: "news.fans.angry.title" })
    w.state.career.support = 78
    nudgeSupport(w, 5)
    expect(w.state.news[0].title).toEqual({ k: "news.fans.adore.title" })
    expect(supportOf(w)).toBe(83)
  })

  it("stays between 0 and 100", () => {
    const w = newWorld()
    nudgeSupport(w, 500)
    expect(supportOf(w)).toBe(100)
    nudgeSupport(w, -500)
    expect(supportOf(w)).toBe(0)
  })

  it("gives the home side a crowd: up to ±0.6 ability points", () => {
    expect(crowdBoost(50)).toBe(0)
    expect(crowdBoost(100)).toBe(SUPPORT_TUNING.crowd)
    expect(crowdBoost(0)).toBe(-SUPPORT_TUNING.crowd)
  })

  it("starts with every career, and old saves get the default", () => {
    const w = newWorld()
    expect(w.state.career.support).toBe(SUPPORT_TUNING.start)
  })
})

describe("a derby result for the manager", () => {
  /** Confidence and support after one result against `opp`, at equal strength. */
  function after(opp: string, h: number, a: number) {
    const w: World = newWorld("TUR")
    w.state.nations[opp].points = w.state.nations.TUR.points
    w.state.career.confidence = 50
    w.state.career.support = 50
    afterUserResult(w, fx("TUR", opp, h, a, "friendly"))
    return { confidence: w.state.career.confidence, support: w.state.career.support! }
  }

  it("counts for more than the same result against anyone else", () => {
    const derbyWin = after("GRE", 2, 1)
    const win = after("AUT", 2, 1)
    expect(derbyWin.confidence).toBeGreaterThan(win.confidence)
    expect(derbyWin.support).toBeGreaterThan(win.support)
    const derbyLoss = after("GRE", 1, 2)
    const loss = after("AUT", 1, 2)
    expect(derbyLoss.confidence).toBeLessThan(loss.confidence)
    expect(derbyLoss.support).toBeLessThan(loss.support)
  })

  it("never costs the job on its own", () => {
    const heavy = after("GRE", 0, 5)
    expect(heavy.confidence).toBeGreaterThan(40)
  })

  it("makes the headlines", () => {
    const w = newWorld("TUR")
    afterUserResult(w, fx("TUR", "GRE", 1, 0, "friendly"))
    expect(
      w.state.news.some((n) => typeof n.title !== "string" && n.title.k === "news.derbyWin.title")
    ).toBe(true)
  })
})
