/**
 * What the manager asks of the player in a slot. A role reshapes the slot — more attack
 * for less defence, more tackling for fewer passes — and when it suits the player's
 * archetype he plays above himself in it. Every role is a trade-off, never a free gain,
 * and a slot with no role is the plain version of the position.
 */
import type { Position } from "../types"
import {
  ARCHETYPES,
  NEUTRAL,
  type Archetype,
  type ArchetypeDef,
  type Modifiers,
} from "../players/archetypes"

export type Role =
  | "stopper"
  | "ball-playing"
  | "cover"
  | "defensive-full-back"
  | "wing-back"
  | "inverted-full-back"
  | "anchor"
  | "ball-winner"
  | "deep-playmaker"
  | "box-to-box"
  | "playmaker"
  | "destroyer"
  | "advanced-playmaker"
  | "shadow-striker"
  | "tracker"
  | "winger"
  | "inside-forward"
  | "tracking-winger"
  | "target-man"
  | "poacher"
  | "complete-forward"
  | "pressing-forward"

export interface RoleDef extends Modifiers {
  positions: Position[]
  /** Archetypes that play this role above themselves. */
  suits: Archetype[]
}

/** Ability points a player gains in a role that suits his archetype. */
export const ROLE_SUIT_BONUS = 2

function role(positions: Position[], suits: Archetype[], change: Partial<Modifiers>): RoleDef {
  return { ...NEUTRAL, ...change, positions, suits }
}

export const ROLES: Record<Role, RoleDef> = {
  stopper: role(["CB"], ["stopper"], {
    unit: [1.03, 0.95, 0.92],
    tackle: 1.2,
    header: 1.1,
    foul: 1.1,
  }),
  "ball-playing": role(["CB"], ["ball-playing-defender"], {
    unit: [0.97, 1.06, 1.06],
    assist: 1.5,
    tackle: 0.9,
  }),
  cover: role(["CB"], [], {
    unit: [1.02, 1, 0.98],
    foul: 0.85,
    assist: 0.8,
  }),
  "defensive-full-back": role(["LB", "RB"], ["defensive-full-back"], {
    unit: [1.04, 0.94, 0.88],
    tackle: 1.15,
    assist: 0.8,
  }),
  "wing-back": role(["LB", "RB"], ["attacking-full-back"], {
    unit: [0.94, 1.06, 1.16],
    assist: 1.4,
    score: 1.25,
  }),
  "inverted-full-back": role(["LB", "RB"], [], { unit: [1, 1.08, 0.95], assist: 1.2, score: 0.8 }),
  anchor: role(["DM"], [], {
    unit: [1.05, 0.95, 0.85],
    tackle: 1.15,
    foul: 0.9,
  }),
  "ball-winner": role(["DM"], ["ball-winner"], {
    unit: [1.04, 0.98, 0.85],
    tackle: 1.25,
    foul: 1.3,
  }),
  "deep-playmaker": role(["DM"], ["deep-playmaker"], { unit: [0.94, 1.06, 1.15], assist: 1.5 }),
  "box-to-box": role(["CM"], ["box-to-box"], {
    unit: [1.03, 0.97, 1.04],
    score: 1.25,
    tackle: 1.1,
  }),
  playmaker: role(["CM"], ["playmaker"], { unit: [0.94, 1.06, 1.02], assist: 1.5 }),
  destroyer: role(["CM"], [], {
    unit: [1.06, 0.96, 0.88],
    tackle: 1.25,
    foul: 1.25,
  }),
  "advanced-playmaker": role(["AM"], ["creator"], {
    unit: [1, 1.05, 0.97],
    assist: 1.45,
    score: 0.85,
  }),
  "shadow-striker": role(["AM"], ["shadow-striker"], {
    unit: [1, 0.95, 1.06],
    score: 1.35,
    assist: 0.8,
  }),
  tracker: role(["AM"], [], {
    unit: [1.06, 1, 0.94],
    tackle: 1.2,
    score: 0.85,
  }),
  winger: role(["LW", "RW"], ["winger"], {
    unit: [1, 1.03, 0.97],
    assist: 1.35,
    score: 0.85,
  }),
  "inside-forward": role(["LW", "RW"], ["inside-forward"], {
    unit: [0.98, 0.97, 1.06],
    score: 1.3,
    assist: 0.9,
  }),
  "tracking-winger": role(["LW", "RW"], [], { unit: [1.06, 1.02, 0.9], tackle: 1.2 }),
  "target-man": role(["ST"], ["target-man"], {
    unit: [1, 1.12, 0.98],
    header: 1.4,
    assist: 1.2,
    score: 0.95,
  }),
  poacher: role(["ST"], ["poacher"], {
    unit: [1, 0.85, 1.05],
    score: 1.3,
    header: 0.85,
    assist: 0.6,
  }),
  "complete-forward": role(["ST"], ["complete-forward"], {
    unit: [0.97, 1.08, 1.03],
    score: 1.1,
    assist: 1.1,
  }),
  "pressing-forward": role(["ST"], [], { unit: [1.05, 1.02, 0.95], tackle: 1.3, foul: 1.2 }),
}

/** The roles a slot can ask for. */
export function rolesFor(pos: Position): Role[] {
  return (Object.keys(ROLES) as Role[]).filter((r) => ROLES[r].positions.includes(pos))
}

/** Whether a role can be asked of a slot. */
export function validRole(r: Role | undefined | null, pos: Position): r is Role {
  return !!r && !!ROLES[r] && ROLES[r].positions.includes(pos)
}

/** The role that suits a player's archetype best in a slot, if any does. */
export function suggestedRole(arch: Archetype, pos: Position): Role | undefined {
  return rolesFor(pos).find((r) => ROLES[r].suits.includes(arch))
}

/** Whether the role is one the archetype plays above itself in. */
export function suitsRole(arch: Archetype, r: Role | null | undefined): boolean {
  return !!r && ROLES[r].suits.includes(arch)
}

const product = (
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] => [a[0] * b[0], a[1] * b[1], a[2] * b[2]]

/** What a player does in a match: his archetype's modifiers with his role's on top. */
export function combineStyle(arch: Archetype, r: Role | null | undefined): Modifiers {
  const a: ArchetypeDef = ARCHETYPES[arch]
  if (!r) return a
  const d = ROLES[r]
  return {
    unit: product(a.unit, d.unit),
    score: a.score * d.score,
    assist: a.assist * d.assist,
    header: a.header * d.header,
    tackle: a.tackle * d.tackle,
    foul: a.foul * d.foul,
    finish: a.finish + d.finish,
    keeper: a.keeper + d.keeper,
  }
}
