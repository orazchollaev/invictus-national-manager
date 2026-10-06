import type { Player, Position } from "../types"
import { FORMATIONS } from "../match/formations"
import type { Formation, MatchReport, Tactics, TeamSheet } from "../match/types"
import { createMatch, playMatch, type MatchState } from "../match/engine"
import { ARCHETYPES, archetypeOf, archetypesFor, type Archetype } from "../players/archetypes"
import { attrKeys, expected, fitTo, type Attr, type Attrs } from "../players/attributes"
import type { Role } from "../match/roles"

/** Attributes with no style at all: exactly what his position and overall predict. */
export function plainAttrs(pos: Position, ca: number): Attrs {
  const raw: Attrs = {}
  for (const key of attrKeys(pos)) raw[key] = expected(pos, key, ca)
  return fitTo(raw, pos, ca)
}

/** A player with a plain style, so a side of them plays as an average side of that level. */
export function makePlayer(
  id: string,
  pos: Position,
  ca: number,
  extra: Partial<Player> = {}
): Player {
  return {
    attrs: plainAttrs(pos, ca),
    id,
    nationId: "TST",
    first: "Test",
    last: id,
    born: "1999-01-01",
    pos,
    alt: [],
    foot: "R",
    ca,
    pa: ca,
    pers: {
      professionalism: 10,
      ambition: 10,
      temperament: 10,
      consistency: 10,
      bigMatch: 10,
      injuryProne: 8,
      loyalty: 10,
    },
    clubId: "c",
    role: "starter",
    form: 0,
    sharp: 70,
    morale: 60,
    injury: null,
    caps: 0,
    goals: 0,
    assists: 0,
    history: [],
    ...extra,
  }
}

/** A match between two sides of `makeTeam`, at the levels given, on neutral ground. */
export function levelSetup(homeCa: number, awayCa: number, seed: number, extra = {}) {
  const home = makeTeam("h", homeCa)
  const away = makeTeam("a", awayCa)
  const byId = new Map([...home.players, ...away.players].map((p) => [p.id, p]))
  return {
    id: `m${seed}`,
    date: "2026-09-24",
    home: home.sheet,
    away: away.sheet,
    player: (id: string) => byId.get(id)!,
    homeAdvantage: false,
    seed,
    ...extra,
  }
}

/** `n` matches between sides at those levels, seeds 1 to n. */
export function playLevel(homeCa: number, awayCa: number, n: number, extra = {}): MatchReport[] {
  return Array.from({ length: n }, (_, i) => playMatch(levelSetup(homeCa, awayCa, i + 1, extra)))
}

/** A full squad (XI in formation + seven on the bench) at one ability level. */
export function makeTeam(prefix: string, ca: number, formation: Formation = "4-2-3-1") {
  const roles = FORMATIONS[formation]
  const players: Player[] = roles.map((pos, i) => makePlayer(`${prefix}${i}`, pos, ca))
  const benchRoles: Position[] = ["GK", "CB", "RB", "CM", "AM", "LW", "ST"]
  benchRoles.forEach((pos, i) => players.push(makePlayer(`${prefix}b${i}`, pos, ca - 3)))
  const sheet: TeamSheet = {
    nationId: prefix,
    xi: roles.map((pos, i) => ({ playerId: `${prefix}${i}`, pos })),
    bench: benchRoles.map((_, i) => `${prefix}b${i}`),
    tactics: { formation, mentality: 0, pressing: 1, tempo: 1 },
  }
  return { players, sheet }
}

// ── Sides built from archetypes and roles ───────────────────────────────────

/** A player of `pos` whose attributes make him `want`: its key attributes pushed well above his position's. */
export function playerWith(prefix: string, pos: Position, want: Archetype, ca = 70): Player {
  const id = `${prefix}0`
  const p = makePlayer(id, pos, ca, { clubId: id })
  // Every other attribute gives a little back, so he still adds up to `ca`.
  const raw = plainAttrs(pos, ca)
  for (const [key, w] of Object.entries(ARCHETYPES[want].keys) as [Attr, number][])
    raw[key] = (raw[key] ?? ca) + 14 * w
  p.attrs = fitTo(raw, pos, ca)
  if (archetypeOf(p) !== want) throw new Error(`attributes do not make a ${want}`)
  return p
}

export interface TestSide {
  players: Player[]
  sheet: TeamSheet
}

/**
 * A side whose players each have the archetype `choose` names for their role, in the
 * formation given, with `role` (if any) asked of each slot and `tactics` on top.
 */
export function sideOf(
  prefix: string,
  choose: (pos: Position) => Archetype,
  options: {
    formation?: Formation
    role?: (pos: Position) => Role | undefined
    tactics?: Partial<Tactics>
  } = {}
): TestSide {
  const formation = options.formation ?? "4-2-3-1"
  const roles = FORMATIONS[formation]
  const players = roles.map((pos, i) => playerWith(`${prefix}${i}-`, pos, choose(pos)))
  const bench = (["GK", "CB", "CM", "ST"] as Position[]).map((pos, i) =>
    playerWith(`${prefix}b${i}-`, pos, archetypesFor(pos)[0], 67)
  )
  return {
    players: [...players, ...bench],
    sheet: {
      nationId: prefix,
      xi: roles.map((pos, i) => ({ playerId: players[i].id, pos, role: options.role?.(pos) })),
      bench: bench.map((p) => p.id),
      tactics: { formation, mentality: 0, pressing: 1, tempo: 1, ...options.tactics },
    },
  }
}

export function setupOf(home: TestSide, away: TestSide, seed = 1) {
  const byId = new Map([...home.players, ...away.players].map((p) => [p.id, p]))
  return {
    id: `m${seed}`,
    date: "2026-09-24",
    home: home.sheet,
    away: away.sheet,
    player: (id: string) => byId.get(id)!,
    homeAdvantage: false,
    seed,
  }
}

export function stateOf(home: TestSide, away: TestSide): MatchState {
  return createMatch(setupOf(home, away))
}

export function playMany(home: TestSide, away: TestSide, n: number): MatchReport[] {
  return Array.from({ length: n }, (_, i) => playMatch(setupOf(home, away, i + 1)))
}
