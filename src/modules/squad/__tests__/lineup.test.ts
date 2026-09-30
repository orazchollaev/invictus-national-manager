import { describe, expect, it } from "vitest"
import { playerWith } from "@/engine/__tests__/helpers"
import { FORMATIONS } from "@/engine/match/formations"
import type { SheetSlot } from "@/engine/match/types"
import type { Player } from "@/engine/types"
import { carryFormation, placePlayer, roleChoices, roleFor, setSlotRole } from "../utils/lineup"

const poacher = playerWith("p", "ST", "poacher")
const targetMan = playerWith("t", "ST", "target-man")
const stopper = playerWith("s", "CB", "stopper")
const players = new Map<string, Player>([poacher, targetMan, stopper].map((p) => [p.id, p]))
const lookup = (id: string) => players.get(id)

const f442 = FORMATIONS["4-4-2"]
const f532 = FORMATIONS["5-3-2"]

function empty(positions = f442): SheetSlot[] {
  return positions.map((pos) => ({ playerId: "", pos }))
}

describe("roleFor", () => {
  it("gives a player the role that suits his style, and none in a slot with no such role", () => {
    expect(roleFor(poacher, "ST")).toBe("poacher")
    expect(roleFor(stopper, "CB")).toBe("stopper")
    expect(roleFor(poacher, "CB")).toBeUndefined()
    expect(roleFor(undefined, "ST")).toBeUndefined()
  })
})

describe("carryFormation", () => {
  it("keeps players and valid roles, one entry per slot", () => {
    const xi = empty()
    const st = f442.indexOf("ST")
    xi[st] = { playerId: poacher.id, pos: "ST", role: "poacher" }
    const out = carryFormation(xi, FORMATIONS["4-3-3"])
    expect(out).toHaveLength(11)
    expect(out[FORMATIONS["4-3-3"].indexOf("ST")]).toMatchObject({ pos: "ST" })
  })

  it("drops a role the new slot cannot ask for", () => {
    const xi = empty()
    xi[9] = { playerId: poacher.id, pos: "ST", role: "poacher" }
    // In 5-3-2 slot 9 is still a striker, slot 4 (index of a centre-back) is not.
    xi[4] = { playerId: poacher.id, pos: "LB", role: "wing-back" }
    const out = carryFormation(xi, f532)
    expect(out[9].role).toBe("poacher")
    expect(out[4].pos).toBe("CB")
    expect(out[4].role).toBeUndefined()
  })

  it("pads a short eleven with empty slots", () => {
    const out = carryFormation([], f442)
    expect(out).toHaveLength(11)
    expect(out.every((s) => s.playerId === "")).toBe(true)
  })
})

describe("placePlayer", () => {
  it("puts a player in a slot with the role that suits him", () => {
    const out = placePlayer(empty(), f442, 9, poacher.id, lookup)
    expect(out[9]).toEqual({ playerId: poacher.id, pos: "ST", role: "poacher" })
  })

  it("replaces whoever was there, and his role with the newcomer's", () => {
    let xi = placePlayer(empty(), f442, 9, poacher.id, lookup)
    xi = placePlayer(xi, f442, 9, targetMan.id, lookup)
    expect(xi[9]).toEqual({ playerId: targetMan.id, pos: "ST", role: "target-man" })
  })

  it("swaps two players who are both in the eleven, each with his own role", () => {
    let xi = placePlayer(empty(), f442, 9, poacher.id, lookup)
    xi = placePlayer(xi, f442, 10, targetMan.id, lookup)
    xi = placePlayer(xi, f442, 10, poacher.id, lookup)
    expect(xi[10]).toMatchObject({ playerId: poacher.id, role: "poacher" })
    expect(xi[9]).toMatchObject({ playerId: targetMan.id, role: "target-man" })
  })

  it("puts the same player in the same slot again without losing a role the manager chose", () => {
    let xi = placePlayer(empty(), f442, 9, poacher.id, lookup)
    xi = setSlotRole(xi, f442, 9, "pressing-forward")
    xi = placePlayer(xi, f442, 9, poacher.id, lookup)
    expect(xi[9].playerId).toBe(poacher.id)
  })

  it("leaves a player with no role when none suits him in that slot", () => {
    const out = placePlayer(empty(), f442, 1, poacher.id, lookup)
    expect(out[1].role).toBeUndefined()
  })

  it("never changes the input", () => {
    const xi = empty()
    placePlayer(xi, f442, 9, poacher.id, lookup)
    expect(xi.every((s) => s.playerId === "")).toBe(true)
  })
})

describe("setSlotRole", () => {
  it("sets a role the slot can ask for and clears it with none", () => {
    let xi = placePlayer(empty(), f442, 9, poacher.id, lookup)
    xi = setSlotRole(xi, f442, 9, "target-man")
    expect(xi[9].role).toBe("target-man")
    xi = setSlotRole(xi, f442, 9, undefined)
    expect(xi[9].role).toBeUndefined()
  })

  it("refuses a role the slot cannot ask for", () => {
    const xi = setSlotRole(empty(), f442, 9, "wing-back")
    expect(xi[9].role).toBeUndefined()
  })

  it("can set a role on an empty slot", () => {
    const xi = setSlotRole(empty(), f442, 9, "poacher")
    expect(xi[9]).toEqual({ playerId: "", pos: "ST", role: "poacher" })
  })
})

describe("roleChoices", () => {
  it("lists the roles of the slot, marking those that suit the player", () => {
    const c = roleChoices("ST", poacher, undefined)
    expect(c.options.map((o) => o.id)).toContain("poacher")
    expect(c.options.find((o) => o.id === "poacher")!.suits).toBe(true)
    expect(c.options.find((o) => o.id === "target-man")!.suits).toBe(false)
    expect(c.style).toBe("Poacher")
    expect(c.suited).toBe(false)
  })

  it("says when the chosen role suits him", () => {
    const c = roleChoices("ST", poacher, "poacher")
    expect(c.suited).toBe(true)
    expect(c.blurb).toContain("box")
  })

  it("says nothing about style when the slot is empty", () => {
    const c = roleChoices("ST", undefined, "poacher")
    expect(c.style).toBeNull()
    expect(c.suited).toBe(false)
    expect(c.options.every((o) => !o.suits)).toBe(true)
  })

  it("describes the plain position when no role is chosen", () => {
    expect(roleChoices("CB", stopper, undefined).blurb).toMatch(/plain/i)
  })
})
