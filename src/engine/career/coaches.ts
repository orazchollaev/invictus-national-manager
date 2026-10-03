/**
 * The coaches of the AI world. Every nation has a head coach who is a person: he
 * is judged on results, sacked when his federation runs out of patience, and the
 * job stays open for a few weeks while the federation looks for someone — the
 * only jobs the user can be offered. Coaches age and retire, and some of the
 * internationals who hang up their boots come back a few years later on the bench.
 */
import type { ISODate } from "../types"
import type { Fixture } from "../competition/types"
import type { Coach, NationState } from "../world/types"
import type { World } from "../world/world"
import { addDays, daysBetween } from "../calendar/dates"
import { IMPORTANCE_WEIGHT } from "../ranking"
import {
  clamp,
  deriveSeed,
  gauss,
  makeRng,
  pickWeighted,
  randInt,
  streamFor,
  type Rng,
} from "../rng"
import { ageOn } from "../players/ability"
import { cultureOf, nameFrom } from "../players/lifecycle"
import { reached } from "./progress"
import { msg, nationText } from "../text"
import { pitchVacancy } from "./career"

/** `NationState.coachId` of the nation the user manages. */
export const USER_COACH = "me"

export const COACH_TUNING = {
  /** Coaches out of work kept on the market: a share of the nations, at least `freeMin`. */
  freePerNation: 0.3,
  freeMin: 40,
  /** A vacant job is filled after this many days (the user's offer holds it longer). */
  vacancyDays: [12, 40] as [number, number],
  confidenceStart: 60,
  /** Share of jobs still open on the first day of a new game. */
  openAtStart: 0.05,
  /** Each month the board's memory fades towards this. */
  settle: 55,
  /** After a match: (result − expected) × this × the match's weight. */
  matchSwing: 30,
  /** Sacked at or below this… */
  sackAt: 15,
  /** …unless he has been in the job fewer days than this. */
  graceDays: 120,
  /** At the end of a competition the board takes stock: sacked at or below this. */
  reviewSackAt: 25,
  /** Each month a board below `doubtBelow` may lose patience: `doubtChance` at the line, more below. */
  doubtBelow: 40,
  doubtChance: 0.08,
  /** Retirement: in work from `retireFrom`, out of work from `freeRetireFrom`; always at `retireAt`. */
  retireFrom: 62,
  freeRetireFrom: 58,
  retireAt: 75,
  /** Internationals with this many caps may go into coaching when they retire. */
  formerCaps: 20,
  formerChance: 0.3,
} as const

const T = COACH_TUNING

export function coachName(c: Pick<Coach, "first" | "last">): string {
  return `${c.first} ${c.last}`
}

export function coachOf(world: World, nationId: string): Coach | undefined {
  const id = world.state.nations[nationId]?.coachId
  return id && id !== USER_COACH ? world.state.coaches?.[id] : undefined
}

/** Where a nation stands among all nations: 0 (the best) to 1. */
function standing(world: World, nationId: string): number {
  const ranked = world.ctx().ranked()
  const i = ranked.indexOf(nationId)
  return i < 0 ? 1 : i / Math.max(1, ranked.length - 1)
}

/** The reputation a federation looks for in a coach: 90 at the top, 15 at the bottom. */
export function jobReputation(world: World, nationId: string): number {
  return Math.round(90 - 75 * standing(world, nationId))
}

function bornAt(date: ISODate, age: number, rng: Rng): ISODate {
  return addDays(date, -Math.round(age * 365.25) - randInt(rng, 0, 364))
}

/** A new coach, named from his nation's naming cultures. */
function newCoach(
  world: World,
  rng: Rng,
  nationality: string,
  age: number,
  reputation: number,
  name?: [string, string]
): Coach {
  const s = world.state
  const id = `c${s.nextCoachId ?? 1}`
  s.nextCoachId = (s.nextCoachId ?? 1) + 1
  const cultures = world.def(nationality).cultures
  const [first, last] =
    name ?? nameFrom(cultures.length ? cultureOf(cultures, rng) : "english", rng)
  const coach: Coach = {
    id,
    first,
    last,
    nationality,
    born: bornAt(s.date, age, rng),
    reputation: Math.round(clamp(reputation, 1, 100)),
    nationId: null,
    confidence: T.confidenceStart,
    history: [],
    face: `coach:${s.seed}:${id}`,
  }
  ;(s.coaches ??= {})[id] = coach
  return coach
}

/** Bigger footballing nations produce more coaches. */
function coachNationality(world: World, rng: Rng): string {
  const defs = [...world.defs.values()].filter((d) => !d.banned)
  return pickWeighted(rng, defs, (d) => 1 + d.points / 300).id
}

function freeCoaches(world: World): Coach[] {
  const date = world.state.date
  return Object.values(world.state.coaches ?? {}).filter(
    (c) => !c.retired && !c.nationId && (c.available ?? "") <= date
  )
}

function marketSize(world: World): number {
  return Math.max(T.freeMin, Math.round(world.defs.size * T.freePerNation))
}

function freeAgent(world: World, rng: Rng): Coach {
  return newCoach(
    world,
    rng,
    coachNationality(world, rng),
    randInt(rng, 38, 62),
    clamp(gauss(rng, 38, 15), 8, 80)
  )
}

/**
 * Coaches for a world (or a save from before coaches were people): one in every
 * job, keeping the names the save already had, and a market of coaches out of work.
 */
export function ensureCoaches(world: World) {
  const s = world.state
  s.coaches ??= {}
  s.nextCoachId ??= 1
  const me = s.career.nationId
  let created = false
  for (const def of world.defs.values()) {
    const n = s.nations[def.id]
    if (!n || n.coachId !== undefined) continue
    if (def.id === me) {
      n.coachId = USER_COACH
      n.coach = s.career.managerName
      continue
    }
    const rng = streamFor(s.seed, "coach-seed", def.id)
    // Most federations hire at home; some look abroad, to a stronger football nation.
    let nationality = def.id
    if (rng() < 0.2) {
      const better = [...world.defs.values()].filter(
        (d) => !d.banned && d.points > def.points && d.id !== def.id
      )
      if (better.length) nationality = pickWeighted(rng, better, (d) => d.points / 400).id
    }
    const old = n.coach.trim().split(" ")
    const name: [string, string] | undefined =
      old.length > 1 && old[0] ? [old[0], old.slice(1).join(" ")] : undefined
    created = true
    // A new world: a few federations are still looking for a coach after the World Cup.
    if (!name && rng() < T.openAtStart) {
      openJob(world, def.id)
      n.vacantSince = addDays(s.date, -randInt(rng, 0, 10))
      continue
    }
    const target = jobReputation(world, def.id)
    const coach = newCoach(
      world,
      rng,
      nationality,
      randInt(rng, 42, 66),
      target + gauss(rng, 0, 6),
      name
    )
    hire(n, coach, addDays(s.date, -randInt(rng, 30, 900)))
  }
  if (created) {
    const rng = streamFor(s.seed, "coach-market", s.date)
    for (let i = freeCoaches(world).length; i < marketSize(world); i++) freeAgent(world, rng)
  }
}

function hire(n: NationState, coach: Coach, from: ISODate) {
  coach.nationId = n.id
  coach.confidence = T.confidenceStart
  coach.available = undefined
  coach.history.push({ nationId: n.id, from, to: null, played: 0, won: 0, drawn: 0, lost: 0 })
  n.coachId = coach.id
  n.coach = coachName(coach)
  delete n.vacantSince
}

/** The user's job: taken, or left open behind him. */
export function takeJob(world: World, nationId: string) {
  const n = world.nation(nationId)
  n.coachId = USER_COACH
  n.coach = world.state.career.managerName
  delete n.vacantSince
}

export function openJob(world: World, nationId: string) {
  const n = world.nation(nationId)
  n.coachId = null
  n.coach = ""
  n.vacantSince = world.state.date
}

/** The coach leaves quietly (a new game opening jobs for a manager out of work). */
export function release(world: World, nationId: string) {
  const coach = coachOf(world, nationId)
  if (!coach) return
  const stint = coach.history[coach.history.length - 1]
  if (stint && !stint.to) stint.to = world.state.date
  coach.nationId = null
  openJob(world, nationId)
}

/** An AI coach leaves his job: sacked, or retired. */
export function vacate(world: World, nationId: string, reason: "sacked" | "retired") {
  const coach = coachOf(world, nationId)
  if (!coach) return
  const stint = coach.history[coach.history.length - 1]
  if (stint && !stint.to) {
    stint.to = world.state.date
    stint.left = reason
  }
  coach.nationId = null
  if (reason === "sacked") coach.reputation = Math.max(1, Math.round(coach.reputation - 4))
  else coach.retired = world.state.date
  openJob(world, nationId)
  const params = { nation: nationText(nationId), coach: coachName(coach) }
  world.news(
    "job",
    msg(`news.coach${reason === "sacked" ? "Sacked" : "Retired"}.title`, params),
    msg(`news.coach${reason === "sacked" ? "Sacked" : "Retired"}.body`, params),
    false,
    `/coach/${coach.id}`
  )
  pitchVacancy(world, nationId)
}

/** The nation is at finals still being played: nobody changes coach mid-tournament. */
export function atFinals(world: World, nationId: string): boolean {
  return Object.values(world.state.competitions).some(
    (inst) =>
      inst.status === "active" &&
      (inst.kind === "world-cup" || inst.kind === "continental") &&
      reached(inst, nationId).length > 0
  )
}

function maybeSack(world: World, nationId: string, line: number, grace: number) {
  const coach = coachOf(world, nationId)
  if (!coach || coach.confidence > line) return
  const stint = coach.history[coach.history.length - 1]
  if (stint && daysBetween(stint.from, world.state.date) < grace) return
  if (atFinals(world, nationId)) return
  vacate(world, nationId, "sacked")
}

/**
 * After every match: the coach's record, and his board's patience — moved by the
 * result against what was expected, and by how much the match mattered.
 */
export function coachResult(world: World, f: Fixture, gh: number, ga: number, expHome: number) {
  for (const [nationId, gf, gAgainst, exp] of [
    [f.home, gh, ga, expHome],
    [f.away, ga, gh, 1 - expHome],
  ] as const) {
    const coach = coachOf(world, nationId)
    if (!coach) continue
    const stint = coach.history[coach.history.length - 1]
    if (stint && !stint.to) {
      stint.played++
      if (gf > gAgainst) stint.won++
      else if (gf < gAgainst) stint.lost++
      else stint.drawn++
    }
    const score = gf > gAgainst ? 1 : gf < gAgainst ? 0 : 0.5
    const weight = (IMPORTANCE_WEIGHT[f.importance] / 25) * (f.compId === "friendly" ? 0.5 : 1)
    const delta = (score - exp) * T.matchSwing * weight
    coach.confidence = Math.round(clamp(coach.confidence + delta, 0, 100) * 10) / 10
    coach.reputation = Math.round(clamp(coach.reputation + delta * 0.15, 1, 100) * 100) / 100
    maybeSack(world, nationId, T.sackAt, T.graceDays)
  }
}

/** The end of a competition: the board takes stock of qualifying, or of the finals. */
export function judgeCoaches(world: World, compId: string) {
  const inst = world.state.competitions[compId]
  if (
    !inst ||
    (inst.kind !== "world-cup" && inst.kind !== "continental" && inst.kind !== "qualifier")
  )
    return
  const teams = new Set(inst.stages.flatMap((s) => s.groups?.flatMap((g) => g.teams) ?? []))
  for (const t of teams) {
    const coach = coachOf(world, t)
    if (!coach) continue
    const confed = world.def(t).confed
    const rank =
      world
        .ctx()
        .ranked((x) => world.def(x).confed === confed)
        .indexOf(t) + 1
    const expectedTop = rank > 0 && rank <= 8
    let delta = 0
    if (inst.outcome.winner === t) delta = 30
    else if (inst.outcome.runnerUp === t) delta = 15
    else if (inst.kind === "qualifier") {
      const qualified = !!inst.outcome.qualified?.includes(t)
      delta = qualified ? 10 : expectedTop ? -35 : -8
    } else if (expectedTop) delta = -10
    coach.confidence = clamp(coach.confidence + delta, 0, 100)
    coach.reputation = clamp(coach.reputation + delta * 0.2, 1, 100)
    maybeSack(world, t, T.reviewSackAt, 60)
  }
}

/** Month start: good and bad runs fade from every board's memory. */
export function coachesMonthly(world: World) {
  const rng = streamFor(world.state.seed, "coach-month", world.state.date)
  for (const n of Object.values(world.state.nations)) {
    const coach = coachOf(world, n.id)
    if (!coach) continue
    const gap = T.settle - coach.confidence
    coach.confidence += clamp(gap, -1, 1)
    // A board in doubt does not wait for rock bottom.
    if (coach.confidence < T.doubtBelow) {
      const doubt = T.doubtChance * (1 + (T.doubtBelow - coach.confidence) / 10)
      if (rng() < doubt) maybeSack(world, n.id, T.doubtBelow, T.graceDays)
    }
  }
}

function vacancyDays(world: World, n: NationState): number {
  const [lo, hi] = T.vacancyDays
  return lo + (deriveSeed(world.state.seed, "vacancy", n.id, n.vacantSince ?? "") % (hi - lo + 1))
}

/**
 * The best coach on the market for a job: his reputation close to what the
 * federation looks for (a big name will not take a small job unless he has been
 * out of work a while), a compatriot preferred, and never the man it just sacked.
 */
function candidateFor(world: World, nationId: string, rng: Rng): Coach | undefined {
  const target = jobReputation(world, nationId)
  const date = world.state.date
  let best: Coach | undefined
  let bestScore = -Infinity
  for (const c of freeCoaches(world)) {
    const last = c.history[c.history.length - 1]
    const idle = last?.to ? daysBetween(last.to, date) : 9999
    if (c.reputation > target + (idle > 365 ? 40 : 25)) continue
    if (c.reputation < target - 20) continue
    if (
      c.history.some(
        (h) =>
          h.nationId === nationId && h.left === "sacked" && h.to && daysBetween(h.to, date) < 1500
      )
    )
      continue
    const score =
      30 - Math.abs(c.reputation - target) + (c.nationality === nationId ? 12 : 0) + rng() * 8
    if (score > bestScore) {
      best = c
      bestScore = score
    }
  }
  return best
}

/** Daily: federations fill the jobs that have been open long enough. */
export function fillVacancies(world: World) {
  const s = world.state
  const me = s.career.nationId
  for (const n of Object.values(s.nations)) {
    if (n.coachId !== null || n.id === me || !world.defs.has(n.id)) continue
    // The federation waits for the user's answer.
    if (s.career.offers.some((o) => o.nationId === n.id)) continue
    if (n.vacantSince && daysBetween(n.vacantSince, s.date) < vacancyDays(world, n)) continue
    const rng = streamFor(s.seed, "appoint", n.id, s.date)
    const target = jobReputation(world, n.id)
    const coach =
      candidateFor(world, n.id, rng) ??
      newCoach(
        world,
        rng,
        rng() < 0.75 ? n.id : coachNationality(world, rng),
        randInt(rng, 38, 55),
        target - 6 + gauss(rng, 0, 4)
      )
    hire(n, coach, s.date)
    world.news(
      "job",
      msg("news.coachChange.title", { nation: nationText(n.id) }),
      msg("news.coachChange.body", { nation: nationText(n.id), coach: coachName(coach) }),
      false,
      `/coach/${coach.id}`
    )
  }
}

function retirementChance(c: Coach, age: number, date: ISODate): number {
  if (age >= T.retireAt) return 1
  if (c.nationId) return age >= T.retireFrom ? (age - T.retireFrom + 1) * 0.1 : 0
  const last = c.history[c.history.length - 1]
  const idleYears = (last?.to ? daysBetween(last.to, date) : 0) / 365
  return (
    (age >= T.freeRetireFrom ? (age - T.freeRetireFrom + 1) * 0.1 : 0) + (idleYears > 3 ? 0.3 : 0)
  )
}

/**
 * 1 July: coaches retire — at the top of the age range in work, sooner out of it —
 * and new faces join the market to keep it the size it was.
 */
export function coachesSeason(world: World) {
  const s = world.state
  const rng = streamFor(s.seed, "coach-season", s.date)
  for (const c of Object.values(s.coaches ?? {})) {
    if (c.retired || (c.available ?? "") > s.date) continue
    if (rng() >= retirementChance(c, ageOn(c.born, s.date), s.date)) continue
    if (c.nationId) vacate(world, c.nationId, "retired")
    // A coach who never had a job leaves no trace worth keeping.
    else if (!c.history.length) delete s.coaches![c.id]
    else c.retired = s.date
  }
  for (let i = freeCoaches(world).length; i < marketSize(world); i++) freeAgent(world, rng)
}

/**
 * A retiring international may take his badges and come back as a coach a few
 * years on, keeping his face; the better his career, the bigger his first name.
 */
export function maybeFormerPlayer(
  world: World,
  p: {
    id: string
    first: string
    last: string
    born: ISODate
    nationId: string
    caps: number
    goals: number
    pos: string
    ca: number
    pers: { professionalism: number }
  }
) {
  if (p.caps < T.formerCaps) return
  const s = world.state
  const rng = makeRng(deriveSeed(s.seed, "former-player", p.id))
  if (rng() >= T.formerChance * (0.5 + p.pers.professionalism / 20)) return
  const id = `c${s.nextCoachId ?? 1}`
  s.nextCoachId = (s.nextCoachId ?? 1) + 1
  ;(s.coaches ??= {})[id] = {
    id,
    first: p.first,
    last: p.last,
    nationality: p.nationId,
    born: p.born,
    reputation: Math.round(clamp(8 + p.caps * 0.25 + (p.ca - 50) * 0.3, 5, 55)),
    nationId: null,
    confidence: T.confidenceStart,
    history: [],
    available: addDays(s.date, randInt(rng, 365, 3 * 365)),
    face: p.id,
    player: { caps: p.caps, goals: p.goals, pos: p.pos },
  }
}
