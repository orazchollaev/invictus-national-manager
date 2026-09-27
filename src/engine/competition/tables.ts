import type { Fixture, GroupTable, Standing } from "./types"

export type Tiebreak = "gd" | "h2h"

function blank(team: string): Standing {
  return { team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
}

function tally(rows: Map<string, Standing>, fixtures: Fixture[]) {
  for (const f of fixtures) {
    if (!f.result) continue
    const h = rows.get(f.home)
    const a = rows.get(f.away)
    if (!h || !a) continue
    const { h: hg, a: ag } = f.result
    h.p++
    a.p++
    h.gf += hg
    h.ga += ag
    a.gf += ag
    a.ga += hg
    if (hg > ag) {
      h.w++
      a.l++
      h.pts += 3
    } else if (hg < ag) {
      a.w++
      h.l++
      a.pts += 3
    } else {
      h.d++
      a.d++
      h.pts++
      a.pts++
    }
  }
  for (const r of rows.values()) r.gd = r.gf - r.ga
}

const byRecord = (a: Standing, b: Standing) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf

/**
 * Standings for a group. `gd`: points, goal difference, goals scored (FIFA).
 * `h2h`: points, then the head-to-head mini-table among teams level on points,
 * then overall goal difference (UEFA). `points` (ranking) breaks what is left.
 */
export function groupStandings(
  group: GroupTable,
  fixtureById: (id: string) => Fixture | undefined,
  rule: Tiebreak = "gd",
  points: (team: string) => number = () => 0
): Standing[] {
  const rows = new Map(group.teams.map((t) => [t, blank(t)]))
  const fixtures = group.fixtures.map(fixtureById).filter((f): f is Fixture => !!f)
  tally(rows, fixtures)
  const list = [...rows.values()]

  if (rule === "gd") return list.sort((a, b) => byRecord(a, b) || points(b.team) - points(a.team))

  list.sort((a, b) => b.pts - a.pts)
  const out: Standing[] = []
  for (let i = 0; i < list.length;) {
    let j = i
    while (j < list.length && list[j].pts === list[i].pts) j++
    const block = list.slice(i, j)
    if (block.length > 1) {
      const ids = new Set(block.map((r) => r.team))
      const mini = new Map(block.map((r) => [r.team, blank(r.team)]))
      tally(
        mini,
        fixtures.filter((f) => ids.has(f.home) && ids.has(f.away))
      )
      block.sort((a, b) => {
        const ma = mini.get(a.team)!
        const mb = mini.get(b.team)!
        return byRecord(ma, mb) || byRecord(a, b) || points(b.team) - points(a.team)
      })
    }
    out.push(...block)
    i = j
  }
  return out
}

/** Rank rows from different groups against each other (best thirds, runners-up). */
export function compareAcrossGroups(a: Standing, b: Standing): number {
  // Groups of different sizes compare on points per game.
  const pa = a.p ? a.pts / a.p : 0
  const pb = b.p ? b.pts / b.p : 0
  return pb - pa || b.gd / Math.max(1, b.p) - a.gd / Math.max(1, a.p) || b.gf - a.gf
}
