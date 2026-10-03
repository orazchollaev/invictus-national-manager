/**
 * Every nation's record since the game began — matches, goals, its biggest win and
 * heaviest defeat, its best and worst FIFA ranking — and the players' clean sheets.
 * Kept as matches are played, so nothing has to be rebuilt from old fixtures.
 */
import type { ISODate, Player } from "../types"
import type { Fixture } from "../competition/types"
import type { MatchReport } from "../match/types"
import type { NationRecord, NationState, RecordMatch, RetiredPlayer } from "./types"

/** A goalkeeper keeps a clean sheet by playing this long without conceding. */
export const CLEAN_SHEET_MINUTES = 60

export function emptyRecord(): NationRecord {
  return { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, cleanSheets: 0 }
}

function isBigger(m: RecordMatch, than: RecordMatch | undefined, sign: 1 | -1): boolean {
  if (!than) return true
  const a = (m.gf - m.ga) * sign
  const b = (than.gf - than.ga) * sign
  // The same margin: more goals for a win, more conceded for a defeat.
  return a > b || (a === b && (sign === 1 ? m.gf > than.gf : m.ga > than.ga))
}

/** Count a finished match in a nation's record (a shoot-out is a draw). */
export function recordMatch(n: NationState, f: Fixture, gf: number, ga: number) {
  const r = (n.record ??= emptyRecord())
  r.played++
  r.gf += gf
  r.ga += ga
  if (ga === 0) r.cleanSheets++
  const opp = f.home === n.id ? f.away : f.home
  const m: RecordMatch = { fixture: f.id, date: f.date, opp, gf, ga }
  if (gf > ga) {
    r.won++
    if (isBigger(m, r.biggestWin, 1)) r.biggestWin = m
  } else if (gf < ga) {
    r.lost++
    if (isBigger(m, r.heaviestDefeat, -1)) r.heaviestDefeat = m
  } else r.drawn++
}

/** Goalkeepers who kept a clean sheet in this match get it counted. */
export function recordCleanSheets(report: MatchReport, player: (id: string) => Player | undefined) {
  const conceded = { home: report.result.away, away: report.result.home }
  for (const line of report.lines) {
    if (line.pos !== "GK" || line.minutes < CLEAN_SHEET_MINUTES) continue
    if (conceded[line.side] !== 0) continue
    const p = player(line.playerId)
    if (p) p.cleanSheets = (p.cleanSheets ?? 0) + 1
  }
}

/** Month's end: each FIFA member's ranking position, its best and worst kept. */
export function recordRanks(ranked: string[], nations: Record<string, NationState>, date: ISODate) {
  ranked.forEach((id, i) => {
    const n = nations[id]
    if (!n) return
    const r = (n.record ??= emptyRecord())
    const rank = i + 1
    if (!r.bestRank || rank < r.bestRank[0]) r.bestRank = [rank, date]
    if (!r.worstRank || rank > r.worstRank[0]) r.worstRank = [rank, date]
  })
}

/** One player's line in a nation's all-time lists. */
export interface RecordHolder {
  id: string
  name: string
  pos: string
  caps: number
  goals: number
  assists: number
  cleanSheets: number
  /** Still in the game (a link to the player) or retired. */
  active: boolean
}

export type RecordStat = "goals" | "caps" | "assists" | "cleanSheets"

/**
 * A nation's leading players for each statistic, current and retired together, best
 * first; ties go to fewer caps (the better ratio), then the name.
 */
export function recordHolders(
  players: Player[],
  retired: RetiredPlayer[],
  limit = 5
): Record<RecordStat, RecordHolder[]> {
  const all: RecordHolder[] = [
    ...players.map((p) => ({
      id: p.id,
      name: `${p.first} ${p.last}`,
      pos: p.pos,
      caps: p.caps,
      goals: p.goals,
      assists: p.assists,
      cleanSheets: p.cleanSheets ?? 0,
      active: true,
    })),
    ...retired.map((r) => ({
      id: r.id,
      name: r.name,
      pos: r.pos,
      caps: r.caps,
      goals: r.goals,
      assists: r.assists ?? 0,
      cleanSheets: r.cleanSheets ?? 0,
      active: false,
    })),
  ]
  const top = (stat: RecordStat) =>
    all
      .filter((h) => h[stat] > 0)
      .sort(
        (a, b) =>
          b[stat] - a[stat] ||
          (stat === "caps" ? 0 : a.caps - b.caps) ||
          a.name.localeCompare(b.name)
      )
      .slice(0, limit)
  return {
    goals: top("goals"),
    caps: top("caps"),
    assists: top("assists"),
    cleanSheets: top("cleanSheets"),
  }
}
