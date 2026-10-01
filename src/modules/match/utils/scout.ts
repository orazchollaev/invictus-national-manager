import type { MatchupLine, ScoutReport } from "@/engine/match/scouting"
import type { Msg } from "@/engine/text"

export interface MatchupNote {
  /** Whose way of playing it is. */
  who: "you" | "them"
  label: Msg
}

/**
 * The matchups of a report from the manager's side: what works for him, whichever team
 * it is that benefits, and what works against him.
 */
export function matchupNotes(report: ScoutReport): { good: MatchupNote[]; bad: MatchupNote[] } {
  const note = (who: MatchupNote["who"]) => (l: MatchupLine) => ({ who, label: l.label })
  return {
    good: [
      ...report.yours.filter((l) => l.factor > 1).map(note("you")),
      ...report.theirs.filter((l) => l.factor < 1).map(note("them")),
    ],
    bad: [
      ...report.yours.filter((l) => l.factor < 1).map(note("you")),
      ...report.theirs.filter((l) => l.factor > 1).map(note("them")),
    ],
  }
}
