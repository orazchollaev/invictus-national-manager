/**
 * The other confederations' championships and their qualifying:
 *  - Africa Cup of Nations: 2027 (Kenya, Tanzania, Uganda; 19 June – 17 July), then
 *    every four years from 2028 (CAF, December 2025). 2027 qualifying is the real draw.
 *  - AFC Asian Cup: 2027 in Saudi Arabia (7 January – 5 February, real groups), then
 *    every four years; later editions qualify through the World Cup qualifying groups.
 *  - Copa América: every four years from 2028, CONMEBOL plus six CONCACAF guests.
 *  - CONCACAF Gold Cup: odd years; CONCACAF Nations League in the autumn after a World Cup.
 *  - OFC Nations Cup: every four years from 2028.
 */
import type { CompContext, CompetitionDef } from "../runtime"
import { finishers, standingsOf } from "../runtime"
import type { CompetitionInstance } from "../types"
import { iso } from "@/engine/calendar/dates"
import { slots, window } from "@/engine/calendar/windows"
import { AFCON_2027_QUALIFYING, ASIAN_CUP_2027, AWARDED_HOSTS } from "@/data/start"
import { finalsDef, qualifierDef } from "./builders"
import { everyNYears, pickHosts } from "./helpers"
import { nationsLeagueDef } from "./nationsLeague"

function hostsOf(key: string, ctx: CompContext, pool: string[], count = 1) {
  return AWARDED_HOSTS[key] ?? pickHosts(ctx, key, pool, count)
}

// ── Africa ──────────────────────────────────────────────────────────────────

const afconYears = (from: number, to: number) =>
  [2027, ...everyNYears(2028, 4)(from, to)].filter((y) => y >= from && y <= to)
const caf = (ctx: CompContext) => ctx.ranked((t) => ctx.confedOf(t) === "CAF")

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
  eligible: (t, ctx) => ctx.confedOf(t) === "CAF",
  entrants(inst, ctx) {
    const q = ctx.instance(`afconq-${inst.year}`)?.outcome.qualified ?? []
    return [
      ...inst.hosts,
      ...q.filter((t) => !inst.hosts.includes(t)).sort((a, b) => ctx.points(b) - ctx.points(a)),
    ]
  },
})

function afconQualify(inst: CompetitionInstance, ctx: CompContext) {
  const hosts =
    ctx.instance(`afcon-${inst.year}`)?.hosts ?? AWARDED_HOSTS[`afcon-${inst.year}`] ?? []
  const tables = standingsOf(inst, "groups", ctx).map((t) =>
    t.filter((r) => !hosts.includes(r.team))
  )
  const places = 24 - hosts.length
  const winners = finishers(tables, 0).map((r) => r.team)
  const runners = finishers(tables, 1).map((r) => r.team)
  return { qualified: [...winners, ...runners].slice(0, places) }
}

export const afconQualifying: CompetitionDef = qualifierDef({
  id: "afconq",
  short: "AFCON Qualifying",
  confed: "CAF",
  name: (y) => `Africa Cup of Nations ${y} Qualifying`,
  editions: afconYears,
  entrants: (inst, ctx) => {
    const hosts =
      AWARDED_HOSTS[`afcon-${inst.year}`] ?? ctx.instance(`afcon-${inst.year}`)?.hosts ?? []
    return caf(ctx)
      .filter((t) => !hosts.includes(t))
      .slice(0, 48)
  },
  groups: () => 12,
  groupSize: 4,
  fixedGroups: (y) => (y === 2027 ? AFCON_2027_QUALIFYING : undefined),
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

const afc = (ctx: CompContext) => ctx.ranked((t) => ctx.confedOf(t) === "AFC")

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
  eligible: (t, ctx) => ctx.confedOf(t) === "AFC",
  entrants(inst, ctx) {
    // Qualification rides on the World Cup qualifying groups played before it.
    const wcq = ctx.instance(`wcq-afc-${inst.year - 1}`)
    const list = [...inst.hosts]
    if (wcq?.status === "done") {
      const tables = standingsOf(wcq, "groups", ctx)
      for (let pos = 0; pos < 5; pos++) list.push(...finishers(tables, pos).map((r) => r.team))
    }
    return [...new Set(list)].slice(0, 24)
  },
})

// ── The Americas ────────────────────────────────────────────────────────────

const concacaf = (ctx: CompContext) => ctx.ranked((t) => ctx.confedOf(t) === "CONCACAF")
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
  eligible: (t, ctx) => ctx.confedOf(t) === "CONMEBOL" || ctx.confedOf(t) === "CONCACAF",
  entrants: (inst, ctx) => {
    const south = conmebol(ctx)
    const guests = concacaf(ctx).slice(0, 6)
    const all = [...south, ...guests].sort((a, b) => ctx.points(b) - ctx.points(a))
    return [...inst.hosts, ...all.filter((t) => !inst.hosts.includes(t))]
  },
})

export const goldCup: CompetitionDef = finalsDef({
  id: "gold-cup",
  short: "Gold Cup",
  confed: "CONCACAF",
  kind: "continental",
  name: (y) => `CONCACAF Gold Cup ${y}`,
  editions: everyNYears(2027, 2),
  teams: 16,
  groups: 4,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => iso(y, 6, 17),
  drawDate: (y) => iso(y, 4, 10),
  hosts: (y, ctx) => AWARDED_HOSTS[`gold-cup-${y}`] ?? (ctx.points("USA") ? ["USA"] : []),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) => ctx.confedOf(t) === "CONCACAF",
  entrants: (inst, ctx) => [...inst.hosts, ...concacaf(ctx).filter((t) => !inst.hosts.includes(t))],
})

export const concacafNationsLeague: CompetitionDef = nationsLeagueDef({
  id: "cnl",
  short: "CONCACAF NL",
  confed: "CONCACAF",
  name: (y) => `CONCACAF Nations League ${y}–${String(y + 1).slice(2)}`,
  editions: everyNYears(2026, 4),
  tiers: [
    { letter: "A", size: 16, groups: 4 },
    { letter: "B", size: 16, groups: 4 },
    { letter: "C", size: 3, groups: 1 },
  ],
  playoffs: false,
  leagueDates: (y) => slots(y, ["sep", "nov"]),
  leagueDrawDate: (y) => iso(y, 5, 20),
  springDates: (y) => slots(y + 1, ["mar"]) as [string, string],
  springDrawDate: (y) => iso(y, 11, 25),
  finalsDates: (y) => {
    const [semi, final] = slots(y + 1, ["jun"])
    return { semi, final }
  },
  finalsDrawDate: (y) => iso(y + 1, 4, 5),
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
      ctx.ranked((t) => ctx.confedOf(t) === "OFC")
    ),
  importance: ["continental", "continental-ko"],
  eligible: (t, ctx) => ctx.confedOf(t) === "OFC",
  entrants: (inst, ctx) => [
    ...inst.hosts,
    ...ctx.ranked((t) => ctx.confedOf(t) === "OFC" && !inst.hosts.includes(t)),
  ],
})

export const CONTINENT_DEFS: CompetitionDef[] = [
  afcon,
  afconQualifying,
  asianCup,
  copaAmerica,
  goldCup,
  concacafNationsLeague,
  ofcNationsCup,
]
