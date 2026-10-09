import { describe, expect, it } from "vitest"
import { formatProblems } from "../competition/invariants"
import { CONFEDS, extraNations, playUntil, worldWith } from "./stretch"

/**
 * Thirty nations more in a confederation — over half again for most of them: the
 * Nations League adds leagues, qualifying adds preliminary rounds, and every format
 * invariant still holds through to the 2030 World Cup.
 */
describe.each(CONFEDS)("%s grown by 30 FIFA members", (confed) => {
  it("keeps every format invariant", { timeout: 600000 }, () => {
    const w = worldWith(extraNations(confed, 30))
    playUntil(w, "2030-08-15")
    expect(formatProblems(w)).toEqual([])
    expect(w.state.competitions["wc-2030"].status).toBe("done")
  })
})
