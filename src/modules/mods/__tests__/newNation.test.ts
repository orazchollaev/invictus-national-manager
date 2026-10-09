import { beforeEach, describe, expect, it, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { markRaw } from "vue"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "@/engine/types"
import type { ClubRow, PlayerRow } from "@/engine/world/create"
import { SQUAD_SIZE, generateSquad } from "@/engine/players/squad"
import { NAME_POOLS } from "@/data/names"
import { useModsStore } from "../store"
import {
  MIN_SQUAD,
  MOD_FORMAT,
  MOD_VERSION,
  normalizeMod,
  nationProblem,
  type ModData,
} from "../utils/format"

// The flag pictures come from a package folder that may not be installed where the
// tests run; what matters here is that a code the game has no picture for is refused.
vi.mock("@/lib/flags", () => ({
  flagUrl: (code: string | undefined | null) =>
    code && /^[a-z-]{2,14}$/.test(code) ? "x" : undefined,
  flagCodes: () => ["gl", "es-ct", "tz-zanzibar"],
}))

const BASE = nations as NationDef[]

const catalonia = (over: Partial<NationDef> = {}): NationDef => ({
  id: "CAT",
  name: "Catalonia",
  flag: "es-ct",
  confed: "UEFA",
  subFeds: [],
  color: "#FCDD09",
  youthLevel: 60,
  points: 1500,
  nonFifa: "confederation",
  cultures: [["spanish", 100]],
  centre: [41.7, 1.8],
  ...over,
})

const taken = new Set(BASE.map((n) => n.id))

function baseMod(): ModData {
  const clubs = clubRows as ClubRow[]
  return {
    format: MOD_FORMAT,
    version: MOD_VERSION,
    id: "m1",
    name: "Test",
    author: "",
    createdAt: 1,
    updatedAt: 1,
    nations: structuredClone(BASE),
    clubs: structuredClone(clubs),
    players: structuredClone(playerRows) as unknown as Record<string, PlayerRow[]>,
  }
}

describe("nationProblem", () => {
  it("accepts a complete nation", () => {
    expect(nationProblem(catalonia(), BASE, taken)).toBeNull()
  })

  it.each([
    ["id", { id: "cat" }],
    ["id", { id: "CATA" }],
    ["taken", { id: "ESP" }],
    ["name", { name: "  " }],
    ["flag", { flag: "not a flag!" }],
    ["confed", { confed: "UEFAX" as never }],
    ["subFeds", { subFeds: ["NOPE"] }],
    ["points", { points: -1 }],
    ["points", { points: 3001 }],
    ["points", { points: Number.NaN }],
    ["youth", { youthLevel: 0 }],
    ["youth", { youthLevel: 101 }],
    ["centre", { centre: undefined }],
    ["centre", { centre: [91, 0] as [number, number] }],
    ["centre", { centre: [0, 181] as [number, number] }],
    ["centre", { centre: [Number.NaN, 0] as [number, number] }],
    ["cultures", { cultures: [] }],
    ["cultures", { cultures: [["klingon", 100]] as [string, number][] }],
    ["cultures", { cultures: [["spanish", 0]] as [string, number][] }],
  ] as const)("refuses a bad %s", (problem, over) => {
    expect(nationProblem(catalonia(over as Partial<NationDef>), BASE, taken)).toBe(problem)
  })

  it("only takes regional federations the game has", () => {
    expect(nationProblem(catalonia({ confed: "CAF", subFeds: ["COSAFA"] }), BASE, taken)).toBeNull()
  })
})

describe("generateSquad", () => {
  const squad = (def = catalonia(), seed = 5) => generateSquad(def, ["a", "b"], "2026-09-01", seed)

  it("names a full squad with three keepers", () => {
    const rows = squad()
    expect(rows).toHaveLength(SQUAD_SIZE)
    expect(rows.filter((r) => r[4] === "GK")).toHaveLength(3)
    expect(new Set(rows.map((r) => r[0])).size).toBe(SQUAD_SIZE)
  })

  it("is the same squad every time and another for another seed", () => {
    expect(squad()).toEqual(squad())
    expect(squad(catalonia(), 6)).not.toEqual(squad())
  })

  it("draws names from the chosen cultures only", () => {
    const rows = squad(catalonia({ cultures: [["japanese", 100]] }))
    const pool = NAME_POOLS.japanese
    const firsts = new Set(pool.first.split(" ").map((s) => s.replace(/_/g, " ")))
    const lasts = new Set(pool.last.split(" ").map((s) => s.replace(/_/g, " ")))
    for (const r of rows) {
      expect(firsts.has(r[1])).toBe(true)
      expect(lasts.has(r[2])).toBe(true)
    }
  })

  it("writes rows the game can read: ages 19–34, sane ability, seven traits", () => {
    for (const r of squad()) {
      const age = 2026 - Number(r[3].slice(0, 4))
      expect(age).toBeGreaterThanOrEqual(18)
      expect(age).toBeLessThanOrEqual(35)
      expect(r[7]).toBeGreaterThanOrEqual(20)
      expect(r[7]).toBeLessThanOrEqual(96)
      expect(r[8]).toBeGreaterThanOrEqual(r[7])
      const pers = r[9].split(",").map(Number)
      expect(pers).toHaveLength(7)
      for (const p of pers) expect(p >= 1 && p <= 20).toBe(true)
      expect(["a", "b"]).toContain(r[10])
    }
  })

  it("makes a stronger nation's squad stronger", () => {
    const avg = (youth: number) => {
      const rows = squad(catalonia({ youthLevel: youth }))
      return rows.reduce((s, r) => s + r[7], 0) / rows.length
    }
    expect(avg(90)).toBeGreaterThan(avg(50) + 5)
    expect(avg(50)).toBeGreaterThan(avg(10) + 5)
  })

  it("puts the better half at the first club", () => {
    const rows = squad()
    const at = (id: string) => rows.filter((r) => r[10] === id)
    expect(at("a").length).toBeGreaterThanOrEqual(SQUAD_SIZE / 2)
    const worstA = Math.min(...at("a").map((r) => r[7]))
    const bestB = Math.max(...at("b").map((r) => r[7]))
    expect(worstA).toBeGreaterThanOrEqual(bestB)
  })

  it("puts everyone at the only club when there is one", () => {
    const rows = generateSquad(catalonia(), ["only"], "2026-09-01", 1)
    expect(rows.every((r) => r[10] === "only")).toBe(true)
  })
})

describe("normalizeMod with added nations", () => {
  function withCatalonia(): ModData {
    const m = baseMod()
    const def = catalonia()
    m.nations.push(def)
    m.clubs.push(["cat-mod-1", "Barça B", "CAT", 3], ["cat-mod-2", "Girona B", "CAT", 4])
    m.players.CAT = generateSquad(def, ["cat-mod-1", "cat-mod-2"], "2026-09-01", 1)
    return m
  }

  it("keeps a complete added nation with its clubs and squad", () => {
    const out = normalizeMod(structuredClone(withCatalonia()), BASE)
    const cat = out.nations.find((n) => n.id === "CAT")
    expect(cat?.name).toBe("Catalonia")
    expect(cat?.centre).toEqual([41.7, 1.8])
    expect(out.nations).toHaveLength(BASE.length + 1)
    expect(out.clubs.filter((c) => c[2] === "CAT")).toHaveLength(2)
    expect(out.players.CAT).toHaveLength(SQUAD_SIZE)
  })

  it("drops an added nation without a club, and its players", () => {
    const m = withCatalonia()
    m.clubs = m.clubs.filter((c) => c[2] !== "CAT")
    const out = normalizeMod(m, BASE)
    expect(out.nations.some((n) => n.id === "CAT")).toBe(false)
    expect(out.players.CAT).toBeUndefined()
  })

  it("drops an added nation with too small a squad, and its clubs", () => {
    const m = withCatalonia()
    m.players.CAT = m.players.CAT.slice(0, MIN_SQUAD - 1)
    const out = normalizeMod(m, BASE)
    expect(out.nations.some((n) => n.id === "CAT")).toBe(false)
    expect(out.clubs.some((c) => c[2] === "CAT")).toBe(false)
    expect(out.players.CAT).toBeUndefined()
  })

  it("drops an added nation that is not valid, even with a club and a squad", () => {
    const m = withCatalonia()
    m.nations.find((n) => n.id === "CAT")!.centre = undefined
    expect(normalizeMod(m, BASE).nations.some((n) => n.id === "CAT")).toBe(false)
  })

  it("moves a foreign player off the books of a dropped nation's club", () => {
    const m = withCatalonia()
    m.players.CAT = []
    m.players.ESP[0][10] = "cat-mod-1"
    const out = normalizeMod(m, BASE)
    expect(out.players.ESP[0][10]).not.toBe("cat-mod-1")
    expect(out.clubs.some((c) => c[0] === out.players.ESP[0][10])).toBe(true)
  })

  it("keeps the first of two added nations that share an id", () => {
    const m = withCatalonia()
    m.nations.push(catalonia({ name: "Twin" }))
    const out = normalizeMod(m, BASE)
    expect(out.nations.filter((n) => n.id === "CAT")).toHaveLength(1)
    expect(out.nations.find((n) => n.id === "CAT")?.name).toBe("Catalonia")
  })

  it("survives an export and an import", () => {
    const once = normalizeMod(JSON.parse(JSON.stringify(withCatalonia())), BASE)
    const twice = normalizeMod(JSON.parse(JSON.stringify(once)), BASE)
    expect(twice.nations).toEqual(once.nations)
    expect(twice.clubs).toEqual(once.clubs)
    expect(twice.players.CAT).toEqual(once.players.CAT)
  })

  it("leaves a mod with no added nations exactly as it was", () => {
    const m = baseMod()
    const out = normalizeMod(structuredClone(m), BASE)
    expect(out.nations).toHaveLength(BASE.length)
    expect(out.nations.every((n) => n.centre === undefined)).toBe(true)
    expect(out.clubs).toEqual(m.clubs)
    // Bundled rows are tidied the way they always were (potential rounds up); a
    // second pass changes nothing, and no nation, club or player is lost.
    expect(normalizeMod(structuredClone(out), BASE).players).toEqual(out.players)
    for (const [id, rows] of Object.entries(m.players))
      expect(out.players[id].map((r) => r[0])).toEqual(rows.map((r) => r[0]))
  })
})

describe("the mod store", () => {
  let store: ReturnType<typeof useModsStore>
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useModsStore()
    store.mod = markRaw(baseMod())
  })

  it("adds a nation with two clubs and a squad", () => {
    expect(store.addNation(catalonia())).toBeNull()
    const m = store.mod!
    expect(m.nations.some((n) => n.id === "CAT")).toBe(true)
    const clubs = m.clubs.filter((c) => c[2] === "CAT")
    expect(clubs).toHaveLength(2)
    expect(clubs[1][3]).toBeGreaterThan(clubs[0][3])
    expect(m.players.CAT).toHaveLength(SQUAD_SIZE)
    const ids = new Set(clubs.map((c) => c[0]))
    expect(m.players.CAT.every((r) => ids.has(r[10]))).toBe(true)
    expect(store.dirty).toBe(true)
  })

  it("gives players ids no other player has", () => {
    store.addNation(catalonia())
    const all = Object.values(store.mod!.players).flat()
    expect(new Set(all.map((r) => r[0])).size).toBe(all.length)
  })

  it("refuses a nation that is not valid and leaves the mod untouched", () => {
    expect(store.addNation(catalonia({ id: "ESP" }))).toBe("taken")
    expect(store.addNation(catalonia({ centre: undefined }))).toBe("centre")
    expect(store.mod!.nations).toHaveLength(BASE.length)
    expect(store.dirty).toBe(false)
  })

  it("refuses a second nation with the same id", () => {
    store.addNation(catalonia())
    expect(store.addNation(catalonia())).toBe("taken")
  })

  it("deletes an added nation with its clubs and squad", () => {
    store.addNation(catalonia())
    expect(store.deleteNation("CAT")).toBe(true)
    const m = store.mod!
    expect(m.nations).toHaveLength(BASE.length)
    expect(m.clubs.some((c) => c[2] === "CAT")).toBe(false)
    expect(m.players.CAT).toBeUndefined()
  })

  it("sends players of other nations at its clubs back home", () => {
    store.addNation(catalonia())
    store.mod!.players.ESP[0][10] = "cat-mod-1"
    store.deleteNation("CAT")
    const club = store.mod!.clubs.find((c) => c[0] === store.mod!.players.ESP[0][10])
    expect(club?.[2]).toBe("ESP")
  })

  it("never deletes a nation of the game", () => {
    expect(store.deleteNation("ESP")).toBe(false)
    expect(store.mod!.nations).toHaveLength(BASE.length)
  })

  it("adds nothing to a running game", () => {
    store.openLive({ nations: structuredClone(BASE), clubs: [], players: {} }, "2026-09-01")
    expect(store.addNation(catalonia())).toBe("id")
  })
})
