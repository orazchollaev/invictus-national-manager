import { describe, expect, it } from "vitest"
import { deriveSeed, gauss, makeRng, pickWeighted, shuffle, clamp } from "../rng"
import { addDays, daysBetween, formatDate, mondayOnOrAfter, yearOf } from "../calendar/dates"
import { nextWindow, slots, window, windowAt, windowsForYear } from "../calendar/windows"
import { expectedResult, rankingUpdate } from "../ranking"

describe("rng", () => {
  it("repeats a stream for the same seed and differs for another", () => {
    const a = makeRng(42)
    const b = makeRng(42)
    const c = makeRng(43)
    const xs = Array.from({ length: 5 }, () => a())
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs)
    expect(Array.from({ length: 5 }, () => c())).not.toEqual(xs)
    for (const x of xs) expect(x >= 0 && x < 1).toBe(true)
  })

  it("derives distinct, stable streams from keys", () => {
    expect(deriveSeed(1, "match", "a")).toBe(deriveSeed(1, "match", "a"))
    expect(deriveSeed(1, "match", "a")).not.toBe(deriveSeed(1, "match", "b"))
    expect(deriveSeed(1, "ab")).not.toBe(deriveSeed(1, "a", "b"))
  })

  it("draws approximately normal values", () => {
    const r = makeRng(7)
    const xs = Array.from({ length: 5000 }, () => gauss(r, 10, 2))
    const mean = xs.reduce((s, x) => s + x, 0) / xs.length
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length)
    expect(mean).toBeGreaterThan(9.9)
    expect(mean).toBeLessThan(10.1)
    expect(sd).toBeGreaterThan(1.8)
    expect(sd).toBeLessThan(2.2)
  })

  it("picks by weight and shuffles without losing items", () => {
    const r = makeRng(3)
    const counts = { a: 0, b: 0 }
    for (let i = 0; i < 4000; i++)
      counts[pickWeighted(r, ["a", "b"] as const, (x) => (x === "a" ? 3 : 1))]++
    expect(counts.a / counts.b).toBeGreaterThan(2.5)
    expect(counts.a / counts.b).toBeLessThan(3.5)
    const list = [1, 2, 3, 4, 5, 6]
    expect([...shuffle(r, list)].sort()).toEqual(list)
    expect(clamp(12, 0, 10)).toBe(10)
  })
})

describe("calendar", () => {
  it("does date arithmetic in UTC", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29")
    expect(daysBetween("2026-09-01", "2026-10-01")).toBe(30)
    expect(yearOf("2031-05-02")).toBe(2031)
    expect(mondayOnOrAfter("2026-09-23")).toBe("2026-09-28")
    expect(formatDate("2026-09-24")).toBe("24 Sep 2026")
  })

  it("has the published 2026 windows and match days", () => {
    const list = windowsForYear(2026)
    expect(list.map((w) => w.start)).toEqual(["2026-09-21", "2026-11-09"])
    expect(window(2026, "sep").slots).toEqual([
      "2026-09-24",
      "2026-09-27",
      "2026-10-01",
      "2026-10-04",
    ])
    expect(window(2026, "nov").slots).toEqual(["2026-11-12", "2026-11-15"])
    expect(slots(2027, ["mar", "jun"])).toHaveLength(4)
  })

  it("follows the same shape after the published calendar", () => {
    for (const year of [2031, 2038, 2045]) {
      const list = windowsForYear(year)
      expect(list.map((w) => w.slots.length)).toEqual([2, 2, 4, 2])
      for (const w of list) expect(new Date(w.start + "T00:00:00Z").getUTCDay()).toBe(1)
    }
  })

  it("finds the window a date belongs to", () => {
    expect(windowAt("2026-09-25")?.start).toBe("2026-09-21")
    expect(windowAt("2026-10-20")).toBeUndefined()
    expect(nextWindow("2026-10-20").start).toBe("2026-11-09")
  })
})

describe("FIFA ranking (SUM)", () => {
  it("expects even sides to draw and favourites to win", () => {
    expect(expectedResult(1500, 1500)).toBeCloseTo(0.5)
    expect(expectedResult(1800, 1500)).toBeCloseTo(0.76, 2)
    expect(expectedResult(1500, 1800) + expectedResult(1800, 1500)).toBeCloseTo(1)
  })

  it("moves points by importance × (result − expectation)", () => {
    const [h, a] = rankingUpdate(1500, 1500, { home: 1, away: 0 }, "qualifier", false)
    expect(h).toBeCloseTo(1512.5)
    expect(a).toBeCloseTo(1487.5)
    const [fh] = rankingUpdate(1500, 1500, { home: 1, away: 0 }, "friendly", false)
    expect(fh).toBeCloseTo(1505)
  })

  it("does not punish a knockout defeat at a finals tournament", () => {
    const [, loser] = rankingUpdate(1500, 1600, { home: 2, away: 0 }, "world-cup-ko", true)
    expect(loser).toBe(1600)
  })

  it("scores a shootout as 0.75 for the winner and 0.5 for the loser", () => {
    const [h, a] = rankingUpdate(
      1500,
      1500,
      { home: 1, away: 1, shootout: "home" },
      "qualifier",
      true
    )
    expect(h - 1500).toBeCloseTo(6.25)
    expect(a).toBe(1500)
  })
})
