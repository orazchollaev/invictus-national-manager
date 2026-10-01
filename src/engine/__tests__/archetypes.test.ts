import { describe, expect, it } from "vitest"
import { resolveText as say } from "@/i18n/text"
import {
  ARCHETYPES,
  TIRES_EARLY_AGE,
  archetypeOf,
  archetypesFor,
  badgesOf,
  type Archetype,
} from "../players/archetypes"
import { POSITIONS, type Player, type Position } from "../types"
import { teamUnits } from "../match/engine"
import { makePlayer, playMany, sideOf as side, stateOf } from "./helpers"

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const first = (pos: Position) => archetypesFor(pos)[0]

describe("archetypes", () => {
  it("gives every position at least two to choose from", () => {
    for (const pos of POSITIONS) expect(archetypesFor(pos).length).toBeGreaterThanOrEqual(2)
  })

  it("lists every archetype under each position it belongs to", () => {
    for (const [id, d] of Object.entries(ARCHETYPES))
      for (const pos of d.positions) expect(archetypesFor(pos)).toContain(id)
  })

  it("gives a player the same archetype every time, always one of his position", () => {
    for (const pos of POSITIONS)
      for (let n = 0; n < 50; n++) {
        const a = archetypeOf({ id: `p${n}`, pos })
        expect(a).toBe(archetypeOf({ id: `p${n}`, pos }))
        expect(archetypesFor(pos)).toContain(a)
      }
  })

  it("does not depend on ability, form or age", () => {
    const young = makePlayer("x1", "ST", 50, { born: "2008-01-01", form: -5 })
    const old = { ...young, ca: 90, born: "1990-01-01", form: 5 }
    expect(archetypeOf(young)).toBe(archetypeOf(old))
  })

  it("uses every archetype across a big pool, the rare one least", () => {
    const counts = new Map<Archetype, number>()
    for (const pos of POSITIONS)
      for (let n = 0; n < 2000; n++) {
        const a = archetypeOf({ id: `id${n}`, pos })
        counts.set(a, (counts.get(a) ?? 0) + 1)
      }
    for (const id of Object.keys(ARCHETYPES) as Archetype[])
      expect(counts.get(id)).toBeGreaterThan(0)
    expect(counts.get("complete-forward")!).toBeLessThan(counts.get("poacher")! * 0.7)
  })

  it("keeps every effect within a band, so no type is a cheat", () => {
    for (const d of Object.values(ARCHETYPES)) {
      for (const u of d.unit) {
        expect(u).toBeGreaterThanOrEqual(0.75)
        expect(u).toBeLessThanOrEqual(1.25)
      }
      for (const f of [d.score, d.header, d.tackle, d.foul]) {
        expect(f).toBeGreaterThanOrEqual(0.5)
        expect(f).toBeLessThanOrEqual(1.5)
      }
      expect(Math.abs(d.finish)).toBeLessThanOrEqual(2)
      expect(Math.abs(d.keeper)).toBeLessThanOrEqual(2)
    }
  })
})

describe("badges", () => {
  const base = makePlayer("b", "CM", 70)
  const ids = (p: Player) => badgesOf(p, "2026-09-24").map((b) => b.id)
  const withPers = (pers: Partial<Player["pers"]>) => ({ ...base, pers: { ...base.pers, ...pers } })

  it("gives nothing to an ordinary player", () => {
    expect(badgesOf(base, "2026-09-24")).toEqual([])
  })

  it("reads character at its thresholds", () => {
    expect(ids(withPers({ bigMatch: 16 }))).toEqual(["big-game"])
    expect(ids(withPers({ bigMatch: 15 }))).toEqual([])
    expect(ids(withPers({ consistency: 16 }))).toEqual(["reliable"])
    expect(ids(withPers({ consistency: 5 }))).toEqual(["erratic"])
    expect(ids(withPers({ consistency: 6 }))).toEqual([])
    expect(ids(withPers({ injuryProne: 15 }))).toEqual(["injury-prone"])
    expect(ids(withPers({ injuryProne: 14 }))).toEqual([])
  })

  it("marks the age from which the engine tires a player faster", () => {
    const born = (age: number) => `${2026 - age}-01-01`
    expect(ids({ ...base, born: born(TIRES_EARLY_AGE) })).toEqual(["tires-early"])
    expect(ids({ ...base, born: born(TIRES_EARLY_AGE - 1) })).toEqual([])
  })

  it("explains each one", () => {
    const all = badgesOf(
      { ...withPers({ bigMatch: 18, consistency: 18, injuryProne: 18 }), born: "1990-01-01" },
      "2026-09-24"
    )
    expect(all.length).toBe(4)
    for (const b of all) {
      expect(say(b.label).length).toBeGreaterThan(0)
      expect(say(b.text).length).toBeGreaterThan(10)
    }
  })
})

describe("archetypes in the match engine", () => {
  it("lets a poacher take more shots than a target man of the same ability", () => {
    const shots = (striker: Archetype) => {
      const home = side("h", (pos) => (pos === "ST" ? striker : first(pos)))
      const st = home.sheet.xi.find((s) => s.pos === "ST")!.playerId
      const reports = playMany(home, side("a", first), 300)
      return sum(reports.map((r) => r.lines.find((l) => l.playerId === st)?.shots ?? 0))
    }
    expect(shots("poacher")).toBeGreaterThan(shots("target-man") * 1.05)
  })

  it("rates a shot-stopper's gloves above a sweeper-keeper's, and the sweeper's defence above his", () => {
    const at = (keeper: Archetype) => {
      const home = side("h", (pos) => (pos === "GK" ? keeper : first(pos)))
      return teamUnits(stateOf(home, side("a", first)), "home")
    }
    const stopper = at("shot-stopper")
    const sweeper = at("sweeper-keeper")
    expect(stopper.gk).toBeGreaterThan(sweeper.gk)
    expect(sweeper.def).toBeGreaterThan(stopper.def)
  })

  it("gives an outfielder standing in goal no keeper style", () => {
    const home = side("h", (pos) => (pos === "ST" ? "poacher" : first(pos)))
    const state = stateOf(home, side("a", first))
    const st = state.home.pitch.find((p) => p.slot === "ST")!
    state.home.pitch.find((p) => p.slot === "GK")!.slot = "CB"
    st.slot = "GK"
    st.arch = "poacher"
    const asPoacher = teamUnits(state, "home")
    st.arch = "target-man"
    const asTarget = teamUnits(state, "home")
    expect(asTarget).toEqual(asPoacher)
  })

  it("puts attack-minded types further forward than cautious ones", () => {
    const bold = teamUnits(
      stateOf(
        side("h", (pos) => BOLD[pos] ?? first(pos)),
        side("a", first)
      ),
      "home"
    )
    const careful = teamUnits(
      stateOf(
        side("h", (pos) => CAREFUL[pos] ?? first(pos)),
        side("a", first)
      ),
      "home"
    )
    expect(bold.att).toBeGreaterThan(careful.att)
    expect(careful.def).toBeGreaterThan(bold.def)
  })

  it("lets a side of attack-minded types out-shoot one of cautious types", () => {
    const bold = side("h", (pos) => BOLD[pos] ?? first(pos))
    const careful = side("a", (pos) => CAREFUL[pos] ?? first(pos))
    const reports = playMany(bold, careful, 400)
    expect(sum(reports.map((r) => r.stats[0].xg))).toBeGreaterThan(
      sum(reports.map((r) => r.stats[1].xg)) * 1.05
    )
  })

  it("keeps a mixed side level with another mixed side of the same ability", () => {
    const reports = playMany(
      side("h", first),
      side("a", (pos) => archetypesFor(pos).at(-1)!),
      400
    )
    const home = sum(reports.map((r) => r.result.home))
    const away = sum(reports.map((r) => r.result.away))
    expect(Math.abs(home - away) / (home + away)).toBeLessThan(0.15)
  })
})

const BOLD: Partial<Record<Position, Archetype>> = {
  GK: "sweeper-keeper",
  CB: "ball-playing-defender",
  LB: "attacking-full-back",
  RB: "attacking-full-back",
  DM: "deep-playmaker",
  LW: "inside-forward",
  RW: "inside-forward",
  AM: "shadow-striker",
  ST: "poacher",
}

const CAREFUL: Partial<Record<Position, Archetype>> = {
  GK: "shot-stopper",
  CB: "stopper",
  LB: "defensive-full-back",
  RB: "defensive-full-back",
  DM: "ball-winner",
  LW: "winger",
  RW: "winger",
  AM: "creator",
  ST: "target-man",
}
