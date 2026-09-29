import { describe, expect, it } from "vitest"
import { ageOn, matchAbility, positionFit, positionGroup } from "../players/ability"
import { nationTop, peakAt } from "../players/quality"
import {
  developSeason,
  INTL_MINUTES_FULL,
  retirementChance,
  intlRetirementChance,
  intakeSize,
  newgen,
  ageFactor,
} from "../players/lifecycle"
import { indexClubs, roleAt, showcased, summerMove, tierForAbility } from "../players/clubs"
import type { Club } from "../types"
import { makeRng } from "../rng"
import type { NationDef } from "../types"
import { makePlayer } from "./helpers"

const clubs = indexClubs([
  { id: "c1", name: "One", nationId: "AAA", tier: 1 },
  { id: "c5", name: "Five", nationId: "AAA", tier: 5 },
  { id: "c3", name: "Three", nationId: "AAA", tier: 3 },
  { id: "c4", name: "Four", nationId: "AAA", tier: 4 },
])

function nation(level: number): NationDef {
  return {
    id: "AAA",
    name: "A",
    flag: "tr",
    confed: "UEFA",
    subFeds: [],
    color: "#000",
    youthLevel: level,
    points: 1500,
    cultures: [["english", 100]],
  }
}

describe("ability", () => {
  it("computes ages on a date", () => {
    expect(ageOn("2000-09-02", "2026-09-01")).toBe(25)
    expect(ageOn("2000-09-01", "2026-09-01")).toBe(26)
  })

  it("rewards natural positions and punishes odd ones", () => {
    const cb = makePlayer("x", "CB", 70, { alt: ["DM"] })
    expect(positionFit(cb, "CB")).toBe(1)
    expect(positionFit(cb, "DM")).toBe(1)
    expect(positionFit(cb, "RB")).toBeLessThan(1)
    expect(positionFit(cb, "ST")).toBeLessThan(positionFit(cb, "RB"))
    expect(positionFit(cb, "GK")).toBeLessThan(0.5)
    expect(positionGroup("LW")).toBe("FWD")
  })

  it("shades match ability by form and sharpness", () => {
    const hot = makePlayer("h", "ST", 70, { form: 5, sharp: 100, morale: 100 })
    const cold = makePlayer("c", "ST", 70, { form: -5, sharp: 20, morale: 20 })
    expect(matchAbility(hot)).toBeGreaterThan(70)
    expect(matchAbility(cold)).toBeLessThan(65)
  })
})

describe("quality curve", () => {
  it("rises with nation level and falls with rank", () => {
    expect(nationTop(100)).toBeGreaterThan(nationTop(60))
    expect(nationTop(60)).toBeGreaterThan(nationTop(10))
    expect(nationTop(100)).toBeLessThanOrEqual(96)
    expect(peakAt(90, 0)).toBe(90)
    expect(peakAt(90, 20)).toBeLessThan(peakAt(90, 5))
  })

  it("maps age to share of peak", () => {
    expect(ageFactor(27, false)).toBe(1)
    expect(ageFactor(18, false)).toBeLessThan(0.85)
    expect(ageFactor(34, false)).toBeLessThan(0.95)
    // Keepers peak two years later.
    expect(ageFactor(31, true)).toBe(1)
  })
})

describe("development", () => {
  it("grows youngsters towards their potential", () => {
    const r = makeRng(1)
    let gained = 0
    for (let i = 0; i < 200; i++) {
      const p = makePlayer(`y${i}`, "CM", 60, { pa: 80, role: "starter" })
      gained += developSeason(p, 18, 3, 0, r)
      expect(p.ca).toBeLessThanOrEqual(p.pa)
    }
    expect(gained / 200).toBeGreaterThan(3)
  })

  it("develops youngsters faster when they play international football", () => {
    const season = (minutes: number) => {
      const r = makeRng(9)
      let gained = 0
      for (let i = 0; i < 300; i++) {
        const p = makePlayer(`y${i}`, "CM", 60, { pa: 82, role: "rotation" })
        gained += developSeason(p, 19, 3, minutes, r)
      }
      return gained / 300
    }
    const none = season(0)
    const some = season(INTL_MINUTES_FULL / 2)
    const full = season(INTL_MINUTES_FULL)
    expect(some).toBeGreaterThan(none)
    expect(full).toBeGreaterThan(some)
    // A full season of caps is worth roughly a fifth more growth, not a miracle.
    expect(full / none).toBeGreaterThan(1.12)
    expect(full / none).toBeLessThan(1.4)
    // More minutes than the full boost add nothing.
    expect(season(INTL_MINUTES_FULL * 3)).toBeCloseTo(full, 1)
  })

  it("develops the user's players a little faster, and keeps veterans going", () => {
    const grow = (boost: number, age: number, ca: number, pa: number) => {
      const r = makeRng(21)
      let total = 0
      for (let i = 0; i < 300; i++)
        total += developSeason(makePlayer(`b${i}`, "CM", ca, { pa }), age, 3, 0, r, boost)
      return total / 300
    }
    expect(grow(0.15, 19, 60, 82)).toBeGreaterThan(grow(0, 19, 60, 82) * 1.08)
    expect(grow(0.15, 33, 80, 80)).toBeGreaterThan(grow(0, 33, 80, 80))
  })

  it("makes veterans decline, keepers later than outfielders", () => {
    const r = makeRng(2)
    let outfield = 0
    let keepers = 0
    for (let i = 0; i < 200; i++) {
      outfield += developSeason(makePlayer(`o${i}`, "ST", 80), 33, 2, 0, r)
      keepers += developSeason(makePlayer(`k${i}`, "GK", 80), 33, 2, 0, r)
    }
    expect(outfield / 200).toBeLessThan(-1.5)
    expect(keepers / 200).toBeGreaterThan(outfield / 200)
  })

  it("retires the old, rarely the young, and everyone by forty", () => {
    const p = makePlayer("r", "CM", 70)
    expect(retirementChance(p, 24, 3)).toBe(0)
    expect(retirementChance(p, 36, 3)).toBeGreaterThan(0.5)
    expect(retirementChance(p, 40, 3)).toBe(1)
    expect(retirementChance(makePlayer("g", "GK", 70), 34, 3)).toBeLessThan(
      retirementChance(p, 34, 3)
    )
    expect(intlRetirementChance(makePlayer("v", "CM", 70, { caps: 60 }), 34, 1)).toBeGreaterThan(0)
  })

  it("brings youngsters through to keep the pool near 80", () => {
    const r = makeRng(4)
    expect(intakeSize(70, r)).toBeGreaterThan(intakeSize(85, r))
    const strong = Array.from({ length: 300 }, (_, i) =>
      newgen(`s${i}`, nation(95), [], "2027-01-01", clubs, r)
    )
    const weak = Array.from({ length: 300 }, (_, i) =>
      newgen(`w${i}`, nation(10), [], "2027-01-01", clubs, r)
    )
    const avg = (list: typeof strong) => list.reduce((s, p) => s + p.pa, 0) / list.length
    expect(avg(strong)).toBeGreaterThan(avg(weak) + 20)
    for (const p of strong) {
      const age = ageOn(p.born, "2027-01-01")
      expect(age).toBeGreaterThanOrEqual(15)
      expect(age).toBeLessThanOrEqual(18)
      expect(p.first.length).toBeGreaterThan(0)
    }
  })
})

describe("clubs", () => {
  it("places better players at better clubs and in bigger roles", () => {
    const r = makeRng(5)
    expect(tierForAbility(90, r)).toBe(1)
    expect(tierForAbility(40, r)).toBe(5)
    expect(roleAt(95, 3, r)).toBe("star")
    expect(roleAt(45, 1, r)).toBe("reserve")
    expect(clubs.get("AAA")?.[0]).toEqual(["c1"])
  })

  it("moves a young player up after an international breakthrough", () => {
    const map = new Map<string, Club>([
      ["c1", { id: "c1", name: "One", nationId: "AAA", tier: 1 }],
      ["c3", { id: "c3", name: "Three", nationId: "AAA", tier: 3 }],
      ["c4", { id: "c4", name: "Four", nationId: "AAA", tier: 4 }],
      ["c5", { id: "c5", name: "Five", nationId: "AAA", tier: 5 }],
    ])
    const moves = (showcase: boolean) => {
      const r = makeRng(12)
      let up = 0
      for (let i = 0; i < 300; i++) {
        // A tier-4 level player at a tier-4 club.
        const p = makePlayer(`m${i}`, "CM", 60, { clubId: "c4", nationId: "AAA" })
        summerMove(p, map, clubs, "UEFA", 21, r, showcase)
        if ((map.get(p.clubId)?.tier ?? 5) < 4) up++
      }
      return up
    }
    expect(moves(true)).toBeGreaterThan(moves(false) + 100)

    const star = makePlayer("s", "CM", 60, { intlMin: 270, intlRating: [22.5, 3] })
    expect(showcased(star, 21)).toBe(true)
    expect(showcased(star, 28)).toBe(false)
    expect(showcased({ ...star, intlRating: [18, 3] }, 21)).toBe(false)
  })
})
