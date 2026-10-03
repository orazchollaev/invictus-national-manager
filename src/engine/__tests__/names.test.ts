import { describe, expect, it } from "vitest"
import { fullName, shortName, surname } from "@/engine/players/ability"
import { editFromRow, rowFromEdit } from "@/modules/mods/utils/format"

describe("player names", () => {
  it("shortens a two-part name to an initial and surname", () => {
    expect(shortName({ first: "Lionel", last: "Messi" })).toBe("L. Messi")
  })

  it("shows a one-name player whole, never a bare initial", () => {
    expect(shortName({ first: "Neymar", last: "" })).toBe("Neymar")
    expect(shortName({ first: "", last: "Neymar" })).toBe("Neymar")
    expect(surname({ first: "Neymar", last: "" })).toBe("Neymar")
    expect(fullName({ first: "Neymar", last: "" })).toBe("Neymar")
  })

  it("keeps a one-name mod player's name as his surname", () => {
    const row = rowFromEdit({
      ...editFromRow("BRA", [
        "x1",
        "",
        "",
        "2000-01-01",
        "ST",
        "",
        "R",
        80,
        85,
        "10,10,10,10,10,10,10",
        "c1",
      ]),
      first: "Neymar",
      last: " ",
    })
    expect(row[1]).toBe("")
    expect(row[2]).toBe("Neymar")
  })
})
