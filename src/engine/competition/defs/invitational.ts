/**
 * Invitational tournaments: four or eight nations playing a small tournament of
 * friendlies in one FIFA window, at one host's grounds. Never scheduled by the
 * calendar — a federation sets one up (engine/world/invitational.ts) and the
 * instance carries its teams and format. One definition per window of the year, so
 * an edition's id ("inv-mar-2027") still reads as definition and year.
 */
import type { ISODate } from "@/engine/types"
import { addDays, daysBetween } from "@/engine/calendar/dates"
import { windowsForYear, type MatchWindow, type WindowKey } from "@/engine/calendar/windows"
import type { CompContext, CompetitionDef, StagePlan } from "../runtime"
import { finishers, knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, CompetitionOutcome, InvitationalFormat } from "../types"
import { finalsOutcome } from "./helpers"

/** Days before the window the draw is made. */
export const INVITATIONAL_DRAW_DAYS = 14

const KEYS: WindowKey[] = ["mar", "jun", "sep", "nov"]
const NAMES: Record<WindowKey, string> = {
  mar: "March",
  jun: "June",
  sep: "September",
  nov: "November",
}

/** The window an id names ("2027-03-22"), if it is one. */
export function windowById(id: string): MatchWindow | undefined {
  return windowsForYear(Number(id.slice(0, 4))).find((w) => w.id === id)
}

/** Which of the year's windows this is. */
export function windowKey(w: MatchWindow): WindowKey {
  const m = w.start.slice(5, 7)
  return m === "03" ? "mar" : m === "05" || m === "06" ? "jun" : m === "09" ? "sep" : "nov"
}

/** The definition an invitational tournament in this window uses. */
export function invitationalDefId(w: MatchWindow): string {
  return `inv-${windowKey(w)}`
}

/** The formats a tournament of this size can be played in. */
export function formatsFor(size: number): InvitationalFormat[] {
  if (size === 4) return ["knockout", "league"]
  if (size === 8) return ["knockout", "groups"]
  return []
}

/** Match days a format needs: rounds of a bracket, of a league, or groups and a final. */
export function roundsOf(format: InvitationalFormat, size: number): number {
  if (format === "knockout") return Math.log2(size)
  if (format === "league") return size - 1
  return 4
}

/**
 * Match days for `rounds` rounds inside a window: never on its first or last day,
 * two or three days apart (a team never plays on consecutive days), centred.
 * Null when they do not fit.
 */
export function matchDays(w: MatchWindow, rounds: number): ISODate[] | null {
  const room = daysBetween(w.start, w.end) - 2
  const gap = rounds === 1 ? 0 : Math.min(3, Math.floor(room / (rounds - 1)))
  if (rounds > 1 && gap < 2) return null
  const first = 1 + Math.floor((room - gap * (rounds - 1)) / 2)
  return Array.from({ length: rounds }, (_, i) => addDays(w.start, first + i * gap))
}

/** Whether a format fits in a window for this many teams. */
export function fits(w: MatchWindow, format: InvitationalFormat, size: number): boolean {
  return formatsFor(size).includes(format) && !!matchDays(w, roundsOf(format, size))
}

function setupOf(inst: CompetitionInstance) {
  const setup = inst.invitational
  const w = setup && windowById(setup.window)
  if (!setup || !w) throw new Error(`${inst.id} has no invitational set-up`)
  const days = matchDays(w, roundsOf(setup.format, setup.teams.length))
  if (!days) throw new Error(`${inst.id} does not fit its window`)
  return { ...setup, days, drawDate: addDays(w.start, -INVITATIONAL_DRAW_DAYS) }
}

function plan(inst: CompetitionInstance): StagePlan[] {
  const { format, teams, days, drawDate } = setupOf(inst)
  const host = inst.hosts[0]
  if (format === "league")
    return [
      {
        key: "league",
        name: "League",
        drawDate,
        importance: "friendly",
        entrants: () => teams,
        groups: {
          count: 1,
          legs: 1,
          dates: days,
          venue: "neutral",
          tiebreak: "gd",
          names: ["League"],
        },
      },
    ]
  if (format === "groups") {
    const last = days[days.length - 1]
    const pair = (pos: number) => (ctx: CompContext, i: CompetitionInstance) =>
      standingsOf(i, "groups", ctx)
        .map((t) => t[pos]?.team)
        .filter((t): t is string => !!t)
    return [
      {
        key: "groups",
        name: "Group stage",
        drawDate,
        importance: "friendly",
        entrants: () => teams,
        groups: {
          count: 2,
          legs: 1,
          dates: days.slice(0, 3),
          seeded: host ? [host] : undefined,
          venue: "neutral",
          tiebreak: "gd",
        },
      },
      {
        key: "final",
        name: "Final",
        drawDate,
        after: "groups",
        importance: "friendly",
        entrants: pair(0),
        knockout: {
          rounds: [{ name: "Final", dates: [last] }],
          pairing: "ordered",
          venue: "neutral",
        },
      },
      {
        key: "third",
        name: "Third place",
        drawDate,
        after: "groups",
        importance: "friendly",
        entrants: pair(1),
        knockout: {
          rounds: [{ name: "Third place", dates: [last] }],
          pairing: "ordered",
          venue: "neutral",
        },
      },
    ]
  }
  const names =
    teams.length === 8 ? ["Quarter-finals", "Semi-finals", "Final"] : ["Semi-finals", "Final"]
  return [
    {
      key: "knockout",
      name: "Knockout stage",
      drawDate,
      importance: "friendly",
      entrants: () => teams,
      knockout: {
        rounds: names.map((name, i) => ({ name, dates: [days[i]] })),
        pairing: "draw",
        thirdPlace: days[days.length - 1],
        venue: "neutral",
      },
    },
  ]
}

function finalize(inst: CompetitionInstance, ctx: CompContext): CompetitionOutcome {
  const format = inst.invitational?.format
  if (format === "knockout") return finalsOutcome(inst, ctx, "none", "knockout")
  if (format === "league") {
    const placings = (standingsOf(inst, "league", ctx)[0] ?? []).map((r) => r.team)
    return { winner: placings[0], runnerUp: placings[1], third: placings[2], placings }
  }
  const final = knockoutResult(inst, "final")
  const third = knockoutResult(inst, "third")
  const placings: string[] = []
  const add = (t?: string) => t && !placings.includes(t) && placings.push(t)
  for (const t of [final.winner, final.runnerUp, third.winner, third.runnerUp]) add(t)
  const tables = standingsOf(inst, "groups", ctx)
  for (let pos = 0; pos < 4; pos++) for (const r of finishers(tables, pos)) add(r.team)
  return { winner: final.winner, runnerUp: final.runnerUp, third: third.winner, placings }
}

function invitationalDef(key: WindowKey): CompetitionDef {
  return {
    id: `inv-${key}`,
    short: "Invitational",
    confed: "FIFA",
    kind: "invitational",
    name: (year) => `${NAMES[key]} Invitational ${year}`,
    editions: () => [],
    plan,
    finalize,
    // Its teams are spoken for in its window: no friendlies are arranged for them.
    reserved: (inst, _ctx, date) => {
      const w = inst.invitational && windowById(inst.invitational.window)
      return w && date >= w.start && date <= w.end ? inst.invitational!.teams : []
    },
  }
}

export const INVITATIONAL_DEFS: CompetitionDef[] = KEYS.map(invitationalDef)
