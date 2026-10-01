import type { ISODate } from "@/engine/types"
import { i18n } from "./index"

/** Dates are ISO strings; they are shown in the language being played, in UTC so no day shifts. */
function format(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(i18n.global.locale.value, { ...options, timeZone: "UTC" }).format(
    date
  )
}

const at = (d: ISODate) => {
  const [y, m, day] = d.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

/** "1 Sep 2026" */
export function formatDate(d: ISODate): string {
  return format(at(d), { day: "numeric", month: "short", year: "numeric" })
}

/** "1 Sep" */
export function formatShort(d: ISODate): string {
  return format(at(d), { day: "numeric", month: "short" })
}

/** "Sep", from a month number (1–12). */
export function monthName(m: number): string {
  return format(new Date(Date.UTC(2026, m - 1, 1)), { month: "short" })
}
