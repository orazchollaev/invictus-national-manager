import { advancedFrom } from "@/engine/competition/advance"
import { competitionDef } from "@/engine/competition/defs"
import { finishers, standingsOf, type CompContext } from "@/engine/competition/runtime"
import { groupStandings } from "@/engine/competition/tables"
import type {
  CompetitionInstance,
  GroupTable,
  StageState,
  Standing,
} from "@/engine/competition/types"
import { outlookOf, type Outlook } from "./outlook"
import { zonesFor, type Zone } from "./zones"

export interface GroupView {
  rows: Standing[]
  zones: (Zone | null)[]
  outlook: Outlook[]
}

/** A group's table with what each position leads to and who is already through or out. */
export function groupView(
  inst: CompetitionInstance,
  stage: StageState,
  group: GroupTable,
  ctx: CompContext
): GroupView {
  const plan = competitionDef(inst.defId)
    .plan(inst, ctx)
    .find((p) => p.key === stage.key)
  const rows = groupStandings(group, ctx.fixture, plan?.groups?.tiebreak ?? "gd", ctx.points)
  const zones = zonesFor(
    inst,
    group.name,
    rows.length,
    ctx,
    stage.key,
    rows.map((r) => r.team)
  )
  const left = rows.map(
    (r) =>
      group.fixtures.filter((id) => {
        const f = ctx.fixture(id)
        return f && !f.result && (f.home === r.team || f.away === r.team)
      }).length
  )
  // Nations Leagues move teams between leagues rather than on: their markers say it all.
  const outlook =
    inst.kind === "nations-league"
      ? rows.map(() => null)
      : outlookOf(
          rows,
          left,
          zones,
          stage.status === "done" ? advancedFrom(inst, stage, ctx) : undefined
        )
  return { rows, zones, outlook }
}

export interface BestPlaced {
  title: string
  rows: Standing[]
  /** How many of them go on. */
  places: number
}

/**
 * The ranking across groups that decides the last places: the best third-placed
 * teams of a 24- or 48-team finals, the best runners-up of a qualifying round.
 */
export function bestPlaced(
  inst: CompetitionInstance,
  stage: StageState,
  ctx: CompContext
): BestPlaced | null {
  const groups = stage.groups ?? []
  if (groups.length < 2) return null
  const plans = competitionDef(inst.defId).plan(inst, ctx)
  const plan = plans.find((p) => p.key === stage.key)
  const zones = zonesFor(inst, groups[0].name, groups[0].teams.length, ctx, stage.key)
  const pos = zones.findIndex(
    (z) => z === "third" || z === "maybe" || (z === "playoff" && inst.defId === "wcq-caf")
  )
  if (pos < 1) return null
  let places = 0
  if (inst.kind === "qualifier") {
    places = inst.defId === "euroq" ? 8 : inst.defId === "wcq-caf" ? 4 : 0
  } else {
    const ko = plans.find((p) => p.knockout && p.key !== stage.key)?.knockout
    if (ko) places = 2 ** ko.rounds.length - groups.length * pos
  }
  if (places < 1 || places >= groups.length) return null
  const tables = standingsOf(inst, stage.key, ctx, plan?.groups?.tiebreak ?? "gd")
  return {
    title: pos === 1 ? "competitions.best.runnersUp" : "competitions.best.thirds",
    rows: finishers(tables, pos),
    places,
  }
}
