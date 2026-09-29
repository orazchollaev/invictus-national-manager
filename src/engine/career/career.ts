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
import { competitionDef } from "../competition/defs"
import { standingsOf } from "../competition/runtime"
import { goldCupRoutes } from "../competition/defs/concacaf"
import { ageOn, fullName } from "../players/ability"
import { nationTop } from "../players/quality"
import type { World } from "../world/world"
import { leagueGroup, ORDER, outcomeFor, playedIn, reached } from "./progress"
import { buildReview, REVIEWED, snapshotOf } from "./review"
import { award, checkMilestones } from "./milestones"

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
} as const

const T = CAREER_TUNING

/** "FIFA World Cup 2030" from "wc-2030". */
function finalsName(instanceId: string): string {
  const year = Number(instanceId.slice(instanceId.lastIndexOf("-") + 1))
  const defId = instanceId.slice(0, instanceId.lastIndexOf("-"))
  return competitionDef(defId).name(year)
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
          text: `Qualify for the ${finalsName(target)}`,
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
          text:
            top && letter !== "A"
              ? `Win promotion from League ${letter}`
              : `Avoid relegation from League ${letter}`,
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
          text: `Win the ${inst.name}`,
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
          text: reachText(stage, inst.name),
          status: "open",
          critical: pos <= n * 0.25,
          agreed: false,
        }
      }
    }
    if (obj) {
      career.objectives.push(obj)
      ;(career.snapshots ??= {})[inst.id] ??= snapshotOf(world, me)
    }
    // Asia's World Cup qualifying second round also decides the next Asian Cup.
    if (inst.defId === "wcq-afc" && rank <= 26) {
      career.objectives.push({
        id: `${inst.id}:asian-cup`,
        comp: inst.defId,
        compInstance: inst.id,
        kind: "qualify",
        target: "asian-cup",
        text: `Qualify for the AFC Asian Cup ${inst.year + 1}`,
        status: "open",
        critical: rank <= 16,
      })
    }
    // CONCACAF's Nations League is also the way into the next Gold Cup.
    if (inst.defId === "cnl" && rank <= 20) {
      career.objectives.push({
        id: `${inst.id}:gold-cup`,
        comp: inst.defId,
        compInstance: inst.id,
        kind: "qualify",
        target: "gold-cup",
        text: `Qualify for the CONCACAF Gold Cup ${inst.year + 1}`,
        status: "open",
        critical: rank <= 8,
      })
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
  c.objectives.push({
    id,
    comp: "youth",
    compInstance: `youth-${year}`,
    kind: "debuts",
    count,
    progress: 0,
    until: `${year}-12-31`,
    text: `Hand international debuts to ${count} players aged 21 or under in ${year}`,
    status: "open",
    critical: false,
  })
}

function reachText(stage: string, name: string) {
  if (stage === "knockout") return `Reach the knockout stage of the ${name}`
  return `Reach the ${stage.toLowerCase()} of the ${name}`
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
  world: World,
  obj: BoardObjective,
  dir: -1 | 1
): BoardObjective | null {
  const name = world.state.competitions[obj.compInstance]?.name ?? obj.text
  if (obj.kind === "qualify") {
    if (obj.target) return null
    if (dir === 1)
      return obj.unbeaten
        ? null
        : { ...obj, unbeaten: true, critical: true, text: `${obj.text} unbeaten` }
    if (obj.unbeaten) return { ...obj, unbeaten: false, text: obj.text.replace(/ unbeaten$/, "") }
    return obj.critical ? { ...obj, critical: false } : null
  }
  if (obj.kind !== "reach" && obj.kind !== "win") return null
  const rung = obj.kind === "win" ? LADDER.length - 1 : LADDER.indexOf(obj.stage ?? "knockout")
  const next = rung + dir
  if (next >= LADDER.length) return null
  if (next < 0) return obj.critical ? { ...obj, critical: false } : null
  const stage = LADDER[next]
  const critical = dir === 1 ? true : obj.critical && next >= 1
  if (stage === "win")
    return { ...obj, kind: "win", stage: undefined, critical, text: `Win the ${name}` }
  return { ...obj, kind: "reach", stage, critical, text: reachText(stage, name) }
}

export interface AmbitionChoice {
  level: -1 | 0 | 1
  text: string
  critical: boolean
  allowed: boolean
  /** Why it is not allowed, or what it costs. */
  note?: string
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
      note: `Rewards ×${T.raisedReward}; falling short costs ${T.brokenPromise} confidence, then the original target stands`,
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
          ? `Costs ${T.lowerCost} confidence now; rewards halved`
          : `The board will only listen with confidence of ${T.lowerNeeds}% or more`,
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
      level === 1 ? "You raise the bar" : "Expectations lowered",
      level === 1
        ? `You have promised the federation more: "${obj.text}". Deliver, and they will not forget it.`
        : `The federation has reluctantly agreed to a lesser target: "${obj.text}".`,
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
      career.reputation = clamp(career.reputation - 2, 1, 100)
      world.news(
        "board",
        "Promise broken",
        `You promised to "${promised.charAt(0).toLowerCase() + promised.slice(1)}" and fell short. The federation still expects you to "${obj.text.charAt(0).toLowerCase() + obj.text.slice(1)}".`,
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
      career.reputation = clamp(career.reputation + (obj.kind === "win" ? 12 : 5) * reward, 1, 100)
      federationBoost(
        world,
        me,
        (obj.critical ? 0.4 : 0.2) * reward,
        (obj.kind === "win" ? 0.6 : 0.3) * reward
      )
      world.news(
        "board",
        "Objective achieved",
        `The federation is delighted: "${obj.text}" — done. The extra backing will reach the academies too.`,
        true,
        "/career"
      )
      if (obj.kind === "qualify" && !obj.target) {
        const wc = obj.comp.startsWith("wcq")
        const name = world.def(me).name
        award(world, "first-qualification", `You have taken ${name} to a major tournament.`)
        if (wc) award(world, "first-world-cup", `You have taken ${name} to a World Cup.`)
      }
    } else {
      nudgeConfidence(world, obj.critical ? T.failedCritical : T.failed)
      career.reputation = clamp(career.reputation - (obj.critical ? 6 : 3), 1, 100)
      federationBoost(world, me, -0.2, 0)
      world.news(
        "board",
        "Objective missed",
        `The federation is unhappy: we failed to "${obj.text.charAt(0).toLowerCase() + obj.text.slice(1)}".`,
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
  career.reputation = clamp(career.reputation + (actual - expected) * weight * 0.15, 1, 100)

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
  const us = world.def(me).name
  const them = world.def(opp).name
  const score = `${gf}–${ga}`
  const comp =
    f.compId === "friendly" ? "a friendly" : (world.state.competitions[f.compId]?.name ?? "")
  let title = ""
  let body = ""
  if (gf - ga >= 4) {
    title = `${us} run riot against ${them}`
    body = `A ${score} win over ${them} in ${comp}. The fans will remember this one.`
  } else if (surprise > 0.35 && gf > ga) {
    title = `Shock win over ${them}`
    body = `Few gave us a chance, but we beat ${them} ${score} in ${comp}.`
  } else if (ga - gf >= 4) {
    title = `Humiliation against ${them}`
    body = `A ${score} defeat to ${them} in ${comp}. Questions are being asked of the manager.`
  } else if (surprise < -0.35 && gf < ga) {
    title = `Embarrassing defeat to ${them}`
    body = `We were expected to win, but lost ${score} to ${them} in ${comp}.`
  }
  if (title) world.news("result", title, body, true, `/report/${f.id}`)
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
        `${fullName(p)} wins cap number ${caps}`,
        `${fullName(p)} has now played ${caps} times for ${world.def(me).name}.`,
        true
      )
    for (const g of [10, 25, 50, 75, 100])
      if (p.goals < g && p.goals + line.goals >= g)
        world.news(
          "callup",
          `${fullName(p)} reaches ${g} international goals`,
          `${fullName(p)} has now scored ${g} goals for ${world.def(me).name}.`,
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
    debuts.length === 1 ? `First cap for ${fullName(debuts[0])}` : `${debuts.length} debuts`,
    `Making their international debut against ${world.def(f.home === me ? f.away : f.home).name}: ${names.join(", ")}.`,
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
    h?.trophies.push(inst.name)
    c.reputation = clamp(
      c.reputation + (inst.kind === "world-cup" ? 25 : inst.kind === "continental" ? 12 : 4),
      1,
      100
    )
    nudgeConfidence(world, 25)
    award(world, "first-trophy", `Your first trophy: the ${inst.name}.`)
    if (inst.kind === "world-cup")
      award(world, "world-champion", `World champions! ${world.def(me).name} win the ${inst.name}.`)
    if (inst.kind === "continental")
      award(world, "continental-champion", `Champions of your continent: the ${inst.name}.`)
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
  const contractDue = c.nationId === me && c.contractFor === inst.id
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
      review.message = `The ${inst.name} marks the end of your contract, and the federation has decided not to renew it.`
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
      "Final warning",
      `The federation has lost patience. Lift their confidence to ${T.ultimatumLifted}% within ${T.ultimatumMatches} competitive matches, or you will be replaced.`,
      true,
      "/career"
    )
  } else if (c.ultimatum && c.confidence >= T.ultimatumLifted) {
    c.ultimatum = null
    world.news(
      "board",
      "The pressure eases",
      "Results have turned. The federation has withdrawn its final warning.",
      true
    )
  }
}

/** Out of the job: sacked, or the contract was not renewed. */
export function leaveJob(world: World, reason: "sacked" | "expired") {
  const c = world.state.career
  if (!c.nationId) return
  const nation = world.def(c.nationId).name
  const h = c.history[c.history.length - 1]
  if (h) {
    h.to = world.state.date
    h.left = reason
  }
  world.news(
    "job",
    reason === "sacked" ? "Sacked" : "Contract not renewed",
    reason === "sacked"
      ? `The ${nation} federation has relieved you of your duties.`
      : `The ${nation} federation has decided not to renew your contract.`,
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
  c.reputation = clamp(c.reputation - (reason === "sacked" ? 8 : 2), 1, 100)
  world.state.pendingCallup = null
  world.state.pendingUltimatum = false
  world.state.pendingSacked = true
  makeOffers(world, true)
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
  const nation = c.nationId ? world.def(c.nationId).name : ""
  if (c.confidence >= T.renewAt) {
    setContract(world)
    world.news(
      "job",
      "Contract renewed",
      `The ${nation} federation has renewed your contract until ${c.contractUntil}.`,
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
      "One more year",
      `The ${nation} federation has extended your contract by a single year. They want to see progress.`,
      true,
      "/career"
    )
    return "extended"
  }
  leaveJob(world, "expired")
  return "expired"
}

/** Month start: good and bad runs alike fade from the board's memory. */
export function monthlyDrift(world: World) {
  const c = world.state.career
  if (!c.nationId || c.confidence === T.settle) return
  const step = Math.min(T.driftPerMonth, Math.abs(T.settle - c.confidence))
  nudgeConfidence(world, c.confidence < T.settle ? step : -step)
}

/** Daily: a contract whose date has passed without its finals deciding it. */
export function checkContract(world: World) {
  const c = world.state.career
  if (c.nationId && c.contractUntil && world.state.date > c.contractUntil) decideContract(world)
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
        `${world.def(t).name} change coach`,
        `${world.def(t).name} have appointed ${world.nation(t).coach} as their new head coach.`,
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
      `Job offer: ${world.def(n).name}`,
      `The ${world.def(n).name} federation would like you as their new head coach. The offer stands until ${expires}.`,
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
    `New job: ${world.def(nationId).name}`,
    `You are the new head coach of ${world.def(nationId).name}.`,
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
  if (!c.nationId && !c.offers.length && c.sacked && world.state.date.slice(8) === "01")
    makeOffers(world, true)
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
