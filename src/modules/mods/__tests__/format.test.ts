import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import type { NationDef } from "@/engine/types"
import { attrsToCsv, deriveAttrs } from "@/engine/players/attributes"
import { playersFromRows, type PlayerRow } from "@/engine/world/create"
import {
  MOD_FORMAT,
  MOD_VERSION,
  ModError,
  ageOn,
  editFromRow,
  normalizeMod,
  rankings,
  rowFromEdit,
  type ModData,
} from "../utils/format"

const BASE = nations as NationDef[]

const row: PlayerRow = [
  "esp0",
  "Lamine",
  "Yamel",
  "2007-07-13",
  "RW",
  "LW",
  "L",
  94.1,
  96,
  "11,7,11,12,13,11,10",
  "esp-1-1",
]

function mod(over: Partial<ModData> = {}): ModData {
  return {
    format: MOD_FORMAT,
    version: MOD_VERSION,
    id: "m1",
    name: "Test",
    author: "",
    createdAt: 1,
    updatedAt: 1,
    nations: structuredClone(BASE),
    clubs: [
      ["esp-1-1", "Barcelona", "ESP", 1],
      ["esp-5-0", "Mirandés", "ESP", 5],
    ],
    players: { ESP: [structuredClone(row)] },
    ...over,
  }
}

describe("player rows", () => {
  it("survive a round trip through the editor", () => {
    expect(rowFromEdit(editFromRow("ESP", row))).toEqual(row)
  })

  it("are clamped: ability 1–99, potential never below ability, traits 1–20", () => {
    const p = editFromRow("ESP", row)
    p.ca = 140
    p.pa = 50
    p.pers = [0, 30, 10, 10, 10, 10, 10]
    p.alt = ["RW", "ST"]
    const r = rowFromEdit(p)
    expect(r[7]).toBe(99)
    expect(r[8]).toBe(99)
    expect(r[9]).toBe("1,20,10,10,10,10,10")
    expect(r[5]).toBe("ST")
  })

  it("ages on a date", () => {
    expect(ageOn("2007-07-13", "2026-09-01")).toBe(19)
    expect(ageOn("2007-09-02", "2026-09-01")).toBe(18)
  })

  it("carry the face features edited by hand as a twelfth column, and only then", () => {
    const p = editFromRow("ESP", row)
    expect(p.face).toBeUndefined()
    p.face = { hair: "afro", hairColor: "#1C1008", eye: "eye7", fatness: 0.4 }
    const r = rowFromEdit(p)
    expect(r).toHaveLength(12)
    expect(r[11]).toEqual({ hair: "afro", hairColor: "#1c1008", eye: "eye7", fatness: 0.4 })
    expect(editFromRow("ESP", r).face).toEqual(r[11])
    p.face = {}
    expect(rowFromEdit(p)).toHaveLength(11)
  })

  it("drop face edits the game does not know", () => {
    const p = editFromRow("ESP", row)
    p.face = { hair: "no-such-hair", skin: "red", fatness: 7, nose: "female1", mouth: "smile" }
    expect(rowFromEdit(p)[11]).toEqual({ fatness: 1, mouth: "smile" })
  })

  it("carry attributes set by hand as a thirteenth column, and his ability follows them", () => {
    const p = editFromRow("ESP", row)
    expect(p.attrs).toBeUndefined()
    p.attrs = deriveAttrs({ id: p.id, pos: p.pos, ca: 60 })
    const r = rowFromEdit(p)
    expect(r).toHaveLength(13)
    expect(r[12]).toBe(attrsToCsv(p.attrs, p.pos))
    expect(Math.abs((r[7] as number) - 60)).toBeLessThan(0.6)
    expect(editFromRow("ESP", r).attrs).toEqual(p.attrs)
  })

  it("ignore attributes that do not fit the position", () => {
    const r = [...row, {}, "50,50,50"] as unknown as PlayerRow
    expect(editFromRow("ESP", r).attrs).toBeUndefined()
    expect(playersFromRows({ ESP: [r] }, new Map(), 1)[0].attrs).toEqual(
      deriveAttrs({ id: "esp0", pos: "RW", ca: 94.1 })
    )
  })

  it("reach the players of a new world", () => {
    const clubs = new Map([["esp-1-1", { id: "esp-1-1", name: "B", nationId: "ESP", tier: 1 }]])
    const withFace = [...row.slice(0, 11), { hair: "afro" }] as unknown as PlayerRow
    const [a, b] = playersFromRows(
      { ESP: [withFace, ["esp1", ...row.slice(1)] as PlayerRow] },
      clubs,
      1
    )
    expect(a.face).toEqual({ hair: "afro" })
    expect(b.face).toBeUndefined()
  })
})

describe("normalizeMod", () => {
  it("rejects what is not a mod", () => {
    expect(() => normalizeMod(null, BASE)).toThrow(ModError)
    expect(() => normalizeMod({ format: "other" }, BASE)).toThrow(ModError)
    expect(() => normalizeMod({ ...mod(), clubs: [] }, BASE)).toThrow(ModError)
  })

  it("keeps a valid mod as it is", () => {
    const m = mod()
    const out = normalizeMod(structuredClone(m), BASE)
    expect(out.players).toEqual(m.players)
    expect(out.clubs).toEqual(m.clubs)
    expect(out.nations.map((n) => n.id)).toEqual(BASE.map((n) => n.id))
  })

  it("drops nations the game does not know and fills the ones missing", () => {
    const m = mod()
    m.nations = [
      { ...BASE[0], name: "Renamed", points: 99999 },
      { ...BASE[1], id: "XXX" },
    ]
    const out = normalizeMod(m, BASE)
    expect(out.nations).toHaveLength(BASE.length)
    expect(out.nations[0].name).toBe("Renamed")
    expect(out.nations[0].points).toBe(3000)
    expect(out.nations.some((n) => n.id === "XXX")).toBe(false)
  })

  it("moves a player at a club that does not exist to one in his country", () => {
    const m = mod()
    m.players.ESP[0][10] = "nowhere"
    m.players.ESP.push(structuredClone(row))
    m.players.XXX = [structuredClone(row)]
    const out = normalizeMod(m, BASE)
    expect(out.players.ESP).toHaveLength(1)
    expect(out.players.ESP[0][10]).toBe("esp-5-0")
    expect(out.players.XXX).toBeUndefined()
  })
})

describe("rankings", () => {
  it("orders FIFA members by points and leaves the rest out", () => {
    const list = structuredClone(BASE)
    const last = list.filter((n) => !n.nonFifa).at(-1)!
    last.points = 5000
    const ranks = rankings(list)
    expect(ranks.get(last.id)).toBe(1)
    for (const n of list.filter((x) => x.nonFifa)) expect(ranks.has(n.id)).toBe(false)
  })
})
