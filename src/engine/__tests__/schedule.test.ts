import { describe, expect, it } from "vitest"
import { drawGroups, roundRobin } from "../competition/draw"
import { makeRng } from "../rng"

const names = (n: number) => Array.from({ length: n }, (_, i) => `T${i}`)

/** The longest stretch of home matches or of away matches any team has. */
function longestRun(rounds: [string, string][][], teams: string[]) {
  let worst = 0
  for (const t of teams) {
    let prev = ""
    let run = 0
    for (const round of rounds)
      for (const [h, a] of round) {
        if (h !== t && a !== t) continue
        const venue = h === t ? "H" : "A"
        run = venue === prev ? run + 1 : 1
        prev = venue
        worst = Math.max(worst, run)
      }
  }
  return worst
}

describe("round robin venues", () => {
  it("never strings more than two home or away matches together in an even group", () => {
    for (const n of [4, 6, 8, 10, 12])
      for (const legs of [1, 2] as const)
        expect(longestRun(roundRobin(names(n), legs), names(n)), `${n} teams, ${legs} legs`).toBe(2)
  })

  it("keeps odd groups, where a team rests each round, to three at the very worst", () => {
    for (const n of [3, 5, 7, 9])
      for (const legs of [1, 2] as const)
        expect(
          longestRun(roundRobin(names(n), legs), names(n)),
          `${n} teams, ${legs} legs`
        ).toBeLessThanOrEqual(3)
  })

  it("plays every pair once a leg, the second leg with the venues swapped", () => {
    for (const n of [3, 4, 5, 10]) {
      const rounds = roundRobin(names(n), 2)
      const per = rounds.length / 2
      const key = (h: string, a: string) => `${h}>${a}`
      const first = new Set(
        rounds
          .slice(0, per)
          .flat()
          .map(([h, a]) => key(h, a))
      )
      const second = new Set(
        rounds
          .slice(per)
          .flat()
          .map(([h, a]) => key(h, a))
      )
      expect(first.size).toBe((n * (n - 1)) / 2)
      for (const [h, a] of rounds.slice(0, per).flat()) expect(second.has(key(a, h))).toBe(true)
    }
  })

  it("lets each team host within one match of half its games", () => {
    for (const n of [4, 6, 10]) {
      const home = new Map<string, number>()
      for (const [h] of roundRobin(names(n), 1).flat()) home.set(h, (home.get(h) ?? 0) + 1)
      for (const t of names(n))
        expect(Math.abs((home.get(t) ?? 0) - (n - 1) / 2)).toBeLessThanOrEqual(1)
    }
  })

  it("never rests the first team in the first round of an odd group", () => {
    for (const n of [3, 5, 7]) expect(roundRobin(names(n), 2)[0].flat()).toContain("T0")
  })
})

describe("draws with places still to be decided", () => {
  it("keeps every confederation a play-off winner could be out of its group", () => {
    // Twelve groups of four: UEFA 16, CAF 9, AFC 8, CONCACAF 7, CONMEBOL 7, OFC 1,
    // the last two places going to play-off winners who may be CAF, CONCACAF or OFC.
    const confeds: [string, number][] = [
      ["UEFA", 16],
      ["CAF", 8],
      ["AFC", 8],
      ["CONCACAF", 6],
      ["CONMEBOL", 7],
      ["OFC", 1],
    ]
    const real = confeds.flatMap(([c, n]) => Array.from({ length: n }, (_, i) => `${c}${i}`))
    const confedOf = (t: string) => (t.startsWith("?") ? "" : t.replace(/\d+$/, ""))
    const open = ["?a", "?b"]
    const candidates: Record<string, string[]> = {
      "?a": ["CAF", "CONCACAF", "OFC"],
      "?b": ["CAF", "CONCACAF", "AFC"],
    }
    const families = (t: string) => (open.includes(t) ? candidates[t] : [confedOf(t)])
    let broken = 0
    for (let seed = 0; seed < 100; seed++) {
      const rng = makeRng(seed + 500)
      const seeded = real.map((t) => [rng(), t] as const).sort((a, b) => a[0] - b[0])
      const ranked = [...seeded.map(([, t]) => t), ...open]
      const groups = drawGroups(ranked, 12, makeRng(seed), {
        families,
        open: (t) => open.includes(t),
        maxPerFamily: (c) => (c === "UEFA" ? 2 : 1),
      })
      for (const g of groups)
        for (const f of new Set(g.flatMap(families)))
          if (g.filter((t) => families(t).includes(f)).length > (f === "UEFA" ? 2 : 1)) broken++
    }
    expect(broken).toBe(0)
  })
})
