import { describe, expect, it } from "vitest"
import { formatProblems } from "../competition/invariants"
import { grownAtOnce } from "./stretch"

/**
 * Formats must stretch: a confederation that grows by a few nations, or by thirty,
 * still plays sound qualifying, Nations Leagues and finals — leagues and groups stay
 * balanced, every match falls in its windows, no team qualifies twice.
 *
 * The sizes are split between this file and formatStretchExtreme.test.ts so the two run
 * in parallel. The bundled world's formats are checked in afcon.test.ts and
 * integrity.test.ts; each confederation grown alone is in formatStretchMatrix.test.ts
 * (LONGRUN=1).
 */
describe("every confederation grown at once", () => {
  it.each([3, 30])("by %i FIFA members each keeps every format invariant", (n) => {
    const w = grownAtOnce(n)
    expect(formatProblems(w)).toEqual([])
    expect(w.state.competitions["wc-2030"].status).toBe("done")
  })
})
