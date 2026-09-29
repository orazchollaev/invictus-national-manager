import type { ReviewVerdict } from "@/engine/world/types"

const LABELS: Record<ReviewVerdict, string> = {
  delighted: "Delighted",
  satisfied: "Satisfied",
  disappointed: "Disappointed",
  ultimatum: "Final warning",
  sacked: "Dismissed",
}

export function verdictLabel(v: ReviewVerdict): string {
  return LABELS[v]
}

/** The verdict's colour, as a token. */
export function verdictTone(v: ReviewVerdict): string {
  if (v === "delighted") return "var(--gold)"
  if (v === "satisfied") return "var(--success)"
  if (v === "disappointed") return "var(--warning)"
  return "var(--danger)"
}
