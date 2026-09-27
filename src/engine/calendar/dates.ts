import type { ISODate } from "../types"

export function toDate(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

export function fromDate(d: Date): ISODate {
  return d.toISOString().slice(0, 10)
}

export function addDays(d: ISODate, days: number): ISODate {
  const x = toDate(d)
  x.setUTCDate(x.getUTCDate() + days)
  return fromDate(x)
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000)
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
