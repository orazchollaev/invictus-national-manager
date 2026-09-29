/**
 * The federation's review when a competition the manager took part in ends: how far
 * the team went, what was asked and what was delivered, who stood out, and what the
 * board makes of it all.
 */
import type { CompetitionInstance } from "../competition/types"
import { ageOn, fullName } from "../players/ability"
import type { World } from "../world/world"
import type { CareerReview, CareerSnapshot, ReviewVerdict } from "../world/types"
import { leagueGroup, ORDER, outcomeFor, playedIn, reached } from "./progress"

/** Kinds of competition that get a review. */
export const REVIEWED = new Set(["qualifier", "continental", "world-cup", "nations-league"])

/** "Champions", "Semi-finals", "Qualified", "Promoted to League B"… */
export function reachedLabel(inst: CompetitionInstance, nationId: string): string {
  const o = inst.outcome
  if (o.winner === nationId) return "Champions"
  if (inst.kind === "qualifier") {
    if (!o.qualified) return "Knocked out"
    return o.qualified.includes(nationId) ? "Qualified" : "Did not qualify"
  }
  if (inst.kind === "nations-league") {
    const found = leagueGroup(inst, nationId)
    const letter = found?.group.name.replace(/\d+$/, "")
    const now = Object.entries(o.tiers ?? {}).find(([, list]) => list.includes(nationId))?.[0]
    if (!letter || !now) return "League stage"
    if (now < letter) return `Promoted to League ${now}`
    if (now > letter) return `Relegated to League ${now}`
    return `Stayed in League ${letter}`
  }
  if (o.runnerUp === nationId) return "Runners-up"
  const deepest = Math.max(...reached(inst, nationId).map((r) => ORDER.indexOf(r)))
  if (deepest <= 0) return "Group stage"
  return ORDER[deepest]
}

export function snapshotOf(world: World, nationId: string | null): CareerSnapshot {
  const c = world.state.career
  return {
    confidence: Math.round(c.confidence),
    reputation: Math.round(c.reputation),
    youth: nationId ? (world.state.nations[nationId]?.youthLevel ?? 0) : 0,
  }
}

const MESSAGES: Record<ReviewVerdict, (name: string, reached: string) => string> = {
  delighted: (name, r) =>
    r === "Champions"
      ? `The federation is delighted. Winning the ${name} is beyond what anyone dared to hope for, and your standing has never been higher.`
      : `The federation is delighted with the ${name}. You have given them more than they asked for.`,
  satisfied: (name) =>
    `The federation is satisfied with the ${name}. The job was done; now they expect you to build on it.`,
  disappointed: (name) =>
    `The federation is disappointed with the ${name}. They expected more, and their patience is not endless.`,
  ultimatum: (name) =>
    `After the ${name}, the federation has run out of patience. Results must improve at once, or they will find someone who can deliver them.`,
  sacked: (name) =>
    `The ${name} was the last straw. The federation has decided to relieve you of your duties.`,
}

/**
 * The review of a finished competition. `before` is the snapshot taken when the
 * nation's campaign began; `sacked` whether the board has just let the manager go.
 */
export function buildReview(
  world: World,
  inst: CompetitionInstance,
  nationId: string,
  before: CareerSnapshot,
  sacked: boolean
): CareerReview {
  const c = world.state.career
  const fixtures = playedIn(world, inst.id, nationId)
  let won = 0
  let drawn = 0
  let lost = 0
  let gf = 0
  let ga = 0
  const stats = new Map<string, { apps: number; goals: number; rating: number }>()
  for (const f of fixtures) {
    const r = outcomeFor(f, nationId)
    gf += r.gf
    ga += r.ga
    if (r.won) won++
    else if (r.lost) lost++
    else drawn++
    const side = f.home === nationId ? "home" : "away"
    for (const line of world.state.reports[f.id]?.lines ?? []) {
      if (line.side !== side) continue
      const s = stats.get(line.playerId) ?? { apps: 0, goals: 0, rating: 0 }
      s.apps++
      s.goals += line.goals
      s.rating += line.rating
      stats.set(line.playerId, s)
    }
  }

  const minApps = Math.max(1, Math.floor(fixtures.length / 3))
  const stars = [...stats.entries()]
    .filter(([id, s]) => s.apps >= minApps && world.state.players[id])
    .map(([id, s]) => ({
      id,
      name: fullName(world.state.players[id]),
      apps: s.apps,
      goals: s.goals,
      rating: Math.round((s.rating / s.apps) * 100) / 100,
    }))
    .sort((a, b) => b.rating - a.rating || b.goals - a.goals)
    .slice(0, 3)
  const youngsters = [...stats.entries()]
    .filter(([id]) => world.state.players[id])
    .map(([id, s]) => {
      const p = world.state.players[id]
      return { id, name: fullName(p), age: ageOn(p.born, world.state.date), apps: s.apps }
    })
    .filter((y) => y.age <= 21)
    .sort((a, b) => b.apps - a.apps)
    .slice(0, 5)

  const objectives = c.objectives
    .filter((o) => o.compInstance === inst.id)
    .map((o) => ({ text: o.text, status: o.status, critical: o.critical }))
  const after = snapshotOf(world, nationId)
  const label = reachedLabel(inst, nationId)
  const delta = after.confidence - before.confidence
  let verdict: ReviewVerdict
  if (sacked) verdict = "sacked"
  else if (c.ultimatum) verdict = "ultimatum"
  else if (objectives.some((o) => o.status === "failed")) verdict = "disappointed"
  else if (label === "Champions" || delta >= 15) verdict = "delighted"
  else if (delta <= -10) verdict = "disappointed"
  else verdict = "satisfied"

  return {
    id: inst.id,
    name: inst.name,
    nationId,
    date: world.state.date,
    reached: label,
    winner: inst.outcome.winner,
    played: fixtures.length,
    won,
    drawn,
    lost,
    gf,
    ga,
    objectives,
    before,
    after,
    stars,
    youngsters,
    verdict,
    message: MESSAGES[verdict](inst.name, label),
  }
}
