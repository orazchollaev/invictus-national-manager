/**
 * How far a nation got in a competition — shared by the objectives (career.ts) and
 * the federation's review at the end of a competition (review.ts).
 */
import type { CompetitionInstance, Fixture } from "../competition/types"
import type { World } from "../world/world"

/** Knockout rounds from the group stage up, as competitions name them. */
export const ORDER = [
  "groups",
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
]

/** How deep a team went in a knockout: the names of the rounds it played. */
export function reached(inst: CompetitionInstance, nationId: string): string[] {
  const out: string[] = []
  for (const s of inst.stages) {
    if (s.groups?.some((g) => g.teams.includes(nationId))) out.push("groups")
    for (const r of s.rounds ?? [])
      if (r.ties.some((t) => t.home === nationId || t.away === nationId)) out.push(r.name)
  }
  return out
}

/** The Nations League group a team plays in, and the stage it belongs to. */
export function leagueGroup(inst: CompetitionInstance, nationId: string) {
  for (const stage of inst.stages) {
    const group = stage.groups?.find((g) => g.teams.includes(nationId))
    if (group) return { stage, group }
  }
  return null
}

/** The nation's played fixtures in a competition, oldest first. */
export function playedIn(world: World, compId: string, nationId: string): Fixture[] {
  return world.fixturesOf(nationId).filter((f) => f.compId === compId && f.result)
}

/** Goals for and against, and the outcome, from one side's point of view. */
export function outcomeFor(f: Fixture, nationId: string) {
  const home = f.home === nationId
  const gf = home ? f.result!.h : f.result!.a
  const ga = home ? f.result!.a : f.result!.h
  const shootout = f.result!.w
  const won = gf > ga || (gf === ga && !!shootout && shootout === (home ? "home" : "away"))
  const lost = gf < ga || (gf === ga && !!shootout && shootout !== (home ? "home" : "away"))
  return { gf, ga, won, lost, drawn: !won && !lost }
}
