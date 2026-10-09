import { describe, expect, it } from "vitest"
import { MAX_PRELIM_ROUNDS, isPrelim, prelimKey, prelimRounds } from "../competition/defs/builders"
import { leagueShape, type Tier } from "../competition/defs/nationsLeague"
import { fitRounds, roundRobin } from "../competition/draw"
import { window, windowBack, windowsForYear } from "../calendar/windows"

describe("prelimRounds", () => {
  it("needs no round when the field fits", () => {
    expect(prelimRounds(8, 8)).toEqual([])
    expect(prelimRounds(5, 8)).toEqual([])
  })

  it("cuts exactly the excess in one round while that is at most half the field", () => {
    expect(prelimRounds(10, 8)).toEqual([2])
    expect(prelimRounds(12, 8)).toEqual([4])
    expect(prelimRounds(16, 8)).toEqual([8])
  })

  it("adds a round when one cannot cut enough", () => {
    // 23 into 8: a round cuts at most 11 (leaving 12), the next cuts the last 4.
    expect(prelimRounds(23, 8)).toEqual([11, 4])
    expect(prelimRounds(40, 10)).toEqual([20, 10])
  })

  it("always lands on the capacity, until the rounds run out", () => {
    for (let capacity = 1; capacity <= 12; capacity++)
      for (let n = capacity; n <= capacity * 6; n++) {
        const rounds = prelimRounds(n, capacity)
        const left = n - rounds.reduce((a, b) => a + b, 0)
        if (rounds.length < MAX_PRELIM_ROUNDS) expect(left).toBeLessThanOrEqual(capacity)
        // Never more ties than the teams left can make.
        let pool = n
        for (const t of rounds) {
          expect(2 * t).toBeLessThanOrEqual(pool)
          pool -= t
        }
      }
  })

  it("stops at the most rounds there are", () => {
    expect(prelimRounds(1000, 2)).toHaveLength(MAX_PRELIM_ROUNDS)
  })
})

describe("preliminary stage keys", () => {
  it("name the first round plainly and number the rest", () => {
    expect([0, 1, 2].map(prelimKey)).toEqual(["prelim", "prelim2", "prelim3"])
    expect(["prelim", "prelim2", "groups", "playoff"].map(isPrelim)).toEqual([
      true,
      true,
      false,
      false,
    ])
  })
})

describe("windowBack", () => {
  it("is the window itself at zero", () => {
    const mar = window(2029, "mar")
    expect(windowBack(mar.slots[0], 0).id).toBe(mar.id)
  })

  it("steps back one window at a time, across a year's end", () => {
    const mar = window(2029, "mar")
    const nov = window(2028, "nov")
    const sep = window(2028, "sep")
    expect(windowBack(mar.slots[0], 1).id).toBe(nov.id)
    expect(windowBack(mar.slots[0], 2).id).toBe(sep.id)
  })

  it("always has two match days to play a two-legged round on", () => {
    for (const w of windowsForYear(2029))
      expect(windowBack(w.slots[0], 1).slots.length).toBeGreaterThan(1)
  })
})

describe("leagueShape", () => {
  const groupSize = (t: Tier) => t.size / t.groups

  it("is three leagues of three groups of six for the 54 nations of the format", () => {
    expect(leagueShape(54)).toEqual([
      { letter: "A", size: 18, groups: 3 },
      { letter: "B", size: 18, groups: 3 },
      { letter: "C", size: 18, groups: 3 },
    ])
  })

  it("holds every nation exactly once, for any confederation from 6 to 120", () => {
    for (let n = 6; n <= 120; n++)
      expect(
        leagueShape(n).reduce((a, t) => a + t.size, 0),
        `${n} nations`
      ).toBe(n)
  })

  it("builds only groups of three, four or six that fit the six match days", () => {
    for (let n = 6; n <= 120; n++)
      for (const t of leagueShape(n)) {
        expect(Number.isInteger(groupSize(t)), `${n}: league ${t.letter}`).toBe(true)
        expect([3, 4, 6], `${n}: league ${t.letter}`).toContain(groupSize(t))
      }
  })

  it("lettered A, B, C … in order, with every league at least one group", () => {
    for (let n = 6; n <= 120; n++)
      leagueShape(n).forEach((t, i) => {
        expect(t.letter).toBe(String.fromCharCode(65 + i))
        expect(t.groups).toBeGreaterThan(0)
      })
  })

  it("keeps the top leagues full and puts the odd nations in small leagues below", () => {
    // 57 nations: three full leagues and a League D of three.
    expect(leagueShape(57).map((t) => [t.size, t.groups])).toEqual([
      [18, 3],
      [18, 3],
      [18, 3],
      [3, 1],
    ])
    // 66: a fourth league of two groups of six.
    expect(leagueShape(66).at(-1)).toEqual({ letter: "D", size: 12, groups: 2 })
  })

  it("never needs more than two leagues beyond the full ones", () => {
    for (let n = 6; n <= 120; n++) {
      const t = leagueShape(n)
      const full = t.filter((x) => x.size === 18 && x.groups === 3).length
      expect(t.length - full, `${n} nations`).toBeLessThanOrEqual(2)
    }
  })

  it("copes with a handful of nations", () => {
    for (let n = 1; n < 6; n++)
      expect(
        leagueShape(n).reduce((a, t) => a + t.size, 0),
        `${n} nations`
      ).toBe(n)
  })
})

describe("fitRounds", () => {
  const teams = (n: number) => Array.from({ length: n }, (_, i) => `T${i}`)
  const plays = (rounds: [string, string][][], t: string) =>
    rounds.flat().filter(([h, a]) => h === t || a === t).length

  it("plays a double round robin while the dates allow", () => {
    const r = fitRounds(teams(4), 2, 6)
    expect(r).toHaveLength(6)
    expect(plays(r, "T0")).toBe(6)
  })

  it("is exactly the round robin it replaces when there is room", () => {
    for (const n of [3, 4, 5, 6, 8]) {
      expect(fitRounds(teams(n), 2, 99)).toEqual(roundRobin(teams(n), 2))
      expect(fitRounds(teams(n), 1, 99)).toEqual(roundRobin(teams(n), 1))
    }
  })

  it("goes single-legged when two legs do not fit", () => {
    const r = fitRounds(teams(5), 2, 6)
    expect(r.length).toBeLessThanOrEqual(6)
    // Everyone still meets everyone once.
    for (const t of teams(5)) expect(plays(r, t)).toBe(4)
  })

  it("cuts a group too large for even one leg to the dates it has", () => {
    const r = fitRounds(teams(10), 2, 6)
    expect(r).toHaveLength(6)
    for (const round of r) {
      const seen = round.flat()
      expect(new Set(seen).size).toBe(seen.length)
    }
  })

  it("never uses fewer than one round", () => {
    expect(fitRounds(teams(4), 2, 0)).toHaveLength(1)
  })
})
