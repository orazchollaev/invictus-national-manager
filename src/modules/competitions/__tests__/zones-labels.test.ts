import { describe, expect, it } from "vitest"
import type { CompetitionInstance } from "@/engine/competition/types"
import type { CompContext } from "@/engine/competition/runtime"
import { zonesFor } from "../utils/zones"

const ctx = { confedOf: () => "UEFA", instance: () => undefined } as unknown as CompContext
const inst = (defId: string, kind: CompetitionInstance["kind"]) =>
  ({ id: `${defId}-2030`, defId, kind, year: 2030, stages: [] }) as unknown as CompetitionInstance

describe("zone labels", () => {
  it("only marks the Asian Cup in Asia's qualifying", () => {
    for (const id of ["wcq-uefa", "wcq-caf", "wcq-concacaf", "euroq", "afconq"]) {
      expect(zonesFor(inst(id, "qualifier"), "A", 5, ctx)).not.toContain("acq")
    }
    expect(zonesFor(inst("wcq-afc", "qualifier"), "A", 4, ctx, "r2")).toEqual([
      "wc-ac",
      "wc-ac",
      "acq",
      "acq",
    ])
  })

  it("follows Asia's rounds: third round, then fourth", () => {
    expect(zonesFor(inst("wcq-afc", "qualifier"), "A", 6, ctx, "r3")).toEqual([
      "through",
      "through",
      "next",
      "next",
      null,
      null,
    ])
    expect(zonesFor(inst("wcq-afc", "qualifier"), "A", 3, ctx, "r4")).toEqual([
      "through",
      "next",
      null,
    ])
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
