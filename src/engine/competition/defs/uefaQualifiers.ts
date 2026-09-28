/**
 * UEFA's European Qualifiers from 2028 (UEFA, 20 May 2026), used for World Cup 2030
 * qualifying and Euro 2032 qualifying onwards:
 *
 *  - League 1: the 36 best teams of the last Nations League (Leagues A and B), three
 *    groups of 12 drawn from three pots of 12. Six matches each against two teams
 *    from every pot, three at home — a Swiss-style league phase.
 *  - League 2: everyone else, three groups of six playing the Nations League's
 *    six-match pattern.
 *  - Hosts qualify for the finals but still play, for the Nations League's sake; a
 *    place a host would take goes to the next team.
 *  - The top teams of each League 1 group qualify directly; the rest of the places
 *    are two-legged play-off ties in March between the best of League 1 left and
 *    League 2's group winners.
 *
 * UEFA left the split between direct places and play-offs "to be fine-tuned"; here
 * about half the places are direct (World Cup 2030: the top two of each group and
 * eight ties; Euro 2032: the top four and ten ties).
 */
import type { ISODate } from "@/engine/types"
import { deriveSeed, makeRng } from "@/engine/rng"
import { drawGroups, roundRobin, sixMatchRounds } from "../draw"
import type { CompContext, CompetitionDef, GroupPlan } from "../runtime"
import { knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, Standing } from "../types"
import { makePlaceholder } from "../placeholders"
import { leagueRanking } from "./nationsLeague"

const LEAGUE_ONE = 36
const GROUPS = 3

export interface EuropeanQualifiersOptions {
  id: string
  short: string
  name(year: number): string
  editions(from: number, to: number): number[]
  finals(year: number): string
  /** Hosts already qualified for the finals (they play all the same). */
  hosts(year: number, ctx: CompContext): string[]
  /** Places to be won here, hosts' excluded. */
  places(year: number, ctx: CompContext): number
  /** The Nations League edition whose ranking splits the leagues. */
  nationsLeague(year: number): string
  drawDate(year: number): ISODate
  groupDates(year: number): ISODate[]
  playoffDrawDate(year: number): ISODate
  playoffDates(year: number): [ISODate, ISODate]
}

/** Direct places per League 1 group, and the play-off ties for the rest. */
export function qualifierSplit(places: number) {
  const perGroup = Math.max(1, Math.round(places / (2 * GROUPS)))
  return { perGroup, ties: Math.max(0, places - perGroup * GROUPS) }
}

const byRecord = (a: Standing, b: Standing) => {
  const pa = a.p ? a.pts / a.p : 0
  const pb = b.p ? b.pts / b.p : 0
  return pb - pa || b.gd - a.gd || b.gf - a.gf
}

export function europeanQualifiersDef(o: EuropeanQualifiersOptions): CompetitionDef {
  /** League 1 and League 2, best first, from the Nations League (or the ranking). */
  const leagues = (year: number, ctx: CompContext) => {
    const members = ctx.ranked((t) => ctx.fifa(t) && ctx.confedOf(t) === "UEFA")
    const nl = ctx.instance(o.nationsLeague(year))
    const order = [
      ...new Set([
        ...(nl ? leagueRanking(nl, ctx).map((x) => x.team) : []).filter((t) => members.includes(t)),
        ...members,
      ]),
    ]
    const one = order.slice(0, LEAGUE_ONE).sort((a, b) => ctx.points(b) - ctx.points(a))
    const two = order.slice(LEAGUE_ONE).sort((a, b) => ctx.points(b) - ctx.points(a))
    return { one, two }
  }

  const groups = (key: "l1" | "l2", year: number, ctx: CompContext): GroupPlan => ({
    count: GROUPS,
    legs: 1,
    dates: o.groupDates(year),
    get fixed() {
      const l = leagues(year, ctx)
      // Pot by pot, so each group lists its teams by pot.
      return drawGroups(
        key === "l1" ? l.one : l.two,
        GROUPS,
        makeRng(deriveSeed(ctx.seed, "draw", `${o.id}-${year}`, key))
      )
    },
    names: key === "l1" ? ["1A", "1B", "1C"] : ["2A", "2B", "2C"],
    schedule: (list) => ({
      rounds: sixMatchRounds(list) ?? roundRobin(list, 1),
      dates: o.groupDates(year),
    }),
    venue: "home-away",
    tiebreak: "gd",
  })

  /** Each League 1 group's table without the hosts, whose places pass down. */
  const leagueOne = (inst: CompetitionInstance, ctx: CompContext) => {
    const hosts = o.hosts(inst.year, ctx)
    return standingsOf(inst, "l1", ctx).map((t) => t.filter((r) => !hosts.includes(r.team)))
  }

  const split = (inst: CompetitionInstance, ctx: CompContext) =>
    qualifierSplit(o.places(inst.year, ctx))

  const direct = (inst: CompetitionInstance, ctx: CompContext) => {
    const { perGroup } = split(inst, ctx)
    return leagueOne(inst, ctx).flatMap((t) => t.slice(0, perGroup).map((r) => r.team))
  }

  /** Play-off ties in order, the better ranked at home second: [low, high, …]. */
  const playoffEntrants = (inst: CompetitionInstance, ctx: CompContext) => {
    const { perGroup, ties } = split(inst, ctx)
    if (!ties) return []
    const hosts = o.hosts(inst.year, ctx)
    const rest = leagueOne(inst, ctx).map((t) => t.slice(perGroup))
    const depth = Math.max(0, ...rest.map((t) => t.length))
    const one: string[] = []
    for (let pos = 0; pos < depth; pos++)
      one.push(
        ...rest
          .map((t) => t[pos])
          .filter((r): r is Standing => !!r)
          .sort(byRecord)
          .map((r) => r.team)
      )
    const two = standingsOf(inst, "l2", ctx)
      .map((t) => t.find((r) => !hosts.includes(r.team)))
      .filter((r): r is Standing => !!r)
      .sort(byRecord)
      .map((r) => r.team)
    const want = ties * 2
    const seeds = [...one.slice(0, Math.max(0, want - two.length)), ...two].slice(0, want)
    const out: string[] = []
    for (let i = 0; i < seeds.length / 2; i++) out.push(seeds[seeds.length - 1 - i], seeds[i])
    return out
  }

  return {
    id: o.id,
    short: o.short,
    confed: "UEFA",
    kind: "qualifier",
    name: o.name,
    editions: o.editions,
    finals: o.finals,
    plan(inst, ctx) {
      const y = inst.year
      return [
        {
          key: "l1",
          name: "League 1",
          after: null,
          drawDate: o.drawDate(y),
          importance: "qualifier",
          entrants: () => [],
          groups: groups("l1", y, ctx),
        },
        {
          key: "l2",
          name: "League 2",
          after: null,
          drawDate: o.drawDate(y),
          importance: "qualifier",
          entrants: () => [],
          groups: groups("l2", y, ctx),
        },
        {
          key: "playoff",
          name: "Play-offs",
          after: ["l1", "l2"],
          drawDate: o.playoffDrawDate(y),
          importance: "qualifier",
          entrants: (c, i) => playoffEntrants(i, c),
          knockout: {
            rounds: [{ name: "Play-offs", dates: o.playoffDates(y) }],
            pairing: "ordered",
            venue: "home-away",
          },
        },
      ]
    },
    finalize(inst, ctx) {
      return {
        qualified: [...direct(inst, ctx), ...knockoutResult(inst, "playoff").finalWinners],
        interconf: [],
      }
    },
    provisional(inst, ctx) {
      if (inst.status === "done") return inst.outcome.qualified ?? []
      const done = (k: string) => inst.stages.find((s) => s.key === k)?.status === "done"
      if (!done("l1") || !done("l2")) return []
      const { ties } = split(inst, ctx)
      return [
        ...direct(inst, ctx),
        ...Array.from({ length: ties }, (_, i) => makePlaceholder(inst.id, i)),
      ]
    },
    placeholderWinner(inst, slot) {
      return knockoutResult(inst, "playoff").finalWinners[slot]
    },
  }
}

/**
 * One competition id whose format changed between editions: `early` up to `last`,
 * `later` after it. Instance ids (`euroq-2028`, `euroq-2032`) stay the same.
 */
export function byEdition(
  last: number,
  early: CompetitionDef,
  later: CompetitionDef
): CompetitionDef {
  const pick = (year: number) => (year <= last ? early : later)
  return {
    ...later,
    name: (y) => pick(y).name(y),
    finals: (y) => pick(y).finals!(y),
    plan: (inst, ctx) => pick(inst.year).plan(inst, ctx),
    finalize: (inst, ctx) => pick(inst.year).finalize(inst, ctx),
    provisional: (inst, ctx) => pick(inst.year).provisional?.(inst, ctx) ?? [],
    placeholderWinner: (inst, slot) => pick(inst.year).placeholderWinner?.(inst, slot),
  }
}
