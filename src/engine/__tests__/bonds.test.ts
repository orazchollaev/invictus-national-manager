import { describe, expect, it } from "vitest"
import { resolveText as say } from "@/i18n/text"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef, Player } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import {
  BOND_LIMITS,
  BOND_POINTS,
  bondBetween,
  bondsAmong,
  chemistryOf,
  spiritLabel,
  spiritOf,
  type BondKind,
} from "../players/bonds"
import { pickXI } from "../ai/squad"
import { createMatch, substitute, step } from "../match/engine"
import { playMany, setupOf, sideOf, stateOf } from "./helpers"
import { archetypesFor } from "../players/archetypes"
import { makePlayer } from "./helpers"
import type { Position } from "../types"

const p = (id: string, extra: Partial<Player> = {}) =>
  makePlayer(id, "CM", 70, { clubId: `club-${id}`, ...extra })
const hot = (id: string) => p(id, { pers: { ...makePlayer("x", "CM", 70).pers, temperament: 18 } })

describe("bonds between players", () => {
  it("is the same both ways and every time, and nobody bonds with himself", () => {
    for (let i = 0; i < 200; i++) {
      const a = p(`a${i}`)
      const b = p(`b${i}`)
      expect(bondBetween(a, b)).toBe(bondBetween(b, a))
      expect(bondBetween(a, b)).toBe(bondBetween(a, b))
      expect(bondBetween(a, a)).toBeNull()
    }
  })

  it("makes club mates, whatever else they are", () => {
    expect(bondBetween(p("a", { clubId: "c1" }), p("b", { clubId: "c1" }))).toBe("clubmates")
  })

  it("does not make club mates of players with no club", () => {
    const rate = (() => {
      let n = 0
      for (let i = 0; i < 400; i++)
        if (bondBetween(p(`a${i}`, { clubId: "" }), p(`b${i}`, { clubId: "" })) === "clubmates") n++
      return n
    })()
    expect(rate).toBe(0)
  })

  it("makes friends and enemies at about the rates it says, and more enemies of hot heads", () => {
    const count = (make: (id: string) => Player) => {
      const c: Record<string, number> = { friends: 0, feud: 0, none: 0 }
      const n = 6000
      for (let i = 0; i < n; i++) c[bondBetween(make(`a${i}`), make(`b${i}`)) ?? "none"]++
      return { friends: c.friends / n, feud: c.feud / n }
    }
    const calm = count(p)
    expect(calm.friends).toBeGreaterThan(0.012)
    expect(calm.friends).toBeLessThan(0.03)
    expect(calm.feud).toBeGreaterThan(0.005)
    expect(calm.feud).toBeLessThan(0.02)
    const fiery = count(hot)
    expect(fiery.feud).toBeGreaterThan(calm.feud * 2)
    expect(fiery.feud).toBeGreaterThan(0.03)
  })

  it("lists every bond among a group once", () => {
    const group = Array.from({ length: 30 }, (_, i) =>
      p(`g${i}`, { clubId: i < 10 ? "same" : `c${i}` })
    )
    const bonds = bondsAmong(group)
    const clubmates = bonds.filter((b) => b.kind === "clubmates")
    expect(clubmates).toHaveLength(45) // ten players at one club: 10 choose 2
    const keys = bonds.map((b) => [b.a, b.b].sort().join("|"))
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe("chemistry", () => {
  const club = (n: number) => Array.from({ length: n }, (_, i) => p(`m${i}`, { clubId: "same" }))

  it("adds up what a player's bonds are worth", () => {
    const [me, ...mates] = club(3)
    expect(chemistryOf(me, mates)).toBeCloseTo(2 * BOND_POINTS.clubmates)
    expect(chemistryOf(me, [])).toBe(0)
  })

  it("never gives or takes more than the limits", () => {
    const [me, ...mates] = club(11)
    expect(chemistryOf(me, mates)).toBe(BOND_LIMITS.max)
    expect(BOND_LIMITS.min).toBeLessThan(0)
  })

  it("scores a side by the average of its players", () => {
    expect(spiritOf([])).toBe(0)
    expect(spiritOf([p("a"), p("b")])).toBeCloseTo(
      (chemistryOf(p("a"), [p("b")]) + chemistryOf(p("b"), [p("a")])) / 2
    )
    expect(spiritOf(club(11))).toBe(BOND_LIMITS.max)
  })

  it("puts the spirit in a word", () => {
    expect(say(spiritLabel(2))).toBe("Tight-knit")
    expect(say(spiritLabel(0.5))).toBe("Good")
    expect(say(spiritLabel(0))).toBe("Neutral")
    expect(say(spiritLabel(-0.5))).toBe("Uneasy")
    expect(say(spiritLabel(-2))).toBe("Divided")
  })

  it("is small across real squads: it shades a side, it does not make one", () => {
    const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
    const w = createWorld(
      { seed: 1, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
      statics,
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    const spirits = (statics.nations as NationDef[]).slice(0, 60).map((n) => {
      const pool = w.pool(n.id)
      const xi = pickXI(pool, "4-2-3-1", "2026-09-01").map((s) => w.state.players[s.playerId])
      return spiritOf(xi)
    })
    const mean = spirits.reduce((a, b) => a + b, 0) / spirits.length
    expect(Math.abs(mean)).toBeLessThan(0.8)
    expect(Math.max(...spirits)).toBeLessThan(BOND_LIMITS.max + 1e-9)
    expect(Math.min(...spirits)).toBeGreaterThan(BOND_LIMITS.min - 1e-9)
  })
})

/**
 * Two players with the bond asked for, and no bond with anyone in `others`, found by
 * trying ids, so that what they give each other is exactly one bond.
 */
function isolatedPair(kind: BondKind, prefix: string, others: Player[]): [Player, Player] {
  for (let i = 0; i < 40000; i++) {
    const x = p(`${prefix}a${i}`)
    const y = p(`${prefix}b${i}`)
    if (bondBetween(x, y) !== kind) continue
    if (others.some((o) => bondBetween(x, o) || bondBetween(y, o))) continue
    return [x, y]
  }
  throw new Error(`no pair is ${kind}`)
}

describe("bonds in the match engine", () => {
  const first = (pos: Position) => archetypesFor(pos)[0]

  /** The home side with two slots handed to `extra`, which are given the slots' positions. */
  function withPlayers(extra: Player[], slots = [1, 2]) {
    const home = sideOf("h", first)
    const away = sideOf("a", first)
    const xi = home.sheet.xi
    extra.forEach((x, i) => {
      x.pos = xi[slots[i]].pos
      home.players.push(x)
      xi[slots[i]] = { ...xi[slots[i]], playerId: x.id }
    })
    return { home, away, state: createMatch(setupOf(home, away)) }
  }

  const others = () => sideOf("h", first).players.filter((_, i) => i !== 1 && i !== 2)

  it("takes from both players of a feud and gives to both friends", () => {
    const feud = isolatedPair("feud", "f", others())
    const { state } = withPlayers(feud)
    for (const x of feud)
      expect(state.home.pitch.find((q) => q.id === x.id)!.bond).toBeCloseTo(BOND_POINTS.feud)

    const friends = isolatedPair("friends", "n", others())
    const s2 = withPlayers(friends).state
    for (const x of friends)
      expect(s2.home.pitch.find((q) => q.id === x.id)!.bond).toBeCloseTo(BOND_POINTS.friends)
  })

  it("agrees with the bonds among the eleven", () => {
    const home = sideOf("h", first)
    const state = stateOf(home, sideOf("a", first))
    const players = state.home.pitch.map((x) => home.players.find((q) => q.id === x.id)!)
    for (const x of state.home.pitch) {
      const me = home.players.find((q) => q.id === x.id)!
      expect(x.bond).toBeCloseTo(
        chemistryOf(
          me,
          players.filter((q) => q !== me)
        )
      )
    }
  })

  it("keeps players on the bench out of it, and updates when one comes on", () => {
    const feud = isolatedPair("feud", "s", others())
    const { home, away } = withPlayers([feud[0]], [1])
    // The second of the feud is on the bench, as a full-back for the slot he would take.
    feud[1].pos = home.sheet.xi[2].pos
    home.players.push(feud[1])
    home.sheet.bench = [feud[1].id, ...home.sheet.bench]
    const state = createMatch(setupOf(home, away))
    const starter = state.home.pitch.find((x) => x.id === feud[0].id)!
    expect(starter.bond).toBeCloseTo(0)
    const out = state.home.pitch.find((x) => x.slot === home.sheet.xi[2].pos)!
    substitute(state, "home", out.id, feud[1].id)
    expect(starter.bond).toBeCloseTo(BOND_POINTS.feud)
    expect(state.home.pitch.find((x) => x.id === feud[1].id)!.bond).toBeCloseTo(BOND_POINTS.feud)
  })

  it("lets a side of club mates beat an equal side of strangers", () => {
    const together = sideOf("h", first)
    for (const pl of together.players) pl.clubId = "one-club"
    const strangers = sideOf("a", first)
    const reports = playMany(together, strangers, 300)
    const f = reports.reduce((a, r) => a + r.stats[0].xg, 0)
    const against = reports.reduce((a, r) => a + r.stats[1].xg, 0)
    expect(f).toBeGreaterThan(against * 1.03)
  })

  it("plays the same match twice", () => {
    const home = sideOf("h", first)
    const a = createMatch(setupOf(home, sideOf("a", first), 5))
    const b = createMatch(setupOf(home, sideOf("a", first), 5))
    for (let i = 0; i < 200; i++) {
      step(a)
      step(b)
    }
    expect(a.events).toEqual(b.events)
  })
})

describe("bonds stay in step through a match", () => {
  it("match what each player on the pitch is owed after every minute, substitutions and red cards included", () => {
    const first = (pos: Position) => archetypesFor(pos)[0]
    let checked = 0
    let changes = 0
    for (let seed = 1; seed <= 25; seed++) {
      const home = sideOf("h", first)
      const away = sideOf("a", first)
      // Three clubs a side, so there are club mates to lose and keep.
      for (const t of [home, away])
        t.players.forEach((pl, i) => (pl.clubId = `${t.sheet.nationId}${i % 3}`))
      const byId = new Map([...home.players, ...away.players].map((x) => [x.id, x]))
      const state = createMatch(setupOf(home, away, seed))
      let guard = 0
      while (state.phase !== "done" && guard++ < 400) {
        state.pendingInjuries = []
        const before = state.home.pitch.map((x) => x.id).join()
        step(state)
        if (before !== state.home.pitch.map((x) => x.id).join()) changes++
        for (const side of [state.home, state.away]) {
          const pitch = side.pitch.map((x) => byId.get(x.id)!)
          for (const live of side.pitch) {
            const me = byId.get(live.id)!
            expect(live.bond).toBeCloseTo(
              chemistryOf(
                me,
                pitch.filter((x) => x !== me)
              )
            )
            checked++
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(20000)
    // Sides did change during these matches, or the check proves little.
    expect(changes).toBeGreaterThan(20)
  })
})
