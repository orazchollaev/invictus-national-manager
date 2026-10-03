/**
 * The fans' support, 0–100: a second meter beside the board's confidence, with its
 * own temper. The board judges results against expectation and remembers for long;
 * the fans want wins — big ones, at home, against the old enemy above all — get
 * carried away by trophies and forget quickly either way.
 *
 * It matters, though less than the board: a full stadium behind the team lifts it
 * at home, and a month of fans on the manager's side (or against him) nudges the
 * board's patience.
 */
import type { Fixture, Importance } from "../competition/types"
import { clamp } from "../rng"
import { msg, nationText } from "../text"
import type { World } from "../world/world"
import { rivalry } from "../world/rivals"

export const SUPPORT_TUNING = {
  /** Support on taking a job. */
  start: 55,
  /** Each month the fans' mood moves this far towards `settle`. */
  settle: 50,
  driftPerMonth: 3,
  /** A result, before weighting. */
  win: 3,
  draw: -0.5,
  loss: -4,
  /** A level match settled on penalties: ±1 on top of the draw. */
  shootout: 1,
  /** Beating the odds counts, but less than for the board. */
  surprise: 3,
  /** Each goal of margin past the first: up to `marginCap` either way. */
  marginPerGoal: 0.75,
  marginCap: 3,
  /** Three or more goals scored: the fans enjoyed it. A goalless draw: they did not. */
  entertaining: 1,
  goalless: -0.5,
  /** At home the fans see it with their own eyes. */
  home: 1.25,
  /** A derby, by intensity (none, rivalry, great derby). */
  derby: [1, 2, 2.5],
  /** End of a competition: a trophy, a final lost, qualifying won or missed. */
  trophy: 15,
  final: 6,
  qualified: 8,
  missedOut: -6,
  /** Each youngster (21 or under) handed a first cap. */
  debut: 0.5,
  /** Fans' mood felt by the board each month: (support − 50) / `boardPull`, up to ±`boardPullMax`. */
  boardPull: 25,
  boardPullMax: 2,
  /** Ability points the home crowd adds at full support (taken away at none). */
  crowd: 0.6,
  /** News when support falls below `low` or climbs above `high`. */
  low: 25,
  high: 80,
} as const

const T = SUPPORT_TUNING

/** How much a match matters to the fans, by its weight. */
const WEIGHT: Record<Importance, number> = {
  friendly: 0.5,
  "nations-league": 1,
  qualifier: 1,
  regional: 1,
  continental: 1.4,
  "nations-league-finals": 1.4,
  "world-cup": 1.6,
  "continental-ko": 1.8,
  "world-cup-ko": 2,
}

/** The fans' support, with the default for saves from before it existed. */
export function supportOf(world: World): number {
  return world.state.career.support ?? T.start
}

/** Move the fans' support; news when it crosses into anger or adoration. */
export function nudgeSupport(world: World, delta: number) {
  const c = world.state.career
  const me = c.nationId
  if (!me || !delta) return
  const before = supportOf(world)
  const after = Math.round(clamp(before + delta, 0, 100) * 10) / 10
  c.support = after
  const nation = nationText(me)
  if (before >= T.low && after < T.low)
    world.news("fans", msg("news.fans.angry.title"), msg("news.fans.angry.body", { nation }), true)
  else if (before <= T.high && after > T.high)
    world.news("fans", msg("news.fans.adore.title"), msg("news.fans.adore.body", { nation }), true)
}

/**
 * How the fans take one of the user's results. `actual` and `expected` are the
 * board's view (1 a win, 0.5 a draw, 0 a defeat, against the ranking's odds).
 */
export function supportForResult(
  f: Fixture,
  me: string,
  gf: number,
  ga: number,
  actual: number,
  expected: number
): number {
  const opp = f.home === me ? f.away : f.home
  let v = gf > ga ? T.win : gf < ga ? T.loss : T.draw
  if (f.result?.pens)
    v += f.result.w === (f.home === me ? "home" : "away") ? T.shootout : -T.shootout
  v += (actual - expected) * T.surprise
  const margin = Math.abs(gf - ga)
  if (margin > 1) v += Math.sign(gf - ga) * Math.min(T.marginCap, (margin - 1) * T.marginPerGoal)
  if (gf >= 3) v += T.entertaining
  if (gf === 0 && ga === 0) v += T.goalless
  v *= WEIGHT[f.importance] ?? 1
  if (f.home === me && f.atHome) v *= T.home
  v *= T.derby[rivalry(me, opp)]
  return Math.round(v * 10) / 10
}

/** Month start: the fans' mood fades towards the middle, and the board feels it. */
export function monthlySupport(world: World): number {
  const c = world.state.career
  if (!c.nationId) return 0
  const s = supportOf(world)
  const pull = clamp((s - T.settle) / T.boardPull, -T.boardPullMax, T.boardPullMax)
  const step = Math.min(T.driftPerMonth, Math.abs(T.settle - s))
  if (step) c.support = Math.round((s < T.settle ? s + step : s - step) * 10) / 10
  return Math.round(pull * 10) / 10
}

/** Ability points the home crowd is worth: up to `crowd` either way. */
export function crowdBoost(support: number): number {
  return Math.round(((support - 50) / 50) * T.crowd * 100) / 100
}
