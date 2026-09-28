/**
 * FIFA international match windows. 2026–2030 are the published calendar
 * (Wikipedia, "FIFA International Match Calendar"); later years follow the same
 * shape: a two-match window in March and June, the combined four-match window
 * across late September and early October, and a two-match window in November.
 */
import type { ISODate } from "../types"
import { addDays, iso, mondayOnOrAfter } from "./dates"

export interface MatchWindow {
  id: string
  start: ISODate
  end: ISODate
  /** The days matches are played on. */
  slots: ISODate[]
}

const PUBLISHED: [ISODate, ISODate, number][] = [
  ["2026-09-21", "2026-10-06", 4],
  ["2026-11-09", "2026-11-17", 2],
  ["2027-03-22", "2027-03-30", 2],
  ["2027-06-07", "2027-06-15", 2],
  ["2027-09-20", "2027-10-05", 4],
  ["2027-11-08", "2027-11-16", 2],
  ["2028-03-20", "2028-03-28", 2],
  ["2028-05-29", "2028-06-06", 2],
  ["2028-09-18", "2028-10-03", 4],
  ["2028-11-13", "2028-11-21", 2],
  ["2029-03-19", "2029-03-27", 2],
  ["2029-06-04", "2029-06-12", 2],
  ["2029-09-24", "2029-10-09", 4],
  ["2029-11-12", "2029-11-20", 2],
  ["2030-03-18", "2030-03-26", 2],
  ["2030-06-03", "2030-06-11", 2],
  ["2030-09-23", "2030-10-08", 4],
  ["2030-11-11", "2030-11-19", 2],
]

const LAST_PUBLISHED_YEAR = 2030

function makeWindow(start: ISODate, end: ISODate, count: number): MatchWindow {
  const offsets = count === 4 ? [3, 6, 10, 13] : [3, 6]
  return { id: start, start, end, slots: offsets.map((o) => addDays(start, o)) }
}

const cache = new Map<number, MatchWindow[]>()

export function windowsForYear(year: number): MatchWindow[] {
  const hit = cache.get(year)
  if (hit) return hit
  let list: MatchWindow[]
  if (year <= LAST_PUBLISHED_YEAR) {
    list = PUBLISHED.filter(([s]) => s.startsWith(String(year))).map(([s, e, n]) =>
      makeWindow(s, e, n)
    )
  } else {
    const mar = mondayOnOrAfter(iso(year, 3, 17))
    const jun = mondayOnOrAfter(iso(year, 5, 31))
    const sep = mondayOnOrAfter(iso(year, 9, 17))
    const nov = mondayOnOrAfter(iso(year, 11, 8))
    list = [
      makeWindow(mar, addDays(mar, 8), 2),
      makeWindow(jun, addDays(jun, 8), 2),
      makeWindow(sep, addDays(sep, 15), 4),
      makeWindow(nov, addDays(nov, 8), 2),
    ]
  }
  cache.set(year, list)
  return list
}

export type WindowKey = "mar" | "jun" | "sep" | "nov"

/** The window of a year by its month key. */
export function window(year: number, key: WindowKey): MatchWindow {
  const month = { mar: "-03-", jun: "-0", sep: "-09-", nov: "-11-" }[key]
  const list = windowsForYear(year)
  const found =
    key === "jun"
      ? list.find((w) => w.start.slice(5, 7) === "05" || w.start.slice(5, 7) === "06")
      : list.find((w) => w.start.includes(month))
  if (!found) throw new Error(`No ${key} window in ${year}`)
  return found
}

/** Match days of several windows in order, e.g. slots(2027, ["mar", "jun", "sep", "nov"]). */
export function slots(year: number, keys: WindowKey[]): ISODate[] {
  return keys.flatMap((k) => window(year, k).slots)
}

/** The window a date falls in, if any. */
export function windowAt(date: ISODate): MatchWindow | undefined {
  const year = Number(date.slice(0, 4))
  return windowsForYear(year).find((w) => date >= w.start && date <= w.end)
}

/**
 * The window a date falls in, or — failing that — the window it was nudged out
 * of. A fixture congestion-shuffled off its slot (competition/runtime.ts
 * `freeDate`, up to 6 days) can land just past a window's `end`; without this,
 * it reads as belonging to no window at all rather than the one it was drawn
 * for, which throws off the squad key it's named under (world.ts `squadKey`).
 */
export function windowNear(date: ISODate): MatchWindow | undefined {
  const w = windowAt(date)
  if (w) return w
  for (let d = addDays(date, -1), i = 0; i < 7; i++, d = addDays(d, -1)) {
    const found = windowAt(d)
    if (found) return found
  }
  return undefined
}

/** The next window starting on or after a date. */
export function nextWindow(date: ISODate): MatchWindow {
  const year = Number(date.slice(0, 4))
  for (const y of [year, year + 1]) {
    const w = windowsForYear(y).find((x) => x.end >= date)
    if (w) return w
  }
  throw new Error(`No window after ${date}`)
}
