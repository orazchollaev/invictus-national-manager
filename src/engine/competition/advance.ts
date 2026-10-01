/**
 * Who went on from a stage that is over: the teams in the stages that follow it.
 */
import type { CompContext } from "./runtime"
import { competitionDef } from "./defs"
import type { CompetitionInstance, StageState } from "./types"

/** The stages that wait for `stage`: the next one unless a stage names what it follows. */
export function stagesAfter(
  inst: CompetitionInstance,
  stage: StageState,
  ctx: CompContext
): StageState[] {
  const plans = competitionDef(inst.defId).plan(inst, ctx)
  const at = inst.stages.indexOf(stage)
  return inst.stages.filter((s, i) => {
    const after = plans.find((p) => p.key === s.key)?.after
    return after === undefined ? i === at + 1 : [after ?? []].flat().includes(stage.key)
  })
}

/**
 * The teams that went on from a stage that is over, or null while that is not known
 * yet (a later stage still to be drawn, in a competition still going).
 */
export function advancedFrom(
  inst: CompetitionInstance,
  stage: StageState,
  ctx: CompContext
): Set<string> | null {
  const next = stagesAfter(inst, stage, ctx)
  const drawn = next.filter((s) => s.status !== "waiting")
  if (inst.status !== "done" && drawn.length < next.length) return null
  const teams = new Set<string>()
  for (const s of drawn) {
    for (const g of s.groups ?? []) g.teams.forEach((t) => teams.add(t))
    for (const t of s.rounds?.[0]?.ties ?? []) {
      if (t.home) teams.add(t.home)
      if (t.away) teams.add(t.away)
    }
  }
  if (inst.status === "done")
    for (const t of [...(inst.outcome.qualified ?? []), ...(inst.outcome.interconf ?? [])])
      teams.add(t)
  return teams
}
