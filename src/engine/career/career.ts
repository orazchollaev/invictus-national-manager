/**
 * The manager's career: what the federation expects, how much patience it has left,
 * and who else wants him. Modelled on True Football National Manager — objectives
 * per competition, a confidence meter that results move, the sack when it runs out,
 * and offers from other federations when the reputation is there.
 */
import type { ISODate } from "../types"
import type { CompetitionInstance, Fixture } from "../competition/types"
import { addDays } from "../calendar/dates"
import { expectedResult, IMPORTANCE_WEIGHT } from "../ranking"
import { clamp, deriveSeed, makeRng, pick } from "../rng"
import type { BoardObjective } from "../world/types"
import { competitionDef } from "../competition/defs"
import { standingsOf } from "../competition/runtime"
import { goldCupRoutes } from "../competition/defs/concacaf"
import type { World } from "../world/world"

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

/** Objectives for every competition the nation is in or about to enter. */
export function refreshObjectives(world: World) {
  const career = world.state.career
  const me = career.nationId
  if (!me) return
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
        }
      } else if (stage) {
        obj = {
          id: `${inst.id}:reach`,
          comp: inst.defId,
          compInstance: inst.id,
          kind: "reach",
          stage,
          text:
            stage === "knockout"
              ? `Reach the knockout stage of the ${inst.name}`
              : `Reach the ${stage.toLowerCase()} of the ${inst.name}`,
          status: "open",
          critical: pos <= n * 0.25,
        }
      }
    }
    if (obj) career.objectives.push(obj)
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

/** How deep a team went in a knockout: the name of the last round it played. */
function reached(inst: CompetitionInstance, nationId: string): string[] {
  const out: string[] = []
  for (const s of inst.stages) {
    if (s.groups?.some((g) => g.teams.includes(nationId))) out.push("groups")
    for (const r of s.rounds ?? [])
      if (r.ties.some((t) => t.home === nationId || t.away === nationId)) out.push(r.name)
  }
  return out
}

/** The Nations League group a team plays in, and the stage it belongs to. */
function leagueGroup(inst: CompetitionInstance, nationId: string) {
  for (const stage of inst.stages) {
    const group = stage.groups?.find((g) => g.teams.includes(nationId))
    if (group) return { stage, group }
  }
  return null
}

const ORDER = ["groups", "Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"]

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
  }
}

function nudgeConfidence(world: World, delta: number) {
  const c = world.state.career
  c.confidence = Math.round(clamp(c.confidence + delta, 0, 100))
}

export function checkObjectives(world: World) {
  const career = world.state.career
  if (!career.nationId) return
  for (const obj of career.objectives) {
    if (obj.status !== "open") continue
    const inst = world.state.competitions[obj.compInstance]
    if (!inst) continue
    const status = evaluate(world, obj, inst)
    if (status === "open") continue
    obj.status = status
    if (status === "met") {
      nudgeConfidence(world, obj.critical ? 20 : 12)
      career.reputation = clamp(career.reputation + (obj.kind === "win" ? 12 : 5), 1, 100)
      world.news(
        "board",
        "Objective achieved",
        `The federation is delighted: "${obj.text}" — done.`,
        true
      )
    } else {
      nudgeConfidence(world, obj.critical ? -35 : -18)
      career.reputation = clamp(career.reputation - (obj.critical ? 6 : 3), 1, 100)
      world.news(
        "board",
        "Objective missed",
        `The federation is unhappy: we failed to "${obj.text.charAt(0).toLowerCase() + obj.text.slice(1)}".`,
        true
      )
    }
  }
  maybeSack(world)
}

/** After each of the user's matches: the meter moves by how the result compares with expectation. */
export function afterUserResult(world: World, f: Fixture) {
  const career = world.state.career
  const me = career.nationId
  if (!me || (f.home !== me && f.away !== me) || !f.result) return
  const home = f.home === me
  const mine = world.nation(me).points
  const opp = world.nation(home ? f.away : f.home).points
  const expected = expectedResult(mine, opp)
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
  checkObjectives(world)
}

export function afterCompetition(world: World, compId: string) {
  const inst = world.state.competitions[compId]
  const me = world.state.career.nationId
  if (inst && me && inst.outcome.winner === me) {
    const h = world.state.career.history[world.state.career.history.length - 1]
    h?.trophies.push(inst.name)
    world.state.career.reputation = clamp(
      world.state.career.reputation +
        (inst.kind === "world-cup" ? 25 : inst.kind === "continental" ? 12 : 4),
      1,
      100
    )
    nudgeConfidence(world, 25)
  }
  checkObjectives(world)
  refreshObjectives(world)
  aiCoachChanges(world, compId)
  if (inst && (inst.kind === "world-cup" || inst.kind === "continental")) makeOffers(world)
}

function maybeSack(world: World) {
  const c = world.state.career
  if (!c.nationId) return
  const criticalFail = c.objectives.some(
    (o) => o.critical && o.status === "failed" && !o.id.endsWith(":handled")
  )
  if (c.confidence <= 0 || (criticalFail && c.confidence < 25)) {
    const nation = world.def(c.nationId).name
    const h = c.history[c.history.length - 1]
    if (h) {
      h.to = world.state.date
      h.left = "sacked"
    }
    world.news("job", "Sacked", `The ${nation} federation has relieved you of your duties.`, true)
    world.nation(c.nationId).coach = aiCoachName(world, c.nationId)
    c.nationId = null
    c.sacked = world.state.date
    c.objectives = []
    c.reputation = clamp(c.reputation - 8, 1, 100)
    world.state.pendingCallup = null
    makeOffers(world, true)
  }
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
  c.confidence = 60
  c.since = date
  c.objectives = []
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
