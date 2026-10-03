import type { ISODate, Player, Position, PositionGroup } from "../types"

export function positionGroup(pos: Position): PositionGroup {
  if (pos === "GK") return "GK"
  if (pos === "CB" || pos === "LB" || pos === "RB") return "DEF"
  if (pos === "ST" || pos === "LW" || pos === "RW") return "FWD"
  return "MID"
}

/** Whole years between `born` and `on`. */
export function ageOn(born: ISODate, on: ISODate): number {
  // Read straight from the characters: this runs for every player every week and in
  // every squad sort, and splitting the strings was a fifth of the whole day loop.
  const age = num(on, 0, 4) - num(born, 0, 4)
  return num(on, 5, 2) * 100 + num(on, 8, 2) < num(born, 5, 2) * 100 + num(born, 8, 2)
    ? age - 1
    : age
}

function num(s: string, at: number, len: number): number {
  let n = 0
  for (let i = at; i < at + len; i++) n = n * 10 + s.charCodeAt(i) - 48
  return n
}

/**
 * How well a player fits a slot, as a multiplier on his ability. His own and listed
 * alternative positions are a full fit; neighbouring roles cost a little, a centre
 * back up front a lot, and anyone but a keeper in goal nearly everything.
 */
const NEIGHBOURS: Record<Position, Partial<Record<Position, number>>> = {
  GK: {},
  CB: { DM: 0.9, LB: 0.88, RB: 0.88 },
  LB: { RB: 0.92, LW: 0.88, CB: 0.87, DM: 0.82 },
  RB: { LB: 0.92, RW: 0.88, CB: 0.87, DM: 0.82 },
  DM: { CM: 0.95, CB: 0.88, AM: 0.84 },
  CM: { DM: 0.94, AM: 0.93, LW: 0.82, RW: 0.82 },
  AM: { CM: 0.93, LW: 0.9, RW: 0.9, ST: 0.88 },
  LW: { RW: 0.93, AM: 0.9, ST: 0.87, LB: 0.8 },
  RW: { LW: 0.93, AM: 0.9, ST: 0.87, RB: 0.8 },
  ST: { AM: 0.87, LW: 0.86, RW: 0.86 },
}

export function positionFit(player: Pick<Player, "pos" | "alt">, slot: Position): number {
  if (player.pos === slot || player.alt.includes(slot)) return 1
  if (slot === "GK") return 0.3
  if (player.pos === "GK") return 0.35
  let best = NEIGHBOURS[player.pos][slot] ?? 0
  for (const alt of player.alt) best = Math.max(best, (NEIGHBOURS[alt][slot] ?? 0) * 0.97)
  if (best) return best
  const g = positionGroup(slot)
  return positionGroup(player.pos) === g ? 0.85 : 0.72
}

/**
 * The ability a player brings to a match before minute-by-minute fatigue: current
 * ability shaded by club form, sharpness and morale. Kept to a few points either
 * way so a 70 is never mistaken for an 80.
 */
export function matchAbility(player: Player): number {
  const form = player.form * 0.6 // ±3
  const sharp = (player.sharp - 70) * 0.05 // −3.5 … +1.5
  const morale = (player.morale - 60) * 0.03 // −1.8 … +1.2
  return Math.max(1, player.ca + form + sharp + morale)
}

export function fullName(p: Pick<Player, "first" | "last">): string {
  return `${p.first} ${p.last}`
}

/** "L. Messi" style, for tight rows. */
export function shortName(p: Pick<Player, "first" | "last">): string {
  return p.first ? `${p.first[0]}. ${p.last}` : p.last
}
