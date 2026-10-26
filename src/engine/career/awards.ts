/**
 * The end of a competition's individual honours: its charts are cut from the players'
 * tallies and kept on the competition. The winners are cheered by their own dressing
 * room, and the user hears of his nation's — a top scorer, a player of the tournament,
 * a place in the team of the tournament.
 */
import type { CompetitionInstance, LeaderRow } from "../competition/types"
import { leadersOf } from "../competition/stats"
import { compText, msg, nationText } from "../text"
import type { World } from "../world/world"
import { award } from "./milestones"

const MORALE_BONUS = 6

export type AwardKind = "scorer" | "assister" | "rating" | "keeper" | "player" | "young" | "xi"

export function finishLeaders(world: World, inst: CompetitionInstance) {
  const leaders = leadersOf(inst, world.state.players, world.state.date)
  inst.leaders = leaders
  delete inst.stats

  const me = world.state.career.nationId
  const winners: [AwardKind, LeaderRow][] = []
  const first = (kind: AwardKind, rows: LeaderRow[]) => rows[0] && winners.push([kind, rows[0]])
  first("scorer", leaders.scorers)
  first("assister", leaders.assisters)
  first("rating", leaders.ratings)
  first("keeper", leaders.keepers)
  first("young", leaders.young)
  if (leaders.player) winners.push(["player", leaders.player])
  const picks: [AwardKind, LeaderRow][] = winners.slice()
  for (const r of leaders.xi) picks.push(["xi", r])

  // The honours of the tournament; the team of it only lifts the user's own.
  for (const [, r] of winners) {
    const p = world.state.players[r.id]
    if (p) p.morale = Math.min(100, p.morale + MORALE_BONUS)
  }
  if (!me) return
  for (const [kind, r] of picks) {
    if (r.nation !== me) continue
    world.news(
      "tournament",
      msg("news.award.title", { name: r.name, award: msg(`award.${kind}`) }),
      msg("news.award.body", {
        name: r.name,
        nation: nationText(r.nation),
        comp: compText(inst.defId, inst.year),
        award: msg(`award.${kind}`),
      }),
      true,
      `/player/${r.id}`
    )
    if (kind === "scorer") award(world, "top-scorer", msg("ms.topScorer"))
    if (kind === "player") award(world, "best-player", msg("ms.bestPlayer"))
  }
}
