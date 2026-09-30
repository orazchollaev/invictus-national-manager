import { describe, expect, it } from "vitest"
import { makePlayer } from "@/engine/__tests__/helpers"
import { BOND_POINTS, bondBetween, chemistryOf, type BondKind } from "@/engine/players/bonds"
import type { Player } from "@/engine/types"
import { bondLines, chemistryWith, relationsOf, signed } from "../utils/chemistry"

const p = (id: string, extra: Partial<Player> = {}) =>
  makePlayer(id, "CM", 70, { clubId: `club-${id}`, first: "Ada", last: id, ...extra })

/** A player with the given bond to `to`, found by trying ids. */
function bonded(kind: BondKind, to: Player, prefix: string): Player {
  for (let i = 0; i < 20000; i++) {
    const x = p(`${prefix}${i}`)
    if (bondBetween(x, to) === kind) return x
  }
  throw new Error(`nobody is ${kind} with ${to.id}`)
}

describe("relationsOf", () => {
  const me = p("me")
  const friend = bonded("friends", me, "fr")
  const foe = bonded("feud", me, "fo")
  const mate = p("mate", { clubId: me.clubId })
  /** Someone with no bond to `me`. */
  const stranger = (() => {
    for (let i = 0; ; i++) {
      const x = p(`st${i}`)
      if (!bondBetween(me, x)) return x
    }
  })()

  it("lists the bonds with the others, feuds first, and skips strangers", () => {
    const r = relationsOf(me, [stranger, mate, friend, foe])
    expect(r.map((x) => x.kind)).toEqual(["feud", "friends", "clubmates"])
    expect(r.map((x) => x.player.id)).toEqual([foe.id, friend.id, mate.id])
    expect(r[0].points).toBe(BOND_POINTS.feud)
    expect(r[2].points).toBe(BOND_POINTS.clubmates)
  })

  it("puts bonds of one kind in name order", () => {
    const a = p("zed", { clubId: me.clubId, last: "Zed" })
    const b = p("abe", { clubId: me.clubId, last: "Abe" })
    expect(relationsOf(me, [a, b]).map((x) => x.player.last)).toEqual(["Abe", "Zed"])
  })

  it("does not list him with himself", () => {
    expect(relationsOf(me, [me])).toEqual([])
  })
})

describe("bondLines", () => {
  it("writes one line per bond, feuds first, naming the club for club mates", () => {
    const a = p("a", { clubId: "gs", first: "Arda" })
    const b = p("b", { clubId: "gs", first: "Hakan" })
    const foe = bonded("feud", a, "x")
    const lines = bondLines([a, b, foe], (id) => (id === "gs" ? "Galatasaray" : undefined))
    const mates = lines.find((l) => l.kind === "clubmates")!
    expect(mates.text).toBe("A. a & H. b · Club mates at Galatasaray")
    expect(mates.points).toBe(BOND_POINTS.clubmates)
    const feud = lines.find((l) => l.kind === "feud")
    expect(feud?.text).toContain("Feud")
    expect(lines[0].kind).toBe("feud")
    expect(new Set(lines.map((l) => l.key)).size).toBe(lines.length)
  })

  it("has nothing to say about players with no ties", () => {
    expect(
      bondLines([p("s1"), p("s2")], () => undefined).filter((l) => l.kind === "clubmates")
    ).toEqual([])
  })
})

describe("chemistryWith", () => {
  it("is what he would get from the eleven, leaving out whoever he replaces", () => {
    const me = p("me")
    const mate = p("mate", { clubId: me.clubId })
    const other = p("other", { clubId: me.clubId })
    expect(chemistryWith(me, [mate, other])).toBeCloseTo(2 * BOND_POINTS.clubmates)
    expect(chemistryWith(me, [mate, other], mate)).toBeCloseTo(BOND_POINTS.clubmates)
    expect(chemistryWith(me, [me, mate])).toBeCloseTo(chemistryOf(me, [mate]))
  })

  it("is zero for a stranger to the eleven", () => {
    const stranger = p("zz-stranger")
    const eleven = Array.from({ length: 10 }, (_, i) => p(`e${i}`))
    expect(chemistryWith(stranger, eleven)).toBe(
      chemistryOf(
        stranger,
        eleven.filter((e) => bondBetween(stranger, e))
      )
    )
  })
})

describe("signed", () => {
  it("shows a sign, one decimal at most, and nothing for nothing", () => {
    expect(signed(0.8)).toBe("+0.8")
    expect(signed(-1)).toBe("−1")
    expect(signed(1.25)).toBe("+1.3")
    expect(signed(0)).toBe("")
    expect(signed(0.01)).toBe("")
  })
})
