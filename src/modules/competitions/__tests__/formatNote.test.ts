import { describe, expect, it } from "vitest"
import type { CompetitionInstance, StageState } from "@/engine/competition/types"
import { formatNote } from "@/modules/competitions/utils/formatNote"

const inst = (defId: string, year: number) => ({ defId, year }) as CompetitionInstance
const stage = (key: string, ...sizes: number[]) =>
  ({
    key,
    groups: sizes.map((n, i) => ({ name: String(i), teams: Array(n).fill("X"), fixtures: [] })),
  }) as unknown as StageState

describe("formatNote", () => {
  it("explains the six-match groups from 2028", () => {
    expect(formatNote(inst("unl", 2030), stage("league", 6, 6))).toBe(
      "competitions.detail.formatSix"
    )
    expect(formatNote(inst("euroq", 2032), stage("l1", 12, 12, 12))).toBe(
      "competitions.detail.formatTwelve"
    )
    expect(formatNote(inst("wcq-uefa", 2030), stage("l2", 6, 6, 6))).toBe(
      "competitions.detail.formatSix"
    )
  })

  it("says nothing for older formats or other competitions", () => {
    expect(formatNote(inst("unl", 2026), stage("league", 4, 4))).toBeNull()
    expect(formatNote(inst("euroq", 2028), stage("groups", 5, 5))).toBeNull()
    expect(formatNote(inst("cnl", 2030), stage("league", 6, 6))).toBeNull()
    // A group of seven plays everyone once, not the six-match pattern.
    expect(formatNote(inst("unl", 2030), stage("league", 6, 7))).toBeNull()
  })
})
