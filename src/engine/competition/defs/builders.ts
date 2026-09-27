/**
 * Builders for the two shapes almost every competition takes: a finals tournament
 * (groups, then a bracket) and a qualifying competition (an optional preliminary
 * round, groups, optional play-offs).
 */
import type { Confed, ISODate } from "@/engine/types"
import type { CompContext, CompetitionDef, StagePlan } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, CompetitionKind, CompetitionOutcome, Importance } from "../types"
import type { Tiebreak } from "../tables"
import { bracketSeeds, fillFromRanking, finalsOutcome, finalsSchedule, roundNames } from "./helpers"

export interface FinalsOptions {
  id: string
  short: string
  confed: Confed | "FIFA"
  kind: CompetitionKind
  offWindow?: boolean
  name(year: number): string
  editions(from: number, to: number): number[]
  teams: number
  groups: number
  /** Qualifiers per group; the rest of the bracket comes from the next position. */
  perGroup: number
  bestThirds: number
  thirdPlace: boolean
  start(year: number): ISODate
  drawDate(year: number): ISODate
  gap?: number
  legs?: 1 | 2
  /** Groups only (round-robin tournaments like the E-1). */
  noKnockout?: boolean
  hosts?(year: number, ctx: CompContext): string[]
  entrants(inst: CompetitionInstance, ctx: CompContext): string[]
  /** Who can be added from the ranking if entrants fall short. */
  eligible(team: string, ctx: CompContext): boolean
  fixedGroups?(year: number): string[][] | undefined
  spreadConfeds?: boolean
  importance: [Importance, Importance]
  tiebreak?: Tiebreak
  /** Group venues: neutral (a hosted tournament) or home and away. */
  venue?: "neutral" | "home-away"
  koVenue?: "neutral" | "home-away"
  koLegs?: 1 | 2
}

export function finalsDef(o: FinalsOptions): CompetitionDef {
  return {
    id: o.id,
    short: o.short,
    confed: o.confed,
    kind: o.kind,
    offWindow: o.offWindow,
    name: o.name,
    editions: o.editions,
    hosts: o.hosts,
    plan(inst, ctx) {
      const perGroupSize = Math.ceil(o.teams / o.groups)
      const rounds = (perGroupSize - (perGroupSize % 2 ? 0 : 1)) * (o.legs ?? 1)
      const koTeams = o.groups * o.perGroup + o.bestThirds
      const names = o.noKnockout ? [] : roundNames(koTeams)
      const koLegs = o.koLegs ?? 1
      const sched = finalsSchedule(o.start(inst.year), rounds, names.length * koLegs, o.gap ?? 4)
      const tiebreak = o.tiebreak ?? "gd"
      const plans: StagePlan[] = [
        {
          key: "groups",
          name: o.groups > 1 ? "Group stage" : "League",
          drawDate: o.drawDate(inst.year),
          importance: o.importance[0],
          entrants: (c, i) =>
            fillFromRanking(c, o.entrants(i, c), o.teams, (t) => o.eligible(t, c)),
          groups: {
            count: o.groups,
            legs: o.legs ?? 1,
            dates: sched.groups,
            fixed: o.fixedGroups?.(inst.year),
            seeded: inst.hosts,
            spreadConfeds: o.spreadConfeds,
            venue: o.venue ?? "neutral",
            tiebreak,
          },
        },
      ]
      if (!o.noKnockout) {
        plans.push({
          key: "knockout",
          name: "Knockout stage",
          drawDate: o.drawDate(inst.year),
          importance: o.importance[1],
          entrants: (c, i) => bracketSeeds(i, "groups", c, o.perGroup, o.bestThirds, tiebreak),
          knockout: {
            rounds: names.map((name, r) => ({
              name,
              dates: sched.ko.slice(r * koLegs, r * koLegs + koLegs),
            })),
            pairing: "bracket",
            thirdPlace: o.thirdPlace ? sched.final : undefined,
            venue: o.koVenue ?? o.venue ?? "neutral",
          },
        })
      }
      void ctx
      return plans
    },
    finalize(inst, ctx) {
      if (o.noKnockout) {
        const table = standingsOf(inst, "groups", ctx, o.tiebreak ?? "gd")[0] ?? []
        return {
          winner: table[0]?.team,
          runnerUp: table[1]?.team,
          third: table[2]?.team,
          placings: table.map((r) => r.team),
        }
      }
      return finalsOutcome(inst, ctx)
    },
  }
}

export interface QualifierOptions {
  id: string
  short: string
  confed: Confed
  name(year: number): string
  editions(from: number, to: number): number[]
  /** Teams entering, best ranked first (hosts and the suspended already removed). */
  entrants(inst: CompetitionInstance, ctx: CompContext): string[]
  /** Group winners that qualify (a group per direct place, unless `groups` says otherwise). */
  groups(inst: CompetitionInstance, ctx: CompContext): number
  groupSize: number
  groupDates(year: number): ISODate[]
  groupDrawDate(year: number): ISODate
  groupLegs?: 1 | 2
  groupVenue?: "home-away" | "neutral"
  /** Two-legged preliminary round for the lowest ranked, played on these dates. */
  prelimDates?(year: number): ISODate[]
  prelimDrawDate?(year: number): ISODate
  /** Places decided by play-off paths among the best runners-up. */
  playoff?: {
    paths(inst: CompetitionInstance, ctx: CompContext): number
    /** Round dates: [semi, final] single matches, or a single two-legged tie. */
    rounds: (year: number) => { name: string; dates: ISODate[] }[]
    teamsPerPath: 2 | 4
    drawDate(year: number): ISODate
    /** Winners go to the inter-confederation play-off instead of qualifying. */
    toInterconf?: boolean
  }
  /** Best runners-up sent straight to the inter-confederation play-off. */
  runnersUpToInterconf?: number
  /** Also qualify the best runners-up directly (Euro qualifying). */
  runnersUpQualify?: boolean
  /** The next finisher after the direct places goes to the inter-confederation play-off (CONMEBOL). */
  nextToInterconf?: boolean
  /** Direct places from the table when there is a single group. */
  direct?(inst: CompetitionInstance, ctx: CompContext): number
  tiebreak?: Tiebreak
  importance?: Importance
  fixedGroups?(year: number): string[][] | undefined
  /** Custom qualification rule over the final tables. */
  qualify?(inst: CompetitionInstance, ctx: CompContext): CompetitionOutcome
}

export function qualifierDef(o: QualifierOptions): CompetitionDef {
  const importance = o.importance ?? "qualifier"
  const tiebreak = o.tiebreak ?? "gd"
  return {
    id: o.id,
    short: o.short,
    confed: o.confed,
    kind: "qualifier",
    name: o.name,
    editions: o.editions,
    plan(inst, ctx) {
      const plans: StagePlan[] = []
      const groupCount = o.groups(inst, ctx)
      const fixed = o.fixedGroups?.(inst.year)
      // How many of the lowest ranked must be knocked out first for the groups to fit.
      const prelimTies = (c: CompContext) => {
        if (fixed) return 0
        const n = o.entrants(inst, c).length
        return Math.max(0, n - groupCount * o.groupSize)
      }
      // Decided once, when the edition is created, so the stage list never shifts.
      const usePrelim =
        !!o.prelimDates &&
        (inst.stages.length ? inst.stages.some((s) => s.key === "prelim") : prelimTies(ctx) > 0)
      if (usePrelim) {
        plans.push({
          key: "prelim",
          name: "Preliminary round",
          drawDate: o.prelimDrawDate!(inst.year),
          importance,
          entrants: (c, i) => {
            const all = o.entrants(i, c)
            return all.slice(all.length - 2 * prelimTies(c))
          },
          knockout: {
            rounds: [{ name: "Preliminary round", dates: o.prelimDates!(inst.year) }],
            pairing: "seeded",
            venue: "home-away",
          },
        })
      }
      plans.push({
        key: "groups",
        name: groupCount > 1 ? "Group stage" : "Qualifying",
        drawDate: o.groupDrawDate(inst.year),
        importance,
        entrants: (c, i) => {
          const all = o.entrants(i, c)
          if (!usePrelim) return all
          const cut = all.length - 2 * prelimTies(c)
          const winners = knockoutResult(i, "prelim").finalWinners
          return [...all.slice(0, cut), ...winners]
        },
        groups: {
          count: groupCount,
          legs: o.groupLegs ?? 2,
          dates: o.groupDates(inst.year),
          fixed,
          venue: o.groupVenue ?? "home-away",
          tiebreak,
        },
      })
      if (o.playoff) {
        const p = o.playoff
        plans.push({
          key: "playoff",
          name: "Play-offs",
          drawDate: p.drawDate(inst.year),
          importance,
          entrants: (c, i) => {
            const tables = standingsOf(i, "groups", c, tiebreak)
            const want = p.paths(i, c) * p.teamsPerPath
            const winnersIn = o.runnersUpQualify ? 2 : 1
            const pool = [
              ...finishers(tables, winnersIn).map((r) => r.team),
              ...finishers(tables, winnersIn + 1).map((r) => r.team),
            ]
            return pool.slice(0, want)
          },
          knockout: { rounds: p.rounds(inst.year), pairing: "seeded", venue: "home-away" },
        })
      }
      return plans
    },
    finalize(inst, ctx) {
      if (o.qualify) return o.qualify(inst, ctx)
      const tables = standingsOf(inst, "groups", ctx, tiebreak)
      const out: CompetitionOutcome = { qualified: [], interconf: [] }
      if (tables.length === 1) {
        const table = tables[0]
        const direct = o.direct?.(inst, ctx) ?? 1
        out.qualified = table.slice(0, direct).map((r) => r.team)
        if (o.nextToInterconf && table[direct]) out.interconf = [table[direct].team]
        out.placings = table.map((r) => r.team)
      } else {
        out.qualified = finishers(tables, 0).map((r) => r.team)
        if (o.runnersUpQualify) out.qualified.push(...finishers(tables, 1).map((r) => r.team))
        if (o.runnersUpToInterconf)
          out.interconf = finishers(tables, 1)
            .slice(0, o.runnersUpToInterconf)
            .map((r) => r.team)
      }
      if (o.playoff) {
        const winners = knockoutResult(inst, "playoff").finalWinners
        if (o.playoff.toInterconf) out.interconf!.push(...winners)
        else out.qualified!.push(...winners)
      }
      return out
    },
  }
}
