/**
 * The manager's career: what the federation expects, how much patience it has left,
 * and who else wants him. Modelled on True Football National Manager — objectives
 * per competition, a confidence meter that results move, the sack when it runs out,
 * and offers from other federations when the reputation is there.
 *
 * Around that loop: the board agrees each big objective with the manager (who may
 * promise more for a bigger reward, or talk it down), reviews every competition when
 * it ends, puts him on a final warning when confidence runs low, and decides on his
 * contract when the finals it runs to are over.
 */
import type { ISODate, Player } from "../types"
import type { CompetitionInstance, Fixture } from "../competition/types"
import type { MatchReport } from "../match/types"
import { addDays } from "../calendar/dates"
import { expectedResult, IMPORTANCE_WEIGHT } from "../ranking"
import { clamp, deriveSeed, makeRng, pick } from "../rng"
import type { BoardObjective, CareerSnapshot } from "../world/types"
import { COMPETITION_DEFS, competitionDef } from "../competition/defs"
import { standingsOf } from "../competition/runtime"
import { goldCupRoutes } from "../competition/defs/concacaf"
import { ageOn, fullName } from "../players/ability"
import { nationTop } from "../players/quality"
import type { World } from "../world/world"
import { leagueGroup, ORDER, outcomeFor, playedIn, reached } from "./progress"
import { buildReview, REVIEWED, snapshotOf } from "./review"
import { award, checkMilestones } from "./milestones"
import { compText, lower, msg, nationText, type Msg, type Text } from "../text"

/** Every number that decides how hard the job is, in one place. */
export const CAREER_TUNING = {
  /** Confidence for an objective met / missed, critical or not. */
  metCritical: 20,
  met: 12,
  failedCritical: -30,
  failed: -15,
  /** A missed critical objective costs the job below this confidence. */
  sackAfterCriticalBelow: 25,
  /** A final warning below this; lifted again at or above `ultimatumLifted`. */
  ultimatumBelow: 30,
  ultimatumLifted: 40,
  /** Competitive matches a final warning gives to turn things round. */
  ultimatumMatches: 3,
  /** Sacked on the spot below this while on a final warning. */
  ultimatumSackBelow: 15,
  /** Ambition: reward and penalty multipliers, and the price of lowering. */
  raisedReward: 1.6,
  /** Confidence lost when a raised promise breaks; the original target then stands. */
  brokenPromise: 15,
  loweredReward: 0.5,
  lowerNeeds: 50,
  lowerCost: 6,
  /** Contract decision at the end of the finals it runs to. */
  renewAt: 55,
  extendAt: 35,
  /** Each month the board's memory fades: confidence moves this far towards `settle`. */
  driftPerMonth: 1,
  settle: 50,
  /**
   * Reputation mostly grows: a little every month in a job, while the board is
   * not losing faith (confidence at or above `reputationSlump`); below that it
   * slips. Every loss of reputation counts at `reputationLossScale` of its size,
   * so only a genuinely bad spell drags a name down.
   */
  reputationMonthly: 0.3,
  reputationSlump: 25,
  reputationLossScale: 0.5,
} as const

const T = CAREER_TUNING

/** Move the manager's reputation; losses are softened (see `reputationLossScale`). */
function nudgeReputation(world: World, delta: number) {
  const c = world.state.career
  const d = delta < 0 ? delta * T.reputationLossScale : delta
  c.reputation = Math.round(clamp(c.reputation + d, 1, 100) * 100) / 100
}

/** A competition instance id ("wc-2030") as its definition and year. */
function splitId(instanceId: string): { defId: string; year: number } {
  const dash = instanceId.lastIndexOf("-")
  return { defId: instanceId.slice(0, dash), year: Number(instanceId.slice(dash + 1)) }
}

/** "World Cup 2030" from "wc-2030", in the language being played. */
function compOf(instanceId: string): Msg {
  const { defId, year } = splitId(instanceId)
  return compText(defId, year)
}

/** What an objective asks, worked out from what it is about, so it can be reworded. */
export function objectiveText(o: BoardObjective): Msg {
  const { defId, year } = splitId(o.compInstance)
  const comp = compOf(o.compInstance)
  switch (o.kind) {
    case "qualify": {
      const finals =
        o.target === "asian-cup" || o.target === "gold-cup"
          ? compText(o.target, year + 1)
          : (() => {
              const id = COMPETITION_DEFS.find((d) => d.id === defId)?.finals?.(year)
              return id ? compOf(id) : comp
            })()
      const base = msg("obj.qualify", { comp: finals })
      return o.unbeaten ? msg("obj.unbeaten", { text: base }) : base
    }
    case "promotion":
      return msg("obj.promotion", { letter: o.league ?? "" })
    case "avoid-relegation":
      return msg("obj.relegation", { letter: o.league ?? "" })
    case "win":
      return msg("obj.win", { comp })
    case "reach":
      return msg(`obj.reach.${(o.stage ?? "knockout").toLowerCase()}`, { comp })
    case "debuts":
      return msg("obj.debuts", { count: o.count ?? 0, year: (o.until ?? "").slice(0, 4) })
  }
}

const withText = (o: BoardObjective): BoardObjective => ({ ...o, text: objectiveText(o) })

/** Text run into a sentence: its first letter in lower case. */
function lc(t: Text): Text {
  return typeof t === "string" ? t.charAt(0).toLowerCase() + t.slice(1) : lower(t)
}

const FINALS_PLACES: Record<string, number> = {
  wc: 48,
  euro: 24,
  afcon: 24,
  "asian-cup": 24,
  copa: 16,
  "gold-cup": 16,
  "ofc-cup": 8,
}

function rankInConfed(world: World, nationId: string): { rank: number; size: number } {
  const confed = world.def(nationId).confed
  const list = world.ctx().ranked((t) => world.def(t).confed === confed)
  return { rank: list.indexOf(nationId) + 1, size: list.length }
}

function rankOverall(world: World, nationId: string): number {
  return world.ctx().ranked().indexOf(nationId) + 1
}

function involved(inst: CompetitionInstance, nationId: string, world: World): boolean {
  for (const s of inst.stages) {
    if (s.groups?.some((g) => g.teams.includes(nationId))) return true
    if (s.rounds?.some((r) => r.ties.some((t) => t.home === nationId || t.away === nationId)))
      return true
  }
  if (inst.status !== "upcoming") return false
  const def = world.def(nationId)
  if (inst.confed === "FIFA")
    return inst.kind === "qualifier" ? false : inst.hosts.includes(nationId)
  // Outside FIFA: no World Cup qualifying, and nothing continental without full
  // membership; anything else shows once the team is drawn in.
  if (def.nonFifa && (inst.kind === "qualifier" || def.nonFifa === "regional")) return false
  return inst.confed === def.confed && (inst.kind === "qualifier" || inst.kind === "nations-league")
}

function round1(v: number) {
  return Math.round(v * 10) / 10
}

/** Objectives for every competition the nation is in or about to enter. */
export function refreshObjectives(world: World) {
  const career = world.state.career
  const me = career.nationId
  if (!me) return
  // Settled objectives stay on the record for two years.
  const cutoff = addDays(world.state.date, -730)
  career.objectives = career.objectives.filter(
    (o) => o.status === "open" || !o.resolved || o.resolved >= cutoff
  )
  const have = new Set(career.objectives.map((o) => o.compInstance))
  const { rank } = rankInConfed(world, me)
  const overall = rankOverall(world, me)

  for (const inst of Object.values(world.state.competitions)) {
    if (inst.status === "done" || have.has(inst.id)) continue
    if (!involved(inst, me, world)) continue
    // Already asked of us through World Cup qualifying's second round.
    if (inst.defId === "asian-cupq" && have.has(`wcq-afc-${inst.year - 1}`)) continue
    // Asked of us through the Nations League, once its leagues are drawn.
    if (inst.defId === "gcq") continue
    if (inst.defId === "cnl" && inst.stages.every((s) => s.status === "waiting")) continue
    const target = competitionDef(inst.defId).finals?.(inst.year)
    let obj: BoardObjective | null = null
    if (target) {
      const finalsDef = target.split("-").slice(0, -1).join("-")
      const places = inst.defId.startsWith("wcq")
        ? ({ UEFA: 16, CAF: 9, AFC: 8, CONCACAF: 6, CONMEBOL: 6, OFC: 1 } as const)[
            world.def(me).confed
          ]
        : (FINALS_PLACES[finalsDef] ?? 16)
      if (rank <= places * 1.25) {
        obj = {
          id: `${inst.id}:qualify`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: "qualify",
          text: "",
          status: "open",
          critical: rank <= places * 0.7,
          agreed: false,
        }
      }
    } else if (inst.kind === "nations-league") {
      const found = leagueGroup(inst, me)
      if (found) {
        const letter = found.group.name.replace(/\d+$/, "")
        const members = found.stage
          .groups!.filter((g) => g.name.startsWith(letter))
          .flatMap((g) => g.teams)
        const pos = members
          .sort((a, b) => world.nation(b).points - world.nation(a).points)
          .indexOf(me)
        const top = pos < members.length / 4
        obj = {
          id: `${inst.id}:nl`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: top && letter !== "A" ? "promotion" : "avoid-relegation",
          league: letter,
          text: "",
          status: "open",
          critical: false,
        }
      }
    } else if (inst.kind === "world-cup" || inst.kind === "continental") {
      const entrants = inst.stages[0].groups?.flatMap((g) => g.teams) ?? []
      if (!entrants.includes(me)) continue
      const pos =
        [...entrants].sort((a, b) => world.nation(b).points - world.nation(a).points).indexOf(me) +
        1
      const n = entrants.length
      const stage =
        pos <= 2
          ? "Semi-finals"
          : pos <= n * 0.25
            ? "Quarter-finals"
            : pos <= n * 0.6
              ? "knockout"
              : null
      if (pos === 1 && overall <= 3) {
        obj = {
          id: `${inst.id}:win`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: "win",
          text: "",
          status: "open",
          critical: false,
          agreed: false,
        }
      } else if (stage) {
        obj = {
          id: `${inst.id}:reach`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: "reach",
          stage,
          text: "",
          status: "open",
          critical: pos <= n * 0.25,
          agreed: false,
        }
      }
    }
    if (obj) {
      obj.text = objectiveText(obj)
      career.objectives.push(obj)
      ;(career.snapshots ??= {})[inst.id] ??= snapshotOf(world, me)
    }
    // Asia's World Cup qualifying second round also decides the next Asian Cup.
    if (inst.defId === "wcq-afc" && rank <= 26) {
      career.objectives.push(
        withText({
          id: `${inst.id}:asian-cup`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: "qualify",
          target: "asian-cup",
          text: "",
          status: "open",
          critical: rank <= 16,
        })
      )
    }
    // CONCACAF's Nations League is also the way into the next Gold Cup.
    if (inst.defId === "cnl" && rank <= 20) {
      career.objectives.push(
        withText({
          id: `${inst.id}:gold-cup`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: "qualify",
          target: "gold-cup",
          text: "",
          status: "open",
          critical: rank <= 8,
        })
      )
    }
  }
}

/**
 * 1 January: with promising uncapped youngsters in the pool, the federation wants
 * some of them blooded this year.
 */
export function youthObjective(world: World) {
  const c = world.state.career
  const me = c.nationId
  if (!me) return
  const year = world.state.date.slice(0, 4)
  const id = `youth-${year}:debuts`
  if (c.objectives.some((o) => o.id === id)) return
  const top = nationTop(world.state.nations[me].youthLevel)
  const prospects = world
    .pool(me)
    .filter((p) => p.caps === 0 && ageOn(p.born, world.state.date) <= 21 && p.pa >= top - 18)
  if (prospects.length < 3) return
  const count = prospects.length >= 6 ? 3 : 2
  c.objectives.push(
    withText({
      id,
      comp: "youth",
      compInstance: `youth-${year}`,
      kind: "debuts",
      count,
      progress: 0,
      until: `${year}-12-31`,
      text: "",
      status: "open",
      critical: false,
    })
  )
}

// ── Agreeing objectives with the board ──────────────────────────────────────

/** The rungs a finals objective climbs: reach the knockouts, … the final, win it. */
const LADDER = ["knockout", "Quarter-finals", "Semi-finals", "Final", "win"]

/**
 * The objective raised (+1) or lowered (−1) one step, or null when it cannot go
 * that way. Raising always makes it a key objective. Lowering keeps a key finals
 * objective key down to the quarter-finals; below that (and for qualifying) it
 * stops being key.
 */
export function shiftObjective(
  _world: World,
  obj: BoardObjective,
  dir: -1 | 1
): BoardObjective | null {
  if (obj.kind === "qualify") {
    if (obj.target) return null
    if (dir === 1) return obj.unbeaten ? null : withText({ ...obj, unbeaten: true, critical: true })
    if (obj.unbeaten) return withText({ ...obj, unbeaten: false })
    return obj.critical ? { ...obj, critical: false } : null
  }
  if (obj.kind !== "reach" && obj.kind !== "win") return null
  const rung = obj.kind === "win" ? LADDER.length - 1 : LADDER.indexOf(obj.stage ?? "knockout")
  const next = rung + dir
  if (next >= LADDER.length) return null
  if (next < 0) return obj.critical ? { ...obj, critical: false } : null
  const stage = LADDER[next]
  const critical = dir === 1 ? true : obj.critical && next >= 1
  if (stage === "win") return withText({ ...obj, kind: "win", stage: undefined, critical })
  return withText({ ...obj, kind: "reach", stage, critical })
}

export interface AmbitionChoice {
  level: -1 | 0 | 1
  text: Text
  critical: boolean
  allowed: boolean
  /** Why it is not allowed, or what it costs. */
  note?: Text
}

/** What the manager can tell the board about an objective. */
export function ambitionChoices(world: World, objectiveId: string): AmbitionChoice[] {
  const c = world.state.career
  const obj = c.objectives.find((o) => o.id === objectiveId)
  if (!obj) return []
  const up = shiftObjective(world, obj, 1)
  const down = shiftObjective(world, obj, -1)
  const out: AmbitionChoice[] = []
  if (up)
    out.push({
      level: 1,
      text: up.text,
      critical: up.critical,
      allowed: true,
      note: msg("obj.raiseNote", { reward: T.raisedReward, cost: T.brokenPromise }),
    })
  out.push({ level: 0, text: obj.text, critical: obj.critical, allowed: true })
  if (down)
    out.push({
      level: -1,
      text: down.text,
      critical: down.critical,
      allowed: c.confidence >= T.lowerNeeds,
      note:
        c.confidence >= T.lowerNeeds
          ? msg("obj.lowerNote", { cost: T.lowerCost })
          : msg("obj.lowerNeeds", { n: T.lowerNeeds }),
    })
  return out
}

/** The manager's word on an objective. Returns false if the board refuses. */
export function setAmbition(world: World, objectiveId: string, level: -1 | 0 | 1): boolean {
  const c = world.state.career
  const obj = c.objectives.find((o) => o.id === objectiveId)
  if (!obj || obj.agreed !== false) return false
  if (level !== 0) {
    if (level === -1 && c.confidence < T.lowerNeeds) return false
    const shifted = shiftObjective(world, obj, level)
    if (!shifted) return false
    if (level === 1)
      shifted.base = {
        kind: obj.kind,
        stage: obj.stage,
        unbeaten: obj.unbeaten,
        text: obj.text,
        critical: obj.critical,
      }
    Object.assign(obj, shifted)
    if (level === -1) nudgeConfidence(world, -T.lowerCost)
    world.news(
      "board",
      msg(level === 1 ? "news.raise.title" : "news.lower.title"),
      msg(level === 1 ? "news.raise.body" : "news.lower.body", { text: obj.text }),
      true,
      "/career"
    )
  }
  obj.agreed = true
  obj.ambition = level
  return true
}

// ── Judging objectives ──────────────────────────────────────────────────────

function evaluate(
  world: World,
  obj: BoardObjective,
  inst: CompetitionInstance
): "met" | "failed" | "open" {
  const me = world.state.career.nationId!
  switch (obj.kind) {
    case "qualify": {
      if (obj.target === "asian-cup") {
        // The second round's top two go through; everyone else through Asian Cup qualifying.
        const year = inst.year + 1
        if (world.state.competitions[`asian-cup-${year}`]?.hosts.includes(me)) return "met"
        if (inst.stages.find((s) => s.key === "r2")?.status !== "done") return "open"
        const table = standingsOf(inst, "r2", world.ctx()).find((t) => t.some((r) => r.team === me))
        if ((table?.findIndex((r) => r.team === me) ?? 99) <= 1) return "met"
        const q = world.state.competitions[`asian-cupq-${year}`]
        if (q?.status !== "done") return "open"
        return q.outcome.qualified?.includes(me) ? "met" : "failed"
      }
      if (obj.target === "gold-cup") {
        // Straight in from the Nations League, or through the Prelims.
        const routes = goldCupRoutes(inst, world.ctx())
        if (routes.direct.includes(me)) return "met"
        if (!routes.settled) return "open"
        if (!routes.prelims.includes(me)) return "failed"
        const q = world.state.competitions[`gcq-${inst.year + 1}`]
        if (q?.status !== "done") return "open"
        return q.outcome.qualified?.includes(me) ? "met" : "failed"
      }
      if (obj.unbeaten && playedIn(world, inst.id, me).some((f) => outcomeFor(f, me).lost))
        return "failed"
      if (inst.status !== "done") return "open"
      return inst.outcome.qualified?.includes(me) ? "met" : "failed"
    }
    case "win":
      if (inst.status !== "done") return "open"
      return inst.outcome.winner === me ? "met" : "failed"
    case "reach": {
      const got = reached(inst, me)
      const wanted = obj.stage === "knockout" ? 1 : ORDER.indexOf(obj.stage!)
      const deepest = Math.max(...got.map((r) => ORDER.indexOf(r)))
      if (deepest >= wanted) return "met"
      return inst.status === "done" ? "failed" : "open"
    }
    case "avoid-relegation":
    case "promotion": {
      if (inst.status !== "done") return "open"
      const tiers = inst.outcome.tiers ?? {}
      const found = leagueGroup(inst, me)
      if (!found) return "open"
      const letter = found.group.name.replace(/\d+$/, "")
      const now = Object.entries(tiers).find(([, list]) => list.includes(me))?.[0]
      if (obj.kind === "promotion") return now && now < letter ? "met" : "failed"
      return now && now > letter ? "failed" : "met"
    }
    case "debuts":
      return "open"
  }
}

function evaluateDebuts(world: World, obj: BoardObjective): "met" | "failed" | "open" {
  if ((obj.progress ?? 0) >= (obj.count ?? 0)) return "met"
  return world.state.date > (obj.until ?? world.state.date) ? "failed" : "open"
}

function nudgeConfidence(world: World, delta: number) {
  const c = world.state.career
  c.confidence = Math.round(clamp(c.confidence + delta, 0, 100))
}

/** Success feeds the federation's standing and, through it, the academies. */
function federationBoost(world: World, nationId: string, reputation: number, youth: number) {
  const n = world.state.nations[nationId]
  const def = world.def(nationId)
  if (!n) return
  n.reputation = round1(clamp(n.reputation + reputation, 1, 10))
  n.youthLevel = round1(clamp(n.youthLevel + youth, def.youthLevel - 6, def.youthLevel + 6))
}

export function checkObjectives(world: World) {
  const career = world.state.career
  const me = career.nationId
  if (!me) return
  let criticalMissed = false
  const judge = (obj: BoardObjective): "met" | "failed" | "open" | null => {
    if (obj.kind === "debuts") return evaluateDebuts(world, obj)
    const inst = world.state.competitions[obj.compInstance]
    return inst ? evaluate(world, obj, inst) : null
  }
  for (const obj of career.objectives) {
    if (obj.status !== "open") continue
    let status = judge(obj)
    // A raised promise broken: it costs, and the board's own target still stands.
    if (status === "failed" && obj.ambition === 1 && obj.base) {
      const promised = obj.text
      Object.assign(obj, obj.base)
      obj.base = undefined
      obj.ambition = 0
      obj.broken = true
      nudgeConfidence(world, -T.brokenPromise)
      nudgeReputation(world, -2)
      world.news(
        "board",
        msg("news.broken.title"),
        msg("news.broken.body", { promised: lc(promised), target: lc(obj.text) }),
        true,
        "/career"
      )
      status = judge(obj)
    }
    if (!status || status === "open") continue
    obj.status = status
    obj.resolved = world.state.date
    const raised = obj.ambition === 1
    const lowered = obj.ambition === -1
    if (status === "met") {
      const reward = raised ? T.raisedReward : lowered ? T.loweredReward : 1
      nudgeConfidence(world, (obj.critical ? T.metCritical : T.met) * reward)
      nudgeReputation(world, (obj.kind === "win" ? 12 : 5) * reward)
      federationBoost(
        world,
        me,
        (obj.critical ? 0.4 : 0.2) * reward,
        (obj.kind === "win" ? 0.6 : 0.3) * reward
      )
      world.news(
        "board",
        msg("news.met.title"),
        msg("news.met.body", { text: obj.text }),
        true,
        "/career"
      )
      if (obj.kind === "qualify" && !obj.target) {
        const wc = obj.comp.startsWith("wcq")
        const name = nationText(me)
        award(world, "first-qualification", msg("ms.qualification", { nation: name }))
        if (wc) award(world, "first-world-cup", msg("ms.worldCup", { nation: name }))
      }
    } else {
      nudgeConfidence(world, obj.critical ? T.failedCritical : T.failed)
      nudgeReputation(world, obj.critical ? -6 : -3)
      federationBoost(world, me, -0.2, 0)
      world.news(
        "board",
        msg("news.missed.title"),
        msg("news.missed.body", { text: lc(obj.text) }),
        true,
        "/career"
      )
      if (obj.critical) criticalMissed = true
    }
  }
  maybeSack(world, criticalMissed)
  pressure(world)
}

// ── Results ─────────────────────────────────────────────────────────────────

/** After each of the user's matches: the meter moves by how the result compares with expectation. */
export function afterUserResult(world: World, f: Fixture) {
  const career = world.state.career
  const me = career.nationId
  if (!me || (f.home !== me && f.away !== me) || !f.result) return
  const home = f.home === me
  const opp = home ? f.away : f.home
  if (f.compId !== "friendly") (career.snapshots ??= {})[f.compId] ??= snapshotOf(world, me)
  const expected = expectedResult(world.nation(me).points, world.nation(opp).points)
  const gf = home ? f.result.h : f.result.a
  const ga = home ? f.result.a : f.result.h
  let actual = gf > ga ? 1 : gf < ga ? 0 : 0.5
  if (f.result.pens) actual = f.result.w === (home ? "home" : "away") ? 0.75 : 0.5
  const weight = IMPORTANCE_WEIGHT[f.importance] / 4
  nudgeConfidence(world, (actual - expected) * weight)
  nudgeReputation(world, (actual - expected) * weight * 0.15)

  const h = career.history[career.history.length - 1]
  if (h) {
    h.played++
    if (actual > 0.5 && gf > ga) h.won++
    else if (gf === ga) h.drawn++
    else h.lost++
  }
  const competitive = f.importance !== "friendly"
  const lost = actual < 0.5 || (gf === ga && actual === 0.5 && !!f.result.pens)
  if (competitive) career.unbeaten = lost ? 0 : (career.unbeaten ?? 0) + 1
  resultNews(world, f, me, opp, gf, ga, actual - expected)

  // A final warning counts down over competitive matches.
  const u = career.ultimatum
  if (u && competitive) {
    u.matches--
    if (career.confidence < T.ultimatumSackBelow) return leaveJob(world, "sacked")
    if (u.matches <= 0) {
      if (career.confidence < T.ultimatumBelow) return leaveJob(world, "sacked")
      career.ultimatum = null
    }
  }
  checkObjectives(world)
  checkMilestones(world)
}

/** Headlines for results out of the ordinary. */
function resultNews(
  world: World,
  f: Fixture,
  me: string,
  opp: string,
  gf: number,
  ga: number,
  surprise: number
) {
  const us = nationText(me)
  const them = nationText(opp)
  const score = `${gf}–${ga}`
  const inst = world.state.competitions[f.compId]
  const comp: Msg = inst ? compText(inst.defId, inst.year) : msg("news.friendly")
  const params = { us, them, score, comp }
  let kind = ""
  if (gf - ga >= 4) kind = "riot"
  else if (surprise > 0.35 && gf > ga) kind = "shock"
  else if (ga - gf >= 4) kind = "humiliation"
  else if (surprise < -0.35 && gf < ga) kind = "embarrassing"
  if (kind)
    world.news(
      "result",
      msg(`news.${kind}.title`, params),
      msg(`news.${kind}.body`, params),
      true,
      `/report/${f.id}`
    )
}

/**
 * A first cap that is really a first cap. The starting pools carry no caps, so an
 * established player's first game in the save is not a debut: only youngsters
 * (21 or under) and players who came through in-game (newgens, "n123") count.
 */
function isDebut(p: Player, date: ISODate): boolean {
  return p.caps === 0 && (/^n\d+$/.test(p.id) || ageOn(p.born, date) <= 21)
}

/**
 * Players' moments in one of the user's matches, before their caps are counted:
 * debuts (which count towards a debuts objective) and cap and goal landmarks.
 */
export function playerMoments(world: World, f: Fixture, report: MatchReport) {
  const c = world.state.career
  const me = c.nationId
  if (!me || (f.home !== me && f.away !== me)) return
  const side = f.home === me ? "home" : "away"
  const debuts: Player[] = []
  for (const line of report.lines) {
    if (line.side !== side) continue
    const p = world.state.players[line.playerId]
    if (!p) continue
    if (isDebut(p, f.date)) debuts.push(p)
    const caps = p.caps + 1
    if (caps === 50 || caps === 100 || caps === 150)
      world.news(
        "callup",
        msg("news.cap.title", { name: fullName(p), caps }),
        msg("news.cap.body", { name: fullName(p), caps, nation: nationText(me) }),
        true
      )
    for (const g of [10, 25, 50, 75, 100])
      if (p.goals < g && p.goals + line.goals >= g)
        world.news(
          "callup",
          msg("news.goals.title", { name: fullName(p), goals: g }),
          msg("news.goals.body", { name: fullName(p), goals: g, nation: nationText(me) }),
          true
        )
  }
  if (!debuts.length) return
  const young = debuts.filter((p) => ageOn(p.born, f.date) <= 21)
  c.debuts = (c.debuts ?? 0) + debuts.length
  c.youthDebuts = (c.youthDebuts ?? 0) + young.length
  for (const o of c.objectives)
    if (o.kind === "debuts" && o.status === "open") o.progress = (o.progress ?? 0) + young.length
  const names = debuts.map((p) => `${fullName(p)} (${ageOn(p.born, f.date)})`)
  world.news(
    "callup",
    debuts.length === 1
      ? msg("news.debut.title", { name: fullName(debuts[0]) })
      : msg("news.debuts.title", { n: debuts.length }),
    msg("news.debut.body", {
      opp: nationText(f.home === me ? f.away : f.home),
      names: names.join(", "),
    }),
    true
  )
}

export function afterCompetition(world: World, compId: string) {
  const inst = world.state.competitions[compId]
  const c = world.state.career
  const me = c.nationId
  // Taken now: losing the job below clears the snapshots.
  const before = c.snapshots?.[compId]
  if (c.snapshots) delete c.snapshots[compId]
  if (inst && me && inst.outcome.winner === me) {
    const h = c.history[c.history.length - 1]
    h?.trophies.push(compText(inst.defId, inst.year))
    nudgeReputation(world, inst.kind === "world-cup" ? 25 : inst.kind === "continental" ? 12 : 4)
    nudgeConfidence(world, 25)
    const comp = compText(inst.defId, inst.year)
    award(world, "first-trophy", msg("ms.trophy", { comp }))
    if (inst.kind === "world-cup")
      award(world, "world-champion", msg("ms.world", { nation: world.def(me).name, comp }))
    if (inst.kind === "continental")
      award(world, "continental-champion", msg("ms.continental", { comp }))
  }
  checkObjectives(world)
  if (inst && me) reviewCompetition(world, inst, me, before)
  refreshObjectives(world)
  aiCoachChanges(world, compId)
  if (inst && (inst.kind === "world-cup" || inst.kind === "continental") && c.nationId)
    makeOffers(world)
}

/** The board's review of a competition the manager took part in, and his contract. */
function reviewCompetition(
  world: World,
  inst: CompetitionInstance,
  me: string,
  before: CareerSnapshot | undefined
) {
  const c = world.state.career
  // Also a contract whose date passed while this competition was still being played.
  const contractDue =
    c.nationId === me &&
    (c.contractFor === inst.id ||
      (!!c.contractUntil && world.state.date > c.contractUntil && !atTournament(world)))
  if (!REVIEWED.has(inst.kind) || !before || !playedIn(world, inst.id, me).length) {
    if (contractDue) decideContract(world)
    return
  }
  const review = buildReview(world, inst, me, before, c.nationId !== me)
  if (contractDue) {
    review.contract = decideContract(world)
    review.contractUntil = c.contractUntil
    if (review.contract === "expired") {
      review.verdict = "sacked"
      review.message = msg("review.msg.contractEnd", { comp: compText(inst.defId, inst.year) })
    }
  }
  const list = (c.reviews ??= [])
  list.push(review)
  if (list.length > 30) list.shift()
  world.state.pendingReview = review.id
}

// ── Pressure, the sack and the contract ─────────────────────────────────────

/** Missing a key objective costs the job unless the board still has faith. */
function maybeSack(world: World, criticalMissed: boolean) {
  const c = world.state.career
  if (!c.nationId) return
  if (c.confidence <= 0 || (criticalMissed && c.confidence < T.sackAfterCriticalBelow))
    leaveJob(world, "sacked")
}

/** Low confidence puts the manager on a final warning; recovering lifts it. */
function pressure(world: World) {
  const c = world.state.career
  if (!c.nationId) return
  if (!c.ultimatum && c.confidence < T.ultimatumBelow) {
    c.ultimatum = { since: world.state.date, matches: T.ultimatumMatches }
    world.state.pendingUltimatum = true
    world.news(
      "board",
      msg("news.ultimatum.title"),
      msg("news.ultimatum.body", { lifted: T.ultimatumLifted, matches: T.ultimatumMatches }),
      true,
      "/career"
    )
  } else if (c.ultimatum && c.confidence >= T.ultimatumLifted) {
    c.ultimatum = null
    world.news("board", msg("news.eases.title"), msg("news.eases.body"), true)
  }
}

const LEAVE_NEWS = { sacked: "sacked", expired: "notRenewed", resigned: "resigned" } as const
const LEAVE_REPUTATION = { sacked: -8, expired: -2, resigned: -4 } as const

/** Out of the job: sacked, the contract was not renewed, or the manager walked away. */
export function leaveJob(world: World, reason: "sacked" | "expired" | "resigned") {
  const c = world.state.career
  if (!c.nationId) return
  const nation = nationText(c.nationId)
  const h = c.history[c.history.length - 1]
  if (h) {
    h.to = world.state.date
    h.left = reason
  }
  const kind = LEAVE_NEWS[reason]
  world.news(
    "job",
    msg(`news.${kind}.title`),
    msg(`news.${kind}.body`, { nation }),
    true,
    "/career"
  )
  world.nation(c.nationId).coach = aiCoachName(world, c.nationId)
  c.nationId = null
  c.sacked = world.state.date
  c.objectives = []
  c.snapshots = {}
  c.ultimatum = null
  c.contractUntil = undefined
  c.contractFor = undefined
  nudgeReputation(world, LEAVE_REPUTATION[reason])
  world.state.pendingCallup = null
  world.state.pendingUltimatum = false
  world.state.pendingSacked = true
  makeOffers(world, true)
}

/** The manager hands in his notice: the job ends today. */
export function resign(world: World) {
  leaveJob(world, "resigned")
}

/**
 * A contract runs to the end of the next major finals the nation can play in (at
 * least ten months away), or two years when there is none.
 */
export function setContract(world: World) {
  const c = world.state.career
  const me = c.nationId
  if (!me) return
  const def = world.def(me)
  const earliest = addDays(world.state.date, 300)
  const next = Object.values(world.state.competitions)
    .filter(
      (i) =>
        i.status !== "done" &&
        i.end >= earliest &&
        ((i.kind === "world-cup" && !def.nonFifa) ||
          (i.kind === "continental" && i.confed === def.confed))
    )
    .sort((a, b) => (a.end < b.end ? -1 : a.end > b.end ? 1 : 0))[0]
  c.contractFor = next?.id
  c.contractUntil = next ? next.end : addDays(world.state.date, 730)
}

/** The contract has run its course: renewed, extended for a year, or ended. */
export function decideContract(world: World): "renewed" | "extended" | "expired" {
  const c = world.state.career
  const nation = c.nationId ? nationText(c.nationId) : ""
  if (c.confidence >= T.renewAt) {
    setContract(world)
    world.news(
      "job",
      msg("news.renewed.title"),
      msg("news.renewed.body", { nation, date: c.contractUntil ?? "" }),
      true,
      "/career"
    )
    return "renewed"
  }
  if (c.confidence >= T.extendAt) {
    c.contractFor = undefined
    c.contractUntil = addDays(world.state.date, 365)
    world.news(
      "job",
      msg("news.extended.title"),
      msg("news.extended.body", { nation }),
      true,
      "/career"
    )
    return "extended"
  }
  leaveJob(world, "expired")
  return "expired"
}

/**
 * Month start: good and bad runs alike fade from the board's memory, and a month
 * in the job adds to the manager's name — unless the board is losing faith.
 */
export function monthlyDrift(world: World) {
  const c = world.state.career
  if (!c.nationId) return
  nudgeReputation(
    world,
    c.confidence >= T.reputationSlump ? T.reputationMonthly : -T.reputationMonthly
  )
  if (c.confidence === T.settle) return
  const step = Math.min(T.driftPerMonth, Math.abs(T.settle - c.confidence))
  nudgeConfidence(world, c.confidence < T.settle ? step : -step)
}

/**
 * The manager's nation is at finals (a World Cup or its continental championship)
 * that are still being played. Contracts and offers wait for the end — no federation
 * lets its coach go, or poaches another's, the day before a final.
 */
export function atTournament(world: World): boolean {
  const me = world.state.career.nationId
  if (!me) return false
  return Object.values(world.state.competitions).some(
    (inst) =>
      inst.status === "active" &&
      (inst.kind === "world-cup" || inst.kind === "continental") &&
      reached(inst, me).length > 0
  )
}

/** Daily: a contract whose date has passed without its finals deciding it. */
export function checkContract(world: World) {
  const c = world.state.career
  if (!c.nationId || !c.contractUntil || world.state.date <= c.contractUntil) return
  if (atTournament(world)) return
  decideContract(world)
}

function aiCoachName(world: World, nationId: string): string {
  const rng = makeRng(deriveSeed(world.state.seed, "coach", nationId, world.state.date))
  const others = Object.values(world.state.nations)
    .map((n) => n.coach)
    .filter(Boolean)
  return pick(rng, others)
}

/** AI federations lose patience too, especially after a tournament. */
function aiCoachChanges(world: World, compId: string) {
  const inst = world.state.competitions[compId]
  if (
    !inst ||
    (inst.kind !== "world-cup" && inst.kind !== "continental" && inst.kind !== "qualifier")
  )
    return
  const rng = makeRng(deriveSeed(world.state.seed, "sackings", compId))
  const me = world.state.career.nationId
  const teams = new Set(inst.stages.flatMap((s) => s.groups?.flatMap((g) => g.teams) ?? []))
  for (const t of teams) {
    if (t === me) continue
    const expectedTop = rankInConfed(world, t).rank <= 8
    const qualified = inst.kind !== "qualifier" || inst.outcome.qualified?.includes(t)
    const chance = !qualified && expectedTop ? 0.6 : inst.outcome.winner === t ? 0.02 : 0.12
    if (rng() < chance) {
      world.nation(t).coach = aiCoachName(world, t)
      world.news(
        "job",
        msg("news.coachChange.title", { nation: nationText(t) }),
        msg("news.coachChange.body", { nation: nationText(t), coach: world.nation(t).coach }),
        false
      )
    }
  }
}

/**
 * Offers from federations whose standing matches the manager's reputation. A
 * manager out of work hears from smaller nations; a successful one from bigger.
 */
export function makeOffers(world: World, unemployed = false) {
  const c = world.state.career
  if (c.nationId && atTournament(world)) return
  const rng = makeRng(deriveSeed(world.state.seed, "offers", world.state.date))
  const ranked = world.ctx().ranked()
  const current = c.nationId ? ranked.indexOf(c.nationId) : ranked.length
  // Reputation 100 reaches the very top; 30 reaches about the 120th-ranked nation.
  const reach = Math.round(ranked.length * (1 - c.reputation / 110))
  const pool = ranked.filter(
    (t, i) => t !== c.nationId && i >= Math.max(0, reach - 15) && (unemployed || i < current)
  )
  const count = unemployed ? 3 : rng() < c.reputation / 150 ? 1 : 0
  const expires = addDays(world.state.date, 21)
  for (let i = 0; i < count && pool.length; i++) {
    const n = pool.splice(Math.floor(rng() * Math.min(pool.length, 12)), 1)[0]
    if (c.offers.some((o) => o.nationId === n)) continue
    c.offers.push({ nationId: n, expires })
    world.state.pendingOffer = n
    world.news(
      "job",
      msg("news.offer.title", { nation: nationText(n) }),
      msg("news.offer.body", { nation: nationText(n), date: expires }),
      true,
      "/career"
    )
  }
}

export function acceptOffer(world: World, nationId: string) {
  const c = world.state.career
  const date: ISODate = world.state.date
  if (c.nationId) {
    const h = c.history[c.history.length - 1]
    if (h) {
      h.to = date
      h.left = "moved"
    }
    world.nation(c.nationId).coach = aiCoachName(world, c.nationId)
  }
  c.nationId = nationId
  c.offers = []
  world.state.pendingOffer = null
  world.state.pendingUltimatum = false
  c.confidence = 60
  c.since = date
  c.objectives = []
  c.snapshots = {}
  c.ultimatum = null
  c.unbeaten = 0
  c.sacked = undefined
  c.history.push({
    nationId,
    from: date,
    to: null,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    trophies: [],
  })
  world.nation(nationId).coach = c.managerName
  world.news(
    "job",
    msg("news.newJob.title", { nation: nationText(nationId) }),
    msg("news.newJob.body", { nation: nationText(nationId) }),
    true
  )
  refreshObjectives(world)
  setContract(world)
}

export function declineOffer(world: World, nationId: string) {
  world.state.career.offers = world.state.career.offers.filter((o) => o.nationId !== nationId)
  if (world.state.pendingOffer === nationId) world.state.pendingOffer = null
}

export function expireOffers(world: World) {
  const c = world.state.career
  c.offers = c.offers.filter((o) => o.expires >= world.state.date)
  if (world.state.pendingOffer && !c.offers.some((o) => o.nationId === world.state.pendingOffer))
    world.state.pendingOffer = null
  // Out of work for a while: someone always calls eventually.
  if (!c.nationId && !c.offers.length && world.state.date.slice(8) === "01") makeOffers(world, true)
}

/** Fill the career fields a save from before they existed does not have. */
export function ensureCareer(world: World) {
  const c = world.state.career
  c.snapshots ??= {}
  c.reviews ??= []
  c.milestones ??= []
  c.watchlist ??= []
  c.debuts ??= 0
  c.youthDebuts ??= 0
  c.unbeaten ??= 0
  if (c.nationId && !c.contractUntil) setContract(world)
}
