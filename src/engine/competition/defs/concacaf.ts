/**
 * CONCACAF: the Nations League, the Gold Cup Prelims and the Gold Cup, after the
 * 2026–27 regulations (Wikipedia, "2026–27 CONCACAF Nations League", "2025 CONCACAF
 * Gold Cup"; CONCACAF's 2026–2030 calendar):
 *
 *  - Nations League every two years from September to March, in three leagues.
 *    League A: the four best ranked go straight to the quarter-finals; the other
 *    twelve play two Swiss groups of six in the September–October window, four
 *    matches each, two at home. The top two join the quarter-finals (November, two
 *    legs), third and fourth go to the Gold Cup Prelims, fifth and sixth go down and
 *    into the Play-In. The quarter-final winners play the League A Finals in March.
 *    League B: groups of four, home and away, September to November. Winners go up,
 *    qualify for the Gold Cup and play the League B Finals; the two best runners-up
 *    go to the Prelims; fourth-placed teams go down.
 *    League C: groups of three, home and away, in the September–October window. The
 *    winners and the best runner-up go up and play the League C Finals and the Play-In.
 *    Play-In (November, two legs): League A's fifth and sixth against League C's
 *    promoted teams, the League A team at home second; winners go to the Prelims.
 *  - Gold Cup Prelims (March): fourteen teams, 1 v 14 … 7 v 8 by ranking, two legs,
 *    the better ranked at home second. The seven winners qualify.
 *  - Gold Cup (odd years, June–July): the eight direct qualifiers, the seven Prelims
 *    winners and an invited guest (Saudi Arabia in 2025, Qatar before).
 *
 * All 41 members play, the six outside FIFA (Martinique, Guadeloupe, French Guiana,
 * Bonaire, Sint Maarten, Saint Martin) included: 16 in League A, 16 in League B and
 * the rest in C. After promotion and relegation, the leagues are topped up or cut
 * back to those sizes in league order (should membership change).
 */
import type { ISODate } from "@/engine/types"
import { addDays, iso } from "@/engine/calendar/dates"
import { slots, window } from "@/engine/calendar/windows"
import { deriveSeed, makeRng, pick } from "@/engine/rng"
import { AWARDED_HOSTS, CONCACAF_NATIONS_LEAGUE_2026 } from "@/data/start"
import { drawGroups, roundRobin } from "../draw"
import type { CompContext, CompetitionDef, KnockoutPlan, StagePlan } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, Standing } from "../types"
import { finalsDef } from "./builders"
import { everyNYears, spaced } from "./helpers"

/** An empty place in an ordered knockout: the other team has a bye. */
const BYE = ""

type Letter = "A" | "B" | "C"
const LETTERS: Letter[] = ["A", "B", "C"]
const LEAGUE_SIZE = 16
const QF_BYES = 4

const nlYears = everyNYears(2026, 2)
const goldCupYears = everyNYears(2027, 2)

const member = (t: string, ctx: CompContext) =>
  ctx.confedMember(t) && ctx.confedOf(t) === "CONCACAF"
const members = (ctx: CompContext) => ctx.ranked((t) => member(t, ctx))
const byPoints = (list: string[], ctx: CompContext) =>
  [...list].sort((a, b) => ctx.points(b) - ctx.points(a))
const stageKey = (letter: Letter) => `league-${letter.toLowerCase()}`
const letterOf = (groupName: string) => groupName.replace(/\d+$/, "")

// ── Nations League ──────────────────────────────────────────────────────────

/**
 * The leagues of an edition in league order: the last edition's movements, newly
 * eligible members at the bottom, cut into 16, 16 and the rest.
 */
function leagues(year: number, ctx: CompContext): Record<Letter, string[]> {
  const all = members(ctx)
  const prev = ctx.instance(`cnl-${year - 2}`)?.outcome.tiers
  const listed = prev ? LETTERS.flatMap((l) => prev[l] ?? []).filter((t) => all.includes(t)) : []
  const order = [...new Set([...listed, ...all])]
  return {
    A: order.slice(0, LEAGUE_SIZE),
    B: order.slice(LEAGUE_SIZE, 2 * LEAGUE_SIZE),
    C: order.slice(2 * LEAGUE_SIZE),
  }
}

/** League A's quarter-final byes and every league's groups, each group by pot. */
function drawOf(inst: CompetitionInstance, ctx: CompContext) {
  if (inst.year === 2026) return CONCACAF_NATIONS_LEAGUE_2026
  const l = leagues(inst.year, ctx)
  const rng = (letter: Letter) => makeRng(deriveSeed(ctx.seed, "cnl", inst.id, letter))
  const a = byPoints(l.A, ctx)
  return {
    byes: a.slice(0, QF_BYES),
    groups: {
      A: drawGroups(a.slice(QF_BYES), 2, rng("A")),
      B: drawGroups(byPoints(l.B, ctx), Math.ceil(l.B.length / 4), rng("B")),
      C: drawGroups(byPoints(l.C, ctx), Math.ceil(l.C.length / 3), rng("C")),
    } as Record<Letter, string[][]>,
  }
}

/** League A's pre-seeded quarter-finalists, best first: League A less its groups once drawn. */
function qfByes(inst: CompetitionInstance, ctx: CompContext): string[] {
  if (inst.year === 2026) return CONCACAF_NATIONS_LEAGUE_2026.byes
  const drawn = inst.stages.find((s) => s.key === stageKey("A"))?.groups
  if (!drawn) return drawOf(inst, ctx).byes
  const inGroups = new Set(drawn.flatMap((g) => g.teams))
  return byPoints(
    leagues(inst.year, ctx).A.filter((t) => !inGroups.has(t)),
    ctx
  )
}

/**
 * League A's Swiss pattern for a group of six, by pot (CONCACAF, July 2026): pot 1
 * at home to pots 2 and 4 and away to pots 2 and 5, and so on round the pots.
 */
const SWISS_SIX: [number, number][][] = [
  [
    [0, 3],
    [1, 2],
    [5, 4],
  ],
  [
    [1, 0],
    [2, 5],
    [3, 4],
  ],
  [
    [3, 2],
    [4, 0],
    [5, 1],
  ],
  [
    [0, 1],
    [2, 3],
    [4, 5],
  ],
]

/** League dates: A and C in the September–October window, B on into November. */
function leagueDates(year: number, letter: Letter): ISODate[] {
  const sep = window(year, "sep")
  if (letter === "A") return sep.slots
  if (letter === "B") return [...sep.slots, ...slots(year, ["nov"])]
  // Six rounds of a group of three at one venue, two days apart.
  return spaced(addDays(sep.start, 3), 6, 2)
}

function schedule(year: number) {
  return (teams: string[], name: string) => {
    const letter = letterOf(name) as Letter
    if (letter === "A" && teams.length === 6)
      return {
        rounds: SWISS_SIX.map((r) => r.map(([h, a]): [string, string] => [teams[h], teams[a]])),
        dates: leagueDates(year, "A"),
      }
    if (letter === "A") {
      // A group short of a team plays everyone once.
      const rounds = roundRobin(teams, 1)
      return { rounds, dates: spaced(addDays(window(year, "sep").start, 3), rounds.length, 3) }
    }
    return { rounds: roundRobin(teams, 2), dates: leagueDates(year, letter) }
  }
}

function tables(inst: CompetitionInstance, letter: Letter, ctx: CompContext): Standing[][] {
  return standingsOf(inst, stageKey(letter), ctx)
}

const place = (t: Standing[][], pos: number) => finishers(t, pos).map((r) => r.team)
const places = (t: Standing[][], from: number, to = 5) => {
  const out: string[] = []
  for (let pos = from; pos <= to; pos++) out.push(...place(t, pos))
  return out
}

/** Ties in playing order, [home first, home second]; a missing side is a bye. */
function tieList(pairs: [string | undefined, string | undefined][]): string[] {
  return pairs.filter(([a, b]) => a || b).flatMap(([a, b]) => [a ?? BYE, b ?? BYE])
}

/**
 * Group winners and runners-up are ranked on their results: the best winner meets
 * the fourth pre-seeded team, … the other runner-up the first. Group teams are at
 * home first.
 */
function quarterFinalists(inst: CompetitionInstance, ctx: CompContext): string[] {
  const a = tables(inst, "A", ctx)
  const [w1, w2] = place(a, 0)
  const [r1, r2] = place(a, 1)
  const byes = qfByes(inst, ctx)
  return tieList([
    [w1, byes[3]],
    [w2, byes[2]],
    [r1, byes[1]],
    [r2, byes[0]],
  ])
}

/**
 * League A's fifth and sixth against League C's winners and best runner-up: the best
 * fifth meets the runner-up, the other sixth the best winner. League C at home first.
 */
function playInTies(inst: CompetitionInstance, ctx: CompContext): string[] {
  const a = tables(inst, "A", ctx)
  const c = tables(inst, "C", ctx)
  const fifth = place(a, 4)
  const sixth = place(a, 5)
  const winners = place(c, 0)
  const runnerUp = place(c, 1)[0]
  return tieList([
    [runnerUp, fifth[0]],
    [winners[2], fifth[1]],
    [winners[1], sixth[0]],
    [winners[0], sixth[1]],
  ])
}

/** Quarter-final winners, best first: aggregate goal difference, goals, away goals. */
function byTieRecord(inst: CompetitionInstance, key: string, ctx: CompContext): string[] {
  const ties = inst.stages.find((s) => s.key === key)?.rounds?.[0]?.ties ?? []
  const rows = ties
    .filter((t) => t.winner)
    .map((t) => {
      let gf = 0
      let ga = 0
      let away = 0
      for (const id of t.fixtures) {
        const f = ctx.fixture(id)
        if (!f?.result) continue
        const home = f.home === t.winner
        gf += home ? f.result.h : f.result.a
        ga += home ? f.result.a : f.result.h
        if (!home) away += f.result.a
      }
      return { team: t.winner!, gd: gf - ga, gf, away }
    })
  rows.sort(
    (a, b) =>
      b.gd - a.gd || b.gf - a.gf || b.away - a.away || ctx.points(b.team) - ctx.points(a.team)
  )
  return rows.map((r) => r.team)
}

/** Finals seeds, best first, as semi-final ties: 1 v 4 and 2 v 3 (a bye for 1 of 3). */
function semiOrder(ranked: string[]): string[] {
  if (ranked.length >= 4) return [ranked[0], ranked[3], ranked[1], ranked[2]]
  if (ranked.length === 3) return [ranked[0], BYE, ranked[1], ranked[2]]
  return ranked
}

/** A league's Finals in the March window: semi-finals, third place and final. */
function finalsKnockout(year: number, teams: number): KnockoutPlan {
  const [semi, final] = slots(year + 1, ["mar"])
  if (teams <= 2)
    return { rounds: [{ name: "Final", dates: [final] }], pairing: "ordered", venue: "neutral" }
  return {
    rounds: [
      { name: "Semi-finals", dates: [semi] },
      { name: "Final", dates: [final] },
    ],
    pairing: "ordered",
    thirdPlace: teams === 4 ? final : undefined,
    venue: "neutral",
  }
}

const leagueBFinalists = (inst: CompetitionInstance, ctx: CompContext) =>
  place(tables(inst, "B", ctx), 0)

const leagueCFinalists = (inst: CompetitionInstance, ctx: CompContext) => {
  const c = tables(inst, "C", ctx)
  return [...place(c, 0), ...place(c, 1).slice(0, 1)]
}

/**
 * Where the Nations League sends each team for the next Gold Cup — straight in, or
 * to the Prelims — and whether all of that is settled yet.
 */
export function goldCupRoutes(inst: CompetitionInstance, ctx: CompContext) {
  const qf = inst.stages.find((s) => s.key === "qf")?.rounds?.[0]?.ties ?? []
  const a = tables(inst, "A", ctx)
  const b = tables(inst, "B", ctx)
  const direct = [...qf.map((t) => t.winner).filter((t): t is string => !!t), ...place(b, 0)]
  const prelims = [
    ...qf.map((t) => t.loser).filter((t): t is string => !!t),
    ...places(a, 2, 3),
    ...place(b, 1).slice(0, 2),
    ...knockoutResult(inst, "playin").finalWinners,
  ]
  const settled = [stageKey("A"), stageKey("B"), "qf", "playin"].every(
    (k) => inst.stages.find((s) => s.key === k)?.status === "done"
  )
  return { direct, prelims, settled }
}

export const concacafNationsLeague: CompetitionDef = {
  id: "cnl",
  short: "CONCACAF NL",
  confed: "CONCACAF",
  kind: "nations-league",
  name: (y) => `CONCACAF Nations League ${y}–${String(y + 1).slice(2)}`,
  editions: nlYears,
  plan(inst, ctx) {
    const y = inst.year
    const league = (letter: Letter): StagePlan => ({
      key: stageKey(letter),
      name: `League ${letter}`,
      // The three leagues are played side by side.
      after: null,
      drawDate: iso(y, 7, 23),
      importance: "nations-league",
      entrants: () => [],
      groups: {
        count: 0,
        legs: 2,
        dates: leagueDates(y, letter),
        // Resolved when the stage is drawn; stable once the previous edition is over.
        get fixed() {
          return drawOf(inst, ctx).groups[letter]
        },
        get names() {
          return drawOf(inst, ctx).groups[letter].map((_, i) => `${letter}${i + 1}`)
        },
        schedule: schedule(y),
        venue: "home-away",
        tiebreak: "gd",
      },
    })
    const [nov1, nov2] = slots(y, ["nov"])
    return [
      league("A"),
      league("B"),
      league("C"),
      {
        key: "qf",
        name: "League A quarter-finals",
        after: stageKey("A"),
        drawDate: iso(y, 10, 8),
        importance: "nations-league",
        entrants: (c, i) => quarterFinalists(i, c),
        knockout: {
          rounds: [{ name: "Quarter-finals", dates: [nov1, nov2] }],
          pairing: "ordered",
          venue: "home-away",
        },
      },
      {
        key: "playin",
        name: "Play-In",
        after: [stageKey("A"), stageKey("C")],
        drawDate: iso(y, 10, 8),
        importance: "nations-league",
        entrants: (c, i) => playInTies(i, c),
        knockout: {
          rounds: [{ name: "Play-In", dates: [nov1, nov2] }],
          pairing: "ordered",
          venue: "home-away",
        },
      },
      {
        key: "a-finals",
        name: "League A Finals",
        after: "qf",
        drawDate: iso(y + 1, 2, 1),
        importance: "nations-league-finals",
        entrants: (c, i) => semiOrder(byTieRecord(i, "qf", c)),
        knockout: finalsKnockout(y, 4),
      },
      {
        key: "b-finals",
        name: "League B Finals",
        after: stageKey("B"),
        drawDate: iso(y + 1, 2, 1),
        importance: "nations-league-finals",
        entrants: (c, i) => semiOrder(leagueBFinalists(i, c)),
        knockout: finalsKnockout(y, leagueBFinalists(inst, ctx).length),
      },
      {
        key: "c-finals",
        name: "League C Finals",
        after: stageKey("C"),
        drawDate: iso(y + 1, 2, 1),
        importance: "nations-league-finals",
        entrants: (c, i) => semiOrder(leagueCFinalists(i, c)),
        knockout: finalsKnockout(y, leagueCFinalists(inst, ctx).length),
      },
    ]
  },
  /**
   * Next season's leagues, each in league order: teams coming down first, then those
   * staying by finish, then those coming up.
   */
  finalize(inst, ctx) {
    const ko = knockoutResult(inst, "a-finals")
    const a = tables(inst, "A", ctx)
    const b = tables(inst, "B", ctx)
    const c = tables(inst, "C", ctx)
    const bUp = place(b, 0)
    const cUp = leagueCFinalists(inst, ctx)
    const tiers: Record<Letter, string[]> = {
      A: [...qfByes(inst, ctx), ...places(a, 0, 3), ...bUp],
      B: [...places(a, 4), ...places(b, 1, 2), ...cUp],
      C: [...places(b, 3), ...places(c, 1).filter((t) => !cUp.includes(t))],
    }
    return {
      winner: ko.winner,
      runnerUp: ko.runnerUp,
      third: ko.third,
      qualified: goldCupRoutes(inst, ctx).direct,
      tiers,
    }
  },
}

// ── Gold Cup ────────────────────────────────────────────────────────────────

export const goldCupPrelims: CompetitionDef = {
  id: "gcq",
  short: "Gold Cup Prelims",
  confed: "CONCACAF",
  kind: "qualifier",
  name: (y) => `CONCACAF Gold Cup ${y} Prelims`,
  editions: goldCupYears,
  finals: (y) => `gold-cup-${y}`,
  plan(inst) {
    const y = inst.year
    return [
      {
        key: "prelims",
        name: "Prelims",
        // Once the Nations League's November round is over.
        drawDate: iso(y - 1, 11, 25),
        importance: "qualifier",
        entrants: (c) => {
          const nl = c.instance(`cnl-${y - 1}`)
          const ranked = byPoints([...new Set(nl ? goldCupRoutes(nl, c).prelims : [])], c)
          const pairs: [string, string | undefined][] = []
          for (let i = 0; i < Math.ceil(ranked.length / 2); i++) {
            const high = ranked[i]
            const low = ranked[ranked.length - 1 - i]
            pairs.push(low === high ? [high, undefined] : [low, high])
          }
          return tieList(pairs)
        },
        knockout: {
          rounds: [{ name: "Prelims", dates: slots(y, ["mar"]) }],
          pairing: "ordered",
          venue: "home-away",
        },
      },
    ]
  },
  finalize(inst) {
    return { qualified: knockoutResult(inst, "prelims").finalWinners }
  },
}

/** The invited guest: one of Asia's best, free that summer. */
function goldCupGuest(inst: CompetitionInstance, ctx: CompContext): string | undefined {
  const pool = ctx
    .ranked((t) => ctx.fifa(t) && ctx.confedOf(t) === "AFC")
    .slice(0, 8)
    .filter((t) => !ctx.busyBetween(t, inst.start, inst.end))
  return pool.length ? pick(makeRng(deriveSeed(ctx.seed, "guest", inst.id)), pool) : undefined
}

export const goldCup: CompetitionDef = finalsDef({
  id: "gold-cup",
  short: "Gold Cup",
  confed: "CONCACAF",
  kind: "continental",
  name: (y) => `CONCACAF Gold Cup ${y}`,
  editions: goldCupYears,
  teams: 16,
  groups: 4,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => iso(y, 6, 17),
  drawDate: (y) => iso(y, 4, 10),
  hosts: (y, ctx) => AWARDED_HOSTS[`gold-cup-${y}`] ?? (ctx.points("USA") ? ["USA"] : []),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) => member(t, ctx),
  // Hosts have no place of their own: they qualify like everyone else.
  entrants(inst, ctx) {
    const nl = ctx.instance(`cnl-${inst.year - 1}`)
    const prelims = ctx.instance(`gcq-${inst.year}`)?.outcome.qualified ?? []
    const earned = [...new Set([...(nl ? goldCupRoutes(nl, ctx).direct : []), ...prelims])]
    const guest = earned.length < 16 ? goldCupGuest(inst, ctx) : undefined
    const list = byPoints([...earned, ...(guest ? [guest] : [])], ctx)
    const hosts = inst.hosts.filter((h) => list.includes(h))
    return [...hosts, ...list.filter((t) => !hosts.includes(t))]
  },
})

export const CONCACAF_DEFS: CompetitionDef[] = [concacafNationsLeague, goldCupPrelims, goldCup]
