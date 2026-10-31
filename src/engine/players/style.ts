/**
 * What kind of player somebody is, beyond a number. His style, the small shifts in a
 * match, comes from his attributes: a quick winger breaks away more, a good header of
 * the ball wins more corners. Nothing is stored.
 *
 * Every factor is 1 (or 0 for points) when his attributes are what his position and
 * overall predict, so a squad of mixed types plays like an average one and only
 * lopsided squads feel different.
 */
import { msg, type Msg } from "../text"
import type { ISODate, Player } from "../types"
import { clamp } from "../rng"
import { ageOn } from "./ability"
import { deviation, type Attr } from "./attributes"

/** What a player's style changes in a match. */
export interface Modifiers {
  /** Multiplies his share of the side's defence, midfield and attack. */
  unit: [number, number, number]
  /** Chance of being the one who shoots. */
  score: number
  /** Chance of setting the shot up. */
  assist: number
  /** Chance of being the one who heads a corner or free kick. */
  header: number
  /** Chance of being the one who wins the ball or blocks the shot. */
  tackle: number
  /** Chance of being the one who fouls. */
  foul: number
  /** Finishing relative to his all-round ability, in ability points. */
  finish: number
  /** Shot-stopping relative to his all-round ability, in ability points (keepers). */
  keeper: number
  /** How well he gets away from, or stays with, a runner. */
  speed: number
  /** How fast he tires: below 1 he lasts longer. */
  drain: number
}

export const NEUTRAL: Modifiers = {
  unit: [1, 1, 1],
  score: 1,
  assist: 1,
  header: 1,
  tackle: 1,
  foul: 1,
  finish: 0,
  keeper: 0,
  speed: 1,
  drain: 1,
}

type Styled = Pick<Player, "id" | "pos" | "ca" | "attrs">

/** Scales a deviation (in attribute points) into a factor around 1. */
function factor(points: number, per: number, lo = 0.7, hi = 1.4): number {
  return clamp(1 + points * per, lo, hi)
}

/**
 * What his attributes do in a match: how often he is the one who shoots, heads, tackles,
 * how good a finisher or shot-stopper he is for his overall, how fast and how durable.
 * Each is the gap between what he has and what his position and overall predict, so the
 * average player changes nothing.
 */
export function playerStyle(p: Styled): Modifiers {
  if (!p.attrs) return NEUTRAL
  const d = (k: Attr) => deviation(p, k)
  if (p.pos === "GK") {
    return {
      ...NEUTRAL,
      unit: [
        factor(d("aerial") * 0.5 + d("positioning") * 0.5, 0.003, 0.95, 1.05),
        factor(d("distribution"), 0.004, 0.95, 1.06),
        1,
      ],
      keeper:
        0.2 *
        (0.35 * d("reflexes") +
          0.25 * d("oneOnOne") +
          0.25 * d("positioning") +
          0.15 * d("agility")),
      speed: factor(d("agility"), 0.01, 0.85, 1.15),
    }
  }
  return {
    unit: [
      factor(
        0.4 * d("tackling") + 0.2 * d("strength") + 0.2 * d("pace") + 0.2 * d("vision"),
        0.004,
        0.9,
        1.1
      ),
      factor(0.4 * d("passing") + 0.3 * d("vision") + 0.3 * d("dribbling"), 0.004, 0.9, 1.1),
      factor(
        0.3 * d("finishing") + 0.2 * d("shooting") + 0.25 * d("dribbling") + 0.25 * d("pace"),
        0.004,
        0.9,
        1.1
      ),
    ],
    score: factor(0.5 * d("finishing") + 0.3 * d("shooting") + 0.2 * d("pace"), 0.02, 0.6, 1.6),
    assist: factor(0.5 * d("passing") + 0.5 * d("vision"), 0.015, 0.6, 1.6),
    header: factor(0.5 * d("heading") + 0.3 * d("jumping") + 0.2 * d("strength"), 0.015, 0.6, 1.6),
    tackle: factor(0.6 * d("tackling") + 0.2 * d("strength") + 0.2 * d("pace"), 0.015, 0.6, 1.6),
    foul: factor(0.5 * d("strength") - 0.5 * d("vision"), 0.01, 0.7, 1.4),
    finish: 0.12 * (0.6 * d("finishing") + 0.4 * d("shooting")),
    keeper: 0,
    speed: factor(0.6 * d("pace") + 0.4 * d("acceleration"), 0.01, 0.8, 1.2),
    drain: factor(-d("stamina"), 0.012, 0.75, 1.3),
  }
}

// ── Badges ──────────────────────────────────────────────────────────────────

export type BadgeId = "big-game" | "reliable" | "erratic" | "injury-prone" | "tires-early"

export interface Badge {
  id: BadgeId
  /** Its name and what it does in a match. */
  label: Msg
  text: Msg
}

/** Age from which the match engine drains a player faster. */
export const TIRES_EARLY_AGE = 31

/** The badges a player has earned from his character and age, each with a real effect. */
export function badgesOf(p: Player, on: ISODate): Badge[] {
  const ids: BadgeId[] = []
  if (p.pers.bigMatch >= 16) ids.push("big-game")
  if (p.pers.consistency >= 16) ids.push("reliable")
  else if (p.pers.consistency <= 5) ids.push("erratic")
  if (p.pers.injuryProne >= 15) ids.push("injury-prone")
  if (ageOn(p.born, on) >= TIRES_EARLY_AGE) ids.push("tires-early")
  return ids.map((id) => ({ id, label: msg(`badge.${id}.label`), text: msg(`badge.${id}.text`) }))
}
