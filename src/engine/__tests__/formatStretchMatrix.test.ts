import { describe, expect, it } from "vitest"
import { formatProblems } from "../competition/invariants"
import type { Confed } from "../types"
import { CONFEDS, extraNations, LONGRUN, playUntil, worldWith } from "./stretch"

/**
 * Each confederation grown alone, by a dozen and by thirty: twelve worlds played to the
 * 2030 World Cup. The default run grows all six at once instead (formatStretch,
 * formatStretchExtreme); this runs with LONGRUN=1.
 */
describe.runIf(LONGRUN).each(
  CONFEDS.flatMap((c) => [
    [c, 12],
    [c, 30],
  ]) as [Confed, number][]
)("%s grown by %i FIFA members", (confed, n) => {
  it("keeps every format invariant", () => {
    const w = worldWith(extraNations(confed, n))
    playUntil(w, "2030-08-15")
    expect(formatProblems(w)).toEqual([])
    expect(w.state.competitions["wc-2030"].status).toBe("done")
  })
})
