import { describe, expect, it } from "vitest"
import {
  attackEdge,
  instructionsOf,
  meet,
  midEdge,
  ownEffect,
  styleOf,
  type PlayStyle,
} from "../match/matchup"
import { FORMATION_LIST } from "../match/formations"
import { advantage } from "../match/scouting"
import { teamUnits } from "../match/engine"
import type { Formation, Level, Tactics } from "../match/types"
import { playMatch } from "../match/engine"
import { archetypesFor } from "../players/archetypes"
import type { Position } from "../types"
import { playMany, setupOf, sideOf, stateOf } from "./helpers"

const first = (pos: Position) => archetypesFor(pos)[0]
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const LEVELS: Level[] = [0, 1, 2]

const tactics = (formation: Formation, extra: Partial<Tactics> = {}): Tactics => ({
  formation,
  mentality: 0,
  pressing: 1,
  tempo: 1,
  ...extra,
})

const style = (extra: Partial<PlayStyle> = {}): PlayStyle => ({
  ...styleOf(tactics("4-2-3-1")),
  ...extra,
})

describe("play style", () => {
  it("defaults the instructions old saves do not have", () => {
    expect(instructionsOf({})).toEqual({ line: 1, width: 1, counter: false })
    expect(instructionsOf({ line: 2, counter: true })).toEqual({ line: 2, width: 1, counter: true })
  })

  it("reads the shape from the formation", () => {
    expect(styleOf(tactics("4-2-3-1"))).toMatchObject({ cbs: 2, strikers: 1, centre: 3 })
    expect(styleOf(tactics("3-5-2"))).toMatchObject({ cbs: 3, strikers: 2, centre: 3 })
    expect(styleOf(tactics("4-4-2"))).toMatchObject({ cbs: 2, strikers: 2, centre: 2 })
  })

  it("reads tempo and pressing from the tactics", () => {
    expect(styleOf(tactics("4-4-2", { tempo: 2, pressing: 0 }))).toMatchObject({
      tempo: 2,
      press: 0,
    })
  })
})

describe("what an instruction costs and buys", () => {
  it("does nothing at the standard settings", () => {
    expect(ownEffect(style())).toEqual({ def: 1, mid: 1, att: 1 })
  })

  it("trades defence for midfield with a high line, and back with a deep one", () => {
    const high = ownEffect(style({ line: 2 }))
    const deep = ownEffect(style({ line: 0 }))
    expect(high.def).toBeLessThan(1)
    expect(high.mid).toBeGreaterThan(1)
    expect(deep.def).toBeGreaterThan(1)
    expect(deep.mid).toBeLessThan(1)
  })

  it("trades midfield for attack with width, and back with narrowness", () => {
    const wide = ownEffect(style({ width: 2 }))
    const narrow = ownEffect(style({ width: 0 }))
    expect(wide.att).toBeGreaterThan(1)
    expect(wide.mid).toBeLessThan(1)
    expect(narrow.att).toBeLessThan(1)
    expect(narrow.mid).toBeGreaterThan(1)
  })

  it("gives up the ball when counter-attacking", () => {
    expect(ownEffect(style({ counter: true })).mid).toBeLessThan(1)
  })
})

describe("matchups", () => {
  const cases: [string, Partial<PlayStyle>, Partial<PlayStyle>, number][] = [
    ["counter against a high line", { counter: true }, { line: 2 }, 1.05],
    ["a direct side against a high line", { tempo: 2 }, { line: 2 }, 1.05],
    ["counter against a deep block", { counter: true }, { line: 0 }, 0.96],
    ["width against a back five", { width: 2 }, { cbs: 3 }, 0.96],
    ["width against a narrow flat four", { width: 2 }, { cbs: 2, width: 0 }, 1.04],
    [
      "width against a flat four with nobody on its flanks",
      { width: 2 },
      { cbs: 2, wingers: 0 },
      1.04,
    ],
    ["patience against a high press", { tempo: 0 }, { press: 2 }, 0.96],
    ["directness against a high press", { tempo: 2 }, { press: 2 }, 1.04],
    ["a lone striker against three centre-backs", { strikers: 1 }, { cbs: 3 }, 0.96],
    ["two strikers against a flat four", { strikers: 2 }, { cbs: 2 }, 1.03],
  ]

  it.each(cases)("%s", (_name, a, d, factor) => {
    // A neutral opponent and attacker elsewhere, so only this rule fires.
    const neutralA = style({ strikers: 0, cbs: 0, tempo: 1, press: 1, counter: false, line: 1 })
    const neutralD = style({ strikers: 0, cbs: 1, tempo: 1, press: 1, counter: false, line: 1 })
    expect(attackEdge({ ...neutralA, ...a }, { ...neutralD, ...d })).toBeCloseTo(factor)
  })

  it("lets the side with more through the middle win the midfield", () => {
    expect(midEdge(style({ centre: 4 }), style({ centre: 3 }))).toBeGreaterThan(1)
    expect(midEdge(style({ centre: 2 }), style({ centre: 3 }))).toBeLessThan(1)
    expect(midEdge(style({ centre: 3 }), style({ centre: 3 }))).toBe(1)
  })

  it("lets a pressing side win the ball off a patient one", () => {
    expect(midEdge(style({ press: 2 }), style({ tempo: 0 }))).toBeGreaterThan(1)
  })

  it("keeps two neutral sides level", () => {
    const n = styleOf(tactics("4-2-3-1"))
    expect(meet(n, n)).toEqual({ def: 1, mid: 1, att: 1 })
  })

  it("never swings a unit more than 15% either way", () => {
    for (const fa of FORMATION_LIST)
      for (const fb of FORMATION_LIST)
        for (const line of LEVELS)
          for (const width of LEVELS)
            for (const counter of [false, true])
              for (const tempo of LEVELS)
                for (const press of LEVELS) {
                  const a = styleOf(tactics(fa, { line, width, counter, tempo, pressing: press }))
                  const b = styleOf(tactics(fb, { line: 2, width: 2, counter: true, tempo: 2 }))
                  for (const v of Object.values(meet(a, b))) {
                    expect(v).toBeGreaterThan(0.85)
                    expect(v).toBeLessThan(1.15)
                  }
                }
  })
})

describe("no way of playing is unbeatable", () => {
  const styles: PlayStyle[] = []
  for (const f of FORMATION_LIST)
    for (const line of LEVELS)
      for (const width of LEVELS)
        for (const counter of [false, true])
          for (const tempo of LEVELS)
            for (const pressing of LEVELS)
              styles.push(styleOf(tactics(f, { line, width, counter, tempo, pressing })))

  it("has something that beats every style, and something almost every style beats", () => {
    let beatsNothing = 0
    for (const a of styles) {
      const results = styles.map((b) => advantage(a, b))
      expect(Math.min(...results)).toBeLessThan(-0.005)
      if (Math.max(...results) <= 0) beatsNothing++
    }
    // A few plain styles only ever draw; none should be a trap.
    expect(beatsNothing / styles.length).toBeLessThan(0.01)
  })

  it("is fair: swapping the sides flips the advantage", () => {
    const a = styles[123]
    const b = styles[456]
    expect(advantage(a, b)).toBeCloseTo(-advantage(b, a))
  })
})

describe("instructions in the match engine", () => {
  it("lets a counter-attacking side hit a high line harder than a standard one", () => {
    const att = (line: Level) =>
      teamUnits(
        stateOf(
          sideOf("h", first, { tactics: { counter: true } }),
          sideOf("a", first, { tactics: { line } })
        ),
        "home"
      ).att
    expect(att(2)).toBeGreaterThan(att(1))
    expect(att(0)).toBeLessThan(att(1))
  })

  it("treats a save without the new instructions as standard ones", () => {
    const old = playMatch(setupOf(sideOf("h", first), sideOf("a", first), 7))
    const explicit = playMatch(
      setupOf(
        sideOf("h", first, { tactics: { line: 1, width: 1, counter: false } }),
        sideOf("a", first, { tactics: { line: 1, width: 1, counter: false } }),
        7
      )
    )
    expect(explicit).toEqual(old)
  })

  it("keeps each instruction close to standard over many matches", () => {
    const settings: Partial<Tactics>[] = [
      { line: 0 },
      { line: 2 },
      { width: 0 },
      { width: 2 },
      { counter: true },
    ]
    for (const t of settings) {
      const reports = playMany(sideOf("h", first, { tactics: t }), sideOf("a", first), 300)
      const f = sum(reports.map((r) => r.stats[0].xg))
      const against = sum(reports.map((r) => r.stats[1].xg))
      expect(Math.abs((f - against) / (f + against)), JSON.stringify(t)).toBeLessThan(0.1)
    }
  })

  it("changes mid-match when the manager changes the instruction", () => {
    const state = stateOf(sideOf("h", first), sideOf("a", first))
    const before = teamUnits(state, "home")
    state.home.tactics.line = 2
    const after = teamUnits(state, "home")
    expect(after.def).toBeLessThan(before.def)
    expect(after.mid).toBeGreaterThan(before.mid)
  })
})
