/**
 * The other confederations' championships and their qualifying:
 *  - Africa Cup of Nations: 2027 (Kenya, Tanzania, Uganda; 19 June – 17 July), then
 *    every four years from 2028 (CAF, December 2025). 2027 qualifying is the real draw.
 *    Hosts play qualifying too; a group with a host sends only its best other team.
 *  - AFC Asian Cup: 2027 in Saudi Arabia (7 January – 5 February, real groups), then
 *    every four years. The top two of each World Cup qualifying second-round group
 *    qualify; everyone else plays Asian Cup qualifying: first-round losers in a
 *    play-off round, then a third round with the second round's third- and
 *    fourth-placed teams, whose group winners take the last places.
 *  - Copa América: every four years from 2028, CONMEBOL plus six CONCACAF guests.
 *    CONCACAF's own competitions are in concacaf.ts.
 *  - OFC Nations Cup: every four years from 2028.
 */
import type { CompContext, CompetitionDef } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance } from "../types"
import { iso } from "@/engine/calendar/dates"
import { slots, window } from "@/engine/calendar/windows"
import { AFCON_2027_QUALIFYING, ASIAN_CUP_2027, AWARDED_HOSTS } from "@/data/start"
import { finalsDef, qualifierDef } from "./builders"
import { everyNYears, pickHosts } from "./helpers"
import { afcFirstRoundLosers, afcSecondRound } from "./fifa"

function hostsOf(key: string, ctx: CompContext, pool: string[], count = 1) {
  return AWARDED_HOSTS[key] ?? pickHosts(ctx, key, pool, count, "continental")
}

// ── Africa ──────────────────────────────────────────────────────────────────

const afconYears = (from: number, to: number) =>
  [2027, ...everyNYears(2028, 4)(from, to)].filter((y) => y >= from && y <= to)
const caf = (ctx: CompContext) =>
  ctx.ranked((t) => ctx.confedMember(t) && ctx.confedOf(t) === "CAF")

export const afcon: CompetitionDef = finalsDef({
  id: "afcon",
  short: "AFCON",
  confed: "CAF",
  kind: "continental",
  name: (y) => `Africa Cup of Nations ${y}`,
  editions: afconYears,
  teams: 24,
  groups: 6,
  perGroup: 2,
  bestThirds: 4,
  thirdPlace: true,
  start: (y) => iso(y, 6, 19),
  drawDate: (y) => iso(y, 4, 20),
  hosts: (y, ctx) => hostsOf(`afcon-${y}`, ctx, caf(ctx)),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) => ctx.confedMember(t) && ctx.confedOf(t) === "CAF",
  entrants(inst, ctx) {
    const q = ctx.instance(`afconq-${inst.year}`)?.outcome.qualified ?? []
    return [
      ...inst.hosts,
      ...q.filter((t) => !inst.hosts.includes(t)).sort((a, b) => ctx.points(b) - ctx.points(a)),
    ]
  },
})

const afconHosts = (year: number, ctx: CompContext) =>
  ctx.instance(`afcon-${year}`)?.hosts ?? AWARDED_HOSTS[`afcon-${year}`] ?? []

/**
 * The top two of each group qualify, but a group with a host sends only its best
 * other team: the host already has that place (as for Kenya, Tanzania and Uganda).
 */
function afconQualify(inst: CompetitionInstance, ctx: CompContext) {
  const hosts = afconHosts(inst.year, ctx)
  const qualified: string[] = []
  for (const table of standingsOf(inst, "groups", ctx)) {
    const hosted = table.some((r) => hosts.includes(r.team))
    const others = table.filter((r) => !hosts.includes(r.team))
    qualified.push(...others.slice(0, hosted ? 1 : 2).map((r) => r.team))
  }
  return { qualified: qualified.slice(0, 24 - hosts.length) }
}

/** Every CAF member, hosts included, best ranked first — hosts spared the preliminary round. */
function afconEntrants(inst: CompetitionInstance, ctx: CompContext) {
  const ranked = caf(ctx)
  const hosts = afconHosts(inst.year, ctx).filter((h) => ranked.includes(h))
  // With 48 group places, the rest of the lowest ranked play off first.
  const spared = Math.min(ranked.length, 96 - ranked.length)
  const out = ranked.filter((t) => !hosts.includes(t))
  for (const h of hosts) out.splice(Math.min(ranked.indexOf(h), spared - 1), 0, h)
  return out
}

export const afconQualifying: CompetitionDef = qualifierDef({
  id: "afconq",
  short: "AFCON Qualifying",
  confed: "CAF",
  name: (y) => `Africa Cup of Nations ${y} Qualifying`,
  editions: afconYears,
  finals: (y) => `afcon-${y}`,
  entrants: afconEntrants,
  groups: () => 12,
  groupSize: 4,
  fixedGroups: (y) => (y === 2027 ? AFCON_2027_QUALIFYING : undefined),
  // The lowest ranked play two-legged ties in the June window before the groups.
  prelimDates: (y) => slots(y === 2028 ? 2027 : y - 2, ["jun"]),
  prelimDrawDate: (y) => iso(y === 2028 ? 2027 : y - 2, 3, 1),
  groupDrawDate: (y) => (y === 2027 ? "2026-07-01" : y === 2028 ? "2027-07-15" : iso(y - 2, 7, 15)),
  groupDates: (y) => {
    if (y === 2027) {
      const sep = window(2026, "sep").slots
      return [sep[0], sep[1], ...slots(2026, ["nov"]), ...slots(2027, ["mar"])]
    }
    return y === 2028 ? slots(2027, ["sep", "nov"]) : slots(y - 2, ["sep", "nov"])
  },
  qualify: afconQualify,
})

// ── Asia ────────────────────────────────────────────────────────────────────

const afc = (ctx: CompContext) =>
  ctx.ranked((t) => ctx.confedMember(t) && ctx.confedOf(t) === "AFC")

export const asianCup: CompetitionDef = finalsDef({
  id: "asian-cup",
  short: "Asian Cup",
  confed: "AFC",
  kind: "continental",
  name: (y) => `AFC Asian Cup ${y}`,
  editions: everyNYears(2027, 4),
  teams: 24,
  groups: 6,
  perGroup: 2,
  bestThirds: 4,
  thirdPlace: false,
  start: (y) => iso(y, 1, 7),
  drawDate: (y) => (y === 2027 ? "2026-05-09" : iso(y - 1, 5, 10)),
  hosts: (y, ctx) => hostsOf(`asian-cup-${y}`, ctx, afc(ctx)),
  fixedGroups: (y) => (y === 2027 ? ASIAN_CUP_2027 : undefined),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) => ctx.confedMember(t) && ctx.confedOf(t) === "AFC",
  entrants(inst, ctx) {
    const wcq = ctx.instance(`wcq-afc-${inst.year - 1}`)
    const q = ctx.instance(`asian-cupq-${inst.year}`)
    const earned = [
      ...(wcq ? afcSecondRound(wcq, ctx).top : []),
      ...(q?.outcome.qualified ?? []),
    ].filter((t) => !inst.hosts.includes(t))
    const list = [
      ...inst.hosts,
      ...[...new Set(earned)].sort((a, b) => ctx.points(b) - ctx.points(a)),
    ]
    return list.slice(0, 24)
  },
})

/** Places left for Asian Cup qualifying: 24, less the hosts and the second round's top two. */
function asianCupDirect(year: number, ctx: CompContext): string[] {
  const hosts = ctx.instance(`asian-cup-${year}`)?.hosts ?? AWARDED_HOSTS[`asian-cup-${year}`] ?? []
  const wcq = ctx.instance(`wcq-afc-${year - 1}`)
  return [...new Set([...hosts, ...(wcq ? afcSecondRound(wcq, ctx).top : [])])]
}

/**
 * Asian Cup qualifying for everyone the World Cup's second round left behind, as for
 * 2027: a two-legged play-off round for the first-round losers (September), then a
 * third round of groups of four, home and away, from March to the next March. The
 * group winners qualify.
 */
export const asianCupQualifying: CompetitionDef = {
  id: "asian-cupq",
  short: "Asian Cup Qualifying",
  confed: "AFC",
  kind: "qualifier",
  name: (y) => `AFC Asian Cup ${y} Qualifying`,
  editions: everyNYears(2031, 4),
  finals: (y) => `asian-cup-${y}`,
  plan(inst, ctx) {
    const y = inst.year
    const wcq = (c: CompContext) => c.instance(`wcq-afc-${y - 1}`)
    const [sep1, sep2] = window(y - 3, "sep").slots
    const [, , oct1, oct2] = window(y - 2, "sep").slots
    return [
      {
        key: "playoff",
        name: "Play-off round",
        drawDate: iso(y - 3, 7, 20),
        importance: "qualifier",
        entrants: (c) => {
          const w = wcq(c)
          const direct = asianCupDirect(y, c)
          return (w ? afcFirstRoundLosers(w) : [])
            .filter((t) => !direct.includes(t))
            .sort((a, b) => c.points(b) - c.points(a))
        },
        knockout: {
          rounds: [{ name: "Play-off round", dates: [sep1, sep2] }],
          pairing: "pots",
          venue: "home-away",
        },
      },
      {
        key: "groups",
        name: "Third round",
        drawDate: iso(y - 3, 12, 10),
        importance: "qualifier",
        entrants: (c, i) => {
          const w = wcq(c)
          const direct = asianCupDirect(y, c)
          const list = [
            ...(w ? afcSecondRound(w, c).rest : []),
            ...knockoutResult(i, "playoff").finalWinners,
          ].filter((t) => !direct.includes(t))
          return [...new Set(list)].sort((a, b) => c.points(b) - c.points(a))
        },
        groups: {
          // A group per place left.
          count: Math.max(1, 24 - asianCupDirect(y, ctx).length),
          legs: 2,
          dates: [
            slots(y - 2, ["mar"])[1],
            slots(y - 2, ["jun"])[1],
            oct1,
            oct2,
            slots(y - 2, ["nov"])[1],
            slots(y - 1, ["mar"])[1],
          ],
          venue: "home-away",
          tiebreak: "gd",
        },
      },
    ]
  },
  finalize(inst, ctx) {
    const tables = standingsOf(inst, "groups", ctx)
    return { qualified: finishers(tables, 0).map((r) => r.team) }
  },
}

// ── The Americas ────────────────────────────────────────────────────────────

// Copa América guests are invited FIFA members.
const concacaf = (ctx: CompContext) =>
  ctx.ranked((t) => ctx.fifa(t) && ctx.confedOf(t) === "CONCACAF")
const conmebol = (ctx: CompContext) => ctx.ranked((t) => ctx.confedOf(t) === "CONMEBOL")

export const copaAmerica: CompetitionDef = finalsDef({
  id: "copa",
  short: "Copa América",
  confed: "CONMEBOL",
  kind: "continental",
  name: (y) => `Copa América ${y}`,
  editions: everyNYears(2028, 4),
  teams: 16,
  groups: 4,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: true,
  start: (y) => iso(y, 6, 20),
  drawDate: (y) => iso(y, 3, 5),
  hosts: (y, ctx) => hostsOf(`copa-${y}`, ctx, conmebol(ctx)),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) =>
    ctx.fifa(t) && (ctx.confedOf(t) === "CONMEBOL" || ctx.confedOf(t) === "CONCACAF"),
  entrants: (inst, ctx) => {
    const south = conmebol(ctx)
    const guests = concacaf(ctx).slice(0, 6)
    const all = [...south, ...guests].sort((a, b) => ctx.points(b) - ctx.points(a))
    return [...inst.hosts, ...all.filter((t) => !inst.hosts.includes(t))]
  },
})

// ── Oceania ─────────────────────────────────────────────────────────────────

export const ofcNationsCup: CompetitionDef = finalsDef({
  id: "ofc-cup",
  short: "OFC Nations Cup",
  confed: "OFC",
  kind: "continental",
  name: (y) => `OFC Nations Cup ${y}`,
  editions: everyNYears(2028, 4),
  teams: 8,
  groups: 2,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: true,
  start: (y) => iso(y, 6, 14),
  drawDate: (y) => iso(y, 3, 1),
  hosts: (y, ctx) =>
    hostsOf(
      `ofc-cup-${y}`,
      ctx,
      ctx.ranked((t) => ctx.confedMember(t) && ctx.confedOf(t) === "OFC")
    ),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) => ctx.confedMember(t) && ctx.confedOf(t) === "OFC",
  entrants: (inst, ctx) => [
    ...inst.hosts,
    ...ctx.ranked(
      (t) => ctx.confedMember(t) && ctx.confedOf(t) === "OFC" && !inst.hosts.includes(t)
    ),
  ],
})

export const CONTINENT_DEFS: CompetitionDef[] = [
  afcon,
  afconQualifying,
  asianCup,
  asianCupQualifying,
  copaAmerica,
  ofcNationsCup,
]
