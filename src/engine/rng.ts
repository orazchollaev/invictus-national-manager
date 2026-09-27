/**
 * Every random draw in the game goes through a seeded stream, so a save replays the
 * same world from the same decisions. Streams are derived from the world seed plus a
 * key ("match:<id>", "season:2027:TUR"), which keeps one match's rolls from shifting
 * every roll after it.
 */

export type Rng = () => number

/** mulberry32: small, fast, good enough for a game. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a over the seed and keys: a stable 32-bit seed for a named stream. */
export function deriveSeed(seed: number, ...keys: (string | number)[]): number {
  let h = 2166136261 ^ (seed >>> 0)
  for (const key of keys) {
    const s = String(key)
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    h ^= 0x2f
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function streamFor(seed: number, ...keys: (string | number)[]): Rng {
  return makeRng(deriveSeed(seed, ...keys))
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32) >>> 0
}

export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function pickWeighted<T>(rng: Rng, items: readonly T[], weight: (item: T) => number): T {
  let total = 0
  for (const item of items) total += Math.max(0, weight(item))
  if (total <= 0) return items[Math.floor(rng() * items.length)]
  let roll = rng() * total
  for (const item of items) {
    roll -= Math.max(0, weight(item))
    if (roll < 0) return item
  }
  return items[items.length - 1]
}

/** Approximately normal: the mean of three uniforms, scaled to a standard deviation. */
export function gauss(rng: Rng, mean = 0, sd = 1): number {
  const u = (rng() + rng() + rng()) / 3 - 0.5
  return mean + u * sd * 6
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}
