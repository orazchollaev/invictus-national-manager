/**
 * Federations: a reputation from 1 to 10 and stadiums from 1 to 5.
 *
 * Reputation rises with trophies and qualifications and drifts back towards what the
 * ranking suggests. It feeds the academies — a federation above its natural standing
 * produces better youngsters (bounded, so no country is transformed overnight) — and,
 * with the stadiums (stadiums.ts), decides who gets to host tournaments. The
 * stadiums' level gives a slightly bigger home advantage.
 */
import type { NationDef } from "../types"
import type { CompetitionInstance } from "../competition/types"
import { clamp } from "../rng"
import type { NationState } from "./types"

/** The reputation a nation's ranking points alone would give it. */
export function baselineReputation(points: number): number {
  return Math.round(clamp(1 + 9 * ((points - 800) / 1200), 1, 10) * 10) / 10
}

export function initialStadium(reputation: number): number {
  return clamp(Math.round(reputation / 2), 1, 5)
}

/** Home advantage in ability points, from the stadium. */
export function homeBoost(stadium: number): number {
  return 1.9 + 0.25 * stadium
}

/** Fill the fields a save from before federations existed does not have. */
export function ensureFederation(n: NationState) {
  n.reputation ??= baselineReputation(n.points)
  n.stadium ??= initialStadium(n.reputation)
}

const TROPHY: Record<string, [number, number]> = {
  // [winner, runner-up]
  "world-cup": [1.2, 0.6],
  continental: [0.7, 0.35],
  "nations-league": [0.3, 0.15],
  "super-cup": [0.2, 0.05],
  regional: [0.15, 0.05],
}

/** Reputation after a competition ends. Returns the nations that moved. */
export function reputationAfter(inst: CompetitionInstance, nations: Record<string, NationState>) {
  const bump = (id: string | undefined, v: number) => {
    const n = id ? nations[id] : undefined
    if (n) n.reputation = Math.round(clamp(n.reputation + v, 1, 10) * 10) / 10
  }
  const o = inst.outcome
  if (inst.kind === "qualifier") {
    // Reaching a World Cup matters more than reaching a continental finals.
    const v = inst.defId.startsWith("wcq") ? 0.2 : 0.1
    for (const t of o.qualified ?? []) bump(t, v)
    return
  }
  const [w, r] = TROPHY[inst.kind] ?? [0, 0]
  bump(o.winner, w)
  bump(o.runnerUp, r)
  bump(o.third, r / 2)
}

/**
 * Once a year: reputation drifts towards the ranking's view and the academies' level
 * follows the reputation (within ±6 of where the nation started).
 */
export function yearlyFederation(n: NationState, def: NationDef) {
  const base = baselineReputation(n.points)
  n.reputation = Math.round(clamp(n.reputation + (base - n.reputation) * 0.15, 1, 10) * 10) / 10

  const target = clamp(
    def.youthLevel + (n.reputation - baselineReputation(def.points)) * 1.5,
    def.youthLevel - 6,
    def.youthLevel + 6
  )
  const step = clamp(target - n.youthLevel, -0.6, 0.6)
  n.youthLevel = Math.round((n.youthLevel + step) * 10) / 10
}
