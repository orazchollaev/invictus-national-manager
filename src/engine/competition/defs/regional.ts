/**
 * Regional cups. Most are played outside FIFA windows, so clubs do not have to
 * release players (the squad screen marks those who are held back). Teams already
 * booked for something else in the same weeks are left out.
 *
 *  - FIFA Arab Cup: December 2029 and 2033 in Qatar, then every four years.
 *  - Arabian Gulf Cup: every two years, December (2026: Saudi Arabia).
 *  - ASEAN Championship: every two years from 2028, July–August.
 *  - EAFF E-1: every two years from 2027, July.
 *  - CAFA Nations Cup: every two years from 2027, in the September window (as in
 *    2025), so clubs must release players.
 *  - WAFF Championship: West Asia's; irregular since 2019 — here every four years
 *    from 2027, in the summer, out of the Arab Cup's way.
 *  - SAFF Championship, COSAFA Cup, CECAFA Cup, WAFU Cup, Baltic Cup.
 *
 * Not modelled: the African Nations Championship (home-based players only) and the
 * dormant UNAF and UNIFFAC tournaments.
 */
import type { ISODate } from "@/engine/types"
import { addDays, iso } from "@/engine/calendar/dates"
import { window } from "@/engine/calendar/windows"
import type { CompContext, CompetitionDef } from "../runtime"
import { AWARDED_HOSTS } from "@/data/start"
import { finalsDef, type FinalsOptions } from "./builders"
import { everyNYears, pickHosts, yearly } from "./helpers"

type RegionalOptions = Omit<
  FinalsOptions,
  "kind" | "importance" | "eligible" | "entrants" | "hosts"
> & {
  members: (t: string, ctx: CompContext) => boolean
  /** Days the tournament spans, for keeping out teams already busy. */
  span: number
  hosted?: boolean
}

function regional(o: RegionalOptions): CompetitionDef {
  const free = (t: string, ctx: CompContext, year: number) => {
    const start: ISODate = o.start(year)
    return !ctx.busyBetween(t, addDays(start, -2), addDays(start, o.span))
  }
  return finalsDef({
    ...o,
    kind: "regional",
    offWindow: o.offWindow ?? true,
    importance: ["regional", "regional"],
    hosts:
      o.hosted === false
        ? undefined
        : (y, ctx) =>
            AWARDED_HOSTS[`${o.id}-${y}`] ??
            pickHosts(
              ctx,
              `${o.id}-${y}`,
              ctx.ranked((t) => o.members(t, ctx)),
              1
            ),
    // Regional cups go ahead with whoever is free rather than calling up outsiders.
    eligible: () => false,
    entrants: (inst, ctx) => {
      const list = ctx.ranked((t) => o.members(t, ctx) && free(t, ctx, inst.year))
      return [
        ...inst.hosts.filter((h) => list.includes(h)),
        ...list.filter((t) => !inst.hosts.includes(t)),
      ].slice(0, o.teams)
    },
  })
}

const member = (fed: string) => (t: string, ctx: CompContext) => ctx.subFeds(t).includes(fed)

export const arabCup = regional({
  id: "arab-cup",
  short: "Arab Cup",
  confed: "FIFA",
  name: (y) => `FIFA Arab Cup ${y}`,
  editions: everyNYears(2029, 4),
  teams: 16,
  groups: 4,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: true,
  start: (y) => iso(y, 12, 1),
  drawDate: (y) => iso(y, 9, 15),
  span: 20,
  gap: 3,
  members: member("UAFA"),
})

export const gulfCup = regional({
  id: "gulf-cup",
  short: "Gulf Cup",
  confed: "AFC",
  name: (y) => `Arabian Gulf Cup ${y}`,
  editions: everyNYears(2026, 2),
  teams: 8,
  groups: 2,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => iso(y, 12, 12),
  drawDate: (y) => iso(y, 10, 20),
  span: 18,
  gap: 3,
  members: member("GULF"),
})

export const aseanChampionship = regional({
  id: "aff",
  short: "ASEAN Championship",
  confed: "AFC",
  name: (y) => `ASEAN Championship ${y}`,
  editions: everyNYears(2028, 2),
  teams: 10,
  groups: 2,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => iso(y, 7, 24),
  drawDate: (y) => iso(y, 5, 15),
  span: 34,
  gap: 3,
  venue: "home-away",
  koVenue: "home-away",
  koLegs: 2,
  hosted: false,
  members: (t, ctx) => member("AFF")(t, ctx) && t !== "AUS",
})

export const eafE1 = regional({
  id: "e1",
  short: "E-1",
  confed: "AFC",
  name: (y) => `EAFF E-1 Championship ${y}`,
  editions: everyNYears(2027, 2),
  teams: 4,
  groups: 1,
  perGroup: 1,
  bestThirds: 0,
  thirdPlace: false,
  noKnockout: true,
  start: (y) => iso(y, 7, 12),
  drawDate: (y) => iso(y, 4, 1),
  span: 10,
  gap: 3,
  members: member("EAFF"),
})

/**
 * Central Asia: two groups of three, the winners meet in the final. Played in the
 * first half of the September window, before anything the second half holds.
 */
export const cafaNationsCup = regional({
  id: "cafa",
  short: "CAFA Nations Cup",
  confed: "AFC",
  name: (y) => `CAFA Nations Cup ${y}`,
  editions: everyNYears(2027, 2),
  offWindow: false,
  teams: 6,
  groups: 2,
  perGroup: 1,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => addDays(window(y, "sep").start, 1),
  drawDate: (y) => iso(y, 6, 25),
  span: 8,
  gap: 2,
  members: member("CAFA"),
})

export const waffChampionship = regional({
  id: "waff",
  short: "WAFF Championship",
  confed: "AFC",
  name: (y) => `WAFF Championship ${y}`,
  editions: everyNYears(2027, 4),
  teams: 8,
  groups: 2,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => iso(y, 7, 30),
  drawDate: (y) => iso(y, 5, 20),
  span: 16,
  gap: 3,
  members: member("WAFF"),
})

export const saffChampionship = regional({
  id: "saff",
  short: "SAFF Championship",
  confed: "AFC",
  name: (y) => `SAFF Championship ${y}`,
  editions: everyNYears(2027, 2),
  teams: 7,
  groups: 2,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: false,
  start: (y) => iso(y, 6, 21),
  drawDate: (y) => iso(y, 4, 20),
  span: 16,
  gap: 3,
  members: member("SAFF"),
})

export const cosafaCup = regional({
  id: "cosafa",
  short: "COSAFA Cup",
  confed: "CAF",
  name: (y) => `COSAFA Cup ${y}`,
  // Not in Africa Cup of Nations years.
  editions: yearly(2029, (y) => y % 4 === 0),
  teams: 12,
  groups: 3,
  perGroup: 1,
  bestThirds: 1,
  thirdPlace: true,
  start: (y) => iso(y, 6, 22),
  drawDate: (y) => iso(y, 5, 1),
  span: 16,
  gap: 3,
  members: member("COSAFA"),
})

export const cecafaCup = regional({
  id: "cecafa",
  short: "CECAFA Cup",
  confed: "CAF",
  name: (y) => `CECAFA Senior Challenge Cup ${y}`,
  editions: everyNYears(2027, 2),
  teams: 10,
  groups: 2,
  perGroup: 2,
  bestThirds: 0,
  thirdPlace: true,
  start: (y) => iso(y, 11, 26),
  drawDate: (y) => iso(y, 10, 1),
  span: 20,
  gap: 3,
  members: member("CECAFA"),
})

export const wafuCup = regional({
  id: "wafu",
  short: "WAFU Cup",
  confed: "CAF",
  name: (y) => `WAFU Zone Cup ${y}`,
  editions: everyNYears(2029, 2),
  teams: 12,
  groups: 4,
  perGroup: 1,
  bestThirds: 0,
  thirdPlace: true,
  start: (y) => iso(y, 6, 24),
  drawDate: (y) => iso(y, 5, 1),
  span: 16,
  gap: 3,
  members: (t, ctx) => member("WAFU-A")(t, ctx) || member("WAFU-B")(t, ctx),
})

export const balticCup = regional({
  id: "baltic",
  short: "Baltic Cup",
  confed: "UEFA",
  name: (y) => `Baltic Cup ${y}`,
  editions: everyNYears(2028, 2),
  teams: 3,
  groups: 1,
  perGroup: 1,
  bestThirds: 0,
  thirdPlace: false,
  noKnockout: true,
  start: (y) => iso(y, 6, 16),
  drawDate: (y) => iso(y, 4, 1),
  span: 8,
  gap: 3,
  members: (t) => t === "EST" || t === "LVA" || t === "LTU",
})

export const REGIONAL_DEFS: CompetitionDef[] = [
  arabCup,
  gulfCup,
  aseanChampionship,
  eafE1,
  cafaNationsCup,
  waffChampionship,
  saffChampionship,
  cosafaCup,
  cecafaCup,
  wafuCup,
  balticCup,
]
