/**
 * The match report: the result, the team stats and a rating for every player who
 * appeared, from what he did (goals, chances made, tackles, saves, mistakes), how his
 * side fared and how much of the match he played.
 */
import { clamp } from "../rng"
import type { MatchReport, MatchResult, PlayerLine, Side } from "./types"
import { DEFENDER_WEIGHT } from "./strength"
import { other, score, sideOf, type LivePlayer, type MatchState } from "./state"

function winnerOf(state: MatchState): Side | undefined {
  if (!state.setup.knockout) return undefined
  if (state.pens) return state.pens[0] > state.pens[1] ? "home" : "away"
  const agg = state.setup.knockout.aggregate ?? [0, 0]
  const h = state.home.goals + agg[0]
  const a = state.away.goals + agg[1]
  if (h === a) return undefined
  return h > a ? "home" : "away"
}

function rate(
  p: LivePlayer,
  state: MatchState,
  won: boolean,
  lost: boolean,
  cleanSheet: boolean
): number {
  const minutes = Math.max(1, (p.off ?? Math.min(state.minute, 120)) - p.on)
  const group = p.slot
  const defender = DEFENDER_WEIGHT[group] >= 0.7
  let r = 6.27 + p.ratingAdj
  r += p.goals * (group === "CB" || group === "LB" || group === "RB" ? 1.2 : 1)
  r += p.assists * 0.6 + (p.keyPasses - p.assists) * 0.12
  r += p.onTarget * 0.1 - (p.shots - p.onTarget) * 0.04
  r += p.tackles * 0.06 - p.fouls * 0.04
  if (group === "GK") r += p.saves * 0.35 - p.conceded * 0.35 + (cleanSheet ? 0.6 : 0)
  else if (defender) r += -p.conceded * 0.12 + (cleanSheet ? 0.4 : 0)
  r += won ? 0.3 : lost ? -0.2 : 0
  r += (p.base - 70) * 0.012
  // Consistent players land near what they earned; erratic ones swing.
  const swing = (21 - p.consistency) / 20
  r += (state.rng() - 0.5) * 0.8 * swing
  // A cameo is pulled back towards the middle.
  const weight = Math.min(1, minutes / 60)
  r = 6.3 + (r - 6.3) * weight
  return Math.round(clamp(r, 3, 10) * 10) / 10
}

export function buildReport(state: MatchState): MatchReport {
  const winner = winnerOf(state)
  const result: MatchResult = {
    home: state.home.goals,
    away: state.away.goals,
    ht: state.ht ?? score(state),
  }
  if (state.ft) result.ft = state.ft
  if (state.pens) result.pens = state.pens
  if (winner) result.winner = winner

  const total = state.home.possessionMinutes + state.away.possessionMinutes || 1
  state.home.stats.possession = Math.round((state.home.possessionMinutes / total) * 100)
  state.away.stats.possession = 100 - state.home.stats.possession
  for (const side of [state.home, state.away]) side.stats.xg = Math.round(side.stats.xg * 100) / 100

  const lines: PlayerLine[] = []
  for (const s of ["home", "away"] as Side[]) {
    const side = sideOf(state, s)
    const oppGoals = sideOf(state, other(s)).goals
    const won = side.goals > oppGoals
    const lost = side.goals < oppGoals
    for (const p of side.appeared) {
      const end = p.off ?? Math.min(state.minute, state.ft ? 120 : 90)
      lines.push({
        playerId: p.id,
        side: s,
        pos: p.slot,
        started: p.started,
        minutes: Math.max(1, end - p.on),
        goals: p.goals,
        assists: p.assists,
        shots: p.shots,
        onTarget: p.onTarget,
        saves: p.saves,
        yellow: p.yellow,
        red: p.sentOff ? 1 : 0,
        injured: p.injured,
        rating: rate(p, state, won, lost, oppGoals === 0),
      })
    }
  }
  return { result, events: state.events, stats: [state.home.stats, state.away.stats], lines }
}
