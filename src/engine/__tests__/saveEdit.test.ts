import { beforeAll, describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { applyEdits, snapshotEdits } from "../world/edit"
import type { World } from "../world/world"

let world: World

beforeAll(() => {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  world = createWorld(
    { seed: 3, start: "2026-09-01", managerName: "Test", nationality: "ESP", nationId: "ESP" },
    statics,
    playerRows as unknown as Record<string, PlayerRow[]>
  )
})

describe("the save editor", () => {
  it("changes nothing when nothing was edited", () => {
    const before = JSON.stringify(world.state.players)
    const { statics } = applyEdits(world, snapshotEdits(world))
    expect(statics).toBe(false)
    expect(JSON.stringify(world.state.players)).toBe(before)
  })

  it("edits a player and keeps what the editor does not touch", () => {
    const data = snapshotEdits(world)
    const row = data.players.ESP[0]
    const p = world.state.players[row[0]]
    const caps = p.caps
    // Without his attributes the ability set by hand is the one that counts.
    row.length = 11
    row[2] = "Edited"
    row[7] = 90
    row[8] = 80
    applyEdits(world, data)
    expect(p.last).toBe("Edited")
    expect(p.ca).toBe(90)
    expect(p.pa).toBeGreaterThanOrEqual(90)
    expect(p.caps).toBe(caps)
  })

  it("never deletes, never moves a player to another nation", () => {
    const data = snapshotEdits(world)
    const count = Object.keys(world.state.players).length
    const [row] = data.players.ESP.splice(0, 1)
    data.players.FRA.push(row)
    data.clubs.pop()
    const clubs = world.clubs.size
    applyEdits(world, data)
    expect(Object.keys(world.state.players)).toHaveLength(count)
    expect(world.state.players[row[0]].nationId).toBe("ESP")
    expect(world.clubs.size).toBe(clubs)
  })

  it("clamps values and refuses an impossible age or club", () => {
    const data = snapshotEdits(world)
    const row = data.players.ESP[1]
    const p = world.state.players[row[0]]
    const { born, clubId } = p
    row[3] = "2020-01-01"
    row[7] = 500
    row[9] = "99,99,99,99,99,99,99"
    row[10] = "no-such-club"
    applyEdits(world, data)
    expect(p.born).toBe(born)
    expect(p.clubId).toBe(clubId)
    expect(p.ca).toBeLessThanOrEqual(99)
    expect(p.pers.ambition).toBe(20)
  })

  it("adds a player and a club, which the world then knows", () => {
    const data = snapshotEdits(world)
    data.clubs.push(["esp-test", "Test FC", "ESP", 9])
    data.players.ESP.push([
      "test-p",
      "New",
      "Player",
      "2005-03-01",
      "ST",
      "",
      "R",
      60,
      70,
      "10,10,10,10,10,10,10",
      "esp-test",
    ])
    const { statics } = applyEdits(world, data)
    expect(statics).toBe(true)
    expect(world.clubs.get("esp-test")?.tier).toBe(5)
    expect(world.state.players["test-p"].clubId).toBe("esp-test")
    expect(world.pool("ESP").some((p) => p.id === "test-p")).toBe(true)
  })

  it("lets points and youth level be set, but not the confederation", () => {
    const data = snapshotEdits(world)
    const n = data.nations.find((x) => x.id === "ESP")!
    n.points = 2000
    n.youthLevel = 70
    n.confed = "CAF"
    n.name = "Spain B"
    applyEdits(world, data)
    expect(world.state.nations.ESP.points).toBe(2000)
    expect(world.state.nations.ESP.youthLevel).toBe(70)
    expect(world.def("ESP").confed).toBe("UEFA")
    expect(world.def("ESP").name).toBe("Spain B")
  })
})
