/**
 * What every competition must keep true whoever is in it and however many they are:
 * the checks the format tests run on a world that has been played, so a format that
 * does not stretch to a bigger (or smaller) confederation shows up as a named problem
 * rather than a quietly wrong tournament.
 */
import { addDays } from "../calendar/dates"
import { windowNear } from "../calendar/windows"
import type { World } from "../world/world"
import { isPlaceholder } from "./placeholders"
import type { CompetitionInstance, StageState } from "./types"

/** Days a match may be moved from its day by the fixture congestion shuffle. */
const SLIP = 6

/** The league a group belongs to: "A" for A3, "1" for 1B, one shared key otherwise. */
function tierOf(name: string): string {
  return name.match(/^([A-Z])\d+$/)?.[1] ?? name.match(/^(\d)[A-Z]$/)?.[1] ?? ""
}

function sizeProblems(inst: CompetitionInstance, stage: StageState): string[] {
  const out: string[] = []
  const byTier = new Map<string, number[]>()
  for (const g of stage.groups ?? []) {
    const key = tierOf(g.name)
    byTier.set(key, [...(byTier.get(key) ?? []), g.teams.length])
  }
  for (const [tier, sizes] of byTier)
    if (Math.max(...sizes) - Math.min(...sizes) > 1)
      out.push(`${inst.id}/${stage.key} ${tier} groups are uneven: ${sizes.join(",")}`)
  return out
}

function repeatProblems(inst: CompetitionInstance, stage: StageState): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const g of stage.groups ?? [])
    for (const t of g.teams) {
      if (!isPlaceholder(t) && seen.has(t)) out.push(`${inst.id}/${stage.key}: ${t} in two groups`)
      seen.add(t)
    }
  for (const r of stage.rounds ?? []) {
    const inRound = new Set<string>()
    for (const tie of r.ties)
      for (const t of [tie.home, tie.away]) {
        if (!t || isPlaceholder(t)) continue
        if (inRound.has(t)) out.push(`${inst.id}/${stage.key}/${r.name}: ${t} in two ties`)
        inRound.add(t)
      }
  }
  return out
}

/**
 * Problems found in a played world; empty when every competition is sound.
 * - a team is never drawn twice into a stage;
 * - the groups of a league (or of a stage) differ by at most one team;
 * - a team qualifies for a World Cup once, not through two routes;
 * - no match is played after its competition was meant to end, nor off a FIFA window
 *   (unless the competition is played off-window);
 * - a finished competition has no unplayed match.
 */
export function formatProblems(world: World): string[] {
  const s = world.state
  const problems: string[] = []
  const fixtures = Object.values(s.fixtures)

  for (const inst of Object.values(s.competitions)) {
    for (const stage of inst.stages) {
      problems.push(...repeatProblems(inst, stage), ...sizeProblems(inst, stage))
    }
    const own = fixtures.filter((f) => f.compId === inst.id)
    for (const f of own) {
      // A match nudged off a congested day may land up to SLIP days late (runtime freeDate).
      if (f.date > addDays(inst.end, SLIP))
        problems.push(`${inst.id}: ${f.id} on ${f.date}, after ${inst.end}`)
      // Finals tournaments are hosted and played in their own weeks; qualifying and
      // the Nations League belong to the international windows.
      const windowed = inst.kind === "qualifier" || inst.kind === "nations-league"
      if (windowed && !inst.offWindow && !windowNear(f.date))
        problems.push(`${inst.id}: ${f.id} on ${f.date} is in no FIFA window`)
      if (inst.status === "done" && !f.result) problems.push(`${inst.id}: ${f.id} never played`)
    }
  }

  // A World Cup is always 48 teams, none of them still a place waiting for a play-off.
  for (const inst of Object.values(s.competitions)) {
    if (inst.defId !== "wc") continue
    const teams = inst.stages[0]?.groups?.flatMap((g) => g.teams) ?? []
    if (teams.length && teams.length !== 48)
      problems.push(`${inst.id} has ${teams.length} teams, not 48`)
    if (inst.status === "done" && teams.some(isPlaceholder))
      problems.push(`${inst.id} finished with a place still to be decided`)
  }

  // One route to each World Cup.
  const routes = new Map<string, Map<string, string>>()
  for (const inst of Object.values(s.competitions)) {
    if (inst.kind !== "qualifier" || !inst.defId.startsWith("wcq")) continue
    const finals = routes.get(String(inst.year)) ?? new Map<string, string>()
    for (const t of inst.outcome.qualified ?? []) {
      const earlier = finals.get(t)
      if (earlier && earlier !== inst.id)
        problems.push(`${t} qualified for the ${inst.year} World Cup in ${earlier} and ${inst.id}`)
      finals.set(t, inst.id)
    }
    routes.set(String(inst.year), finals)
  }

  return [...new Set(problems)]
}
