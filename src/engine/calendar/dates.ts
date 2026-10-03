import type { ISODate } from "../types"

export function toDate(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

export function fromDate(d: Date): ISODate {
  return d.toISOString().slice(0, 10)
}

/** The digits of `d` from `at`, `len` long, as a number (no strings or arrays made). */
function digits(d: ISODate, at: number, len: number): number {
  let n = 0
  for (let i = at; i < at + len; i++) n = n * 10 + d.charCodeAt(i) - 48
  return n
}

/**
 * Days since 1970-01-01, by plain integer arithmetic (H. Hinnant's days_from_civil):
 * the day loop calls this thousands of times a day, where building a `Date` each
 * time cost more than the matches.
 */
export function dayNumber(d: ISODate): number {
  const m = digits(d, 5, 2)
  const y = digits(d, 0, 4) - (m <= 2 ? 1 : 0)
  const era = Math.floor(y / 400)
  const yoe = y - era * 400
  const doy = Math.floor((153 * (m > 2 ? m - 3 : m + 9) + 2) / 5) + digits(d, 8, 2) - 1
  return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468
}

/** The date `n` days after 1970-01-01 (civil_from_days). */
export function fromDayNumber(n: number): ISODate {
  const z = n + 719468
  const era = Math.floor(z / 146097)
  const doe = z - era * 146097
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
  )
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
  const mp = Math.floor((5 * doy + 2) / 153)
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1
  const m = mp < 10 ? mp + 3 : mp - 9
  return iso(yoe + era * 400 + (m <= 2 ? 1 : 0), m, day)
}

export function addDays(d: ISODate, days: number): ISODate {
  return days === 0 ? d : fromDayNumber(dayNumber(d) + days)
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return dayNumber(b) - dayNumber(a)
}

export function yearOf(d: ISODate): number {
  return Number(d.slice(0, 4))
}

export function monthOf(d: ISODate): number {
  return Number(d.slice(5, 7))
}

export function iso(y: number, m: number, d: number): ISODate {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

/** The Monday on or after a date. */
export function mondayOnOrAfter(d: ISODate): ISODate {
  const x = toDate(d)
  const dow = (x.getUTCDay() + 6) % 7 // Monday = 0
  return addDays(d, dow === 0 ? 0 : 7 - dow)
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "24 Sep 2026" */
export function formatDate(d: ISODate): string {
  const [y, m, day] = d.split("-").map(Number)
  return `${day} ${MONTHS[m - 1]} ${y}`
}

/** "24 Sep" */
export function formatShort(d: ISODate): string {
  const [, m, day] = d.split("-").map(Number)
  return `${day} ${MONTHS[m - 1]}`
}

export function monthName(m: number): string {
  return MONTHS[m - 1]
}
