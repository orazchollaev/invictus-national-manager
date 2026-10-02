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

  it("marks the 2026–27 Nations League's move to three leagues of 18", () => {
    const unl2026 = { ...inst("unl", "nations-league"), id: "unl-2026", year: 2026 }
    expect(zonesFor(unl2026, "A1", 4, ctx)).toEqual(["qf", "qf", "playoff-risk", "risk"])
    expect(zonesFor(unl2026, "B1", 4, ctx)).toEqual(["up", "playoff-up", null, "playoff-down"])
    // Nobody goes down from League C; all of League D goes up.
    expect(zonesFor(unl2026, "C1", 4, ctx)).toEqual(["up", "playoff-up", null, null])
    expect(zonesFor(unl2026, "D1", 3, ctx)).toEqual(["up", "up", "up"])
  })

  it("marks the groups of six from 2028–29", () => {
    expect(zonesFor(inst("unl", "nations-league"), "A1", 6, ctx)).toEqual([
      "qf",
      "qf",
      "qf-third",
      null,
      "playoff-down",
      "down",
    ])
    expect(zonesFor(inst("unl", "nations-league"), "B2", 6, ctx)).toEqual([
      "up",
      "playoff-up",
      null,
      null,
      "playoff-down",
      "down",
    ])
    expect(zonesFor(inst("unl", "nations-league"), "C3", 6, ctx)).toEqual([
      "up",
      "playoff-up",
      null,
      null,
      null,
      null,
    ])
  })

  it("marks champions, not qualifiers, for league-format cups", () => {
    expect(zonesFor(inst("e1", "regional"), "A", 4, ctx)).toEqual(["champion", null, null, null])
  })
})

describe("European qualifying with hosts in the group", () => {
  const confedOf = (t: string) => (["ESP", "POR"].includes(t) ? "UEFA" : "CAF")
  const ctx2 = { confedOf, instance: () => undefined } as unknown as CompContext

  it("passes a host's place down the table", () => {
    // 2030: Spain and Portugal are hosts, so 14 places and three direct per group.
    const rows = ["ESP", "SRB", "CRO", "TUR", "UKR", "GRE", "ALB"]
    expect(zonesFor(inst("wcq-uefa", "qualifier"), "1B", 7, ctx2, "l1", rows)).toEqual([
      "host",
      "through",
      "through",
      "through",
      "playoff",
      "playoff",
      "playoff",
    ])
  })

  it("is unchanged where no host plays", () => {
    const rows = ["FRA", "BEL", "NOR", "ITA", "ROU", "AUT", "SCO"]
    const plain = zonesFor(inst("wcq-uefa", "qualifier"), "1A", 7, ctx2, "l1")
    expect(zonesFor(inst("wcq-uefa", "qualifier"), "1A", 7, ctx2, "l1", rows)).toEqual(plain)
    expect(plain.slice(0, 3)).toEqual(["through", "through", "through"])
  })
})
