/**
 * The World Cup cycle: the 48-team finals, the six confederations' qualifiers and the
 * inter-confederation play-off.
 *
 * Places (48): UEFA 16, CAF 9, AFC 8, CONCACAF 6, CONMEBOL 6, OFC 1, play-off 2.
 * Hosts qualify automatically and count against their confederation's places.
 * Qualifying formats for 2030 had not been published at the start date; these follow
 * the 2026 cycle's shape, scaled to the places left after the hosts.
 */
import type { Confed } from "@/engine/types"
import { iso } from "@/engine/calendar/dates"
import { slots } from "@/engine/calendar/windows"
import { AWARDED_HOSTS } from "@/data/start"
import type { CompContext, CompetitionDef } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance } from "../types"
import { finalsDef, pathOrder, qualifierDef } from "./builders"
import { leagueRanking } from "./nationsLeague"
import { makePlaceholder } from "../placeholders"
import { everyNYears, fillFromRanking, pickHosts } from "./helpers"

export const WC_PLACES: Record<Confed, number> = {
  UEFA: 16,
  CAF: 9,
  AFC: 8,
  CONCACAF: 6,
  CONMEBOL: 6,
  OFC: 1,
}

const wcYears = everyNYears(2030, 4)

/** Past hosts' confederations are not eligible for the next two editions. */
export function worldCupHosts(year: number, ctx: CompContext): string[] {
  const awarded = AWARDED_HOSTS[`wc-${year}`]
  if (awarded) return awarded
  const recent = new Set<Confed>()
  for (const y of [year - 4, year - 8])
    for (const h of worldCupHosts(y, ctx)) recent.add(ctx.confedOf(h))
  const candidates = ctx.ranked((t) => !recent.has(ctx.confedOf(t)))
  return pickHosts(ctx, `wc-${year}`, candidates, 1)
}

function hostsIn(year: number, confed: Confed, ctx: CompContext) {
  return worldCupHosts(year, ctx).filter((h) => ctx.confedOf(h) === confed)
}

function directPlaces(year: number, confed: Confed, ctx: CompContext) {
  return Math.max(0, WC_PLACES[confed] - hostsIn(year, confed, ctx).length)
}

function confedEntrants(confed: Confed) {
  return (inst: CompetitionInstance, ctx: CompContext) => {
    const hosts = worldCupHosts(inst.year, ctx)
    return ctx.ranked((t) => ctx.confedOf(t) === confed && !hosts.includes(t))
  }
}

export const worldCup: CompetitionDef = finalsDef({
  id: "wc",
  short: "World Cup",
  confed: "FIFA",
  kind: "world-cup",
  name: (y) => `FIFA World Cup ${y}`,
  editions: wcYears,
  teams: 48,
  groups: 12,
  perGroup: 2,
  bestThirds: 8,
  thirdPlace: true,
  start: (y) => iso(y, 6, 11),
  drawDate: (y) => iso(y - 1, 12, 5),
  gap: 4,
  hosts: worldCupHosts,
  spreadConfeds: true,
  importance: ["world-cup", "world-cup-ko"],
  eligible: () => true,
  entrants(inst, ctx) {
    // Places still being played for in March are drawn as placeholders
    // ("UEFA play-off Path A winner") and filled in when they are decided.
    const list = [...inst.hosts]
    const sources: [string, CompetitionDef][] = [
      ["wcq-uefa", wcqUefa],
      ["wcq-caf", wcqCaf],
      ["wcq-afc", wcqAfc],
      ["wcq-concacaf", wcqConcacaf],
      ["wcq-conmebol", wcqConmebol],
      ["wcq-ofc", wcqOfc],
      ["wcq-ic", wcqInterconf],
    ]
    for (const [id, def] of sources) {
      const q = ctx.instance(`${id}-${inst.year}`)
      if (q) list.push(...(def.provisional?.(q, ctx) ?? q.outcome.qualified ?? []))
    }
    // Seeding: hosts first, then by ranking.
    const hosts = list.filter((t) => inst.hosts.includes(t))
    const rest = list
      .filter((t) => !inst.hosts.includes(t))
      .sort((a, b) => ctx.points(b) - ctx.points(a))
    return fillFromRanking(ctx, [...hosts, ...rest], 48, () => true)
  },
})

export const wcqUefa: CompetitionDef = qualifierDef({
  id: "wcq-uefa",
  short: "WCQ Europe",
  confed: "UEFA",
  name: (y) => `World Cup ${y} Qualifying · UEFA`,
  editions: wcYears,
  entrants: confedEntrants("UEFA"),
  // Groups of four (and three) fit the six matchdays of the autumn before.
  groups: (inst, ctx) => Math.ceil(confedEntrants("UEFA")(inst, ctx).length / 4),
  groupSize: 5,
  groupDrawDate: (y) => iso(y - 2, 12, 10),
  groupDates: (y) => slots(y - 1, ["sep", "nov"]),
  tiebreak: "h2h",
  maxDirect: (inst, ctx) => directPlaces(inst.year, "UEFA", ctx),
  playoff: {
    paths: uefaPaths,
    teamsPerPath: 4,
    /**
     * The best runners-up, plus — as in the 2026 cycle — the best Nations League group
     * winners who finished outside the top two, one per path, as the lowest seeds.
     */
    entrants(inst, ctx) {
      const paths = uefaPaths(inst, ctx)
      const want = paths * 4
      const tables = standingsOf(inst, "groups", ctx, "h2h")
      const winners = new Set(finishers(tables, 0).map((r) => r.team))
      const runners = finishers(tables, 1).map((r) => r.team)
      const hosts = worldCupHosts(inst.year, ctx)
      const nl = ctx.instance(`unl-${inst.year - 2}`)
      const nlWinners = (nl ? leagueRanking(nl, ctx) : [])
        .filter(
          (x) =>
            x.pos === 0 &&
            !winners.has(x.team) &&
            !runners.includes(x.team) &&
            !hosts.includes(x.team)
        )
        .map((x) => x.team)
      const nlPlaces = Math.min(paths, nlWinners.length)
      const pool = [...runners.slice(0, want - nlPlaces), ...nlWinners.slice(0, nlPlaces)]
      for (const r of finishers(tables, 2))
        if (pool.length < want && !pool.includes(r.team)) pool.push(r.team)
      return pathOrder(pool, paths)
    },
    rounds: (y) => {
      const [semi, final] = slots(y, ["mar"])
      return [
        { name: "Play-off semi-finals", dates: [semi] },
        { name: "Play-off finals", dates: [final] },
      ]
    },
    drawDate: (y) => iso(y - 1, 11, 25),
  },
})

/** UEFA play-off paths: the places left after the group winners. */
function uefaPaths(inst: CompetitionInstance, ctx: CompContext): number {
  const groups = Math.ceil(confedEntrants("UEFA")(inst, ctx).length / 4)
  return Math.max(0, directPlaces(inst.year, "UEFA", ctx) - groups)
}

export const wcqCaf: CompetitionDef = qualifierDef({
  id: "wcq-caf",
  short: "WCQ Africa",
  confed: "CAF",
  name: (y) => `World Cup ${y} Qualifying · CAF`,
  editions: wcYears,
  entrants: confedEntrants("CAF"),
  groups: (inst, ctx) => directPlaces(inst.year, "CAF", ctx),
  groupSize: 6,
  prelimDates: (y) => slots(y - 2, ["mar"]),
  prelimDrawDate: (y) => iso(y - 3, 12, 15),
  groupDrawDate: (y) => iso(y - 2, 7, 20),
  groupDates: (y) => [...slots(y - 2, ["sep", "nov"]), ...slots(y - 1, ["mar", "jun"])],
  playoff: {
    paths: () => 1,
    teamsPerPath: 4,
    rounds: (y) => {
      const [semi, final] = slots(y - 1, ["nov"])
      return [
        { name: "Play-off semi-finals", dates: [semi] },
        { name: "Play-off final", dates: [final] },
      ]
    },
    drawDate: (y) => iso(y - 1, 10, 20),
    toInterconf: true,
  },
})

export const wcqAfc: CompetitionDef = qualifierDef({
  id: "wcq-afc",
  short: "WCQ / Asian Cup Q",
  confed: "AFC",
  // The same groups decide the next Asian Cup (the year after the World Cup).
  name: (y) => `World Cup ${y} & Asian Cup ${y + 1} Qualifying · AFC`,
  editions: wcYears,
  entrants: confedEntrants("AFC"),
  groups: (inst, ctx) => directPlaces(inst.year, "AFC", ctx),
  groupSize: 5,
  prelimDates: (y) => slots(y - 3, ["nov"]),
  prelimDrawDate: (y) => iso(y - 3, 8, 1),
  groupDrawDate: (y) => iso(y - 3, 12, 10),
  groupDates: (y) => [...slots(y - 2, ["jun", "sep", "nov"]), ...slots(y - 1, ["mar"])],
  playoff: {
    paths: () => 1,
    teamsPerPath: 2,
    rounds: (y) => [{ name: "Play-off", dates: slots(y - 1, ["jun"]) }],
    drawDate: (y) => iso(y - 1, 4, 10),
    toInterconf: true,
  },
})

export const wcqConcacaf: CompetitionDef = qualifierDef({
  id: "wcq-concacaf",
  short: "WCQ CONCACAF",
  confed: "CONCACAF",
  name: (y) => `World Cup ${y} Qualifying · CONCACAF`,
  editions: wcYears,
  entrants: confedEntrants("CONCACAF"),
  groups: (inst, ctx) => Math.max(1, directPlaces(inst.year, "CONCACAF", ctx)),
  groupSize: 5,
  prelimDates: (y) => slots(y - 2, ["mar"]),
  prelimDrawDate: (y) => iso(y - 3, 12, 12),
  groupDrawDate: (y) => iso(y - 2, 4, 20),
  groupDates: (y) => [...slots(y - 2, ["jun", "sep", "nov"]), ...slots(y - 1, ["mar"])],
  runnersUpToInterconf: 2,
})

export const wcqConmebol: CompetitionDef = qualifierDef({
  id: "wcq-conmebol",
  short: "WCQ South America",
  confed: "CONMEBOL",
  name: (y) => `World Cup ${y} Qualifying · CONMEBOL`,
  editions: wcYears,
  entrants: confedEntrants("CONMEBOL"),
  groups: () => 1,
  groupSize: 10,
  groupDrawDate: (y) => iso(y - 3, 7, 30),
  groupDates: (y) => [
    ...slots(y - 3, ["sep", "nov"]),
    ...slots(y - 2, ["mar", "sep", "nov"]),
    ...slots(y - 1, ["mar", "jun", "sep", "nov"]),
  ],
  direct: (inst, ctx) => directPlaces(inst.year, "CONMEBOL", ctx),
  nextToInterconf: true,
})

export const wcqOfc: CompetitionDef = qualifierDef({
  id: "wcq-ofc",
  short: "WCQ Oceania",
  confed: "OFC",
  name: (y) => `World Cup ${y} Qualifying · OFC`,
  editions: wcYears,
  entrants: confedEntrants("OFC"),
  groups: () => 2,
  groupSize: 4,
  groupLegs: 1,
  groupVenue: "neutral",
  prelimDates: (y) => slots(y - 2, ["mar"]),
  prelimDrawDate: (y) => iso(y - 3, 12, 1),
  groupDrawDate: (y) => iso(y - 1, 6, 20),
  groupDates: (y) => slots(y - 1, ["sep"]).slice(0, 3),
  qualify(inst, ctx) {
    const tables = standingsOf(inst, "groups", ctx, "gd")
    const top = [...finishers(tables, 0), ...finishers(tables, 1)].map((r) => r.team)
    // Best group winner qualifies; the other winner goes to the play-off.
    return { qualified: top.slice(0, 1), interconf: top.slice(1, 2) }
  },
})

export const wcqInterconf: CompetitionDef = {
  id: "wcq-ic",
  short: "Play-off",
  confed: "FIFA",
  kind: "qualifier",
  name: (y) => `World Cup ${y} Play-off Tournament`,
  editions: wcYears,
  hosts: (y, ctx) => worldCupHosts(y, ctx).slice(0, 1),
  plan(inst) {
    const [semi, final] = slots(inst.year, ["mar"])
    return [
      {
        key: "knockout",
        name: "Play-off tournament",
        drawDate: iso(inst.year - 1, 11, 26),
        importance: "qualifier",
        entrants: (c) => {
          const list: string[] = []
          for (const id of ["caf", "afc", "concacaf", "conmebol", "ofc", "uefa"]) {
            list.push(...(c.instance(`wcq-${id}-${inst.year}`)?.outcome.interconf ?? []))
          }
          // Six teams: the two best ranked get byes to the finals.
          const ranked = [...new Set(list)].sort((a, b) => c.points(b) - c.points(a))
          return fillFromRanking(
            c,
            ranked,
            6,
            (t) => c.confedOf(t) !== "UEFA" && !inst.hosts.includes(t)
          )
        },
        knockout: {
          rounds: [
            { name: "Semi-finals", dates: [semi] },
            { name: "Finals", dates: [final] },
          ],
          pairing: "seeded",
          venue: "neutral",
        },
      },
    ]
  },
  finalize(inst) {
    return { qualified: knockoutResult(inst, "knockout").finalWinners }
  },
  provisional(inst) {
    return inst.status === "done"
      ? (inst.outcome.qualified ?? [])
      : [makePlaceholder(inst.id, 0), makePlaceholder(inst.id, 1)]
  },
  placeholderWinner(inst, slot) {
    return knockoutResult(inst, "knockout").finalWinners[slot]
  },
}

export const FIFA_DEFS: CompetitionDef[] = [
  worldCup,
  wcqUefa,
  wcqCaf,
  wcqAfc,
  wcqConcacaf,
  wcqConmebol,
  wcqOfc,
  wcqInterconf,
]
