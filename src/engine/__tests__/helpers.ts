import type { Player, Position } from "../types"
import { FORMATIONS } from "../match/formations"
import type { Formation, TeamSheet } from "../match/types"

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
