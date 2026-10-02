import type { CompetitionInstance, StageState } from "@/engine/competition/types"
import { isTransitionEdition } from "@/engine/competition/defs/nationsLeague"

/**
 * The key of a line explaining UEFA's six-match groups from 2028 (engine sixMatchRounds),
 * where not everyone meets everyone: groups of six play one opponent twice, groups of
 * twelve six opponents once. Null for every other stage.
 */
export function formatNote(inst: CompetitionInstance, stage: StageState): string | null {
  const sixMatch =
    (inst.defId === "unl" && !isTransitionEdition(inst.year) && stage.key === "league") ||
    (inst.defId === "euroq" && inst.year > 2028 && ["l1", "l2"].includes(stage.key)) ||
    (inst.defId === "wcq-uefa" && ["l1", "l2"].includes(stage.key))
  if (!sixMatch || !stage.groups?.length) return null
  const sizes = new Set(stage.groups.map((g) => g.teams.length))
  if (sizes.size !== 1) return null
  const [size] = sizes
  if (size === 6) return "competitions.detail.formatSix"
  if (size === 12) return "competitions.detail.formatTwelve"
  return null
}
