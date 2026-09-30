import { describe, expect, it } from "vitest"
import {
  ROLES,
  ROLE_SUIT_BONUS,
  combineStyle,
  rolesFor,
  suggestedRole,
  suitsRole,
  validRole,
  type Role,
} from "../match/roles"
import { ARCHETYPES, archetypesFor, type Archetype } from "../players/archetypes"
import { POSITIONS, type Position } from "../types"
import { changeFormation, substitute, teamUnits } from "../match/engine"
import { playMany, sideOf, stateOf } from "./helpers"

const first = (pos: Position) => archetypesFor(pos)[0]
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const allRoles = Object.keys(ROLES) as Role[]

describe("roles", () => {
  it("gives every outfield position at least two roles, and keepers none", () => {
    for (const pos of POSITIONS)
      expect(rolesFor(pos).length).toBeGreaterThanOrEqual(pos === "GK" ? 0 : 2)
    expect(rolesFor("GK")).toEqual([])
  })

  it("only lets an archetype suit a role at a position it can play", () => {
    for (const r of allRoles)
      for (const a of ROLES[r].suits)
        expect(ARCHETYPES[a].positions.some((p) => ROLES[r].positions.includes(p))).toBe(true)
  })

  it("has a role to suit every outfield archetype", () => {
    for (const a of Object.keys(ARCHETYPES) as Archetype[]) {
      const pos = ARCHETYPES[a].positions[0]
      if (pos === "GK") continue
      for (const p of ARCHETYPES[a].positions) expect(suggestedRole(a, p)).toBeDefined()
    }
  })

  it("makes every role a trade-off, never a free gain", () => {
    for (const r of allRoles) {
      const d = ROLES[r]
      const costs = [...d.unit, d.score, d.assist, d.header, d.tackle, d.foul].some((v) => v < 1)
      expect(costs, r).toBe(true)
    }
  })

  it("keeps every role within a band", () => {
    for (const r of allRoles) {
      const d = ROLES[r]
      for (const u of d.unit) expect(u).toBeGreaterThanOrEqual(0.8)
      for (const u of d.unit) expect(u).toBeLessThanOrEqual(1.2)
      for (const f of [d.score, d.assist, d.header, d.tackle, d.foul]) {
        expect(f).toBeGreaterThanOrEqual(0.5)
        expect(f).toBeLessThanOrEqual(1.5)
      }
    }
  })

  it("validates a role against a slot", () => {
    expect(validRole("poacher", "ST")).toBe(true)
    expect(validRole("poacher", "CB")).toBe(false)
    expect(validRole(undefined, "ST")).toBe(false)
    expect(validRole("nonsense" as Role, "ST")).toBe(false)
  })

  it("suggests the role that suits the archetype, and none that does not exist", () => {
    expect(suggestedRole("poacher", "ST")).toBe("poacher")
    expect(suggestedRole("attacking-full-back", "RB")).toBe("wing-back")
    expect(suggestedRole("poacher", "CB")).toBeUndefined()
    expect(suitsRole("poacher", "poacher")).toBe(true)
    expect(suitsRole("poacher", "target-man")).toBe(false)
    expect(suitsRole("poacher", null)).toBe(false)
  })

  it("combines an archetype with a role, and leaves it alone with none", () => {
    expect(combineStyle("poacher", null)).toBe(ARCHETYPES.poacher)
    const m = combineStyle("poacher", "poacher")
    expect(m.score).toBeCloseTo(ARCHETYPES.poacher.score * ROLES.poacher.score)
    expect(m.unit[1]).toBeCloseTo(ARCHETYPES.poacher.unit[1] * ROLES.poacher.unit[1])
    expect(m.finish).toBeCloseTo(ARCHETYPES.poacher.finish + ROLES.poacher.finish)
  })
})

describe("roles in the match engine", () => {
  const plain = sideOf("a", first)

  it("reshapes the slot: wing-backs give up defence for attack", () => {
    const at = (role?: Role) =>
      teamUnits(
        stateOf(
          sideOf("h", first, { role: (pos) => (pos === "LB" || pos === "RB" ? role : undefined) }),
          plain
        ),
        "home"
      )
    const normal = at()
    const wing = at("wing-back")
    expect(wing.att).toBeGreaterThan(normal.att)
    expect(wing.def).toBeLessThan(normal.def)
  })

  it("lifts a player whose archetype suits the role by the suit bonus, and only him", () => {
    const strength = (arch: Archetype) => {
      const side = sideOf("h", (pos) => (pos === "ST" ? arch : first(pos)), {
        role: (pos) => (pos === "ST" ? "poacher" : undefined),
      })
      const state = stateOf(side, plain)
      const st = state.home.pitch.find((p) => p.slot === "ST")!
      return { suited: st.suited, base: st.base }
    }
    expect(strength("poacher").suited).toBe(true)
    expect(strength("target-man").suited).toBe(false)
    expect(ROLE_SUIT_BONUS).toBeGreaterThan(0)
  })

  it("makes a suited player stronger in the same role than an unsuited one", () => {
    const att = (arch: Archetype) =>
      teamUnits(
        stateOf(
          sideOf("h", (pos) => (pos === "ST" ? arch : first(pos)), {
            role: (pos) => (pos === "ST" ? "poacher" : undefined),
          }),
          plain
        ),
        "home"
      ).att
    // Both are in the poacher role; only the poacher suits it, so he plays above himself.
    const suitedAtt = att("poacher")
    const unsuitedAtt = att("target-man")
    expect(suitedAtt).toBeGreaterThan(unsuitedAtt)
  })

  it("ignores a role the slot cannot have", () => {
    const side = sideOf("h", first, { role: () => "poacher" })
    const state = stateOf(side, plain)
    for (const p of state.home.pitch) expect(p.role).toBe(p.slot === "ST" ? "poacher" : null)
  })

  it("hands a slot's role to the substitute who takes it", () => {
    const side = sideOf("h", first, { role: (pos) => (pos === "ST" ? "poacher" : undefined) })
    const state = stateOf(side, plain)
    const st = state.home.pitch.find((p) => p.slot === "ST")!
    const bench = state.home.bench.find((p) => p.natural === "ST")!
    substitute(state, "home", st.id, bench.id)
    expect(bench.slot).toBe("ST")
    expect(bench.role).toBe("poacher")
  })

  it("clears the roles when the shape changes", () => {
    const side = sideOf("h", first, { role: (pos) => (pos === "ST" ? "poacher" : undefined) })
    const state = stateOf(side, plain)
    changeFormation(state, "home", "4-4-2")
    expect(state.home.pitch.every((p) => p.role === null)).toBe(true)
  })

  it("plays a sheet without roles exactly as before", () => {
    const a = playMany(sideOf("h", first), plain, 20)
    const b = playMany(sideOf("h", first, { role: () => undefined }), plain, 20)
    expect(a).toEqual(b)
  })

  it("gives no role a free lunch: each stays close to the plain position over many matches", () => {
    const xgShare = (role: Role) => {
      const positions = ROLES[role].positions
      // Players whose archetype does not suit the role, so only the trade-off is measured.
      const choose = (pos: Position) =>
        archetypesFor(pos).find((a) => !ROLES[role].suits.includes(a)) ?? first(pos)
      const home = sideOf("h", choose, {
        role: (pos) => (positions.includes(pos) ? role : undefined),
      })
      const reports = playMany(home, sideOf("a", choose), 200)
      const f = sum(reports.map((r) => r.stats[0].xg))
      const against = sum(reports.map((r) => r.stats[1].xg))
      return (f - against) / (f + against)
    }
    for (const r of allRoles) expect(Math.abs(xgShare(r)), r).toBeLessThan(0.1)
  })
})
