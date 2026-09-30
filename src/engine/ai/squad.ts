/**
 * How a national team coach picks a squad and an eleven. Used for every nation the
 * user does not manage, and as the "suggest" button for the one he does.
 */
import type { ISODate, Player, Position } from "../types"
import { FORMATIONS } from "../match/formations"
import type { Formation, SheetSlot, TeamSheet, Tactics } from "../match/types"
import { ageOn, matchAbility, positionFit, positionGroup } from "../players/ability"
import { archetypeOf } from "../players/archetypes"
import { deriveSeed } from "../rng"
import { suggestedRole } from "../match/roles"

export const SQUAD_SIZE = { window: 26, tournament: 26, min: 23 }

/** A player can be picked: fit, not retired from international duty, not held back. */
export function available(p: Player, date: ISODate, released = true): boolean {
  if (p.intlRetired || !released) return false
  return !p.injury || p.injury.until <= date
}

/** What a coach sees when he weighs a player: ability, form and his age curve. */
export function selectionValue(p: Player, date: ISODate): number {
  const age = ageOn(p.born, date)
  const youthBonus = age <= 21 ? (p.pa - p.ca) * 0.08 : 0
  const veteran = age >= 34 ? -1.5 : 0
  return matchAbility(p) + p.form * 0.5 + youthBonus + veteran + Math.min(3, p.caps / 40)
}

const SQUAD_SHAPE: Record<string, number> = { GK: 3, DEF: 9, MID: 8, FWD: 6 }

/**
 * Pick a squad of `size` from the pool: three keepers and a balanced outfield,
 * best available first, with a nudge towards players who have been there before.
 */
export function pickSquad(
  pool: Player[],
  date: ISODate,
  size = 26,
  previous: string[] = [],
  isReleased: (p: Player) => boolean = () => true
): string[] {
  const candidates = pool.filter((p) => available(p, date, isReleased(p)))
  const value = (p: Player) => selectionValue(p, date) + (previous.includes(p.id) ? 1.5 : 0)
  const byGroup = new Map<string, Player[]>()
  for (const p of candidates) {
    const g = positionGroup(p.pos)
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g)!.push(p)
  }
  for (const list of byGroup.values()) list.sort((a, b) => value(b) - value(a))
  const scale = size / 26
  const chosen: Player[] = []
  for (const [g, n] of Object.entries(SQUAD_SHAPE)) {
    const want = g === "GK" ? Math.min(3, Math.round(n * scale)) : Math.round(n * scale)
    chosen.push(...(byGroup.get(g) ?? []).slice(0, want))
  }
  // Top up with the best of the rest (never a fourth keeper).
  const rest = candidates
    .filter((p) => !chosen.includes(p) && p.pos !== "GK")
    .sort((a, b) => value(b) - value(a))
  while (chosen.length < size && rest.length) chosen.push(rest.shift()!)
  return chosen.slice(0, size).map((p) => p.id)
}

/** The formation that gets the most out of a squad. */
export function bestFormation(
  squad: Player[],
  date: ISODate,
  options: Formation[] = Object.keys(FORMATIONS) as Formation[]
): Formation {
  let best: Formation = "4-2-3-1"
  let bestValue = -Infinity
  for (const f of options) {
    const xi = pickXI(squad, f, date)
    const v = xi.reduce(
      (s, slot) =>
        s +
        slotValue(
          squad.find((p) => p.id === slot.playerId)!,
          slot.pos
        ),
      0
    )
    if (v > bestValue + 1) {
      best = f
      bestValue = v
    }
  }
  return best
}

function slotValue(p: Player, slot: Position): number {
  return matchAbility(p) * positionFit(p, slot) + p.form * 0.3
}

/** Fill a formation's slots from the squad, hardest-to-fill slots first. */
export function pickXI(
  squad: Player[],
  formation: Formation,
  date: ISODate,
  exclude: Set<string> = new Set()
): SheetSlot[] {
  const roles = FORMATIONS[formation]
  const pool = squad.filter((p) => !exclude.has(p.id) && available(p, date))
  const used = new Set<string>()
  const slots: (SheetSlot | null)[] = roles.map(() => null)
  // Keepers first, then the slots with the fewest natural candidates.
  const order = roles
    .map((pos, i) => ({
      pos,
      i,
      natural: pool.filter((p) => p.pos === pos || p.alt.includes(pos)).length,
    }))
    .sort((a, b) => (a.pos === "GK" ? -1 : b.pos === "GK" ? 1 : a.natural - b.natural))
  for (const { pos, i } of order) {
    let best: Player | null = null
    let bestV = -Infinity
    for (const p of pool) {
      if (used.has(p.id)) continue
      const v = slotValue(p, pos)
      if (v > bestV) {
        best = p
        bestV = v
      }
    }
    if (best) {
      used.add(best.id)
      slots[i] = { playerId: best.id, pos }
    }
  }
  return slots.filter((s): s is SheetSlot => !!s)
}

/** Bench: a keeper and the best of the rest, covering every line. */
export function pickBench(squad: Player[], xi: SheetSlot[], date: ISODate, size = 12): string[] {
  const inXI = new Set(xi.map((s) => s.playerId))
  const rest = squad.filter((p) => !inXI.has(p.id) && available(p, date))
  const gk = rest.filter((p) => p.pos === "GK").sort((a, b) => matchAbility(b) - matchAbility(a))
  const out = rest.filter((p) => p.pos !== "GK").sort((a, b) => matchAbility(b) - matchAbility(a))
  return [...gk.slice(0, 1), ...out].slice(0, size).map((p) => p.id)
}

/** The penalty and set-piece takers a coach would name. */
export function pickTakers(squad: Player[], xi: SheetSlot[]) {
  const on = xi.map((s) => squad.find((p) => p.id === s.playerId)!).filter(Boolean)
  const attackers = on.filter((p) => p.pos !== "GK")
  const pen = [...attackers].sort(
    (a, b) =>
      b.ca +
      (positionGroup(b.pos) === "FWD" ? 4 : 0) -
      (a.ca + (positionGroup(a.pos) === "FWD" ? 4 : 0))
  )[0]
  const setPiece = [...attackers].sort(
    (a, b) =>
      b.ca +
      (["AM", "CM", "LW", "RW"].includes(b.pos) ? 4 : 0) -
      (a.ca + (["AM", "CM", "LW", "RW"].includes(a.pos) ? 4 : 0))
  )[0]
  const captain = [...on].sort((a, b) => b.caps - a.caps || b.ca - a.ca)[0]
  return { penaltyTakerId: pen?.id, setPieceTakerId: setPiece?.id, captainId: captain?.id }
}

/** Give each slot the role that suits the player in it, where one does. */
export function pickRoles(squad: Player[], xi: SheetSlot[]): SheetSlot[] {
  const byId = new Map(squad.map((p) => [p.id, p]))
  return xi.map((slot) => {
    const p = byId.get(slot.playerId)
    const role = p ? suggestedRole(archetypeOf(p), slot.pos) : undefined
    return role ? { ...slot, role } : slot
  })
}

/**
 * How a coach sets his team up: the weak sit deep and counter, the strong push up and
 * play wide, the rest follow a habit that is theirs and stays the same.
 */
export function aiStyle(nationId: string, mentality: number): Partial<Tactics> {
  const habits: Partial<Tactics>[] =
    mentality <= -1
      ? [
          { line: 0, width: 1, counter: true, tempo: 2 },
          { line: 0, width: 0, counter: true, tempo: 1 },
        ]
      : mentality >= 1
        ? [
            { line: 2, width: 2, pressing: 2 },
            { line: 2, width: 1, tempo: 0, pressing: 2 },
          ]
        : [
            { line: 1, width: 1 },
            { line: 2, width: 1, pressing: 2 },
            { line: 1, width: 2 },
            { line: 0, width: 1, counter: true, tempo: 2 },
          ]
  return habits[deriveSeed(0, "coach", nationId) % habits.length]
}

/** An AI coach's full team sheet for a match. */
export function aiTeamSheet(
  nationId: string,
  squad: Player[],
  date: ISODate,
  tactics?: Partial<Tactics>,
  favourite?: Formation
): TeamSheet {
  const formation =
    tactics?.formation ??
    favourite ??
    bestFormation(squad, date, ["4-2-3-1", "4-3-3", "4-4-2", "3-5-2", "4-1-4-1", "5-3-2"])
  const xi = pickRoles(squad, pickXI(squad, formation, date))
  return {
    nationId,
    xi,
    bench: pickBench(squad, xi, date),
    tactics: {
      formation,
      mentality: 0,
      pressing: 1,
      tempo: 1,
      ...aiStyle(nationId, tactics?.mentality ?? 0),
      ...tactics,
    },
    ...pickTakers(squad, xi),
  }
}

/** Mentality for the underdog and the favourite: the weak sit deep, the strong press. */
export function aiMentality(own: number, opp: number): -2 | -1 | 0 | 1 {
  const d = own - opp
  if (d < -12) return -2
  if (d < -5) return -1
  if (d > 8) return 1
  return 0
}

/** Average match ability of the best eleven — a squad's headline strength. */
export function squadStrength(squad: Player[], date: ISODate): number {
  const xi = pickXI(squad, "4-2-3-1", date)
  if (!xi.length) return 0
  const total = xi.reduce(
    (s, slot) =>
      s +
      slotValue(
        squad.find((p) => p.id === slot.playerId)!,
        slot.pos
      ),
    0
  )
  return total / 11
}
