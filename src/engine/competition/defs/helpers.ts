import type { ISODate } from "@/engine/types"
import { addDays, iso } from "@/engine/calendar/dates"
import { deriveSeed, makeRng, pickWeighted } from "@/engine/rng"
import type { CompContext } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, Standing } from "../types"
import type { Tiebreak } from "../tables"
import type { HostLevel } from "@/engine/world/stadiums"
import { NEIGHBOURS } from "@/data/geo"
import { AWARDED_HOSTS } from "@/data/start"

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

/** Days a hosted round of `matches` games is spread over: about four a day, never fewer than two days. */
function spreadOver(games: number): number {
  return games <= 1 ? 1 : Math.min(4, Math.max(2, Math.ceil(games / 2)))
}

/**
 * A hosted tournament's schedule, played the way real ones are: a matchday spread over
 * several days, two groups a day in order (A first), and each knockout round over a
 * few days, the bracket's top ties first — the round of 16 over four days, the
 * quarter-finals over two. Every team gets at least `gap` days between its rounds.
 * `koTies` is the first knockout round's number of ties.
 */
export function hostedSchedule(
  start: ISODate,
  groupRounds: number,
  groups: number,
  koRounds: number,
  koTies: number,
  gap = 4
) {
  const groupSpread = groups <= 1 ? 1 : Math.max(2, Math.ceil(groups / 2))
  // A day more than the spread: the first matchday starts a day late after the opening match.
  const groupDates = spaced(start, groupRounds, Math.max(gap, groupSpread + 1))
  const lastGroupDay = addDays(groupDates[groupDates.length - 1], groupSpread - 1)
  const ko: { date: ISODate; spread: number }[] = []
  let day = addDays(lastGroupDay, Math.max(2, gap - 1))
  for (let r = 0; r < koRounds; r++) {
    const spread = spreadOver(Math.max(1, Math.round(koTies / 2 ** r)))
    if (r > 0) {
      // The last tie of a round feeds the last of the next: it needs its rest too.
      const prev = ko[r - 1].spread
      day = addDays(ko[r - 1].date, Math.max(gap, prev - spread + gap))
    }
    ko.push({ date: day, spread })
  }
  const final = ko[ko.length - 1]?.date ?? lastGroupDay
  return { groups: groupDates, groupSpread, ko, final, thirdPlace: addDays(final, -1) }
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

/** Kilometres between two nations' centres. */
export function distanceKm(ctx: CompContext, a: string, b: string): number {
  const pa = ctx.centre(a)
  const pb = ctx.centre(b)
  if (!pa || !pb) return Infinity
  const rad = Math.PI / 180
  const dLat = (pb[0] - pa[0]) * rad
  const dLon = (pb[1] - pa[1]) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(pa[0] * rad) * Math.cos(pb[0] * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Close enough to share a tournament: a border or short sea crossing, or centres within 700 km. */
export function nearby(ctx: CompContext, a: string, b: string): boolean {
  return !!NEIGHBOURS.get(a)?.has(b) || distanceKm(ctx, a, b) <= 700
}

/** An edition id: the definition and the year ("euro-2032"). */
const EDITION = /^(.+)-(\d{4})$/

/** Final tournaments a nation hosts or has hosted, the ones awarded before the start included. */
function hostings(ctx: CompContext, team: string): { defId: string; year: number }[] {
  const out = [...ctx.hosted(team)]
  for (const [key, hosts] of Object.entries(AWARDED_HOSTS)) {
    const m = EDITION.exec(key)
    if (!m || !hosts.includes(team)) continue
    const year = Number(m[2])
    if (!out.some((h) => h.defId === m[1] && h.year === year)) out.push({ defId: m[1], year })
  }
  return out
}

/**
 * How much less likely a nation is to be given an edition for having hosted
 * lately: the same tournament within eight years all but rules it out, within
 * sixteen counts heavily; any other final tournament within four years a little.
 */
function hostingFatigue(ctx: CompContext, team: string, key: string): number {
  const m = EDITION.exec(key)
  if (!m) return 1
  const defId = m[1]
  const year = Number(m[2])
  let f = 1
  for (const h of hostings(ctx, team)) {
    if (h.defId === defId && h.year === year) continue
    const gap = Math.abs(year - h.year)
    if (h.defId === defId && gap <= 8) f *= 0.002
    else if (h.defId === defId && gap <= 16) f *= 0.05 + ((gap - 8) / 8) * 0.4
    else if (gap <= 4) f *= 0.5
  }
  return f
}

/**
 * Pick hosts for an edition no one has been awarded yet: weighted towards stronger,
 * bigger football nations whose stadiums can stage it, and away from those that
 * hosted lately, deterministic for the world seed. A bid (the user's federation)
 * counts four times over. A World Cup or continental host whose grounds fall short
 * is joined by co-hosts from its confederation — neighbours, or nations close by —
 * until together they meet the requirements (up to three for a World Cup, two
 * otherwise).
 */
export function pickHosts(
  ctx: CompContext,
  key: string,
  candidates: string[],
  count = 1,
  level: HostLevel = "regional"
): string[] {
  const rng = makeRng(deriveSeed(ctx.seed, "hosts", key))
  const ready = (t: string) => ctx.readiness([t], level)
  const bidders = candidates.filter((t) => ctx.bid(t, level) && ready(t) >= 0.5)
  let pool = [...new Set([...candidates.slice(0, Math.max(count, 24)), ...bidders])]
  const able = pool.filter((t) => ready(t) >= 0.5)
  if (able.length >= count) pool = able
  const weight = (t: string) =>
    Math.max(1, ctx.points(t) - 900) ** 1.2 *
    ctx.stature(t) *
    (0.2 + ready(t) ** 2) *
    (ctx.bid(t, level) ? 4 : 1) *
    hostingFatigue(ctx, t, key)
  const out: string[] = []
  while (out.length < count && pool.length) {
    const choice = pickWeighted(rng, pool, weight)
    out.push(choice)
    pool.splice(pool.indexOf(choice), 1)
  }
  if (count === 1 && out.length && level !== "regional") {
    const most = level === "world-cup" ? 3 : 2
    const confed = ctx.confedOf(out[0])
    const gap = (t: string) => Math.min(...out.map((h) => distanceKm(ctx, h, t)))
    while (out.length < most && ctx.readiness(out, level) < 1) {
      const able = candidates.filter(
        (t) => !out.includes(t) && ctx.confedOf(t) === confed && ready(t) > 0.2
      )
      let partners = able.filter((t) => out.some((h) => nearby(ctx, h, t)))
      // No neighbour can help: the closest within a short flight.
      if (!partners.length)
        partners = able
          .filter((t) => gap(t) <= 1800)
          .sort((a, b) => gap(a) - gap(b))
          .slice(0, 3)
      partners = partners.sort((a, b) => ready(b) - ready(a)).slice(0, 8)
      if (!partners.length) break
      out.push(pickWeighted(rng, partners, (t) => weight(t) / (1 + (gap(t) / 600) ** 2)))
    }
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
