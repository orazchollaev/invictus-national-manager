import { describe, expect, it } from "vitest"
import { FORMATIONS } from "@/engine/match/formations"
import type { SheetSlot } from "@/engine/match/types"
import { carryFormation, placePlayer } from "../utils/lineup"

const f442 = FORMATIONS["4-4-2"]
const f532 = FORMATIONS["5-3-2"]

function empty(positions = f442): SheetSlot[] {
  return positions.map((pos) => ({ playerId: "", pos }))
}

describe("carryFormation", () => {
  it("keeps players, one entry per slot", () => {
    const xi = empty()
    xi[f442.indexOf("ST")] = { playerId: "a", pos: "ST" }
    const out = carryFormation(xi, FORMATIONS["4-3-3"])
    expect(out).toHaveLength(11)
    expect(out[FORMATIONS["4-3-3"].indexOf("ST")]).toEqual({ playerId: "a", pos: "ST" })
  })

  it("gives each slot the position of the new shape", () => {
    const xi = empty()
    xi[4] = { playerId: "a", pos: "LB" }
    const out = carryFormation(xi, f532)
    expect(out[4].pos).toBe("CB")
    expect(out[4].playerId).toBe("a")
  })

  it("pads a short eleven with empty slots", () => {
    const out = carryFormation([], f442)
    expect(out).toHaveLength(11)
    expect(out.every((s) => s.playerId === "")).toBe(true)
  })
})

describe("placePlayer", () => {
  it("puts a player in a slot", () => {
    const out = placePlayer(empty(), f442, 9, "a")
    expect(out[9]).toEqual({ playerId: "a", pos: "ST" })
  })

  it("replaces whoever was there", () => {
    let xi = placePlayer(empty(), f442, 9, "a")
    xi = placePlayer(xi, f442, 9, "b")
    expect(xi[9]).toEqual({ playerId: "b", pos: "ST" })
  })

  it("swaps two players who are both in the eleven", () => {
    let xi = placePlayer(empty(), f442, 9, "a")
    xi = placePlayer(xi, f442, 10, "b")
    xi = placePlayer(xi, f442, 10, "a")
    expect(xi[10].playerId).toBe("a")
    expect(xi[9].playerId).toBe("b")
  })

  it("puts the same player in the same slot again", () => {
    let xi = placePlayer(empty(), f442, 9, "a")
    xi = placePlayer(xi, f442, 9, "a")
    expect(xi[9].playerId).toBe("a")
  })

  it("never changes the input", () => {
    const xi = empty()
    placePlayer(xi, f442, 9, "a")
    expect(xi.every((s) => s.playerId === "")).toBe(true)
  })
})
