import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { citiesOf, stadiumLevel } from "../world/stadiums"

/** A dataset edited the way the mod editor edits one. */
function moddedData() {
  const defs = structuredClone(nations) as NationDef[]
  const tur = defs.find((n) => n.id === "TUR")!
  tur.name = "Türkiye"
  tur.points = 2100
  tur.grounds = [
    { city: "Istanbul", name: "Grand Arena", capacity: 92000 },
    { city: "Ankara", name: "Capital Ground", capacity: 45000 },
  ]
  tur.cities = ["Trabzon", "Izmir"]
  const kaz = defs.find((n) => n.id === "KAZ")!
  kaz.confed = "AFC"

  const clubs = structuredClone(clubRows) as ClubRow[]
  clubs.push(["tur-mod-1", "Bosphorus FC", "TUR", 1])

  const players = structuredClone(playerRows) as unknown as Record<string, PlayerRow[]>
  const star = players.TUR[0]
  star[1] = "Edited"
  star[7] = 97.5
  star[10] = "tur-mod-1"
  players.TUR.push([
    "mod-p1",
    "New",
    "Player",
    "2004-05-05",
    "ST",
    "",
    "R",
    80,
    90,
    "10,10,10,10,10,10,10",
    "tur-mod-1",
  ])
  return { defs, clubs, players, starId: star[0] }
}

describe("a world built from a mod", () => {
  const { defs, clubs, players, starId } = moddedData()
  const w = createWorld(
    { seed: 11, start: "2026-09-01", managerName: "M", nationality: "TUR", nationId: "TUR" },
    { nations: defs, clubs: clubsFromRows(clubs) },
    players
  )

  it("uses the edited nations, grounds and towns", () => {
    const tur = w.state.nations.TUR
    expect(w.def("TUR").name).toBe("Türkiye")
    expect(tur.points).toBe(2100)
    expect(tur.stadiums?.map((s) => s.name)).toEqual(["Grand Arena", "Capital Ground"])
    expect(tur.stadium).toBe(stadiumLevel(tur.stadiums!))
    expect(citiesOf(tur)).toEqual(["Istanbul", "Ankara", "Trabzon", "Izmir"])
  })

  it("leaves nations the mod did not touch as they were", () => {
    const esp = w.state.nations.ESP
    expect(esp.cities).toBeUndefined()
    expect(esp.stadiums?.[0]?.name).toBe("Santiago Bernabéu")
  })

  it("uses the edited players and clubs", () => {
    const star = w.player(starId)
    expect(star.first).toBe("Edited")
    expect(star.ca).toBe(97.5)
    expect(w.clubs.get(star.clubId)?.name).toBe("Bosphorus FC")
    expect(w.player("mod-p1").nationId).toBe("TUR")
  })

  it("plays on through the autumn windows", () => {
    w.state.career.nationId = null
    while (w.state.date < "2026-12-01") w.nextDay()
    expect(Object.values(w.state.fixtures).some((f) => f.home === "TUR" || f.away === "TUR")).toBe(
      true
    )
  })
})
