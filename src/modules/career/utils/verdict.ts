import type { ReviewVerdict } from "@/engine/world/types"

/** The i18n key of the verdict's label. */
export function verdictKey(v: ReviewVerdict): string {
  return `career.verdict.${v}`
}

/** The verdict's colour, as a token. */
export function verdictTone(v: ReviewVerdict): string {
  if (v === "delighted") return "var(--gold)"
  if (v === "satisfied") return "var(--success)"
  if (v === "disappointed") return "var(--warning)"
  return "var(--danger)"
}
