import { shuffle, type Rng } from "../rng"

/**
 * Round-robin rounds by the circle method. With an odd count one team rests each
 * round. `legs` 2 repeats the rounds with home and away swapped. Home and away
 * alternate for each team as evenly as the method allows.
 */
export function roundRobin(teams: string[], legs: 1 | 2): [string, string][][] {
  const list = teams.slice()
  if (list.length % 2) list.push("")
  const n = list.length
  const rounds: [string, string][][] = []
  const arr = list.slice()
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = []
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i]
      const b = arr[n - 1 - i]
      if (!a || !b) continue
      // Alternate the fixed team's venue and flip by round for the rest.
      pairs.push(i === 0 ? (r % 2 ? [b, a] : [a, b]) : (r + i) % 2 ? [b, a] : [a, b])
    }
    rounds.push(pairs)
    arr.splice(1, 0, arr.pop()!)
  }
  if (legs === 1) return rounds
  return [...rounds, ...rounds.map((pairs) => pairs.map(([h, a]) => [a, h] as [string, string]))]
}

/**
 * Split ranked teams into pots and draw them into `count` groups: one team from each
 * pot per group, keeping teams from the same `family` (confederation) apart where the
 * `maxPerFamily` rule allows. `fixed` places teams (hosts) as the first of a group.
 */
export function drawGroups(
  ranked: string[],
  count: number,
  rng: Rng,
  opts: {
    family?: (team: string) => string
    maxPerFamily?: (family: string) => number
    fixed?: string[]
  } = {}
): string[][] {
  const groups: string[][] = Array.from({ length: count }, () => [])
  const fixed = (opts.fixed ?? []).slice(0, count)
  fixed.forEach((t, i) => groups[i].push(t))
  const rest = ranked.filter((t) => !fixed.includes(t))
  const family = opts.family
  const max = opts.maxPerFamily ?? (() => 1)
  const fits = (g: string[], t: string) =>
    !family || g.filter((x) => family(x) === family(t)).length < max(family(t))

  let cursor = 0
  for (let level = 0; cursor < rest.length; level++) {
    const size = level === 0 ? count - fixed.length : count
    const pot = shuffle(rng, rest.slice(cursor, cursor + size))
    cursor += size
    let open = groups.map((_, i) => i).filter((i) => groups[i].length === level)
    for (const team of pot) {
      if (!open.length) open = groups.map((_, i) => i)
      const ok = open.filter((i) => fits(groups[i], team))
      const pool = ok.length ? ok : open
      const choice = pool[Math.floor(rng() * pool.length)]
      groups[choice].push(team)
      open = open.filter((i) => i !== choice)
    }
  }
  return groups
}

/** Standard bracket order for `n` seeds (power of two): 1 v n, and 1 and 2 kept apart. */
export function bracketOrder(n: number): number[] {
  let order = [0]
  while (order.length < n) {
    const size = order.length * 2
    order = order.flatMap((s) => [s, size - 1 - s])
  }
  return order
}

/**
 * Pair seeded teams into first-round ties in bracket order (best meets worst) and
 * separate teams that met in the same group where a neighbouring swap allows.
 */
export function seedBracket(
  seeds: string[],
  sameGroup: (a: string, b: string) => boolean
): [string, string][] {
  const order = bracketOrder(seeds.length)
  const slots = order.map((i) => seeds[i])
  const ties: [string, string][] = []
  for (let i = 0; i < slots.length; i += 2) ties.push([slots[i], slots[i + 1]])
  for (let i = 0; i < ties.length; i++) {
    if (!sameGroup(ties[i][0], ties[i][1])) continue
    for (let j = 0; j < ties.length; j++) {
      if (j === i) continue
      const [a, b] = ties[i]
      const [c, d] = ties[j]
      if (!sameGroup(a, d) && !sameGroup(c, b)) {
        ties[i] = [a, d]
        ties[j] = [c, b]
        break
      }
    }
  }
  return ties
}
