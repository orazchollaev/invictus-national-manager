/**
 * UEFA: the European Championship and its qualifying, the Nations League, and the
 * Finalissima against South America's champions.
 *
 * Euro 2028 (UK and Ireland, 9 June – 9 July) and Euro 2032 (Italy and Türkiye) are
 * awarded; later hosts are chosen in-game. Qualifying follows the Euro 2024 shape:
 * ten groups, the top two qualify, the rest through play-off paths in March.
 */
import { iso, addDays } from "@/engine/calendar/dates"
import { slots, window } from "@/engine/calendar/windows"
import { AWARDED_HOSTS, NATIONS_LEAGUE_2026 } from "@/data/start"
import type { CompContext, CompetitionDef } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance } from "../types"
import { finalsDef, qualifierDef } from "./builders"
import { everyNYears, pickHosts } from "./helpers"
import { leagueRanking, nationsLeagueDef } from "./nationsLeague"

const euroYears = everyNYears(2028, 4)

function euroHosts(year: number, ctx: CompContext): string[] {
  return (
    AWARDED_HOSTS[`euro-${year}`] ??
    pickHosts(
      ctx,
      `euro-${year}`,
      ctx.ranked((t) => ctx.confedOf(t) === "UEFA"),
      1
    )
  )
}

/** Hosts that skip qualifying: all of them for one or two hosts, the best two otherwise. */
function autoHosts(year: number, ctx: CompContext): string[] {
  return [...euroHosts(year, ctx)].sort((a, b) => ctx.points(b) - ctx.points(a)).slice(0, 2)
}

export const euro: CompetitionDef = finalsDef({
  id: "euro",
  short: "Euro",
  confed: "UEFA",
  kind: "continental",
  name: (y) => `UEFA Euro ${y}`,
  editions: euroYears,
  teams: 24,
  groups: 6,
  perGroup: 2,
  bestThirds: 4,
  thirdPlace: false,
  start: (y) => iso(y, 6, 9),
  // December, before the March play-offs: their winners are drawn as placeholders.
  drawDate: (y) => iso(y - 1, 12, 2),
  hosts: euroHosts,
  importance: ["continental", "continental-ko"],
  tiebreak: "h2h",
  eligible: (t, ctx) => ctx.confedOf(t) === "UEFA",
  entrants(inst, ctx) {
    const q = ctx.instance(`euroq-${inst.year}`)
    const known = q ? (euroQualifying.provisional?.(q, ctx) ?? []) : []
    const hosts = autoHosts(inst.year, ctx)
    const rest = known.filter((t) => !hosts.includes(t))
    return [...hosts, ...rest.sort((a, b) => ctx.points(b) - ctx.points(a))]
  },
})

export const euroQualifying: CompetitionDef = qualifierDef({
  id: "euroq",
  short: "Euro Qualifying",
  confed: "UEFA",
  name: (y) => `UEFA Euro ${y} Qualifying`,
  editions: euroYears,
  finals: (y) => `euro-${y}`,
  entrants: (inst, ctx) => {
    const hosts = autoHosts(inst.year, ctx)
    return ctx.ranked((t) => ctx.confedOf(t) === "UEFA" && !hosts.includes(t))
  },
  groups: () => 10,
  groupSize: 6,
  groupDrawDate: (y) => iso(y - 2, 12, 6),
  groupDates: (y) => slots(y - 1, ["mar", "jun", "sep", "nov"]),
  tiebreak: "h2h",
  runnersUpQualify: true,
  playoff: {
    paths: euroPaths,
    teamsPerPath: 4,
    /**
     * Play-off places come from the Nations League, as for Euro 2024: one path per
     * league, A first, each made of that league's four best-ranked teams that did not
     * qualify through the groups. A league short of teams is topped up with the next
     * best-ranked teams.
     */
    entrants(inst, ctx) {
      const paths = euroPaths(inst, ctx)
      const tables = standingsOf(inst, "groups", ctx, "h2h")
      const qualified = new Set([
        ...autoHosts(inst.year, ctx),
        ...finishers(tables, 0).map((r) => r.team),
        ...finishers(tables, 1).map((r) => r.team),
      ])
      const nl = ctx.instance(`unl-${inst.year - 2}`)
      const ranking = (nl ? leagueRanking(nl, ctx) : []).filter((x) => !qualified.has(x.team))
      const fallback = [2, 3].flatMap((pos) => finishers(tables, pos).map((r) => r.team))
      const used = new Set<string>()
      const out: string[] = []
      "ABCD"
        .slice(0, paths)
        .split("")
        .forEach((letter) => {
          const path = ranking
            .filter((x) => x.letter === letter && !used.has(x.team))
            .map((x) => x.team)
          for (const t of [...ranking.map((x) => x.team), ...fallback]) {
            if (path.length >= 4) break
            if (!used.has(t) && !path.includes(t)) path.push(t)
          }
          const seeds = path.slice(0, 4)
          seeds.forEach((t) => used.add(t))
          // Seed 1 v 4 and 2 v 3, the winners meeting in the path final.
          out.push(seeds[0], seeds[3], seeds[1], seeds[2])
        })
      return out.filter(Boolean)
    },
    rounds: (y) => {
      const [semi, final] = slots(y, ["mar"])
      return [
        { name: "Play-off semi-finals", dates: [semi] },
        { name: "Play-off finals", dates: [final] },
      ]
    },
    drawDate: (y) => iso(y - 1, 11, 24),
  },
})

/** Euro play-off paths: the places left after the hosts and the top two of each group. */
function euroPaths(inst: CompetitionInstance, ctx: CompContext): number {
  return Math.max(0, 24 - autoHosts(inst.year, ctx).length - 20)
}

export const uefaNationsLeague: CompetitionDef = nationsLeagueDef({
  id: "unl",
  short: "Nations League",
  confed: "UEFA",
  name: (y) => `UEFA Nations League ${y}–${String(y + 1).slice(2)}`,
  editions: everyNYears(2026, 2),
  tiers: [
    { letter: "A", size: 16, groups: 4 },
    { letter: "B", size: 16, groups: 4 },
    { letter: "C", size: 16, groups: 4 },
    { letter: "D", size: 6, groups: 2 },
  ],
  leagueDates: (y) => slots(y, ["sep", "nov"]),
  leagueDrawDate: (y) => iso(y, 2, 12),
  finalsDates: (y) => {
    const w = window(y + 1, "jun")
    return { semi: w.slots[0], final: addDays(w.slots[1], 1) }
  },
  springDates: (y) => slots(y + 1, ["mar"]) as [string, string],
  springDrawDate: (y) => iso(y, 11, 26),
  finalsDrawDate: (y) => iso(y + 1, 4, 5),
  fixed: (y) => (y === 2026 ? NATIONS_LEAGUE_2026 : undefined),
})

/** Euro winners against Copa América winners, the March after both. */
export const finalissima: CompetitionDef = {
  id: "finalissima",
  short: "Finalissima",
  confed: "FIFA",
  kind: "super-cup",
  name: (y) => `Finalissima ${y}`,
  editions: everyNYears(2029, 4),
  plan(inst: CompetitionInstance) {
    return [
      {
        key: "final",
        name: "Final",
        drawDate: iso(inst.year, 1, 10),
        importance: "continental-ko",
        entrants: (c: CompContext) => {
          const e = c.instance(`euro-${inst.year - 1}`)?.outcome.winner
          const s = c.instance(`copa-${inst.year - 1}`)?.outcome.winner
          const list = [e, s].filter((t): t is string => !!t)
          return list.length === 2 ? list : c.ranked().slice(0, 2)
        },
        knockout: {
          rounds: [{ name: "Final", dates: [slots(inst.year, ["mar"])[1]] }],
          pairing: "ordered",
          venue: "neutral",
        },
      },
    ]
  },
  finalize(inst) {
    const ko = knockoutResult(inst, "final")
    return { winner: ko.winner, runnerUp: ko.runnerUp }
  },
}

export const EUROPE_DEFS: CompetitionDef[] = [euro, euroQualifying, uefaNationsLeague, finalissima]
