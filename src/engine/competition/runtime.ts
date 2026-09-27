/**
 * Runs competitions: draws each stage on its draw date, builds the fixtures, and
 * moves knockout ties and stages along as results come in. What a competition looks
 * like — its stages, dates and who enters — lives in its definition (defs/).
 */
import type { Confed, ISODate } from "../types"
import { addDays } from "../calendar/dates"
import { makeRng, deriveSeed, shuffle } from "../rng"
import { drawGroups, roundRobin, seedBracket, bracketOrder } from "./draw"
import { groupStandings, type Tiebreak } from "./tables"
import type {
  CompetitionInstance,
  CompetitionKind,
  CompetitionOutcome,
  Fixture,
  Importance,
  StageState,
  Standing,
  Tie,
} from "./types"

export interface CompContext {
  date: ISODate
  seed: number
  confedOf(team: string): Confed
  subFeds(team: string): string[]
  points(team: string): number
  /** Nations allowed to enter competitions (not suspended), best ranked first. */
  ranked(filter?: (team: string) => boolean): string[]
  instance(id: string): CompetitionInstance | undefined
  fixture(id: string): Fixture | undefined
  addFixture(f: Fixture): void
  /** A team already plays within a day of this date. */
  busy(team: string, date: ISODate): boolean
  /** Federation reputation × stadiums: how good a candidate host a nation is. */
  stature(team: string): number
  /** A team has any fixture between these dates. */
  busyBetween(team: string, from: ISODate, to: ISODate): boolean
}

export interface GroupPlan {
  count: number
  legs: 1 | 2
  /** One date per round; later rounds reuse the spacing of the last two. */
  dates: ISODate[]
  /** A real draw, used instead of drawing. */
  fixed?: string[][]
  /** Teams placed first in the opening groups (hosts). */
  seeded?: string[]
  /** Keep confederations apart (World Cup): at most one per group, two for UEFA. */
  spreadConfeds?: boolean
  venue: "home-away" | "neutral"
  tiebreak: Tiebreak
  /** Group names; defaults to A, B, C… */
  names?: string[]
}

export interface KnockoutPlan {
  /** Each round's dates: one for a single match, two for home and away legs. */
  rounds: { name: string; dates: ISODate[] }[]
  /** bracket: seeds split by group; seeded: 1 v n; draw: random; ordered: as listed. */
  pairing: "bracket" | "seeded" | "draw" | "ordered"
  thirdPlace?: ISODate
  venue: "home-away" | "neutral"
}

export interface StagePlan {
  key: string
  name: string
  drawDate: ISODate
  /** Key of the stage this one waits for; defaults to the stage before it. */
  after?: string
  importance: Importance
  entrants(ctx: CompContext, inst: CompetitionInstance): string[]
  groups?: GroupPlan
  knockout?: KnockoutPlan
}

export interface CompetitionDef {
  id: string
  short: string
  confed: Confed | "FIFA"
  kind: CompetitionKind
  offWindow?: boolean
  name(year: number): string
  /** Edition years this definition runs, within [from, to]. */
  editions(from: number, to: number): number[]
  /** Hosts, chosen when the edition is created. */
  hosts?(year: number, ctx: CompContext): string[]
  plan(inst: CompetitionInstance, ctx: CompContext): StagePlan[]
  finalize(inst: CompetitionInstance, ctx: CompContext): CompetitionOutcome
  /**
   * Teams with a place so far, and placeholders for places still being decided —
   * what a finals draw uses when it comes before the last play-offs.
   */
  provisional?(inst: CompetitionInstance, ctx: CompContext): string[]
  /** The team a placeholder slot of this competition turned into, once decided. */
  placeholderWinner?(inst: CompetitionInstance, slot: number): string | undefined
}

// ── Creation ────────────────────────────────────────────────────────────────

export function createInstance(
  def: CompetitionDef,
  year: number,
  ctx: CompContext
): CompetitionInstance {
  const inst: CompetitionInstance = {
    id: `${def.id}-${year}`,
    defId: def.id,
    name: def.name(year),
    short: def.short,
    year,
    confed: def.confed,
    kind: def.kind,
    hosts: def.hosts?.(year, ctx) ?? [],
    offWindow: !!def.offWindow,
    status: "upcoming",
    start: "",
    end: "",
    stages: [],
    outcome: {},
  }
  const plans = def.plan(inst, ctx)
  inst.stages = plans.map((p) => ({
    key: p.key,
    name: p.name,
    kind: p.groups ? "groups" : "knockout",
    status: "waiting",
  }))
  const dates = plans.flatMap((p) => [
    ...(p.groups?.dates ?? []),
    ...(p.knockout?.rounds.flatMap((r) => r.dates) ?? []),
    ...(p.knockout?.thirdPlace ? [p.knockout.thirdPlace] : []),
  ])
  dates.sort()
  inst.start = dates[0] ?? plans[0]?.drawDate ?? ctx.date
  inst.end = dates[dates.length - 1] ?? inst.start
  return inst
}

// ── Drawing ─────────────────────────────────────────────────────────────────

function fixtureId(inst: CompetitionInstance, stage: string, n: number) {
  return `${inst.id}:${stage}:${n}`
}

function roundDate(dates: ISODate[], r: number): ISODate {
  if (r < dates.length) return dates[r]
  const gap = dates.length > 1 ? 3 : 3
  return addDays(dates[dates.length - 1], gap * (r - dates.length + 1))
}

/** Move a match to the first day on or after `date` when neither side already plays. */
function freeDate(ctx: CompContext, a: string, b: string, date: ISODate): ISODate {
  // Never in the past: a round drawn late (after a delayed tie) starts tomorrow.
  const tomorrow = addDays(ctx.date, 1)
  let d = date < tomorrow ? tomorrow : date
  for (let i = 0; i < 6 && (ctx.busy(a, d) || ctx.busy(b, d)); i++) d = addDays(d, 1)
  return d
}

function venueFor(
  inst: CompetitionInstance,
  home: string,
  away: string,
  mode: "home-away" | "neutral"
) {
  if (mode === "home-away") return { home, away, atHome: true }
  // On neutral ground a host always plays "at home".
  if (inst.hosts.includes(away) && !inst.hosts.includes(home))
    return { home: away, away: home, atHome: true }
  return { home, away, atHome: inst.hosts.includes(home) }
}

function drawGroupStage(
  inst: CompetitionInstance,
  stage: StageState,
  plan: StagePlan,
  ctx: CompContext
) {
  const gp = plan.groups!
  const rng = makeRng(deriveSeed(ctx.seed, "draw", inst.id, stage.key))
  const entrants = plan.entrants(ctx, inst)
  const teams =
    gp.fixed ??
    drawGroups(entrants, gp.count, rng, {
      fixed: gp.seeded?.filter((t) => entrants.includes(t)),
      family: gp.spreadConfeds ? ctx.confedOf : undefined,
      maxPerFamily: (c) => (c === "UEFA" ? 2 : 1),
    })
  let n = 0
  stage.groups = teams.map((list, gi) => {
    const name = gp.names?.[gi] ?? String.fromCharCode(65 + gi)
    const ids: string[] = []
    roundRobin(list, gp.legs).forEach((pairs, r) => {
      for (const [h, a] of pairs) {
        const v = venueFor(inst, h, a, gp.venue)
        const date = freeDate(ctx, v.home, v.away, roundDate(gp.dates, r))
        const f: Fixture = {
          id: fixtureId(inst, stage.key, n++),
          compId: inst.id,
          stage: stage.key,
          label: `${stage.name} · ${teams.length > 1 ? `Group ${name} · ` : ""}Matchday ${r + 1}`,
          date,
          ...v,
          importance: plan.importance,
        }
        ctx.addFixture(f)
        ids.push(f.id)
      }
    })
    return { name, teams: list, fixtures: ids }
  })
  stage.status = "active"
}

function drawKnockoutStage(
  inst: CompetitionInstance,
  stage: StageState,
  plan: StagePlan,
  ctx: CompContext
) {
  const kp = plan.knockout!
  const rng = makeRng(deriveSeed(ctx.seed, "draw", inst.id, stage.key))
  const entrants = plan.entrants(ctx, inst)
  if (entrants.length < 2) {
    // Nobody to play: the stage passes without a match.
    stage.rounds = []
    stage.status = "done"
    return
  }
  let pairs: [string | null, string | null][]
  const size = Math.max(2, 2 ** Math.ceil(Math.log2(Math.max(2, entrants.length))))

  if (kp.pairing === "ordered") {
    pairs = []
    for (let i = 0; i < entrants.length; i += 2) pairs.push([entrants[i], entrants[i + 1] ?? null])
  } else if (kp.pairing === "draw") {
    const s = shuffle(rng, entrants)
    pairs = []
    for (let i = 0; i < s.length; i += 2) pairs.push([s[i], s[i + 1] ?? null])
  } else {
    // Seeds in bracket order; missing seeds are byes for the top teams.
    const seeds: (string | null)[] = [...entrants, ...Array(size - entrants.length).fill(null)]
    if (kp.pairing === "bracket" && entrants.length === size) {
      const prev = inst.stages[inst.stages.indexOf(stage) - 1]
      const groupOf = new Map<string, string>()
      for (const g of prev?.groups ?? []) for (const t of g.teams) groupOf.set(t, g.name)
      pairs = seedBracket(entrants, (a, b) => !!groupOf.get(a) && groupOf.get(a) === groupOf.get(b))
    } else {
      const order = bracketOrder(size)
      const slots = order.map((i) => seeds[i])
      pairs = []
      for (let i = 0; i < slots.length; i += 2) pairs.push([slots[i], slots[i + 1]])
    }
  }

  stage.rounds = kp.rounds.map((r) => ({ name: r.name, dates: r.dates, ties: [] }))
  stage.rounds[0].ties = pairs.map(([a, b], i) => makeTie(inst, stage, plan, ctx, 0, i, a, b))
  stage.status = "active"
  settleByes(stage)
}

function makeTie(
  inst: CompetitionInstance,
  stage: StageState,
  plan: StagePlan,
  ctx: CompContext,
  round: number,
  index: number,
  a: string | null,
  b: string | null,
  third = false
): Tie {
  const kp = plan.knockout!
  const roundPlan = third ? { name: "Third place", dates: [kp.thirdPlace!] } : kp.rounds[round]
  const tie: Tie = {
    id: `${inst.id}:${stage.key}:${third ? "3rd" : `r${round}t${index}`}`,
    home: a,
    away: b,
    fixtures: [],
  }
  if (!a || !b) return tie
  const legs = roundPlan.dates.length as 1 | 2
  roundPlan.dates.forEach((date, leg) => {
    const [h, w] = leg === 0 ? [a, b] : [b, a]
    const v = venueFor(inst, h, w, kp.venue)
    const f: Fixture = {
      id: `${tie.id}:${leg + 1}`,
      compId: inst.id,
      stage: stage.key,
      label: `${stage.name === roundPlan.name ? "" : `${stage.name} · `}${roundPlan.name}${legs > 1 ? ` · Leg ${leg + 1}` : ""}`,
      date: freeDate(ctx, v.home, v.away, date),
      ...v,
      importance: plan.importance,
      knockout: { tie: tie.id, leg: (leg + 1) as 1 | 2, legs, decisive: leg === legs - 1 },
    }
    ctx.addFixture(f)
    tie.fixtures.push(f.id)
  })
  return tie
}

function settleByes(stage: StageState) {
  for (const tie of stage.rounds?.[0]?.ties ?? []) {
    if (tie.home && !tie.away) tie.winner = tie.home
    else if (!tie.home && tie.away) tie.winner = tie.away
  }
}

// ── Progress ────────────────────────────────────────────────────────────────

function tieWinner(tie: Tie, ctx: CompContext): { winner: string; loser: string } | null {
  if (tie.winner) return { winner: tie.winner, loser: tie.loser ?? "" }
  const last = ctx.fixture(tie.fixtures[tie.fixtures.length - 1])
  if (!last?.result) return null
  const r = last.result
  const side = r.w ?? (r.h > r.a ? "home" : "away")
  const winner = side === "home" ? last.home : last.away
  const loser = side === "home" ? last.away : last.home
  return { winner, loser }
}

function progressKnockout(
  inst: CompetitionInstance,
  stage: StageState,
  plan: StagePlan,
  ctx: CompContext
) {
  const rounds = stage.rounds ?? []
  if (!rounds.length) {
    stage.status = "done"
    return
  }
  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r]
    if (!round.ties.length) {
      const prev = rounds[r - 1]
      if (!prev.ties.every((t) => t.winner)) return
      const winners = prev.ties.map((t) => t.winner!)
      for (let i = 0; i < winners.length; i += 2)
        round.ties.push(
          makeTie(inst, stage, plan, ctx, r, i / 2, winners[i], winners[i + 1] ?? null)
        )
      if (r === rounds.length - 1 && plan.knockout!.thirdPlace && prev.ties.length === 2) {
        const losers = prev.ties.map((t) => t.loser!)
        stage.thirdPlace = makeTie(inst, stage, plan, ctx, r, 0, losers[0], losers[1], true)
      }
      return
    }
    for (const tie of round.ties) {
      if (tie.winner) continue
      const res = tieWinner(tie, ctx)
      if (res) {
        tie.winner = res.winner
        tie.loser = res.loser
      }
    }
    if (!round.ties.every((t) => t.winner)) return
  }
  if (stage.thirdPlace && !stage.thirdPlace.winner) {
    const res = tieWinner(stage.thirdPlace, ctx)
    if (!res) return
    stage.thirdPlace.winner = res.winner
    stage.thirdPlace.loser = res.loser
  }
  stage.status = "done"
}

function progressGroups(stage: StageState, ctx: CompContext) {
  const all = (stage.groups ?? []).flatMap((g) => g.fixtures)
  if (all.every((id) => ctx.fixture(id)?.result)) stage.status = "done"
}

/** Advance every competition to `ctx.date`: draws due, rounds completed, outcomes. */
export function advanceCompetition(
  inst: CompetitionInstance,
  def: CompetitionDef,
  ctx: CompContext
): boolean {
  if (inst.status === "done") return false
  let changed = false
  const plans = def.plan(inst, ctx)
  // Saves from before a format change: add stages the definition now has.
  if (plans.some((p) => !inst.stages.some((s) => s.key === p.key))) {
    inst.stages = plans.map(
      (p) =>
        inst.stages.find((s) => s.key === p.key) ?? {
          key: p.key,
          name: p.name,
          kind: p.groups ? "groups" : "knockout",
          status: "waiting",
        }
    )
  }
  // A stage waits for the one it follows — the previous stage unless it names
  // another — so parallel stages (Nations League quarter-finals and play-offs)
  // run side by side.
  const statusOf = (key: string) => inst.stages.find((s) => s.key === key)?.status
  for (let i = 0; i < inst.stages.length; i++) {
    const stage = inst.stages[i]
    const plan = plans.find((p) => p.key === stage.key)
    if (!plan) {
      stage.status = "done"
      continue
    }
    if (stage.status === "done") continue
    if (stage.status === "waiting") {
      if (ctx.date < plan.drawDate) continue
      const dependsOn = plan.after ?? (i > 0 ? inst.stages[i - 1].key : null)
      if (dependsOn && statusOf(dependsOn) !== "done") continue
      if (stage.kind === "groups" && plan.groups) drawGroupStage(inst, stage, plan, ctx)
      else if (plan.knockout) drawKnockoutStage(inst, stage, plan, ctx)
      else stage.status = "done"
      inst.status = "active"
      changed = true
    }
    const before = stage.status
    if (stage.kind === "groups") progressGroups(stage, ctx)
    else progressKnockout(inst, stage, plan, ctx)
    if ((stage.status as string) !== before) changed = true
  }
  if (inst.stages.every((s) => s.status === "done") && inst.stages.length) {
    inst.outcome = def.finalize(inst, ctx)
    inst.status = "done"
    changed = true
  }
  return changed
}

// ── Reading results ─────────────────────────────────────────────────────────

export function stageByKey(inst: CompetitionInstance, key: string): StageState | undefined {
  return inst.stages.find((s) => s.key === key)
}

export function standingsOf(
  inst: CompetitionInstance,
  key: string,
  ctx: CompContext,
  rule: Tiebreak = "gd"
): Standing[][] {
  const stage = stageByKey(inst, key)
  return (stage?.groups ?? []).map((g) => groupStandings(g, ctx.fixture, rule, ctx.points))
}

/** Teams finishing in `pos` (0-based) across all groups, best first. */
export function finishers(tables: Standing[][], pos: number): Standing[] {
  return tables
    .map((t) => t[pos])
    .filter((r): r is Standing => !!r)
    .sort((a, b) => {
      const pa = a.p ? a.pts / a.p : 0
      const pb = b.p ? b.pts / b.p : 0
      return pb - pa || b.gd - a.gd || b.gf - a.gf
    })
}

export function knockoutResult(inst: CompetitionInstance, key: string) {
  const stage = stageByKey(inst, key)
  const rounds = stage?.rounds ?? []
  const final = rounds[rounds.length - 1]?.ties[0]
  return {
    winner: final?.winner,
    runnerUp: final?.loser,
    third: stage?.thirdPlace?.winner,
    /** Winners of the last round, for multi-path play-offs. */
    finalWinners: final
      ? rounds[rounds.length - 1].ties.map((t) => t.winner).filter((x): x is string => !!x)
      : [],
  }
}
