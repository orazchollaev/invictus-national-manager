import { beforeAll, describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { pruneOldFixtures } from "../world/prune"
import type { World } from "../world/world"

let world: World

beforeAll(() => {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  world = createWorld(
    { seed: 5, start: "2026-09-01", managerName: "Test", nationality: "ESP", nationId: "ESP" },
    statics,
    playerRows as unknown as Record<string, PlayerRow[]>
  )
})

describe("old fixtures", () => {
  it("keeps the user's matches and recent ones, drops old finished ones", () => {
    const s = world.state
    const f = Object.values(s.fixtures)[0]
    const mine = {
      ...f,
      id: "mine",
      home: "ESP",
      away: "FRA",
      date: "2010-01-01",
      compId: "friendly",
      result: { h: 1, a: 0 },
    }
    const old = {
      ...f,
      id: "old",
      home: "BRA",
      away: "ARG",
      date: "2010-01-01",
      compId: "friendly",
      result: { h: 2, a: 2 },
    }
    const recent = { ...old, id: "recent", date: s.date }
    for (const x of [mine, old, recent]) s.fixtures[x.id] = x
    world.reindex()
    expect(pruneOldFixtures(world)).toBeGreaterThanOrEqual(1)
    expect(s.fixtures.old).toBeUndefined()
    expect(s.fixtures.mine).toBeDefined()
    expect(s.fixtures.recent).toBeDefined()
    expect(world.fixturesOf("BRA").some((x) => x.id === "old")).toBe(false)
    expect(world.fixturesOf("ESP").some((x) => x.id === "mine")).toBe(true)
  })

  it("finds a nation's fixtures in date order from the index", () => {
    const list = world.fixturesOf("ESP")
    expect(list.length).toBeGreaterThan(0)
    for (let i = 1; i < list.length; i++) expect(list[i - 1].date <= list[i].date).toBe(true)
  })
})
