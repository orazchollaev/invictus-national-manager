import { describe, expect, it } from "vitest"
import type { Standing } from "@/engine/competition/types"
import { outlookOf } from "../utils/outlook"
import type { Zone } from "../utils/zones"

const row = (team: string, p: number, pts: number): Standing => ({
  team,
  p,
  w: 0,
  d: 0,
  l: 0,
  gf: 0,
  ga: 0,
  gd: 0,
  pts,
})
const zones: (Zone | null)[] = ["advance", "advance", "third", null]

describe("who is through and who is out", () => {
  it("says nothing before the matches begin", () => {
    const rows = ["A", "B", "C", "D"].map((t) => row(t, 0, 0))
    expect(outlookOf(rows, [3, 3, 3, 3], zones)).toEqual([null, null, null, null])
  })

  it("marks a team through once too few rivals can still catch it", () => {
    // A has 9 points; B, C and D can reach 6 at most with one match each left.
    const rows = [row("A", 3, 9), row("B", 2, 3), row("C", 2, 2), row("D", 2, 1)]
    const out = outlookOf(rows, [0, 1, 1, 1], zones)
    expect(out[0]).toBe("qualified")
    expect(out[1]).toBeNull()
  })

  it("counts a tie against the team, so a place is never promised too early", () => {
    // B can still draw level with A on 6, and level is not safe.
    const rows = [row("A", 2, 6), row("B", 2, 3), row("C", 2, 3), row("D", 2, 0)]
    const out = outlookOf(rows, [1, 1, 1, 1], ["advance", null, null, null])
    expect(out[0]).toBeNull()
  })

  it("marks a team out once enough rivals are beyond its reach", () => {
    // D can reach 3 at most; A, B and C already have more, and three places are alive.
    const rows = [row("A", 3, 9), row("B", 3, 6), row("C", 3, 4), row("D", 3, 0)]
    const out = outlookOf(rows, [0, 0, 0, 1], zones)
    expect(out[3]).toBe("eliminated")
  })

  it("keeps a team that could still be a best third alive", () => {
    const rows = [row("A", 3, 9), row("B", 3, 6), row("C", 3, 1), row("D", 3, 0)]
    const out = outlookOf(rows, [0, 0, 0, 0], zones)
    // The group is over, but whether C goes on depends on other groups.
    expect(out[2]).toBeNull()
  })

  it("settles the group from who actually went on, once the stage is over", () => {
    const rows = [row("A", 3, 9), row("B", 3, 6), row("C", 3, 4), row("D", 3, 0)]
    const out = outlookOf(rows, [0, 0, 0, 0], zones, new Set(["A", "B"]))
    expect(out).toEqual(["qualified", "qualified", "eliminated", "eliminated"])
    const best = outlookOf(rows, [0, 0, 0, 0], zones, new Set(["A", "B", "C"]))
    expect(best).toEqual(["qualified", "qualified", "qualified", "eliminated"])
  })

  it("leaves a decided stage open while who went on is not known yet", () => {
    const rows = [row("A", 3, 9), row("B", 3, 6), row("C", 3, 4), row("D", 3, 0)]
    expect(outlookOf(rows, [0, 0, 0, 0], zones, null)).toEqual([
      "qualified",
      "qualified",
      null,
      null,
    ])
  })

  it("marks no one in a table that leads nowhere", () => {
    const rows = [row("A", 3, 9), row("B", 3, 0)]
    expect(outlookOf(rows, [0, 0], [null, null])).toEqual([null, null])
  })
})
