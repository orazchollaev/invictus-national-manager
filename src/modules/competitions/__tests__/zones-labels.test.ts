import { describe, expect, it } from "vitest"
import type { CompetitionInstance } from "@/engine/competition/types"
import type { CompContext } from "@/engine/competition/runtime"
import { zonesFor } from "../utils/zones"

const ctx = { confedOf: () => "UEFA" } as unknown as CompContext
const inst = (defId: string, kind: CompetitionInstance["kind"]) =>
  ({ defId, kind, year: 2030 }) as CompetitionInstance

describe("zone labels", () => {
  it("only marks the Asian Cup in Asia's qualifying", () => {
    for (const id of ["wcq-uefa", "wcq-caf", "wcq-concacaf", "euroq", "afconq"]) {
      expect(zonesFor(inst(id, "qualifier"), "A", 5, ctx)).not.toContain("cup")
    }
    expect(zonesFor(inst("wcq-afc", "qualifier"), "A", 5, ctx)).toContain("cup")
  })

  it("marks relegation on the last place of each Nations League group", () => {
    expect(zonesFor(inst("unl", "nations-league"), "A1", 4, ctx)).toEqual([
      "qf",
      "qf",
      "playoff-down",
      "down",
    ])
    expect(zonesFor(inst("unl", "nations-league"), "D2", 3, ctx)).toEqual([
      "up",
      "playoff-up",
      null,
    ])
  })

  it("marks champions, not qualifiers, for league-format cups", () => {
    expect(zonesFor(inst("e1", "regional"), "A", 4, ctx)).toEqual(["champion", null, null, null])
  })
})
