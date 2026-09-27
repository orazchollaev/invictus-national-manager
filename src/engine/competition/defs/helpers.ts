import type { ISODate } from "@/engine/types"
import { addDays, iso } from "@/engine/calendar/dates"
import { deriveSeed, makeRng, pickWeighted } from "@/engine/rng"
import type { CompContext } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, Standing } from "../types"
import type { Tiebreak } from "../tables"

export function everyNYears(first: number, n: number) {
  return (from: number, to: number) => {
    const out: number[] = []
    for (let y = first; y <= to; y += n) if (y >= from) out.push(y)
    return out
  }
}

/** Every year from `first`, skipping years `skip` says no to. */
export function yearly(first: number, skip: (y: number) => boolean = () => false) {
  return (from: number, to: number) => {
    const out: number[] = []
    for (let y = Math.max(first, from); y <= to; y++) if (!skip(y)) out.push(y)
    return out
  }
}

/** `count` dates from `start`, `gap` days apart. */
export function spaced(start: ISODate, count: number, gap: number): ISODate[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i * gap))
}

/**
 * A finals tournament schedule: group matchdays then knockout rounds, from `start`.
 * Returns the dates each stage needs.
 */
export function finalsSchedule(start: ISODate, groupRounds: number, koRounds: number, gap = 4) {
  const groups = spaced(start, groupRounds, gap)
  const koStart = addDays(groups[groups.length - 1], gap + 1)
  const ko = spaced(koStart, koRounds, gap)
  return { groups, ko, final: ko[ko.length - 1] }
}

/** Knockout round names for a bracket of `teams`. */
export function roundNames(teams: number): string[] {
  const names: string[] = []
  for (let n = teams; n >= 2; n /= 2) {
    names.push(
      n === 2 ? "Final" : n === 4 ? "Semi-finals" : n === 8 ? "Quarter-finals" : `Round of ${n}`
    )
  }
  return names
}

/**
 * Seeds for a knockout that follows a group stage: group winners, then runners-up,
 * then the best third-placed teams, each set ordered by record.
 */
export function bracketSeeds(
  inst: CompetitionInstance,
  key: string,
  ctx: CompContext,
  perGroup: number,
  bestThirds: number,
  rule: Tiebreak = "gd"
): string[] {
  const tables = standingsOf(inst, key, ctx, rule)
  const seeds: string[] = []
  for (let pos = 0; pos < perGroup; pos++) seeds.push(...finishers(tables, pos).map((r) => r.team))
  if (bestThirds)
    seeds.push(
      ...finishers(tables, perGroup)
        .slice(0, bestThirds)
        .map((r) => r.team)
    )
  return seeds
}

export function tablesOf(
  inst: CompetitionInstance,
  key: string,
  ctx: CompContext,
  rule: Tiebreak = "gd"
): Standing[][] {
  return standingsOf(inst, key, ctx, rule)
}

/** Winner, runner-up, third and a finishing order for a group-then-knockout event. */
export function finalsOutcome(
  inst: CompetitionInstance,
  ctx: CompContext,
  groupKey = "groups",
  koKey = "knockout"
) {
  const ko = knockoutResult(inst, koKey)
  const tables = standingsOf(inst, groupKey, ctx)
  const placings: string[] = []
  const add = (t?: string) => t && !placings.includes(t) && placings.push(t)
  add(ko.winner)
  add(ko.runnerUp)
  add(ko.third)
  const stage = inst.stages.find((s) => s.key === koKey)
  for (const round of [...(stage?.rounds ?? [])].reverse())
    for (const tie of round.ties) add(tie.loser)
  for (let pos = 0; pos < 8; pos++) for (const r of finishers(tables, pos)) add(r.team)
  return { winner: ko.winner, runnerUp: ko.runnerUp, third: ko.third, placings }
}

/**
 * Pick hosts for an edition no one has been awarded yet: weighted towards stronger,
 * bigger football nations, deterministic for the world seed.
 */
export function pickHosts(
  ctx: CompContext,
  key: string,
  candidates: string[],
  count = 1
): string[] {
  const rng = makeRng(deriveSeed(ctx.seed, "hosts", key))
  const pool = candidates.slice(0, Math.max(count, 16))
  const out: string[] = []
  while (out.length < count && pool.length) {
    const choice = pickWeighted(
      rng,
      pool,
      (t) => Math.max(1, ctx.points(t) - 900) ** 1.5 * ctx.stature(t)
    )
    out.push(choice)
    pool.splice(pool.indexOf(choice), 1)
  }
  return out
}

/** Keep `list` if it has enough teams; otherwise top it up from the ranking. */
export function fillFromRanking(
  ctx: CompContext,
  list: string[],
  size: number,
  filter: (t: string) => boolean
): string[] {
  const out = [...new Set(list)]
  if (out.length >= size) return out.slice(0, size)
  for (const t of ctx.ranked(filter)) {
    if (out.length >= size) break
    if (!out.includes(t)) out.push(t)
  }
  return out
}

export const jan = (y: number, d: number) => iso(y, 1, d)
export const jun = (y: number, d: number) => iso(y, 6, d)
export const jul = (y: number, d: number) => iso(y, 7, d)
export const dec = (y: number, d: number) => iso(y, 12, d)
