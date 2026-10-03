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

export type RuleId =
  | "behind-high-line"
  | "counter-into-deep-block"
  | "width-into-back-five"
  | "width-into-open-flanks"
  | "patience-into-press"
  | "direct-past-press"
  | "lone-striker-into-back-three"
  | "two-strikers-into-flat-four"
  | "midfield-numbers"
  | "midfield-outnumbered"
  | "press-patient-side"
  | "narrow-into-wide"

export interface Rule {
  id: RuleId
  /** `att`: chances for the side on the ball; `mid`: who wins the ball in midfield. */
  layer: "att" | "mid"
  factor: number
  /** `a` is the side the factor is applied to, `o` the other. */
  applies(a: PlayStyle, o: PlayStyle): boolean
}

/** Every matchup, in the order they multiply. */
export const RULES: Rule[] = [
  // Balls in behind a high line; nothing to counter into against a deep block.
  {
    id: "behind-high-line",
    layer: "att",
    factor: 1.05,
    applies: (a, o) => (a.counter || a.tempo === 2) && o.line === 2,
  },
  {
    id: "counter-into-deep-block",
    layer: "att",
    factor: 0.96,
    applies: (a, o) => a.counter && o.line === 0,
  },
  // Width against a back five is wasted; against a flat four with nobody on its
  // flanks (narrow by choice or by shape, as in a diamond) it is not.
  {
    id: "width-into-back-five",
    layer: "att",
    factor: 0.96,
    applies: (a, o) => a.width === 2 && o.cbs === 3,
  },
  {
    id: "width-into-open-flanks",
    layer: "att",
    factor: 1.04,
    applies: (a, o) => a.width === 2 && o.cbs === 2 && (o.width === 0 || o.wingers === 0),
  },
  // A patient side gets pressed into mistakes; a direct one bypasses the press.
  {
    id: "patience-into-press",
    layer: "att",
    factor: 0.96,
    applies: (a, o) => a.tempo === 0 && o.press === 2,
  },
  {
    id: "direct-past-press",
    layer: "att",
    factor: 1.04,
    applies: (a, o) => a.tempo === 2 && o.press === 2,
  },
  // Three centre-backs smother a lone striker; two forwards stretch a flat four.
  {
    id: "lone-striker-into-back-three",
    layer: "att",
    factor: 0.96,
    applies: (a, o) => a.strikers === 1 && o.cbs === 3,
  },
  {
    id: "two-strikers-into-flat-four",
    layer: "att",
    factor: 1.03,
    applies: (a, o) => a.strikers >= 2 && o.cbs === 2,
  },
  {
    id: "midfield-numbers",
    layer: "mid",
    factor: 1.03,
    applies: (a, o) => a.centre > o.centre,
  },
  {
    id: "midfield-outnumbered",
    layer: "mid",
    factor: 0.97,
    applies: (a, o) => a.centre < o.centre,
  },
  // A high press wins the ball off a patient side.
  {
    id: "press-patient-side",
    layer: "mid",
    factor: 1.03,
    applies: (a, o) => a.press === 2 && o.tempo === 0,
  },
  // A narrow side packs the middle against a wide one.
  {
    id: "narrow-into-wide",
    layer: "mid",
    factor: 1.02,
    applies: (a, o) => a.width === 0 && o.width === 2,
  },
]

/** The matchups that act on `a` when it meets `o`. */
export function firing(a: PlayStyle, o: PlayStyle, layer?: Rule["layer"]): Rule[] {
  return RULES.filter((r) => (!layer || r.layer === layer) && r.applies(a, o))
}

const product = (rules: Rule[]) => rules.reduce((f, r) => f * r.factor, 1)

/** How the attacking side's way of playing works against the defending side's. */
export function attackEdge(a: PlayStyle, d: PlayStyle): number {
  return product(firing(a, d, "att"))
}

/** How a side's way of playing works in the fight for the ball. */
export function midEdge(a: PlayStyle, o: PlayStyle): number {
  return product(firing(a, o, "mid"))
}

/** The whole effect on `own` of meeting `opp`: its own instructions and the matchup. */
/** What a style is made of: everything `styleOf` reads (not the mentality). */
function styleKey(t: Tactics): string {
  return `${t.formation}/${t.tempo}${t.pressing}${t.line ?? 1}${t.width ?? 1}${t.counter ? 1 : 0}`
}

const meetings = new Map<string, Multipliers>()

/**
 * `meet(styleOf(own), styleOf(opp))`, remembered: the match engine asks every
 * minute for both sides, and the answer only changes when a style does. Read-only.
 */
export function playOf(own: Tactics, opp: Tactics): Readonly<Multipliers> {
  const key = styleKey(own) + "|" + styleKey(opp)
  let hit = meetings.get(key)
  if (!hit) {
    if (meetings.size > 20000) meetings.clear()
    meetings.set(key, (hit = meet(styleOf(own), styleOf(opp))))
  }
  return hit
}

export function meet(own: PlayStyle, opp: PlayStyle): Multipliers {
  const self = ownEffect(own)
  return {
    def: self.def,
    mid: self.mid * midEdge(own, opp),
    att: self.att * attackEdge(own, opp),
  }
}
