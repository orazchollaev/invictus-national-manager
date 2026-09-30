/**
 * How one side's way of playing meets the other's. Two layers, both small:
 *
 * - **Own cost and benefit** of the team instructions: a high line wins the ball higher
 *   and is exposed behind, a wide side stretches the pitch and thins the middle, a
 *   counter-attacking side gives up the ball.
 * - **Matchups**: what the opponent's way of playing does to yours. Balls in behind a
 *   high line, a patient side pressed into mistakes, a lone striker against three
 *   centre-backs.
 *
 * Nothing here is large enough to beat a better team on its own; it is what makes the
 * same two teams play differently when the manager reads the opponent. The tests pin
 * that no way of playing is unbeatable.
 */
import { FORMATIONS } from "./formations"
import type { Level, Tactics } from "./types"

/** The team instructions with their defaults, for saves and AI sheets that predate them. */
export interface Instructions {
  line: Level
  width: Level
  counter: boolean
}

export function instructionsOf(t: Partial<Tactics>): Instructions {
  return { line: t.line ?? 1, width: t.width ?? 1, counter: t.counter ?? false }
}

/** Everything about how a side plays that a matchup can read. */
export interface PlayStyle extends Instructions {
  tempo: Level
  press: Level
  /** Centre-backs in the formation: 2 is a flat four, 3 a back three or five. */
  cbs: number
  strikers: number
  /** Wide forwards and wide midfielders: a diamond or a pair of strikers has none. */
  wingers: number
  /** Midfielders through the middle (defensive, central and attacking). */
  centre: number
}

export function styleOf(t: Tactics): PlayStyle {
  const roles = FORMATIONS[t.formation]
  const count = (...pos: string[]) => roles.filter((r) => pos.includes(r)).length
  return {
    ...instructionsOf(t),
    tempo: t.tempo,
    press: t.pressing,
    cbs: count("CB"),
    strikers: count("ST"),
    wingers: count("LW", "RW"),
    centre: count("DM", "CM", "AM"),
  }
}

export interface Multipliers {
  def: number
  mid: number
  att: number
}

/** A side's own instructions: what they cost and what they buy. */
export function ownEffect(s: PlayStyle): Multipliers {
  const line = s.line - 1
  const width = s.width - 1
  return {
    def: 1 - 0.03 * line,
    mid: 1 + 0.03 * line - 0.02 * width - (s.counter ? 0.03 : 0),
    att: 1 + 0.02 * width,
  }
}

/** How the attacking side's way of playing works against the defending side's. */
export function attackEdge(a: PlayStyle, d: PlayStyle): number {
  let f = 1
  // Balls in behind a high line; nothing to counter into against a deep block.
  if ((a.counter || a.tempo === 2) && d.line === 2) f *= 1.05
  if (a.counter && d.line === 0) f *= 0.96
  // Width against a back five is wasted; against a flat four with nobody on its
  // flanks (narrow by choice or by shape, as in a diamond) it is not.
  if (a.width === 2 && d.cbs === 3) f *= 0.96
  if (a.width === 2 && d.cbs === 2 && (d.width === 0 || d.wingers === 0)) f *= 1.04
  // A patient side gets pressed into mistakes; a direct one bypasses the press.
  if (a.tempo === 0 && d.press === 2) f *= 0.96
  if (a.tempo === 2 && d.press === 2) f *= 1.04
  // Three centre-backs smother a lone striker; two forwards stretch a flat four.
  if (a.strikers === 1 && d.cbs === 3) f *= 0.96
  if (a.strikers >= 2 && d.cbs === 2) f *= 1.03
  return f
}

/** How a side's way of playing works in the fight for the ball. */
export function midEdge(a: PlayStyle, o: PlayStyle): number {
  let f = 1
  if (a.centre > o.centre) f *= 1.03
  if (a.centre < o.centre) f *= 0.97
  // A high press wins the ball off a patient side.
  if (a.press === 2 && o.tempo === 0) f *= 1.03
  // A narrow side packs the middle against a wide one.
  if (a.width === 0 && o.width === 2) f *= 1.02
  return f
}

/** The whole effect on `own` of meeting `opp`: its own instructions and the matchup. */
export function meet(own: PlayStyle, opp: PlayStyle): Multipliers {
  const self = ownEffect(own)
  return {
    def: self.def,
    mid: self.mid * midEdge(own, opp),
    att: self.att * attackEdge(own, opp),
  }
}
