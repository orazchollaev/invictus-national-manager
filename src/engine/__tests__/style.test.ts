import { describe, expect, it } from "vitest"
import { resolveText as say } from "@/i18n/text"
import { NEUTRAL, TIRES_EARLY_AGE, badgesOf, playerStyle } from "../players/style"
import { deriveAttrs } from "../players/attributes"
import { POSITIONS, type Player, type Position } from "../types"
import { teamUnits } from "../match/engine"
import { LEANS, makePlayer, playMany, sideOf as side, stateOf, type Lean } from "./helpers"

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

describe("player style", () => {
  it("keeps every effect within a band and the average player neutral", () => {
    let score = 0
    let finish = 0
    let n = 0
    for (const pos of POSITIONS)
      for (let i = 0; i < 300; i++) {
        const p = { id: `s${i}`, pos, ca: 40 + (i % 50), attrs: undefined as Player["attrs"] }
        p.attrs = deriveAttrs(p)
        const s = playerStyle(p)
        for (const u of s.unit) {
          expect(u).toBeGreaterThanOrEqual(0.9)
          expect(u).toBeLessThanOrEqual(1.1)
        }
        for (const f of [s.score, s.header, s.tackle, s.foul, s.assist]) {
          expect(f).toBeGreaterThanOrEqual(0.6)
          expect(f).toBeLessThanOrEqual(1.6)
        }
        expect(s.speed).toBeGreaterThanOrEqual(0.8)
        expect(s.speed).toBeLessThanOrEqual(1.2)
        if (pos !== "GK") {
          score += s.score
          finish += s.finish
          n++
        }
      }
    expect(Math.abs(score / n - 1)).toBeLessThan(0.03)
    expect(Math.abs(finish / n)).toBeLessThan(0.3)
  })

  it("gives a player with no attributes the plain style", () => {
    expect(playerStyle({ id: "n", pos: "ST", ca: 70 })).toEqual(NEUTRAL)
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

describe("style in the match engine", () => {
  it("lets a poacher take more shots than a target man of the same ability", () => {
    const shots = (lean: typeof LEANS.poacher | typeof LEANS.targetMan) => {
      const home = side("h", (pos) => (pos === "ST" ? lean : undefined))
      const st = home.sheet.xi.find((s) => s.pos === "ST")!.playerId
      const reports = playMany(home, side("a"), 300)
      return sum(reports.map((r) => r.lines.find((l) => l.playerId === st)?.shots ?? 0))
    }
    expect(shots(LEANS.poacher)).toBeGreaterThan(shots(LEANS.targetMan) * 1.05)
  })

  it("rates a shot-stopper's gloves above a sweeper-keeper's, and the sweeper's defence above his", () => {
    const at = (lean: typeof LEANS.shotStopper | typeof LEANS.sweeperKeeper) => {
      const home = side("h", (pos) => (pos === "GK" ? lean : undefined))
      return teamUnits(stateOf(home, side("a")), "home")
    }
    const stopper = at(LEANS.shotStopper)
    const sweeper = at(LEANS.sweeperKeeper)
    expect(stopper.gk).toBeGreaterThan(sweeper.gk)
    expect(sweeper.def).toBeGreaterThan(stopper.def)
  })

  it("gives an outfielder standing in goal no keeper style", () => {
    const home = side("h", (pos) => (pos === "ST" ? LEANS.poacher : undefined))
    const state = stateOf(home, side("a"))
    const st = state.home.pitch.find((p) => p.slot === "ST")!
    state.home.pitch.find((p) => p.slot === "GK")!.slot = "CB"
    st.slot = "GK"
    st.mod = { ...st.mod, keeper: 5 }
    const withStyle = teamUnits(state, "home")
    st.mod = { ...st.mod, keeper: -5 }
    const without = teamUnits(state, "home")
    expect(without).toEqual(withStyle)
  })

  it("puts attack-minded players further forward than cautious ones", () => {
    const bold = teamUnits(
      stateOf(
        side("h", (pos) => BOLD[pos]),
        side("a")
      ),
      "home"
    )
    const careful = teamUnits(
      stateOf(
        side("h", (pos) => CAREFUL[pos]),
        side("a")
      ),
      "home"
    )
    expect(bold.att).toBeGreaterThan(careful.att)
    expect(careful.def).toBeGreaterThan(bold.def)
  })

  it("lets a side of attack-minded players out-shoot one of cautious players", () => {
    const bold = side("h", (pos) => BOLD[pos])
    const careful = side("a", (pos) => CAREFUL[pos])
    const reports = playMany(bold, careful, 400)
    expect(sum(reports.map((r) => r.stats[0].xg))).toBeGreaterThan(
      sum(reports.map((r) => r.stats[1].xg)) * 1.05
    )
  })

  it("keeps a plain side level with another plain side of the same ability", () => {
    const reports = playMany(side("h"), side("a"), 400)
    const home = sum(reports.map((r) => r.result.home))
    const away = sum(reports.map((r) => r.result.away))
    expect(Math.abs(home - away) / (home + away)).toBeLessThan(0.2)
  })
})

const BOLD: Partial<Record<Position, Lean>> = {
  GK: LEANS.sweeperKeeper,
  CB: LEANS.ballPlayer,
  LB: LEANS.attackingFullBack,
  RB: LEANS.attackingFullBack,
  DM: LEANS.deepPlaymaker,
  LW: LEANS.insideForward,
  RW: LEANS.insideForward,
  AM: LEANS.shadowStriker,
  ST: LEANS.poacher,
}

const CAREFUL: Partial<Record<Position, Lean>> = {
  GK: LEANS.shotStopper,
  CB: LEANS.stopper,
  LB: LEANS.defensiveFullBack,
  RB: LEANS.defensiveFullBack,
  DM: LEANS.ballWinner,
  LW: LEANS.winger,
  RW: LEANS.winger,
  AM: LEANS.creator,
  ST: LEANS.targetMan,
}
