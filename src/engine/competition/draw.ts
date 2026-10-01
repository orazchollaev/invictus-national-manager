import { shuffle, type Rng } from "../rng"

/**
 * Round-robin rounds by the circle method. With an odd count one team rests each
 * round — never the first team in the first round, so a host always opens. Venues
 * follow the position a team holds in the circle, so each team alternates home and
 * away as the circle turns (a run of three in a row happens at most once, at the
 * turn). `legs` 2 repeats the rounds with home and away swapped, the second leg
 * starting at whichever round keeps runs shortest across the join.
 */
export function roundRobin(teams: string[], legs: 1 | 2): [string, string][][] {
  const list = teams.slice()
  if (list.length % 2) list.splice(1, 0, "")
  const n = list.length
  const build = (flip: boolean) => {
    const out: [string, string][][] = []
    const arr = list.slice()
    for (let r = 0; r < n - 1; r++) {
      const pairs: [string, string][] = []
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i]
        const b = arr[n - 1 - i]
        if (!a || !b) continue
        // The fixed team alternates by round; the rest by their place in the circle.
        const aHome = i === 0 ? r % 2 === 0 : (i % 2 === 0) !== flip
        pairs.push(aHome ? [a, b] : [b, a])
      }
      out.push(pairs)
      arr.splice(1, 0, arr.pop()!)
    }
    return out
  }
  const [plain, flipped] = [build(false), build(true)]
  const rounds = runScore(flipped, list) < runScore(plain, list) ? flipped : plain
  if (legs === 1) return rounds
  const mirror = rounds.map((pairs) => pairs.map(([h, a]) => [a, h] as [string, string]))
  // Any order of the second leg is a valid schedule: take the one with the fewest
  // long runs of home or away matches where the legs meet.
  let best = mirror
  let bestScore = Infinity
  for (let shift = 0; shift < mirror.length; shift++) {
    const second = [...mirror.slice(shift), ...mirror.slice(0, shift)]
    const score = runScore([...rounds, ...second], list)
    if (score < bestScore) {
      bestScore = score
      best = second
    }
  }
  return [...rounds, ...best]
}

/** How badly a schedule strings home or away matches together: runs of 3+ cost most. */
export function runScore(rounds: [string, string][][], teams: string[]): number {
  let score = 0
  for (const t of teams) {
    if (!t) continue
    let prev = ""
    let run = 0
    for (const round of rounds)
      for (const [h, a] of round) {
        if (h !== t && a !== t) continue
        const venue = h === t ? "H" : "A"
        run = venue === prev ? run + 1 : 1
        prev = venue
        if (run >= 3) score += 10 ** (run - 2)
      }
  }
  return score
}

/**
 * UEFA's six-match groups from 2028 (Nations League and European Qualifiers): a
 * group of three pots, listed pot by pot, each team playing two opponents from every
 * pot — its own included — once at home and once away. Pots of two (groups of six)
 * make the same-pot pair a home-and-away tie; pots of four (groups of twelve) are a
 * Swiss-style league phase. Six rounds, one match per team each round.
 *
 * Returns null when the group cannot be split into three equal pots of two or four.
 */
export function sixMatchRounds(teams: string[]): [string, string][][] | null {
  const k = teams.length / 3
  if (k !== 2 && k !== 4) return null
  const pot = (p: number) => teams.slice(p * k, (p + 1) * k)
  // Own pot: two matchings, each team once at home and once away over the pair.
  const own = (p: number, second: boolean): [string, string][] => {
    const t = pot(p)
    if (k === 2) return [second ? [t[1], t[0]] : [t[0], t[1]]]
    return second
      ? [
          [t[1], t[2]],
          [t[3], t[0]],
        ]
      : [
          [t[0], t[1]],
          [t[2], t[3]],
        ]
  }
  // Two pots: P_i hosts Q_i, then Q_(i+1) hosts P_i.
  const cross = (p: number, q: number, second: boolean): [string, string][] => {
    const a = pot(p)
    const b = pot(q)
    return a.map((t, i) => (second ? [b[(i + 1) % k], t] : [t, b[i]]))
  }
  const rounds: [string, string][][] = []
  for (const second of [false, true]) {
    rounds.push([...cross(0, 1, second), ...own(2, second)])
    rounds.push([...cross(0, 2, second), ...own(1, second)])
    rounds.push([...cross(1, 2, second), ...own(0, second)])
  }
  return rounds
}

/**
 * Split ranked teams into pots and draw them into `count` groups: one team from each
 * pot per group, keeping teams from the same `family` (confederation) apart where the
 * `maxPerFamily` rule allows. `fixed` places teams (hosts) as the first of a group.
 *
 * A few places still to be decided (`open`: play-off winners) are given their groups
 * first and held there, so the teams drawn after them keep clear of every
 * confederation they could turn out to be. A draw that leaves a team nowhere legal is thrown away and made
 * again; only when none of many draws works is the rule bent.
 */
export function drawGroups(
  ranked: string[],
  count: number,
  rng: Rng,
  opts: {
    family?: (team: string) => string
    /**
     * Every family a team may belong to: a place still to be decided (a play-off
     * winner) counts against each confederation it could turn out to be.
     */
    families?: (team: string) => string[]
    /** Places not yet known, drawn into the last pot whatever their ranking. */
    open?: (team: string) => boolean
    maxPerFamily?: (family: string) => number
    fixed?: string[]
  } = {}
): string[][] {
  const fixed = (opts.fixed ?? []).slice(0, count)
  const isOpen = opts.open ?? (() => false)
  const unplaced = ranked.filter((t) => !fixed.includes(t))
  // Few enough open places to have a group each: set them aside. Many (a finals drawn
  // before most play-offs) simply fill the last pots, as the ranking puts them.
  const setAside = unplaced.filter(isOpen).length <= count
  const open = setAside ? unplaced.filter(isOpen) : []
  const rest = setAside ? unplaced.filter((t) => !isOpen(t)) : unplaced
  const family = opts.families ?? (opts.family ? (t: string) => [opts.family!(t)] : undefined)
  const max = opts.maxPerFamily ?? (() => 1)

  const attempt = (strict: boolean): string[][] | null => {
    const groups: string[][] = Array.from({ length: count }, () => [])
    // What each group holds or has set aside, for the family rule.
    const held: string[][] = groups.map(() => [])
    const fits = (g: number, t: string) =>
      !family ||
      family(t).every((f) => held[g].filter((x) => family(x).includes(f)).length < max(f))
    fixed.forEach((t, i) => {
      groups[i].push(t)
      held[i].push(t)
    })

    // Open places first, each in a group of its own, away from what it could clash with.
    const reserved = new Set<number>()
    const reservedBy = new Map<string, number>()
    for (const t of open) {
      const free = groups.map((_, i) => i).filter((i) => !reserved.has(i))
      const ok = free.filter((i) => fits(i, t))
      if (!ok.length && strict) return null
      const pool = ok.length ? ok : free.length ? free : groups.map((_, i) => i)
      const g = pool[Math.floor(rng() * pool.length)]
      reserved.add(g)
      reservedBy.set(t, g)
      held[g].push(t)
    }

    let cursor = 0
    for (let level = 0; cursor < rest.length; level++) {
      const size = level === 0 ? count - fixed.length : count
      const lastLevel = cursor + size >= rest.length
      const pot = shuffle(rng, rest.slice(cursor, cursor + size))
      cursor += size
      let free = groups
        .map((_, i) => i)
        .filter((i) => groups[i].length === level && !(lastLevel && reserved.has(i)))
      const order = strict
        ? [...pot].sort(
            (x, y) => free.filter((i) => fits(i, x)).length - free.filter((i) => fits(i, y)).length
          )
        : pot
      for (const team of order) {
        if (!free.length) free = groups.map((_, i) => i)
        const ok = free.filter((i) => fits(i, team))
        if (!ok.length && strict) return null
        const pool = ok.length ? ok : free
        const choice = pool[Math.floor(rng() * pool.length)]
        groups[choice].push(team)
        held[choice].push(team)
        free = free.filter((i) => i !== choice)
      }
    }
    for (const [t, g] of reservedBy) groups[g].push(t)
    return groups
  }

  for (let tries = 0; tries < 300; tries++) {
    const groups = attempt(true)
    if (groups) return groups
  }
  return attempt(false)!
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
