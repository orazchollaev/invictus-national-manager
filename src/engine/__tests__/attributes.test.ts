import { describe, expect, it } from "vitest"
import { POSITIONS, type Player } from "../types"
import {
  attrKeys,
  caFromAttrs,
  deriveAttrs,
  distributeDelta,
  ensureAttrs,
} from "../players/attributes"

function player(id: string, pos: Player["pos"], ca: number): Player {
  return { id, pos, ca, pa: ca + 5 } as Player
}

describe("attributes", () => {
  it("are deterministic for the same id, position and ca", () => {
    expect(deriveAttrs(player("a", "ST", 70))).toEqual(deriveAttrs(player("a", "ST", 70)))
    expect(deriveAttrs(player("a", "ST", 70))).not.toEqual(deriveAttrs(player("b", "ST", 70)))
  })

  it("add up to the overall they were drawn from", () => {
    for (const pos of POSITIONS)
      for (const ca of [30, 55, 70, 85, 94]) {
        const attrs = deriveAttrs(player(`${pos}${ca}`, pos, ca))
        expect(Math.abs(caFromAttrs(attrs, pos) - ca)).toBeLessThan(0.6)
        for (const k of attrKeys(pos)) {
          expect(attrs[k]).toBeGreaterThanOrEqual(1)
          expect(attrs[k]).toBeLessThanOrEqual(99)
        }
      }
  })

  it("give a goalkeeper only keeper attributes", () => {
    const attrs = deriveAttrs(player("k", "GK", 70))
    expect(Object.keys(attrs).sort()).toEqual([...attrKeys("GK")].sort())
  })

  it("make a winger faster than a centre-back of the same overall", () => {
    let wing = 0
    let back = 0
    for (let i = 0; i < 50; i++) {
      wing += deriveAttrs(player(`w${i}`, "LW", 70)).pace ?? 0
      back += deriveAttrs(player(`c${i}`, "CB", 70)).pace ?? 0
    }
    expect(wing).toBeGreaterThan(back)
  })

  it("fill themselves once", () => {
    const p = player("x", "CM", 66)
    expect(ensureAttrs(p)).toBe(true)
    expect(ensureAttrs(p)).toBe(false)
  })

  it("move with a season's change in ability, legs first when declining", () => {
    const p = player("v", "ST", 70)
    ensureAttrs(p)
    const before = { ...p.attrs }
    const ca = distributeDelta(p, -3, 33)
    expect(Math.abs(ca - 67)).toBeLessThan(0.3)
    const lostPace = (before.pace ?? 0) - (p.attrs?.pace ?? 0)
    const lostVision = (before.vision ?? 0) - (p.attrs?.vision ?? 0)
    expect(lostPace).toBeGreaterThan(lostVision)
  })
})
