/**
 * Nations League builder, after the UEFA format in use since 2024–25:
 *
 *  - League phase in the autumn: leagues of groups, six matchdays.
 *  - March: the top league's group winners and runners-up play two-legged
 *    quarter-finals; at the same time promotion/relegation play-offs are played
 *    between neighbouring leagues (A3 v B2, B3 v C2, C4 v D2), the lower team at
 *    home first.
 *  - June: Finals — semi-finals, third place and final — for the quarter-final winners.
 *  - Direct movement: A4 down; B1 up, B4 down; C1 up and the two worst C4 down;
 *    D1 up. Play-off winners from the lower league swap places with the losers.
 *
 * With `playoffs: false` (CONCACAF) movement is direct only: the last of each group
 * of the upper league swaps with the winners of the lower.
 */
import type { Confed, ISODate } from "@/engine/types"
import { deriveSeed, makeRng } from "@/engine/rng"
import { drawGroups } from "../draw"
import type { CompContext, CompetitionDef, StagePlan } from "../runtime"
import { knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, Standing } from "../types"

export interface NationsLeagueOptions {
  id: string
  short: string
  confed: Confed
  name(year: number): string
  editions(from: number, to: number): number[]
  /** League letters and their sizes, top first; the last takes everyone left. */
  tiers: { letter: string; size: number; groups: number }[]
  leagueDates(year: number): ISODate[]
  leagueDrawDate(year: number): ISODate
  /** March: quarter-final legs (and play-offs). */
  springDates(year: number): [ISODate, ISODate]
  springDrawDate(year: number): ISODate
  finalsDates(year: number): { semi: ISODate; final: ISODate }
  finalsDrawDate(year: number): ISODate
  /** UEFA-style promotion/relegation play-offs; otherwise direct swaps. */
  playoffs: boolean
  /** A real draw for an edition already under way. */
  fixed?(year: number): Record<string, string[][]> | undefined
}

export const letterOf = (groupName: string) => groupName.replace(/\d+$/, "")

function prevYear(o: NationsLeagueOptions, year: number): number {
  const list = o.editions(year - 8, year - 1)
  return list.length ? list[list.length - 1] : year
}

function tierComposition(o: NationsLeagueOptions, inst: CompetitionInstance, ctx: CompContext) {
  const members = ctx.ranked((t) => ctx.confedOf(t) === o.confed)
  const previous = ctx.instance(`${o.id}-${prevYear(o, inst.year)}`)
  const out: Record<string, string[]> = {}
  if (previous?.outcome.tiers) {
    const placed = new Set<string>()
    for (const t of o.tiers) {
      out[t.letter] = (previous.outcome.tiers[t.letter] ?? []).filter((x) => members.includes(x))
      out[t.letter].forEach((x) => placed.add(x))
    }
    // Newly eligible members start in the bottom league.
    const last = o.tiers[o.tiers.length - 1].letter
    for (const m of members) if (!placed.has(m)) out[last].push(m)
    return out
  }
  let cursor = 0
  o.tiers.forEach((t, i) => {
    const size = i === o.tiers.length - 1 ? members.length - cursor : t.size
    out[t.letter] = members.slice(cursor, cursor + size)
    cursor += size
  })
  return out
}

function groupsFor(o: NationsLeagueOptions, inst: CompetitionInstance, ctx: CompContext) {
  const fixed = o.fixed?.(inst.year)
  const names: string[] = []
  const groups: string[][] = []
  const tiers = fixed ? null : tierComposition(o, inst, ctx)
  for (const t of o.tiers) {
    const list = fixed
      ? (fixed[t.letter] ?? [])
      : drawGroups(
          [...tiers![t.letter]].sort((a, b) => ctx.points(b) - ctx.points(a)),
          t.groups,
          makeRng(deriveSeed(ctx.seed, "nl", inst.id, t.letter))
        )
    list.forEach((g, i) => {
      names.push(`${t.letter}${i + 1}`)
      groups.push(g)
    })
  }
  return { names, groups }
}

/** League tables grouped by league letter. */
function tablesByLetter(inst: CompetitionInstance, ctx: CompContext): Record<string, Standing[][]> {
  const stage = inst.stages.find((s) => s.key === "league")
  const tables = standingsOf(inst, "league", ctx, "h2h")
  const out: Record<string, Standing[][]> = {}
  stage?.groups?.forEach((g, gi) => (out[letterOf(g.name)] ??= []).push(tables[gi]))
  return out
}

const best = (a: Standing, b: Standing) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
const at = (tables: Standing[][] | undefined, pos: number) =>
  (tables ?? [])
    .map((t) => t[pos])
    .filter((r): r is Standing => !!r)
    .sort(best)

/** The play-off pairs, each [lower-league team, upper-league team]. */
function playoffPairs(o: NationsLeagueOptions, inst: CompetitionInstance, ctx: CompContext) {
  const t = tablesByLetter(inst, ctx)
  const [A, B, C, D] = o.tiers.map((x) => x.letter)
  const pairs: [string, string][] = []
  // The best upper team meets the weakest lower team.
  const pair = (upper: Standing[], lower: Standing[]) => {
    const low = [...lower].reverse()
    upper.forEach((u, i) => low[i] && pairs.push([low[i].team, u.team]))
  }
  if (B) pair(at(t[A], 2), at(t[B], 1))
  if (C) pair(at(t[B], 2), at(t[C], 1))
  if (D) pair(at(t[C], 3).slice(0, at(t[D], 1).length), at(t[D], 1))
  return pairs
}

export function nationsLeagueDef(o: NationsLeagueOptions): CompetitionDef {
  return {
    id: o.id,
    short: o.short,
    confed: o.confed,
    kind: "nations-league",
    name: o.name,
    editions: o.editions,
    plan(inst, ctx) {
      const { semi, final } = o.finalsDates(inst.year)
      const spring = o.springDates(inst.year)
      const top = o.tiers[0].letter
      const plans: StagePlan[] = [
        {
          key: "league",
          name: "League phase",
          drawDate: o.leagueDrawDate(inst.year),
          importance: "nations-league",
          entrants: () => [],
          groups: {
            count: 0,
            legs: 2,
            dates: o.leagueDates(inst.year),
            // Resolved when the stage is drawn; stable once the previous edition is over.
            get fixed() {
              return groupsFor(o, inst, ctx).groups
            },
            get names() {
              return groupsFor(o, inst, ctx).names
            },
            venue: "home-away",
            tiebreak: "h2h",
          },
        },
        {
          key: "quarter-finals",
          name: "Quarter-finals",
          after: "league",
          drawDate: o.springDrawDate(inst.year),
          importance: "nations-league",
          // Runners-up at home first; group winners host the second leg. Group 1's
          // winner meets group 2's runner-up, and so on round the groups.
          entrants: (c, i) => {
            const t = tablesByLetter(i, c)[top] ?? []
            const out: string[] = []
            t.forEach((g, gi) => {
              const w = g[0]?.team
              const r = t[(gi + 1) % t.length]?.[1]?.team
              if (w && r) out.push(r, w)
            })
            return out
          },
          knockout: {
            rounds: [{ name: "Quarter-finals", dates: spring }],
            pairing: "ordered",
            venue: "home-away",
          },
        },
      ]
      if (o.playoffs) {
        plans.push({
          key: "playoffs",
          name: "Promotion/relegation play-offs",
          after: "league",
          drawDate: o.springDrawDate(inst.year),
          importance: "nations-league",
          entrants: (c, i) => playoffPairs(o, i, c).flat(),
          knockout: {
            rounds: [{ name: "Play-offs", dates: spring }],
            pairing: "ordered",
            venue: "home-away",
          },
        })
      }
      plans.push({
        key: "finals",
        name: "Finals",
        after: "quarter-finals",
        drawDate: o.finalsDrawDate(inst.year),
        importance: "nations-league-finals",
        entrants: (_c, i) => knockoutResult(i, "quarter-finals").finalWinners,
        knockout: {
          rounds: [
            { name: "Semi-finals", dates: [semi] },
            { name: "Final", dates: [final] },
          ],
          pairing: "ordered",
          thirdPlace: final,
          venue: "neutral",
        },
      })
      return plans
    },
    finalize(inst, ctx) {
      const ko = knockoutResult(inst, "finals")
      const t = tablesByLetter(inst, ctx)
      const letters = o.tiers.map((x) => x.letter)
      const tiers: Record<string, string[]> = {}
      for (const l of letters) tiers[l] = (t[l] ?? []).flatMap((tb) => tb.map((r) => r.team))
      const move = (team: string, from: string, to: string) => {
        tiers[from] = tiers[from].filter((x) => x !== team)
        if (!tiers[to].includes(team)) tiers[to].push(team)
      }

      if (o.playoffs) {
        const [A, B, C, D] = letters
        if (B) for (const r of at(t[A], 3)) move(r.team, A, B)
        if (B) for (const r of at(t[B], 0)) move(r.team, B, A)
        if (C) for (const r of at(t[B], 3)) move(r.team, B, C)
        if (C) for (const r of at(t[C], 0)) move(r.team, C, B)
        if (D) {
          // The two worst fourth-placed in C go straight down; the others play off.
          const playoffSpots = at(t[D], 1).length
          for (const r of at(t[C], 3).slice(playoffSpots)) move(r.team, C, D)
          for (const r of at(t[D], 0)) move(r.team, D, C)
        }
        // A lower-league team that wins its play-off swaps with the upper-league loser.
        const stage = inst.stages.find((s) => s.key === "playoffs")
        for (const tie of stage?.rounds?.[0]?.ties ?? []) {
          if (!tie.home || !tie.away || tie.winner !== tie.home) continue
          const lower = letters.find((l) => tiers[l].includes(tie.home!))
          const upper = letters.find((l) => tiers[l].includes(tie.away!))
          if (lower && upper && lower > upper) {
            move(tie.home, lower, upper)
            move(tie.away, upper, lower)
          }
        }
      } else {
        for (let i = 0; i < letters.length - 1; i++) {
          const upper = letters[i]
          const lower = letters[i + 1]
          const firsts = at(t[lower], 0)
          const size = t[upper]?.[0]?.length ?? 4
          const lasts = at(t[upper], size - 1)
            .reverse()
            .slice(0, firsts.length)
          for (const r of lasts) move(r.team, upper, lower)
          for (const r of firsts) move(r.team, lower, upper)
        }
      }
      return { winner: ko.winner, runnerUp: ko.runnerUp, third: ko.third, tiers }
    },
  }
}
