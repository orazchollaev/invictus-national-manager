import type { Player, Position } from "../types"
import { FORMATIONS } from "../match/formations"
import type { Formation, MatchReport, Tactics, TeamSheet } from "../match/types"
import { createMatch, playMatch, type MatchState } from "../match/engine"
import { archetypeOf, archetypesFor, type Archetype } from "../players/archetypes"
import type { Role } from "../match/roles"

export function makePlayer(
  id: string,
  pos: Position,
  ca: number,
  extra: Partial<Player> = {}
): Player {
  return {
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

/** A player of `pos` whose id draws `want`, found by trying ids. */
export function playerWith(prefix: string, pos: Position, want: Archetype, ca = 70): Player {
  for (let n = 0; n < 5000; n++) {
    const id = `${prefix}${n}`
    if (archetypeOf({ id, pos }) === want) return makePlayer(id, pos, ca, { clubId: id })
  }
  throw new Error(`no id draws ${want}`)
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
