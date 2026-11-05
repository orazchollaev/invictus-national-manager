/**
 * A player's international record, read from what the world already keeps: the full
 * reports of the user's matches and the charts every finished tournament leaves behind.
 */
import type { CompetitionInstance, CompetitionLeaders } from "@/engine/competition/types"
import type { MatchReport } from "@/engine/match/types"
import type { Fixture } from "@/engine/competition/types"
import type { Player, PlayerSeason } from "@/engine/types"

export interface LogEntry {
  fixtureId: string
  date: string
  opp: string
  compId: string
  minutes: number
  goals: number
  assists: number
  rating: number
}

/** Every stored match report he played in, newest first. */
export function matchLog(
  playerId: string,
  fixtures: Record<string, Fixture>,
  reports: Record<string, MatchReport>
): LogEntry[] {
  const out: LogEntry[] = []
  for (const [id, report] of Object.entries(reports)) {
    const line = report.lines.find((l) => l.playerId === playerId)
    const f = fixtures[id]
    if (!line || !f || !line.minutes) continue
    out.push({
      fixtureId: id,
      date: f.date,
      opp: line.side === "home" ? f.away : f.home,
      compId: f.compId,
      minutes: line.minutes,
      goals: line.goals,
      assists: line.assists,
      rating: line.rating,
    })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export type HonourKind = "player" | "scorer" | "assister" | "rating" | "keeper" | "young" | "xi"

export interface PlayerHonour {
  kind: HonourKind
  inst: CompetitionInstance
}

/** Where he topped a tournament's chart or made its team, latest tournament first. */
export function honoursOf(
  playerId: string,
  competitions: Record<string, CompetitionInstance>
): PlayerHonour[] {
  const out: PlayerHonour[] = []
  const charts: [HonourKind, keyof CompetitionLeaders][] = [
    ["scorer", "scorers"],
    ["assister", "assisters"],
    ["rating", "ratings"],
    ["keeper", "keepers"],
    ["young", "young"],
  ]
  for (const inst of Object.values(competitions)) {
    const l = inst.leaders
    if (!l) continue
    if (l.player?.id === playerId) out.push({ kind: "player", inst })
    for (const [kind, key] of charts) {
      const rows = l[key] as { id: string }[]
      if (rows[0]?.id === playerId) out.push({ kind, inst })
    }
    if (l.xi.some((r) => r.id === playerId)) out.push({ kind: "xi", inst })
  }
  return out.sort((a, b) => b.inst.end.localeCompare(a.inst.end))
}

export interface SeasonRow {
  season: number
  clubId: string
  ca: number
  /** Totals when the season ended (today's, for the one under way). */
  caps: number
  goals: number
  /** Caps and goals won in that season. */
  capsGained: number
  goalsGained: number
  /** The season still being played. */
  current: boolean
}

/**
 * His seasons, newest first, the one under way included. A record is written on 1 July
 * as the season ends, with his totals then, so what he won in a season is the gap to
 * the record before.
 */
export function seasonRows(
  p: Pick<Player, "caps" | "goals" | "history" | "clubId" | "ca">,
  currentSeason: number
): SeasonRow[] {
  const h: PlayerSeason[] = p.history
  const rows: SeasonRow[] = h.map((s, i) => ({
    season: s.season,
    clubId: s.clubId,
    ca: s.ca,
    caps: s.caps,
    goals: s.goals,
    capsGained: Math.max(0, s.caps - (h[i - 1]?.caps ?? 0)),
    goalsGained: Math.max(0, s.goals - (h[i - 1]?.goals ?? 0)),
    current: false,
  }))
  const last = h[h.length - 1]
  rows.push({
    season: currentSeason,
    clubId: p.clubId,
    ca: p.ca,
    caps: p.caps,
    goals: p.goals,
    capsGained: Math.max(0, p.caps - (last?.caps ?? 0)),
    goalsGained: Math.max(0, p.goals - (last?.goals ?? 0)),
    current: true,
  })
  return rows.reverse()
}

/** The season a date falls in: from 1 July, the new one. */
export function seasonOf(date: string): number {
  const [y, m] = date.split("-").map(Number)
  return m >= 7 ? y : y - 1
}

/** "2026–27" for the season that starts in 2026. */
export function seasonLabel(season: number): string {
  return `${season}–${String(season + 1).slice(2)}`
}
