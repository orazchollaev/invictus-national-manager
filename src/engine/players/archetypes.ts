/**
 * What kind of player somebody is, beyond a number. His archetype is a label read off
 * his attributes (the type of player he is strongest at being for his position), and
 * his style, the small shifts in a match, comes from the same attributes: a quick winger
 * breaks away more, a good header of the ball wins more corners. Nothing is stored.
 *
 * Every factor is 1 (or 0 for points) when his attributes are what his position and
 * overall predict, so a squad of mixed types plays like an average one and only
 * lopsided squads feel different.
 */
import { msg, type Msg } from "../text"
import type { ISODate, Player, Position } from "../types"
import { clamp } from "../rng"
import { ageOn } from "./ability"
import { deviation, ensureAttrs, type Attr } from "./attributes"

export type Archetype =
  | "shot-stopper"
  | "sweeper-keeper"
  | "stopper"
  | "ball-playing-defender"
  | "defensive-full-back"
  | "attacking-full-back"
  | "ball-winner"
  | "deep-playmaker"
  | "box-to-box"
  | "playmaker"
  | "creator"
  | "shadow-striker"
  | "winger"
  | "inside-forward"
  | "target-man"
  | "poacher"
  | "complete-forward"

/** What a style (an archetype, a role, or both together) changes in a match. */
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

export interface ArchetypeDef {
  positions: Position[]
  /** The attributes that make a player this type, with how much each counts. */
  keys: Partial<Record<Attr, number>>
  /** Points taken off his lean, so the all-rounder is only picked when nothing else stands out. */
  handicap?: number
}

export const ARCHETYPES: Record<Archetype, ArchetypeDef> = {
  "shot-stopper": { positions: ["GK"], keys: { reflexes: 1, oneOnOne: 0.8, positioning: 0.6 } },
  "sweeper-keeper": { positions: ["GK"], keys: { distribution: 1, agility: 0.8, aerial: 0.4 } },
  stopper: { positions: ["CB"], keys: { tackling: 1, strength: 0.7, heading: 0.7 } },
  "ball-playing-defender": {
    positions: ["CB"],
    keys: { passing: 1, vision: 0.8, dribbling: 0.5 },
  },
  "defensive-full-back": {
    positions: ["LB", "RB"],
    keys: { tackling: 1, strength: 0.6, stamina: 0.5 },
  },
  "attacking-full-back": {
    positions: ["LB", "RB"],
    keys: { pace: 1, dribbling: 0.8, passing: 0.7, stamina: 0.4 },
  },
  "ball-winner": { positions: ["DM"], keys: { tackling: 1, strength: 0.7, stamina: 0.5 } },
  "deep-playmaker": { positions: ["DM"], keys: { passing: 1, vision: 0.9 } },
  "box-to-box": { positions: ["CM"], keys: { stamina: 1, tackling: 0.6, shooting: 0.6 } },
  playmaker: { positions: ["CM"], keys: { passing: 1, vision: 0.9, dribbling: 0.5 } },
  creator: { positions: ["AM"], keys: { passing: 1, vision: 0.9, dribbling: 0.7 } },
  "shadow-striker": { positions: ["AM"], keys: { finishing: 1, shooting: 0.8, pace: 0.4 } },
  winger: { positions: ["LW", "RW"], keys: { pace: 1, acceleration: 0.8, dribbling: 0.8 } },
  "inside-forward": {
    positions: ["LW", "RW"],
    keys: { finishing: 1, shooting: 0.8, dribbling: 0.6 },
  },
  "target-man": { positions: ["ST"], keys: { heading: 1, strength: 0.8, jumping: 0.8 } },
  poacher: { positions: ["ST"], keys: { finishing: 1, acceleration: 0.5, vision: 0.5 } },
  "complete-forward": {
    positions: ["ST"],
    keys: { finishing: 0.4, passing: 0.4, dribbling: 0.4, pace: 0.3, strength: 0.3 },
    handicap: 2,
  },
}

const BY_POSITION: Record<Position, Archetype[]> = (() => {
  const out = {} as Record<Position, Archetype[]>
  for (const [id, d] of Object.entries(ARCHETYPES) as [Archetype, ArchetypeDef][])
    for (const pos of d.positions) (out[pos] ??= []).push(id)
  return out
})()

/** The archetypes a position can have. */
export function archetypesFor(pos: Position): Archetype[] {
  return BY_POSITION[pos]
}

type Styled = Pick<Player, "id" | "pos" | "ca" | "attrs">

/** His archetype: the type of player, for his natural position, his attributes lean towards. */
export function archetypeOf(p: Styled): Archetype {
  const candidates = BY_POSITION[p.pos]
  const subject = p.attrs ? p : withAttrs(p)
  let best = candidates[0]
  let top = -Infinity
  for (const id of candidates) {
    const d = ARCHETYPES[id]
    let sum = 0
    let weight = 0
    for (const [key, w] of Object.entries(d.keys) as [Attr, number][]) {
      sum += deviation(subject, key) * w
      weight += w
    }
    const score = sum / weight - (d.handicap ?? 0)
    if (score > top) {
      top = score
      best = id
    }
  }
  return best
}

function withAttrs(p: Styled): Styled {
  const copy = { ...p } as Player
  ensureAttrs(copy)
  return copy
}

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
