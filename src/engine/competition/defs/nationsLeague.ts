/**
 * The UEFA Nations League, in the two shapes it takes from the start date:
 *
 * 2026–27, four leagues (16, 16, 16, 6) — the last edition before the change to three
 * leagues of 18, so promotion and relegation are rebalanced to fill them:
 *  - League phase (September–November): groups of four (League D: three), home and away.
 *  - March: League A's group winners and runners-up play two-legged quarter-finals;
 *    alongside, promotion/relegation play-offs, the lower-league team at home first:
 *    League A's two best fourth-placed and two worst third-placed against League B's
 *    runners-up, League B's fourth-placed against League C's runners-up.
 *  - June: Finals — semi-finals, third place and final.
 *  - Direct movement: League A's two worst fourth-placed go down; League B's and C's
 *    group winners go up; every League D team goes up; nobody leaves C.
 *
 * From 2028–29, three leagues of 18 (UEFA, 20 May 2026): three groups of six per
 * league, six matches each — home and away against the other team from its own pot,
 * once against each team from the other two pots. UEFA has confirmed quarter-finals,
 * Finals and promotion/relegation play-offs "with no change" without publishing the
 * details for three groups, so they are modelled as:
 *  - Quarter-finals: League A's three winners, three runners-up and two best thirds,
 *    ranked on their results, 1 v 8 … 4 v 5 (the better ranked at home second).
 *  - Group winners go up and sixth-placed teams go down; runners-up of the lower
 *    league meet fifth-placed teams of the upper one in the play-offs.
 */
import type { Confed, ISODate } from "@/engine/types"
import { deriveSeed, makeRng } from "@/engine/rng"
import { drawGroups, fitRounds, seedBracket, sixMatchRounds } from "../draw"
import type { CompContext, CompetitionDef, StagePlan } from "../runtime"
import { knockoutResult, standingsOf } from "../runtime"
import type { CompetitionInstance, Standing } from "../types"

export interface Tier {
  letter: string
  size: number
  groups: number
}

export interface NationsLeagueOptions {
  id: string
  short: string
  confed: Confed
  name(year: number): string
  editions(from: number, to: number): number[]
  /**
   * League letters and their sizes, top first, for a confederation of `members`
   * nations; the last takes everyone left.
   */
  tiers(year: number, members: number): Tier[]
  leagueDates(year: number): ISODate[]
  leagueDrawDate(year: number): ISODate
  /** March: quarter-final legs (and play-offs). */
  springDates(year: number): [ISODate, ISODate]
  springDrawDate(year: number): ISODate
  finalsDates(year: number): { semi: ISODate; final: ISODate }
  finalsDrawDate(year: number): ISODate
  /** A real draw for an edition already under way. */
  fixed?(year: number): Record<string, string[][]> | undefined
}

export const letterOf = (groupName: string) => groupName.replace(/\d+$/, "")

/** Groups of this many teams play their league phase in the six match days there are. */
const GROUP_SIZES = [6, 4, 3]
/** A full league: three groups of six. */
const LEAGUE_SIZE = 18

/**
 * Leagues for `members` nations whose groups all fit the league phase's six match
 * days (a group of six plays the six-match pattern, a group of three or four a double
 * round robin) and whose groups never differ by more than a team within a league:
 * full leagues of three groups of six, then — for the nations left over — one or two
 * smaller leagues of groups of six, four or three. It is exactly three leagues of 18
 * for the 54 nations the format was made for.
 */
export function leagueShape(members: number): Tier[] {
  let full = Math.floor(members / LEAGUE_SIZE)
  let rest = members - full * LEAGUE_SIZE
  // 1, 2 or 5 nations cannot make groups of three or four: borrow a full league.
  if ([1, 2, 5].includes(rest) && full > 0) {
    full--
    rest += LEAGUE_SIZE
  }
  const small: { size: number; groups: number }[] = []
  if (rest > 0) {
    const one = GROUP_SIZES.find((s) => rest % s === 0)
    if (one) small.push({ size: one, groups: rest / one })
    else {
      // Two leagues, the larger groups first: as many of them as leave a whole number
      // of the smaller.
      search: for (const [a, b] of [
        [6, 4],
        [6, 3],
        [4, 3],
      ]) {
        for (let n = Math.floor(rest / a); n >= 1; n--) {
          const left = rest - n * a
          if (left > 0 && left % b === 0) {
            small.push({ size: a, groups: n }, { size: b, groups: left / b })
            break search
          }
        }
      }
      // A confederation too small for any of this plays in one league of one group.
      if (!small.length) small.push({ size: rest, groups: 1 })
    }
  }
  const leagues = [...Array.from({ length: full }, () => ({ size: 6, groups: 3 })), ...small]
  return leagues.map((l, i) => ({
    letter: String.fromCharCode(65 + i),
    size: l.size * l.groups,
    groups: l.groups,
  }))
}

/** The leagues of an edition, for the number of nations the confederation has now. */
function tiersOf(o: NationsLeagueOptions, year: number, ctx: CompContext): Tier[] {
  return o.tiers(year, ctx.ranked((t) => ctx.confedOf(t) === o.confed).length)
}

/** The 2026–27 edition: four leagues, rebalanced to three leagues of 18. */
export const isTransitionEdition = (year: number) => year === 2026

function prevYear(o: NationsLeagueOptions, year: number): number {
  const list = o.editions(year - 8, year - 1)
  return list.length ? list[list.length - 1] : year
}

function tierComposition(o: NationsLeagueOptions, inst: CompetitionInstance, ctx: CompContext) {
  const tiers = tiersOf(o, inst.year, ctx)
  const members = ctx.ranked((t) => ctx.confedOf(t) === o.confed)
  const previous = ctx.instance(`${o.id}-${prevYear(o, inst.year)}`)
  const out: Record<string, string[]> = {}
  if (previous?.outcome.tiers) {
    // Last edition's leagues in league order (a league that no longer exists folds
    // into the bottom one), cut to this edition's sizes.
    const letters = Object.keys(previous.outcome.tiers).sort()
    const order = [
      ...new Set([
        ...letters.flatMap((l) => previous.outcome.tiers![l].filter((x) => members.includes(x))),
        ...members,
      ]),
    ]
    let cursor = 0
    tiers.forEach((t, i) => {
      const size = i === tiers.length - 1 ? order.length - cursor : t.size
      out[t.letter] = order.slice(cursor, cursor + size)
      cursor += size
    })
    return out
  }
  let cursor = 0
  tiers.forEach((t, i) => {
    const size = i === tiers.length - 1 ? members.length - cursor : t.size
    out[t.letter] = members.slice(cursor, cursor + size)
    cursor += size
  })
  return out
}

function groupsFor(o: NationsLeagueOptions, inst: CompetitionInstance, ctx: CompContext) {
  const fixed = o.fixed?.(inst.year)
  const names: string[] = []
  const groups: string[][] = []
  const tiers = fixed ? null : tierComposition(o, inst, ctx)
  for (const t of tiersOf(o, inst.year, ctx)) {
    const list = fixed
      ? (fixed[t.letter] ?? [])
      : drawGroups(
          [...tiers![t.letter]].sort((a, b) => ctx.points(b) - ctx.points(a)),
          t.groups,
          makeRng(deriveSeed(ctx.seed, "nl", inst.id, t.letter))
        )
    list.forEach((g, i) => {
      names.push(`${t.letter}${i + 1}`)
      groups.push(g)
    })
  }
  return { names, groups }
}

/** League tables grouped by league letter. */
function tablesByLetter(inst: CompetitionInstance, ctx: CompContext): Record<string, Standing[][]> {
  const stage = inst.stages.find((s) => s.key === "league")
  const tables = standingsOf(inst, "league", ctx, "h2h")
  const out: Record<string, Standing[][]> = {}
  stage?.groups?.forEach((g, gi) => (out[letterOf(g.name)] ??= []).push(tables[gi]))
  return out
}

const best = (a: Standing, b: Standing) => {
  const pa = a.p ? a.pts / a.p : 0
  const pb = b.p ? b.pts / b.p : 0
  return pb - pa || b.gd - a.gd || b.gf - a.gf
}
const at = (tables: Standing[][] | undefined, pos: number) =>
  (tables ?? [])
    .map((t) => t[pos])
    .filter((r): r is Standing => !!r)
    .sort(best)
const teams = (rows: Standing[]) => rows.map((r) => r.team)

/**
 * Who goes where after the league phase: straight up, straight down, and the
 * play-off pairs, each [lower-league team, upper-league team].
 */
export function movements(inst: CompetitionInstance, ctx: CompContext, letters: string[]) {
  const t = tablesByLetter(inst, ctx)
  const up: string[] = []
  const down: string[] = []
  const pairs: [string, string][] = []
  // The best upper team meets the weakest lower team.
  const pair = (upper: string[], lower: string[]) => {
    const low = [...lower].reverse()
    upper.forEach((u, i) => low[i] && pairs.push([low[i], u]))
  }
  if (isTransitionEdition(inst.year)) {
    const [A, B, C, D] = letters
    const fourthsA = teams(at(t[A], 3))
    const thirdsA = teams(at(t[A], 2))
    down.push(...fourthsA.slice(2))
    pair([...thirdsA.slice(2), ...fourthsA.slice(0, 2)], teams(at(t[B], 1)))
    up.push(...teams(at(t[B], 0)))
    pair(teams(at(t[B], 3)), teams(at(t[C], 1)))
    up.push(...teams(at(t[C], 0)))
    if (D) for (const g of t[D] ?? []) up.push(...teams(g))
    return { up, down, pairs }
  }
  letters.forEach((l, i) => {
    const lower = letters[i + 1]
    if (i > 0) up.push(...teams(at(t[l], 0)))
    if (!lower) return
    const size = Math.max(0, ...(t[l] ?? []).map((g) => g.length))
    down.push(...teams(at(t[l], size - 1)))
    pair(teams(at(t[l], size - 2)), teams(at(t[lower], 1)))
  })
  return { up, down, pairs }
}

/** Quarter-finalists as two-legged ties, [home first, home second]. */
function quarterFinalists(inst: CompetitionInstance, ctx: CompContext, top: string): string[] {
  const t = tablesByLetter(inst, ctx)[top] ?? []
  const out: string[] = []
  if (t.length === 4) {
    // Four groups: group 1's winner meets group 2's runner-up, and so on round the
    // groups; runners-up at home first.
    t.forEach((g, gi) => {
      const w = g[0]?.team
      const r = t[(gi + 1) % t.length]?.[1]?.team
      if (w && r) out.push(r, w)
    })
    return out
  }
  const seeds = [...teams(at(t, 0)), ...teams(at(t, 1)), ...teams(at(t, 2)).slice(0, 2)]
  if (seeds.length < 8) return []
  const groupOf = new Map<string, number>()
  t.forEach((g, gi) => g.forEach((r) => groupOf.set(r.team, gi)))
  const rank = (x: string) => seeds.indexOf(x)
  for (const [a, b] of seedBracket(seeds, (a, b) => groupOf.get(a) === groupOf.get(b))) {
    const [high, low] = rank(a) < rank(b) ? [a, b] : [b, a]
    out.push(low, high)
  }
  return out
}

export function nationsLeagueDef(o: NationsLeagueOptions): CompetitionDef {
  return {
    id: o.id,
    short: o.short,
    confed: o.confed,
    kind: "nations-league",
    name: o.name,
    editions: o.editions,
    plan(inst, ctx) {
      const { semi, final } = o.finalsDates(inst.year)
      const spring = o.springDates(inst.year)
      const tiers = tiersOf(o, inst.year, ctx)
      const top = tiers[0].letter
      const letters = tiers.map((x) => x.letter)
      const plans: StagePlan[] = [
        {
          key: "league",
          name: "League phase",
          drawDate: o.leagueDrawDate(inst.year),
          importance: "nations-league",
          entrants: () => [],
          groups: {
            count: 0,
            legs: 2,
            dates: o.leagueDates(inst.year),
            // Resolved when the stage is drawn; stable once the previous edition is over.
            get fixed() {
              return groupsFor(o, inst, ctx).groups
            },
            get names() {
              return groupsFor(o, inst, ctx).names
            },
            // Groups of six play the six-match pattern; the rest a double round robin.
            schedule: (list) => ({
              rounds: sixMatchRounds(list) ?? fitRounds(list, 2, o.leagueDates(inst.year).length),
              dates: o.leagueDates(inst.year),
            }),
            venue: "home-away",
            tiebreak: "h2h",
          },
        },
        {
          key: "quarter-finals",
          name: "Quarter-finals",
          after: "league",
          drawDate: o.springDrawDate(inst.year),
          importance: "nations-league",
          entrants: (c, i) => quarterFinalists(i, c, top),
          knockout: {
            rounds: [{ name: "Quarter-finals", dates: spring }],
            pairing: "ordered",
            venue: "home-away",
          },
        },
        {
          key: "playoffs",
          name: "Promotion/relegation play-offs",
          after: "league",
          drawDate: o.springDrawDate(inst.year),
          importance: "nations-league",
          entrants: (c, i) => movements(i, c, letters).pairs.flat(),
          knockout: {
            rounds: [{ name: "Play-offs", dates: spring }],
            pairing: "ordered",
            venue: "home-away",
          },
        },
      ]
      plans.push({
        key: "finals",
        name: "Finals",
        after: "quarter-finals",
        drawDate: o.finalsDrawDate(inst.year),
        importance: "nations-league-finals",
        entrants: (_c, i) => knockoutResult(i, "quarter-finals").finalWinners,
        knockout: {
          rounds: [
            { name: "Semi-finals", dates: [semi] },
            { name: "Final", dates: [final] },
          ],
          pairing: "ordered",
          thirdPlace: final,
          venue: "neutral",
        },
      })
      return plans
    },
    // The four of the Finals play the semi-final, then the third-place match or the
    // final: no friendly is arranged for them in the gap between.
    reserved(inst, _ctx, date) {
      const { semi, final } = o.finalsDates(inst.year)
      if (date <= semi || date >= final) return []
      const finals = inst.stages.find((s) => s.key === "finals")
      const drawn = finals?.rounds?.[0]?.ties.flatMap((t) => [t.home, t.away])
      const teams = drawn?.length ? drawn : knockoutResult(inst, "quarter-finals").finalWinners
      return teams.filter((t): t is string => !!t)
    },
    finalize(inst, ctx) {
      const ko = knockoutResult(inst, "finals")
      const t = tablesByLetter(inst, ctx)
      const letters = tiersOf(o, inst.year, ctx).map((x) => x.letter)
      const tiers: Record<string, string[]> = {}
      for (const l of letters) tiers[l] = (t[l] ?? []).flatMap((tb) => tb.map((r) => r.team))
      const leagueOf = (team: string) => letters.find((l) => tiers[l].includes(team))
      const move = (team: string, to: string) => {
        const from = leagueOf(team)
        if (!from || !tiers[to]) return
        tiers[from] = tiers[from].filter((x) => x !== team)
        if (!tiers[to].includes(team)) tiers[to].push(team)
      }
      const step = (team: string, by: number) => {
        const i = letters.indexOf(leagueOf(team) ?? "")
        if (i >= 0 && letters[i + by]) move(team, letters[i + by])
      }
      const m = movements(inst, ctx, letters)
      for (const team of m.down) step(team, 1)
      for (const team of m.up) step(team, -1)
      // A lower-league team that wins its play-off swaps with the upper-league loser.
      const stage = inst.stages.find((s) => s.key === "playoffs")
      for (const tie of stage?.rounds?.[0]?.ties ?? []) {
        if (!tie.home || !tie.away || tie.winner !== tie.home) continue
        const lower = leagueOf(tie.home)
        const upper = leagueOf(tie.away)
        if (lower && upper && lower > upper) {
          move(tie.home, upper)
          move(tie.away, lower)
        }
      }
      // A league emptied by the change of format (League D) is not carried over.
      for (const l of letters) if (!tiers[l].length) delete tiers[l]
      return { winner: ko.winner, runnerUp: ko.runnerUp, third: ko.third, tiers }
    },
  }
}

/**
 * The Nations League overall ranking, as UEFA uses it for play-off places: league by
 * league (A first), within a league by group position, then by record.
 */
export function leagueRanking(
  inst: CompetitionInstance,
  ctx: CompContext
): { team: string; letter: string; pos: number }[] {
  const byLetter = tablesByLetter(inst, ctx)
  const out: { team: string; letter: string; pos: number }[] = []
  for (const letter of Object.keys(byLetter).sort()) {
    const tables = byLetter[letter]
    const depth = Math.max(...tables.map((t) => t.length))
    for (let pos = 0; pos < depth; pos++) {
      for (const r of at(tables, pos)) out.push({ team: r.team, letter, pos })
    }
  }
  return out
}
