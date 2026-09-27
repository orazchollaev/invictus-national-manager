/**
 * How good a nation's players are. One curve, used both to build the starting pools
 * and to create every newgen after, so a pool keeps its shape for decades.
 *
 * `level` is the nation's strength 0–100 (its youth level in-game). The best player
 * of an 80-man generation sits at `nationTop(level)`; each rank below loses a third
 * of a point, so a strong nation has a handful of world-class players, not one.
 *
 * Rough targets (peak ability of rank 0 / rank 22 / rank 40):
 *   level 100 (Spain)   96 / 89 / 84
 *   level  83 (Brazil)  91 / 84 / 79
 *   level  60           84 / 77 / 72
 *   level  20 (small)   67 / 60 / 55
 *   level   5 (tiny)    56 / 49 / 44
 */
import { clamp } from "../rng"

export const GENERATION_SIZE = 80

export function nationTop(level: number): number {
  return 38 + 55.5 * Math.pow(clamp(level, 0, 100) / 100, 0.4)
}

/** Peak ability of the player ranked `rank` (0 = best) in a generation. */
export function peakAt(top: number, rank: number): number {
  return top - 0.5 * Math.pow(rank, 0.9)
}
