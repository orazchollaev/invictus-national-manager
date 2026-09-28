/**
 * The World Cup cycle: the 48-team finals, the six confederations' qualifiers and the
 * inter-confederation play-off.
 *
 * Places (48): UEFA 16, CAF 9, AFC 8, CONCACAF 6, CONMEBOL 6, OFC 1, play-off 2.
 * Hosts qualify automatically and count against their confederation's places.
 * Apart from CONCACAF's and UEFA's, qualifying formats for 2030 had not been
 * published at the start date; these follow the 2026 cycle's shape, scaled to the
 * places left after the hosts.
 *
 *  - UEFA: the European Qualifiers from 2028 (League 1 and League 2, announced May
 *    2026) in the autumn before, then March play-offs.
 *  - CAF: groups of six, winners qualify; the four best runners-up play a single-venue
 *    play-off for the inter-confederation place.
 *  - AFC: five rounds (see wcqAfc); the first two also decide the Asian Cup.
 *  - CONCACAF: its published 2030 format (see wcqConcacaf), kept clear of the
 *    Nations League's windows.
 *  - CONMEBOL: one league of ten.
 *  - OFC: a preliminary round, two groups of four at one venue, then semi-finals and
 *    a final: the winner qualifies, the runner-up goes to the play-off.
 */
import type { Confed } from "@/engine/types"
import { addDays, iso } from "@/engine/calendar/dates"
import { slots, window } from "@/engine/calendar/windows"
import { AWARDED_HOSTS } from "@/data/start"
import type { CompContext, CompetitionDef } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance } from "../types"
import { finalsDef, qualifierDef } from "./builders"
import { europeanQualifiersDef } from "./uefaQualifiers"
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
  const awarded = ctx.instance(`wc-${year}`)?.hosts ?? AWARDED_HOSTS[`wc-${year}`]
  if (awarded) return awarded
  const recent = new Set<Confed>()
  for (const y of [year - 4, year - 8])
    for (const h of worldCupHosts(y, ctx)) recent.add(ctx.confedOf(h))
  const candidates = ctx.ranked((t) => ctx.fifa(t) && !recent.has(ctx.confedOf(t)))
  return pickHosts(ctx, `wc-${year}`, candidates, 1, "world-cup")
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
    return ctx.ranked((t) => ctx.fifa(t) && ctx.confedOf(t) === confed && !hosts.includes(t))
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
    return fillFromRanking(ctx, [...hosts, ...rest], 48, (t) => ctx.fifa(t))
  },
})

/**
 * Europe: the European Qualifiers' League 1 and League 2 (uefaQualifiers.ts), in the
 * autumn before the finals, with March play-offs. Hosts (Spain and Portugal in 2030)
 * play but their places pass down.
 */
export const wcqUefa: CompetitionDef = europeanQualifiersDef({
  id: "wcq-uefa",
  short: "WCQ Europe",
  name: (y) => `World Cup ${y} Qualifying · UEFA`,
  editions: wcYears,
  finals: (y) => `wc-${y}`,
  hosts: (y, ctx) => hostsIn(y, "UEFA", ctx),
  places: (y, ctx) => directPlaces(y, "UEFA", ctx),
  nationsLeague: (y) => `unl-${y - 2}`,
  drawDate: (y) => iso(y - 2, 12, 10),
  groupDates: (y) => slots(y - 1, ["sep", "nov"]),
  playoffDrawDate: (y) => iso(y - 1, 11, 25),
  playoffDates: (y) => slots(y, ["mar"]) as [string, string],
})

export const wcqCaf: CompetitionDef = qualifierDef({
  id: "wcq-caf",
  short: "WCQ Africa",
  confed: "CAF",
  name: (y) => `World Cup ${y} Qualifying · CAF`,
  editions: wcYears,
  finals: (y) => `wc-${y}`,
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
    // Played at one venue, as in Morocco in November 2025.
    venue: "neutral",
    toInterconf: true,
  },
})

// ── Asia ────────────────────────────────────────────────────────────────────

/** Teams in Asia's second round: nine groups of four. */
const AFC_SECOND_ROUND = 36

/**
 * Fourth-round groups: the places the third round's six leaves. Two groups (of the
 * third- and fourth-placed) with eight places; one (of the third-placed) with seven.
 */
export function afcFourthRoundGroups(year: number, ctx: CompContext): number {
  return Math.min(2, Math.max(1, directPlaces(year, "AFC", ctx) - 6))
}

function teamsIn(inst: CompetitionInstance, key: string): string[] {
  const stage = inst.stages.find((s) => s.key === key)
  return (stage?.rounds?.[0]?.ties ?? []).flatMap((t) =>
    [t.home, t.away].filter((x): x is string => !!x)
  )
}

/** First-round losers: they drop into Asian Cup qualifying's play-off round. */
export function afcFirstRoundLosers(inst: CompetitionInstance): string[] {
  const winners = knockoutResult(inst, "r1").finalWinners
  return teamsIn(inst, "r1").filter((t) => !winners.includes(t))
}

/**
 * The second round's top two reach the next Asian Cup (and the third round); the
 * third- and fourth-placed go to Asian Cup qualifying's third round.
 */
export function afcSecondRound(inst: CompetitionInstance, ctx: CompContext) {
  const tables = standingsOf(inst, "r2", ctx)
  const pos = (p: number) => finishers(tables, p).map((r) => r.team)
  return { top: [...pos(0), ...pos(1)], rest: [...pos(2), ...pos(3)] }
}

/**
 * Asia, in the 2026 cycle's five rounds. The first two double as Asian Cup
 * qualifying, so a World Cup host (Saudi Arabia, 2034) plays them too — for the
 * Asian Cup only — as Qatar did before 2022.
 *
 *  1. First round (October): the lowest ranked play two-legged ties down to 36.
 *  2. Second round (November – June): nine groups of four, home and away. The top
 *     two reach the third round and the next Asian Cup.
 *  3. Third round (September – June): three groups of six; the top two qualify.
 *  4. Fourth round (October): third- and fourth-placed teams in two groups of three
 *     at a single venue; the winners qualify.
 *  5. Fifth round (November): the fourth round's runners-up, home and away, for the
 *     inter-confederation play-off.
 */
export const wcqAfc: CompetitionDef = {
  id: "wcq-afc",
  short: "WCQ Asia",
  confed: "AFC",
  kind: "qualifier",
  name: (y) => `World Cup ${y} Qualifying · AFC`,
  editions: wcYears,
  finals: (y) => `wc-${y}`,
  plan(inst, ctx) {
    const y = inst.year
    const all = (c: CompContext) => c.ranked((t) => c.fifa(t) && c.confedOf(t) === "AFC")
    const firstRoundTies = (c: CompContext) => Math.max(0, all(c).length - AFC_SECOND_ROUND)
    const [, , oct1, oct2] = window(y - 3, "sep").slots
    const autumn = window(y - 1, "sep").slots
    return [
      {
        key: "r1",
        name: "First round",
        drawDate: iso(y - 3, 7, 27),
        importance: "qualifier",
        entrants: (c) => {
          const list = all(c)
          return list.slice(list.length - 2 * firstRoundTies(c))
        },
        knockout: {
          rounds: [{ name: "First round", dates: [oct1, oct2] }],
          pairing: "pots",
          venue: "home-away",
        },
      },
      {
        key: "r2",
        name: "Second round",
        drawDate: iso(y - 3, 10, 12),
        importance: "qualifier",
        entrants: (c, i) => {
          const played = teamsIn(i, "r1")
          const winners = knockoutResult(i, "r1").finalWinners
          const list = all(c).filter((t) => !played.includes(t) || winners.includes(t))
          return list.slice(0, AFC_SECOND_ROUND)
        },
        groups: {
          count: AFC_SECOND_ROUND / 4,
          legs: 2,
          dates: [...slots(y - 3, ["nov"]), ...slots(y - 2, ["mar", "jun"])],
          venue: "home-away",
          tiebreak: "gd",
        },
      },
      {
        key: "r3",
        name: "Third round",
        drawDate: iso(y - 2, 6, 27),
        importance: "qualifier",
        entrants: (c, i) => {
          // A host's place goes to the best third-placed team.
          const hosts = worldCupHosts(y, c)
          const tables = standingsOf(i, "r2", c)
          const pool = [0, 1, 2]
            .flatMap((p) => finishers(tables, p).map((r) => r.team))
            .filter((t) => !hosts.includes(t))
          return pool.slice(0, 18).sort((a, b) => c.points(b) - c.points(a))
        },
        groups: {
          count: 3,
          legs: 2,
          dates: [...slots(y - 2, ["sep", "nov"]), ...slots(y - 1, ["mar", "jun"])],
          venue: "home-away",
          tiebreak: "gd",
        },
      },
      {
        key: "r4",
        name: "Fourth round",
        drawDate: iso(y - 1, 7, 17),
        importance: "qualifier",
        entrants: (c, i) => {
          const tables = standingsOf(i, "r3", c)
          const positions = afcFourthRoundGroups(y, c) === 2 ? [2, 3] : [2]
          return positions
            .flatMap((p) => finishers(tables, p).map((r) => r.team))
            .sort((a, b) => c.points(b) - c.points(a))
        },
        groups: {
          count: afcFourthRoundGroups(y, ctx),
          legs: 1,
          // Three matchdays in October, all inside the window.
          dates: [addDays(autumn[2], -1), addDays(autumn[2], 2), addDays(autumn[3], 2)],
          venue: "neutral",
          tiebreak: "gd",
        },
      },
      {
        key: "r5",
        name: "Fifth round",
        drawDate: iso(y - 1, 10, 20),
        importance: "qualifier",
        entrants: (c, i) => {
          if (afcFourthRoundGroups(y, c) < 2) return []
          const tables = standingsOf(i, "r4", c)
          return finishers(tables, 1).map((r) => r.team)
        },
        knockout: {
          rounds: [{ name: "Fifth round", dates: slots(y - 1, ["nov"]) }],
          pairing: "seeded",
          venue: "home-away",
        },
      },
    ]
  },
  finalize(inst, ctx) {
    const r3 = standingsOf(inst, "r3", ctx)
    const r4 = standingsOf(inst, "r4", ctx)
    const places = directPlaces(inst.year, "AFC", ctx)
    const qualified = [...finishers(r3, 0), ...finishers(r3, 1), ...finishers(r4, 0)].map(
      (r) => r.team
    )
    const interconf =
      afcFourthRoundGroups(inst.year, ctx) === 2
        ? knockoutResult(inst, "r5").finalWinners
        : finishers(r4, 1)
            .slice(0, 1)
            .map((r) => r.team)
    return { qualified: qualified.slice(0, places), interconf }
  },
}

/**
 * The final round's top places, as many as CONCACAF has, and the next two for the
 * Play-In: winners, then runners-up, then third-placed, each by record.
 */
export function concacafFinalRound(inst: CompetitionInstance, ctx: CompContext) {
  const tables = standingsOf(inst, "final", ctx)
  const order = [0, 1, 2].flatMap((pos) => finishers(tables, pos).map((r) => r.team))
  const places = directPlaces(inst.year, "CONCACAF", ctx)
  return { qualified: order.slice(0, places), playIn: order.slice(places, places + 2) }
}

/**
 * CONCACAF's 2030 format (CONCACAF, February 2026), between its Nations League
 * editions: a first round of two-legged ties for those ranked 14th and below (first
 * half of the September–October window), a second round of six groups of four
 * (September–October to March), a final round of three groups of four (June, then
 * the next September–October) and a two-legged Play-In in November for the
 * inter-confederation play-off.
 */
export const wcqConcacaf: CompetitionDef = {
  id: "wcq-concacaf",
  short: "WCQ CONCACAF",
  confed: "CONCACAF",
  kind: "qualifier",
  name: (y) => `World Cup ${y} Qualifying · CONCACAF`,
  editions: wcYears,
  finals: (y) => `wc-${y}`,
  plan(inst) {
    const y = inst.year
    const entrants = confedEntrants("CONCACAF")
    // Twenty-four play the second round: the best ranked and the first round's winners.
    const firstRound = (c: CompContext) => {
      const all = entrants(inst, c)
      return all.slice(Math.max(0, 48 - all.length))
    }
    const sep = window(y - 3, "sep").slots
    return [
      {
        key: "r1",
        name: "First round",
        drawDate: iso(y - 3, 7, 1),
        importance: "qualifier",
        entrants: (c) => firstRound(c),
        knockout: {
          rounds: [{ name: "First round", dates: sep.slice(0, 2) }],
          pairing: "pots",
          venue: "home-away",
        },
      },
      {
        key: "r2",
        name: "Second round",
        drawDate: iso(y - 3, 7, 1),
        importance: "qualifier",
        entrants: (c, i) => {
          const first = firstRound(c)
          const list = [
            ...entrants(i, c).filter((t) => !first.includes(t)),
            ...knockoutResult(i, "r1").finalWinners,
          ]
          return list.sort((a, b) => c.points(b) - c.points(a))
        },
        groups: {
          count: 6,
          legs: 2,
          dates: [...sep.slice(2), ...slots(y - 3, ["nov"]), ...slots(y - 2, ["mar"])],
          venue: "home-away",
          tiebreak: "gd",
        },
      },
      {
        key: "final",
        name: "Final round",
        drawDate: iso(y - 2, 4, 20),
        importance: "qualifier",
        entrants: (c, i) => {
          const tables = standingsOf(i, "r2", c)
          const list = [...finishers(tables, 0), ...finishers(tables, 1)].map((r) => r.team)
          return list.sort((a, b) => c.points(b) - c.points(a))
        },
        groups: {
          count: 3,
          legs: 2,
          dates: [...slots(y - 2, ["jun"]), ...slots(y - 1, ["sep"])],
          venue: "home-away",
          tiebreak: "gd",
        },
      },
      {
        key: "playin",
        name: "Play-In",
        // Before November's friendlies are arranged.
        drawDate: iso(y - 1, 10, 12),
        importance: "qualifier",
        // The better placed at home in the second leg.
        entrants: (c, i) => {
          const [high, low] = concacafFinalRound(i, c).playIn
          return high && low ? [low, high] : []
        },
        knockout: {
          rounds: [{ name: "Play-In", dates: slots(y - 1, ["nov"]) }],
          pairing: "ordered",
          venue: "home-away",
        },
      },
    ]
  },
  // The second round is drawn once the first is over, halfway through the window.
  reserved(inst, ctx, date) {
    const r2 = inst.stages.find((s) => s.key === "r2")
    const days = window(inst.year - 3, "sep").slots.slice(2)
    return r2?.status === "waiting" && days.includes(date)
      ? confedEntrants("CONCACAF")(inst, ctx)
      : []
  },
  finalize(inst, ctx) {
    return {
      qualified: concacafFinalRound(inst, ctx).qualified,
      interconf: knockoutResult(inst, "playin").finalWinners,
    }
  },
}

export const wcqConmebol: CompetitionDef = qualifierDef({
  id: "wcq-conmebol",
  short: "WCQ South America",
  confed: "CONMEBOL",
  name: (y) => `World Cup ${y} Qualifying · CONMEBOL`,
  editions: wcYears,
  finals: (y) => `wc-${y}`,
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
  finals: (y) => `wc-${y}`,
  entrants: confedEntrants("OFC"),
  groups: () => 2,
  groupSize: 4,
  groupLegs: 1,
  groupVenue: "neutral",
  prelimDates: (y) => slots(y - 2, ["mar"]),
  prelimDrawDate: (y) => iso(y - 3, 12, 1),
  groupDrawDate: (y) => iso(y - 2, 6, 20),
  groupDates: (y) => window(y - 2, "sep").slots.slice(1),
  // The top two of each group play semi-finals and a final at one venue in March.
  playoff: {
    paths: () => 1,
    teamsPerPath: 4,
    entrants(inst, ctx) {
      const [a, b] = standingsOf(inst, "groups", ctx, "gd")
      return [a?.[0], b?.[1], b?.[0], a?.[1]].map((r) => r?.team).filter((t): t is string => !!t)
    },
    rounds: (y) => {
      const [semi, final] = slots(y - 1, ["mar"])
      return [
        { name: "Semi-finals", dates: [semi] },
        { name: "Final", dates: [final] },
      ]
    },
    drawDate: (y) => iso(y - 2, 12, 1),
    venue: "neutral",
  },
  qualify(inst) {
    // The winner qualifies; the runner-up goes to the inter-confederation play-off.
    const ko = knockoutResult(inst, "playoff")
    return {
      qualified: [ko.winner].filter((t): t is string => !!t),
      interconf: [ko.runnerUp].filter((t): t is string => !!t),
    }
  },
})

export const wcqInterconf: CompetitionDef = {
  id: "wcq-ic",
  short: "Play-off",
  confed: "FIFA",
  kind: "qualifier",
  name: (y) => `World Cup ${y} Play-off Tournament`,
  editions: wcYears,
  finals: (y) => `wc-${y}`,
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
          const qualified = new Set<string>(worldCupHosts(inst.year, c))
          for (const id of ["caf", "afc", "concacaf", "conmebol", "ofc", "uefa"]) {
            const q = c.instance(`wcq-${id}-${inst.year}`)
            list.push(...(q?.outcome.interconf ?? []))
            q?.outcome.qualified?.forEach((t) => qualified.add(t))
          }
          // Six teams: the two best ranked get byes to the finals. A place no
          // confederation fills (CONCACAF sends one team from 2030) goes to the best
          // ranked team still out.
          const ranked = [...new Set(list)].sort((a, b) => c.points(b) - c.points(a))
          return fillFromRanking(
            c,
            ranked,
            6,
            (t) =>
              c.fifa(t) && c.confedOf(t) !== "UEFA" && !inst.hosts.includes(t) && !qualified.has(t)
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
