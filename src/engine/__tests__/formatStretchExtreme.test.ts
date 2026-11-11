import { describe, expect, it } from "vitest"
import { formatProblems } from "../competition/invariants"
import { grownAtOnce } from "./stretch"

/**
 * The middle sizes of formatStretch.test.ts, in a file of their own so the two run in
 * parallel: eight, then a dozen nations more in every confederation — the Nations
 * League adds leagues, qualifying adds preliminary rounds, and every format invariant
 * still holds through to the 2030 World Cup.
 */
describe("every confederation grown at once", () => {
  it.each([8, 12])("by %i FIFA members each keeps every format invariant", (n) => {
    const w = grownAtOnce(n)
    expect(formatProblems(w)).toEqual([])
    expect(w.state.competitions["wc-2030"].status).toBe("done")
  })
})
