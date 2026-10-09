import { describe, expect, it } from "vitest"
import { formatProblems } from "../competition/invariants"
import type { Confed } from "../types"
import { CONFEDS, extraNations, playUntil, worldWith } from "./stretch"

/**
 * Formats must stretch: a confederation that grows by a few nations, or by a dozen,
 * still plays sound qualifying, Nations Leagues and finals — leagues and groups stay
 * balanced, every match falls in its windows, no team qualifies twice.
 */

const UNTIL = "2030-08-15"

describe("the bundled world", { timeout: 600000 }, () => {
  it("keeps every format invariant", () => {
    const w = worldWith([])
    playUntil(w, UNTIL)
    expect(formatProblems(w)).toEqual([])
  })
})

describe.each(CONFEDS.map((c) => [c, 12] as [Confed, number]))(
  "%s grown by %i FIFA members",
  (confed, n) => {
    it("keeps every format invariant", { timeout: 600000 }, () => {
      const w = worldWith(extraNations(confed, n))
      playUntil(w, UNTIL)
      expect(formatProblems(w)).toEqual([])
    })
  }
)

describe("every confederation grown at once", { timeout: 900000 }, () => {
  it.each([3, 8])("by %i FIFA members each keeps every format invariant", (n) => {
    const w = worldWith(CONFEDS.flatMap((c) => extraNations(c, n)))
    playUntil(w, UNTIL)
    expect(formatProblems(w)).toEqual([])
  })
})
