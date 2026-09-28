/**
 * UEFA: the European Championship and its qualifying, the Nations League, and the
 * Finalissima against South America's champions.
 *
 * Euro 2028 (UK and Ireland, 9 June – 9 July) and Euro 2032 (Italy and Türkiye) are
 * awarded; later hosts are chosen in-game.
 *
 * Euro 2028 qualifying (draw 6 December 2026, Belfast): twelve groups of four or five,
 * home and away from March to November 2027. The group winners and the eight best
 * runners-up qualify. The four hosts play qualifying in separate groups; the two best
 * ranked hosts who have not qualified that way take two reserved places. The places
 * left go to March play-off paths for the four worst runners-up and the 2026–27
 * Nations League group winners still out (UEFA plays four places as single two-legged
 * ties; here every play-off place is a path of four).
 *
 * From Euro 2032, the European Qualifiers' League 1 and League 2 (uefaQualifiers.ts),
 * with the hosts qualified but playing.
 */
import { iso, addDays } from "@/engine/calendar/dates"
import { slots, window } from "@/engine/calendar/windows"
import { AWARDED_HOSTS, NATIONS_LEAGUE_2026 } from "@/data/start"
import type { CompContext, CompetitionDef } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance } from "../types"
import { finalsDef, pathOrder, qualifierDef } from "./builders"
import { everyNYears, pickHosts } from "./helpers"
import { leagueRanking, nationsLeagueDef } from "./nationsLeague"
import { byEdition, europeanQualifiersDef } from "./uefaQualifiers"

const euroYears = everyNYears(2028, 4)
/** The last edition with the old qualifying format. */
const OLD_QUALIFYING = 2028

function euroHosts(year: number, ctx: CompContext): string[] {
  return (
    ctx.instance(`euro-${year}`)?.hosts ??
    AWARDED_HOSTS[`euro-${year}`] ??
    pickHosts(
      ctx,
      `euro-${year}`,
      ctx.ranked((t) => ctx.confedOf(t) === "UEFA"),
      1,
      "continental"
    )
  )
}

/** Hosts qualified before a ball is kicked: none for 2028 (reserved places instead). */
function autoHosts(year: number, ctx: CompContext): string[] {
  if (year <= OLD_QUALIFYING) return []
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
    const all = [...new Set([...autoHosts(inst.year, ctx), ...known])]
    // Hosts that are in head the groups; everyone else by ranking.
    const hosts = inst.hosts.filter((h) => all.includes(h))
    const rest = all.filter((t) => !hosts.includes(t))
    return [...hosts, ...rest.sort((a, b) => ctx.points(b) - ctx.points(a))]
  },
})

/** Euro 2028: the group winners, the eight best runners-up and up to two hosts. */
function euro2028Direct(inst: CompetitionInstance, ctx: CompContext) {
  const tables = standingsOf(inst, "groups", ctx, "h2h")
  const runners = finishers(tables, 1).map((r) => r.team)
  const direct = [...finishers(tables, 0).map((r) => r.team), ...runners.slice(0, 8)]
  const hosts = euroHosts(inst.year, ctx)
    .filter((h) => !direct.includes(h))
    .sort((a, b) => ctx.points(b) - ctx.points(a))
    .slice(0, 2)
  return { direct: [...direct, ...hosts], runnersOut: runners.slice(8) }
}

function euro2028Paths(inst: CompetitionInstance, ctx: CompContext): number {
  return Math.max(0, 24 - euro2028Direct(inst, ctx).direct.length)
}

const euroQualifying2028: CompetitionDef = qualifierDef({
  id: "euroq",
  short: "Euro Qualifying",
  confed: "UEFA",
  name: (y) => `UEFA Euro ${y} Qualifying`,
  editions: euroYears,
  finals: (y) => `euro-${y}`,
  entrants: (_inst, ctx) => ctx.ranked((t) => ctx.confedOf(t) === "UEFA"),
  groups: () => 12,
  groupSize: 5,
  separate: (y, ctx) => euroHosts(y, ctx),
  groupDrawDate: (y) => iso(y - 2, 12, 6),
  groupDates: (y) => slots(y - 1, ["mar", "jun", "sep", "nov"]),
  tiebreak: "h2h",
  qualify: (inst, ctx) => ({
    qualified: [
      ...euro2028Direct(inst, ctx).direct,
      ...knockoutResult(inst, "playoff").finalWinners,
    ],
    interconf: [],
  }),
  playoff: {
    paths: euro2028Paths,
    teamsPerPath: 4,
    /**
     * The four worst runners-up, then the Nations League group winners still out (by
     * the Nations League ranking), then its next best-ranked teams; seeded into paths.
     */
    entrants(inst, ctx) {
      const paths = euro2028Paths(inst, ctx)
      const { direct, runnersOut } = euro2028Direct(inst, ctx)
      const out = new Set([...direct, ...euroHosts(inst.year, ctx)])
      const nl = ctx.instance(`unl-${inst.year - 2}`)
      const ranking = (nl ? leagueRanking(nl, ctx) : []).filter((x) => !out.has(x.team))
      const pool = [
        ...runnersOut,
        ...ranking.filter((x) => x.pos === 0).map((x) => x.team),
        ...ranking.map((x) => x.team),
      ]
      const seeds = [...new Set(pool)].filter((t) => !out.has(t)).slice(0, paths * 4)
      return pathOrder(seeds, paths)
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

const euroQualifyingLeagues: CompetitionDef = europeanQualifiersDef({
  id: "euroq",
  short: "Euro Qualifying",
  name: (y) => `UEFA Euro ${y} Qualifying`,
  editions: euroYears,
  finals: (y) => `euro-${y}`,
  hosts: autoHosts,
  places: (y, ctx) => 24 - autoHosts(y, ctx).length,
  nationsLeague: (y) => `unl-${y - 2}`,
  drawDate: (y) => iso(y - 2, 12, 6),
  groupDates: (y) => slots(y - 1, ["sep", "nov"]),
  playoffDrawDate: (y) => iso(y - 1, 11, 24),
  playoffDates: (y) => slots(y, ["mar"]) as [string, string],
})

export const euroQualifying: CompetitionDef = byEdition(
  OLD_QUALIFYING,
  euroQualifying2028,
  euroQualifyingLeagues
)

export const uefaNationsLeague: CompetitionDef = nationsLeagueDef({
  id: "unl",
  short: "Nations League",
  confed: "UEFA",
  name: (y) => `UEFA Nations League ${y}–${String(y + 1).slice(2)}`,
  editions: everyNYears(2026, 2),
  tiers: (y) =>
    y === 2026
      ? [
          { letter: "A", size: 16, groups: 4 },
          { letter: "B", size: 16, groups: 4 },
          { letter: "C", size: 16, groups: 4 },
          { letter: "D", size: 6, groups: 2 },
        ]
      : [
          { letter: "A", size: 18, groups: 3 },
          { letter: "B", size: 18, groups: 3 },
          { letter: "C", size: 18, groups: 3 },
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
