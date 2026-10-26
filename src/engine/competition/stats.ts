/**
 * Who did what in a competition: the top scorers and assisters, the best rated, the
 * keepers with most clean sheets, the best young player, the player and the team of
 * the tournament. Every match of every competition feeds a small tally per player
 * (qualifiers included); when the competition ends the charts are cut from it, kept,
 * and the tallies are dropped.
 */
import type { MatchReport } from "../match/types"
import { ageOn, positionGroup } from "../players/ability"
import type { ISODate, Player, PositionGroup } from "../types"
import type { CompetitionInstance, CompetitionLeaders, LeaderRow, PlayerTally } from "./types"

/** Ratings count from this many minutes on, as in a player's international record. */
const RATED_MINUTES = 30
/** A keeper keeps a clean sheet by playing at least this long. */
const KEEPER_MINUTES = 60
const TOP = 10
const YOUNG_AGE = 21
/** The side picked as the team of the tournament: 4-3-3. */
const XI: Record<PositionGroup, number> = { GK: 1, DEF: 4, MID: 3, FWD: 3 }

/** Add one finished match to the competition's tallies. */
export function recordStats(inst: CompetitionInstance, report: MatchReport) {
  const stats = (inst.stats ??= {})
  const conceded = { home: report.result.away, away: report.result.home }
  for (const line of report.lines) {
    const t = (stats[line.playerId] ??= {
      pos: line.pos,
      a: 0,
      m: 0,
      g: 0,
      s: 0,
      r: 0,
      rn: 0,
      cs: 0,
    })
    t.a++
    t.m += line.minutes
    t.g += line.goals
    t.s += line.assists
    if (line.minutes >= RATED_MINUTES) {
      t.r = Math.round((t.r + line.rating) * 10) / 10
      t.rn++
    }
    if (line.pos === "GK" && line.minutes >= KEEPER_MINUTES && conceded[line.side] === 0) t.cs++
  }
}

type Entry = { id: string; t: PlayerTally; p: Player }

const avg = (t: PlayerTally) => (t.rn ? t.r / t.rn : 0)

/** How good a tournament a player had, for the player and the team of the tournament. */
const form = (t: PlayerTally) => avg(t) + 0.12 * t.g + 0.08 * t.s + 0.1 * t.cs

function row({ id, t, p }: Entry): LeaderRow {
  return {
    id,
    name: `${p.first} ${p.last}`,
    nation: p.nationId,
    pos: t.pos,
    apps: t.a,
    goals: t.g,
    assists: t.s,
    rating: Math.round(avg(t) * 10) / 10,
    clean: t.cs,
  }
}

/**
 * The charts so far, or at the end. Ratings, the keepers, the young player and both
 * "of the tournament" picks need a fair number of games, so someone who came on once
 * and scored cannot top them.
 */
export function leadersOf(
  inst: CompetitionInstance,
  players: Record<string, Player>,
  on: ISODate
): CompetitionLeaders {
  const entries: Entry[] = []
  for (const [id, t] of Object.entries(inst.stats ?? {})) {
    const p = players[id]
    if (p) entries.push({ id, t, p })
  }
  const maxApps = entries.reduce((n, e) => Math.max(n, e.t.a), 0)
  const minApps = Math.max(1, Math.ceil(maxApps / 2))
  const regulars = entries.filter((e) => e.t.rn >= minApps)

  const top = (list: Entry[], by: (a: Entry, b: Entry) => number, n = TOP) =>
    [...list].sort((a, b) => by(a, b) || a.t.m - b.t.m || (a.id < b.id ? -1 : 1)).slice(0, n)

  const scorers = top(
    entries.filter((e) => e.t.g > 0),
    (a, b) => b.t.g - a.t.g || b.t.s - a.t.s
  )
  const assisters = top(
    entries.filter((e) => e.t.s > 0),
    (a, b) => b.t.s - a.t.s || b.t.g - a.t.g
  )
  const ratings = top(regulars, (a, b) => avg(b.t) - avg(a.t) || b.t.g - a.t.g)
  const keepers = top(
    entries.filter((e) => e.t.pos === "GK" && e.t.cs > 0),
    (a, b) => b.t.cs - a.t.cs || avg(b.t) - avg(a.t),
    5
  )
  const young = top(
    regulars.filter((e) => ageOn(e.p.born, inst.start) <= YOUNG_AGE),
    (a, b) => form(b.t) - form(a.t),
    5
  )

  const xi: Entry[] = []
  for (const group of ["GK", "DEF", "MID", "FWD"] as PositionGroup[]) {
    const inGroup = (e: Entry) => positionGroup(e.t.pos) === group
    // Regulars first; a thin group is filled from whoever else played there.
    const pool = [
      ...regulars.filter(inGroup),
      ...entries.filter((e) => inGroup(e) && !regulars.includes(e)),
    ]
    xi.push(...top(pool, (a, b) => form(b.t) - form(a.t), XI[group]))
  }
  const best = top(regulars, (a, b) => form(b.t) - form(a.t), 1)[0]

  return {
    on,
    minApps,
    scorers: scorers.map(row),
    assisters: assisters.map(row),
    ratings: ratings.map(row),
    keepers: keepers.map(row),
    young: young.map(row),
    xi: xi.map(row),
    player: best ? row(best) : null,
  }
}

/** Charts are empty until the first goal or a regular's rating exists. */
export function hasLeaders(l: CompetitionLeaders): boolean {
  return !!(l.scorers.length || l.assisters.length || l.ratings.length || l.xi.length)
}
