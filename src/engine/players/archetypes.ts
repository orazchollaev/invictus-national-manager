/**
 * What kind of player somebody is, beyond a number. Every player has one archetype for
 * his natural position, drawn from his id so it never changes and needs no saved state.
 * The match engine reads the same numbers the player card explains: nothing here is
 * decoration.
 *
 * Every factor is 1 (or 0 for points) when the archetype changes nothing, so a squad of
 * mixed types plays like the old one and only lopsided squads feel different.
 */
import { msg, type Msg } from "../text"
import type { ISODate, Player, Position } from "../types"
import { deriveSeed, makeRng, pickWeighted } from "../rng"
import { ageOn } from "./ability"

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
}

export interface ArchetypeDef extends Modifiers {
  positions: Position[]
  /** Share of players of those positions who get it. */
  weight: number
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
}

function def(positions: Position[], change: Partial<ArchetypeDef> = {}, weight = 1): ArchetypeDef {
  return { ...NEUTRAL, positions, weight, ...change }
}

export const ARCHETYPES: Record<Archetype, ArchetypeDef> = {
  "shot-stopper": def(["GK"], {
    unit: [0.99, 1, 1],
    keeper: 1.5,
  }),
  "sweeper-keeper": def(["GK"], { unit: [1.02, 1.01, 1], keeper: -1 }),
  stopper: def(["CB"], {
    unit: [1.04, 0.92, 0.9],
    tackle: 1.25,
    header: 1.15,
    foul: 1.15,
  }),
  "ball-playing-defender": def(["CB"], {
    unit: [0.97, 1.1, 1.1],
    assist: 1.6,
    header: 0.9,
    tackle: 0.9,
  }),
  "defensive-full-back": def(["LB", "RB"], { unit: [1.04, 0.93, 0.87], tackle: 1.15, assist: 0.8 }),
  "attacking-full-back": def(["LB", "RB"], { unit: [0.95, 1.06, 1.15], assist: 1.4, score: 1.3 }),
  "ball-winner": def(["DM"], { unit: [1.05, 0.97, 0.8], tackle: 1.2, foul: 1.25 }),
  "deep-playmaker": def(["DM"], {
    unit: [0.93, 1.06, 1.2],
    assist: 1.5,
  }),
  "box-to-box": def(["CM"], { unit: [1.04, 0.97, 1], score: 1.25, tackle: 1.1 }),
  playmaker: def(["CM"], {
    unit: [0.94, 1.06, 1],
    assist: 1.5,
  }),
  creator: def(["AM"], {
    unit: [1, 1.02, 0.98],
    assist: 1.4,
    score: 0.85,
    finish: -0.5,
  }),
  "shadow-striker": def(["AM"], {
    unit: [1, 0.98, 1.02],
    score: 1.35,
    assist: 0.8,
    finish: 0.5,
  }),
  winger: def(["LW", "RW"], {
    unit: [1, 1.02, 0.98],
    assist: 1.35,
    score: 0.85,
    finish: -0.5,
  }),
  "inside-forward": def(["LW", "RW"], {
    unit: [1, 0.98, 1.02],
    score: 1.3,
    assist: 0.9,
    finish: 0.5,
  }),
  "target-man": def(["ST"], {
    unit: [1, 1.15, 1],
    header: 1.4,
    assist: 1.2,
    score: 0.95,
    finish: -1.5,
  }),
  poacher: def(["ST"], {
    unit: [1, 0.8, 1],
    score: 1.3,
    finish: 1.5,
    header: 0.85,
    assist: 0.6,
  }),
  "complete-forward": def(["ST"], { unit: [1, 1.1, 1.03], score: 1.1, assist: 1.1 }, 0.5),
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

/** His archetype: fixed by his id and natural position, so it never changes. */
export function archetypeOf(p: Pick<Player, "id" | "pos">): Archetype {
  const rng = makeRng(deriveSeed(0, "archetype", p.id))
  return pickWeighted(rng, BY_POSITION[p.pos], (a) => ARCHETYPES[a].weight)
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
