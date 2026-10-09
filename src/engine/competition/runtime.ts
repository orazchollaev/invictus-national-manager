/**
 * Runs competitions: draws each stage on its draw date, builds the fixtures, and
 * moves knockout ties and stages along as results come in. What a competition looks
 * like — its stages, dates and who enters — lives in its definition (defs/).
 */
import type { Confed, ISODate } from "../types"
import type { HostLevel } from "../world/stadiums"
import { addDays } from "../calendar/dates"
import { makeRng, deriveSeed, shuffle } from "../rng"
import { drawGroups, fitRounds, seedBracket, bracketOrder } from "./draw"
import { isPlaceholder } from "./placeholders"
import { groupText, msg, stageText, type Msg } from "../text"
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
  /** Every confederation a team is or — for a place still to be decided — may turn out to be. */
  confedsOf(team: string): Confed[]
  subFeds(team: string): string[]
  /** Centre of a nation as [latitude, longitude], or undefined when none is known. */
  centre(team: string): [number, number] | undefined
  points(team: string): number
  /** Nations allowed to enter competitions (not suspended), best ranked first. */
  ranked(filter?: (team: string) => boolean): string[]
  /** A FIFA member: World Cup qualifying and the FIFA ranking are for these only. */
  fifa(team: string): boolean
  /** A full member of its confederation, able to enter its competitions. */
  confedMember(team: string): boolean
  instance(id: string): CompetitionInstance | undefined
  fixture(id: string): Fixture | undefined
  addFixture(f: Fixture): void
  /** A team already plays within a day of this date. */
  busy(team: string, date: ISODate): boolean
  /** Federation reputation × stadiums: how good a candidate host a nation is. */
  stature(team: string): number
  /** 0–1: how far these nations' grounds, together, meet a tournament's needs. */
  readiness(teams: string[], level: HostLevel): number
  /** The nation has put in a bid to host tournaments of this level. */
  bid(team: string, level: HostLevel): boolean
  /** Final tournaments the nation hosts or has hosted, awarded ones included. */
  hosted(team: string): { defId: string; year: number }[]
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
  /** Teams placed first in the opening groups, in order: A, B, C… (hosts). */
  seeded?: string[]
  /**
   * The first of these in the draw plays the opening match on its own; the rest of
   * the first matchday follows the next day (hosts, in order).
   */
  opening?: string[]
  /**
   * Days each matchday is spread over, groups in order (A first): a hosted tournament.
   * Defaults to every group on the round's date.
   */
  spread?: number
  /** Keep confederations apart (World Cup): at most one per group, two for UEFA. */
  spreadConfeds?: boolean
  /** Teams to keep in different groups (hosts playing qualifying). */
  separate?: string[]
  venue: "home-away" | "neutral"
  tiebreak: Tiebreak
  /** Group names; defaults to A, B, C… */
  names?: string[]
  /**
   * A group's own rounds and dates, when groups play differently (the CONCACAF
   * Nations League's Swiss groups); otherwise a round robin over `legs` on `dates`.
   */
  schedule?(teams: string[], name: string): { rounds: [string, string][][]; dates: ISODate[] }
}

export interface KnockoutPlan {
  /**
   * Each round's dates: one for a single match, two for home and away legs. A round
   * with a `spread` plays its ties over that many days from the date, in bracket order.
   */
  rounds: { name: string; dates: ISODate[]; spread?: number }[]
  /**
   * bracket: seeds split by group; seeded: 1 v n, the top seeds taking any byes;
   * pots: the better half drawn against the rest, no byes (preliminary rounds);
   * draw: random; ordered: as listed, an empty name (BYE) giving the other a bye.
   */
  pairing: "bracket" | "seeded" | "pots" | "draw" | "ordered"
  thirdPlace?: ISODate
  venue: "home-away" | "neutral"
}

export interface StagePlan {
  key: string
  name: string
  drawDate: ISODate
  /**
   * Keys of the stages this one waits for; defaults to the stage before it, and
   * null waits for none (leagues played side by side).
   */
  after?: string | string[] | null
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
  /** The finals a qualifying competition leads to, as an instance id ("wc-2030"). */
  finals?(year: number): string
  /**
   * Teams sure to play on a date in a stage not drawn yet (one drawn mid-window);
   * friendlies are not arranged for them that day.
   */
  reserved?(inst: CompetitionInstance, ctx: CompContext, date: ISODate): string[]
}

// ── Creation ────────────────────────────────────────────────────────────────

export function createInstance(
  def: CompetitionDef,
  year: number,
  ctx: CompContext,
  /** Set before the plan is read: an invitational tournament's hosts and teams. */
  extra: Partial<Pick<CompetitionInstance, "hosts" | "invitational">> = {}
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
    ...extra,
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

/** A fixture's label in a knockout: the stage (unless it is the round), the round, the leg. */
function roundLabel(stage: string, round: string, leg: number): Msg {
  const r = stageText(round)
  if (stage === round)
    return leg ? msg("fx.roundLeg", { round: r, leg }) : msg("fx.round", { round: r })
  const s = stageText(stage)
  return leg
    ? msg("fx.stageRoundLeg", { stage: s, round: r, leg })
    : msg("fx.stageRound", { stage: s, round: r })
}

/** Day offset of the `i`th of `n` groups or ties when they are spread over `days`. */
function offset(i: number, n: number, days = 1): number {
  return days > 1 ? Math.floor((i * days) / n) : 0
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
      open: isPlaceholder,
      families: gp.spreadConfeds
        ? ctx.confedsOf
        : gp.separate?.length
          ? (t) => [gp.separate!.includes(t) ? "separate" : t]
          : undefined,
      maxPerFamily: (c) => (c === "UEFA" ? 2 : 1),
    })
  const opener = gp.opening?.find((t) => teams.some((g) => g.includes(t)))
  let n = 0
  stage.groups = teams.map((list, gi) => {
    const name = gp.names?.[gi] ?? String.fromCharCode(65 + gi)
    const ids: string[] = []
    const own = gp.schedule?.(list, name)
    const dates = own?.dates ?? gp.dates
    ;(own?.rounds ?? fitRounds(list, gp.legs, dates.length)).forEach((pairs, r) => {
      for (const [h, a] of pairs) {
        const v = venueFor(inst, h, a, gp.venue)
        const day = addDays(roundDate(dates, r), offset(gi, teams.length, own ? 1 : gp.spread))
        // The opening match is the only one on its day.
        const alone = !opener || r > 0 || h === opener || a === opener
        const date = freeDate(ctx, v.home, v.away, alone ? day : addDays(day, 1))
        const f: Fixture = {
          id: fixtureId(inst, stage.key, n++),
          compId: inst.id,
          stage: stage.key,
          label:
            teams.length > 1
              ? msg("fx.groupMatchday", {
                  stage: stageText(stage.name),
                  group: groupText(name),
                  n: r + 1,
                })
              : msg("fx.matchday", { stage: stageText(stage.name), n: r + 1 }),
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
    for (let i = 0; i < entrants.length; i += 2)
      pairs.push([entrants[i] || null, entrants[i + 1] || null])
  } else if (kp.pairing === "pots") {
    const half = Math.ceil(entrants.length / 2)
    const top = shuffle(rng, entrants.slice(0, half))
    const bottom = shuffle(rng, entrants.slice(half))
    // Who hosts the first leg is drawn too.
    pairs = top.map((t, i): [string, string | null] => {
      const b = bottom[i] ?? null
      return b && rng() < 0.5 ? [b, t] : [t, b]
    })
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
  stage.rounds[0].ties = pairs.map(([a, b], i) =>
    makeTie(inst, stage, plan, ctx, 0, i, pairs.length, a, b)
  )
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
  /** Ties in the round. */
  count: number,
  a: string | null,
  b: string | null,
  third = false
): Tie {
  const kp = plan.knockout!
  const roundPlan: KnockoutPlan["rounds"][number] = third
    ? { name: "Third place", dates: [kp.thirdPlace!] }
    : kp.rounds[round]
  const shift = offset(index, count, roundPlan.spread)
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
      label: roundLabel(stage.name, roundPlan.name, legs > 1 ? leg + 1 : 0),
      date: freeDate(ctx, v.home, v.away, addDays(date, shift)),
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
      const count = Math.ceil(winners.length / 2)
      for (let i = 0; i < winners.length; i += 2)
        round.ties.push(
          makeTie(inst, stage, plan, ctx, r, i / 2, count, winners[i], winners[i + 1] ?? null)
        )
      if (r === rounds.length - 1 && plan.knockout!.thirdPlace && prev.ties.length === 2) {
        const losers = prev.ties.map((t) => t.loser!)
        stage.thirdPlace = makeTie(inst, stage, plan, ctx, r, 0, 1, losers[0], losers[1], true)
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

/**
 * A competition's plan, built once per day while none of its stages is being played: it is
 * advanced several times a day (and after each of its matches), and rebuilding its
 * schedule each time was a tenth of the day loop. A draw or a finished stage changes
 * the key, so the plan is rebuilt whenever it could differ.
 */
const planCache = new WeakMap<
  CompetitionInstance,
  {
    key: string
    plans: StagePlan[]
    /** Nothing drawn yet: the first draw date, before which there is nothing to do. */
    idleUntil?: ISODate
  }
>()

function plansFor(inst: CompetitionInstance, def: CompetitionDef, ctx: CompContext) {
  let key = ctx.date + "|"
  for (const s of inst.stages) key += s.status[0]
  const hit = planCache.get(inst)
  // While a stage is being played its results change during the day, and what the
  // next stage takes from them (seeds, who went through) must be read afresh.
  if (hit && hit.key === key && !inst.stages.some((s) => s.status === "active")) return hit.plans
  const plans = def.plan(inst, ctx)
  const idleUntil =
    inst.status === "upcoming" && plans.length
      ? plans.reduce((min, p) => (p.drawDate < min ? p.drawDate : min), plans[0].drawDate)
      : undefined
  planCache.set(inst, { key, plans, idleUntil })
  return plans
}

/**
 * An edition with nothing drawn and its first draw still to come has nothing to do
 * today; skipping it spares building its plan every day for the months (or years)
 * between its creation and its draw.
 */
function idle(inst: CompetitionInstance, ctx: CompContext): boolean {
  const hit = planCache.get(inst)
  return inst.status === "upcoming" && !!hit?.idleUntil && ctx.date < hit.idleUntil
}

/** Advance every competition to `ctx.date`: draws due, rounds completed, outcomes. */
export function advanceCompetition(
  inst: CompetitionInstance,
  def: CompetitionDef,
  ctx: CompContext
): boolean {
  if (inst.status === "done" || idle(inst, ctx)) return false
  let changed = false
  const plans = plansFor(inst, def, ctx)
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
      const dependsOn =
        plan.after === undefined
          ? i > 0
            ? [inst.stages[i - 1].key]
            : []
          : [plan.after ?? []].flat()
      if (dependsOn.some((key) => statusOf(key) !== "done")) continue
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
