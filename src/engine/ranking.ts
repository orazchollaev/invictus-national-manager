/**
 * The FIFA men's ranking "SUM" method (in use since 2018):
 *
 *   P = P_before + I × (W − W_e),  W_e = 1 / (10^(−dr/600) + 1)
 *
 * I is the match importance; W is 1 for a win, 0.5 for a draw, 0 for a loss, and
 * 0.75 / 0.5 for winning / losing on penalties. A side knocked out of a final
 * tournament's knockout stage does not lose points.
 */
import type { Importance } from "./competition/types"

export const IMPORTANCE_WEIGHT: Record<Importance, number> = {
  friendly: 10,
  regional: 10,
  "nations-league": 15,
  "nations-league-finals": 25,
  qualifier: 25,
  continental: 35,
  "continental-ko": 40,
  "world-cup": 50,
  "world-cup-ko": 60,
}

export function expectedResult(points: number, opponent: number): number {
  return 1 / (Math.pow(10, -(points - opponent) / 600) + 1)
}

export interface RankedResult {
  home: number
  away: number
  /** Winner on penalties, when a draw was settled by a shootout. */
  shootout?: "home" | "away"
}

/** New points for both sides after a match. */
export function rankingUpdate(
  home: number,
  away: number,
  result: RankedResult,
  importance: Importance,
  knockout: boolean
): [number, number] {
  const I = IMPORTANCE_WEIGHT[importance]
  let wh: number
  if (result.home > result.away) wh = 1
  else if (result.home < result.away) wh = 0
  else if (result.shootout) wh = result.shootout === "home" ? 0.75 : 0.5
  else wh = 0.5
  const wa = result.shootout ? (result.shootout === "away" ? 0.75 : 0.5) : 1 - wh
  const eh = expectedResult(home, away)
  let dh = I * (wh - eh)
  let da = I * (wa - (1 - eh))
  const finalsKnockout =
    knockout &&
    (importance === "continental-ko" ||
      importance === "world-cup-ko" ||
      importance === "nations-league-finals")
  if (finalsKnockout) {
    dh = Math.max(0, dh)
    da = Math.max(0, da)
  }
  return [Math.round((home + dh) * 100) / 100, Math.round((away + da) * 100) / 100]
}
