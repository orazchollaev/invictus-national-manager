/**
 * The press conference before a tournament, held once the squad is named. Five
 * journalists of the nation's press corps — each with a name, a face and an outlet
 * that stay the same for the nation — ask about the aim, the federation, the players
 * called and left out, the first opponent, the fans or the team's form.
 *
 * Every question has three ways to answer (boldly, carefully, bluntly) and what each
 * does depends on the situation: promising the earth is cheered when the team is
 * strong and punished when it is not. An answer moves the federation's confidence
 * and the fans' support, and the morale of the player it was about. Leaving the
 * room costs a little of both for every question left.
 */
import type { Player } from "../types"
import { ageOn } from "../players/ability"
import { cultureOf, nameFrom } from "../players/lifecycle"
import { clamp, pickWeighted, shuffle, streamFor } from "../rng"
import { compText, msg, nationText, type Msg } from "../text"
import { rivalry } from "../world/rivals"
import type { PressAnswer, PressQuestion, PressTone, PressTopic, Reporter } from "../world/types"
import type { World } from "../world/world"
import { nudgeConfidence } from "./career"
import { standing } from "./coaches"
import { nudgeSupport, supportOf } from "./support"

export const PRESS_TUNING = {
  /** Tournaments that call the press (competition kinds). */
  kinds: ["world-cup", "continental", "regional"],
  /** Months of the FIFA windows that call it too (March and September). */
  windowMonths: ["03", "09"],
  questions: 5,
  /** Journalists in a nation's press corps; the last is from abroad. */
  corps: 6,
  /** Leaving a question unanswered. */
  skipBoard: -0.4,
  skipFans: -0.5,
  /** A left-out or named player this close to the squad's best is a star. */
  starGap: 3,
  /** The best of the uncalled must be at least this close to the squad's 14th. */
  leftOutGap: 1,
  /** Net effect (board + 0.7 × fans) at which the press warms or cools. */
  warm: 2,
  cool: -1.5,
} as const

const T = PRESS_TUNING

export const PRESS_TONES: readonly PressTone[] = ["bold", "calm", "blunt"]

/** The agency every nation's press corps shares a correspondent from. */
const AGENCY = "World Football Wire"

/** A nation's press corps: the same people for as long as the save lasts. */
export function pressCorps(world: World, nationId: string): Reporter[] {
  const seed = world.state.seed
  const rng = streamFor(seed, "press-corps", nationId)
  const cultures = world.def(nationId).cultures
  const outlets = ["daily", "sport", "tv", "radio"]
  const out: Reporter[] = []
  const name = (nation: string): [string, string] => {
    const c = world.def(nation).cultures
    return nameFrom(c.length ? cultureOf(c, rng) : "english", rng)
  }
  for (let i = 0; i < T.corps - 1; i++) {
    const [first, last] = cultures.length
      ? nameFrom(cultureOf(cultures, rng), rng)
      : nameFrom("english", rng)
    out.push({
      id: `${nationId}-${i}`,
      first,
      last,
      nationId,
      face: `press:${seed}:${nationId}:${i}`,
      outlet: msg(`press.outlet.${outlets[i % outlets.length]}`, { nation: nationText(nationId) }),
    })
  }
  const abroad = pickWeighted(
    rng,
    [...world.defs.values()].filter((d) => !d.banned && d.id !== nationId),
    (d) => 1 + d.points / 300
  )
  const [first, last] = name(abroad.id)
  out.push({
    id: `${nationId}-abroad`,
    first,
    last,
    nationId: abroad.id,
    face: `press:${seed}:${nationId}:abroad`,
    outlet: AGENCY,
  })
  return out
}

/** The question the reporter puts, in the language being played. */
export function questionText(q: PressQuestion, world?: World): Msg {
  const p = q.playerId ? world?.state.players[q.playerId] : undefined
  const name = p ? `${p.first} ${p.last}` : ""
  switch (q.topic) {
    case "form":
      return msg(q.good ? "press.q.formGood" : "press.q.formBad")
    case "opponent":
      return msg("press.q.opponent", { opp: nationText(q.opp ?? "") })
    default:
      return msg(`press.q.${q.topic}`, { name })
  }
}

/** What the manager could say. */
export function answerText(q: PressQuestion, tone: PressTone): Msg {
  const key = q.topic === "form" ? (q.good ? "formGood" : "formBad") : q.topic
  return msg(`press.a.${key}.${tone}`)
}

/** Whether a tournament's squad calls the press. */
function callsPress(world: World, key: string): boolean {
  const inst = world.state.competitions[key]
  if (inst) return (T.kinds as readonly string[]).includes(inst.kind)
  // A window's squad is keyed by the window's start date.
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    (T.windowMonths as readonly string[]).includes(key.slice(5, 7))
  )
}

/** The user's first unplayed match in a tournament (or after today for a window): who he meets. */
function firstOpponent(world: World, me: string, key: string): string | null {
  const tournament = !!world.state.competitions[key]
  let best: { date: string; opp: string } | null = null
  for (const f of Object.values(world.state.fixtures)) {
    if (tournament ? f.compId !== key : f.date < world.state.date) continue
    if (f.result || (f.home !== me && f.away !== me)) continue
    if (!best || f.date < best.date) best = { date: f.date, opp: f.home === me ? f.away : f.home }
  }
  return best && !best.opp.startsWith("@") ? best.opp : null
}

const byAbility = (a: Player, b: Player) => b.ca - a.ca

/**
 * Called when the user's squad is named: if it is for a tournament the press has
 * not met him for yet, a conference is arranged.
 */
export function arrangePress(world: World, key: string) {
  const c = world.state.career
  const me = c.nationId
  if (!me || !callsPress(world, key) || c.pressed?.includes(key)) return
  const s = world.state
  const squad = s.nations[me].squad.map((id) => s.players[id]).filter(Boolean)
  if (squad.length < 11) return
  const rng = streamFor(s.seed, "press", key)
  const best = [...squad].sort(byAbility)

  const have = new Set(squad.map((p) => p.id))
  const bench = best[Math.min(13, best.length - 1)].ca
  const left = world
    .pool(me)
    .filter((p) => !have.has(p.id) && !p.intlRetired && !p.injury && !p.banned)
    .sort(byAbility)[0]
  const newcomer = squad
    .filter((p) => p.caps === 0 && ageOn(p.born, s.date) <= 23)
    .sort((a, b) => b.pa - a.pa)[0]
  const opp = firstOpponent(world, me, key)
  const run = c.unbeaten ?? 0
  const form: boolean | null =
    run >= 6 || c.confidence >= 70
      ? true
      : c.confidence <= 40 || supportOf(world) <= 35
        ? false
        : null

  const topics: { topic: PressTopic; extra?: Partial<PressQuestion> }[] = []
  const rest: typeof topics = [
    { topic: "star", extra: { playerId: best[0].id } },
    ...(newcomer ? [{ topic: "newcomer" as const, extra: { playerId: newcomer.id } }] : []),
    ...(opp ? [{ topic: "opponent" as const, extra: { opp } }] : []),
    { topic: "fans" },
    ...(form === null ? [] : [{ topic: "form" as const, extra: { good: form } }]),
  ]
  if (world.state.competitions[key]) topics.push({ topic: "goal" })
  topics.push({ topic: "federation" })
  if (left && left.ca >= bench - T.leftOutGap)
    topics.push({ topic: "leftOut", extra: { playerId: left.id } })
  topics.push(...shuffle(rng, rest).slice(0, T.questions - topics.length))
  const asked =
    topics[0].topic === "goal"
      ? [topics[0], ...shuffle(rng, topics.slice(1))]
      : shuffle(rng, topics)

  const corps = shuffle(rng, pressCorps(world, me))
  c.pressed = [...(c.pressed ?? []), key]
  s.pendingPress = {
    compId: key,
    nationId: me,
    date: s.date,
    questions: asked.map((t, i) => ({
      topic: t.topic,
      reporter: corps[i % corps.length],
      ...t.extra,
    })),
  }
}

interface Situation {
  /** The nation's standing: 0 (the best) to 1. */
  s: number
  confidence: number
  rival: number
  oppStronger: boolean
  star: boolean
}

/** [federation, fans, morale of the player asked about] for one answer. */
function effect(q: PressQuestion, tone: PressTone, x: Situation): [number, number, number] {
  const strong = x.s < 0.25
  const weak = x.s > 0.5
  const pick = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number]
  ) => ({ bold: a, calm: b, blunt: c })[tone]
  switch (q.topic) {
    case "goal":
      return pick(
        [strong ? 1.5 : weak ? -2 : 0, weak ? 2 : 3, 0],
        [1, 0, 0],
        [weak ? 1 : -2, weak ? 0 : -2.5, 0]
      )
    case "federation":
      return pick([2, 0, 0], [0.5, 0, 0], [x.confidence >= 60 ? -1 : -3, 1.5, 0])
    case "opponent":
      return pick(
        [x.oppStronger ? -1 : 0.5, 2 + x.rival * 1.5, 0],
        [0.5, x.rival ? -0.5 : 0, 0],
        [x.oppStronger ? -2 : -0.5, x.oppStronger ? -1.5 : 1 + x.rival * 1.5, 0]
      )
    case "fans":
      return pick([0, 3, 0], [0.5, 2, 0], [0.5, -1.5, 0])
    case "form":
      return q.good
        ? pick([1, 2.5, 0], [1, 1, 0], [0.5, -1, 0])
        : pick([-1, 1, 0], [1, 0.5, 0], [0.5, 2, 0])
    case "star":
      return pick([0, 1, 6], [0, 0, 1], [0.5, -0.5, -5])
    case "leftOut":
      return pick([0, 0.5, 5], [0.5, 0, 0], [0.5, x.star ? -2 : -1, -7])
    case "newcomer":
      return pick([0.5, 1.5, 7], [0.5, 0, 3], [0, -0.5, -4])
  }
}

function situation(world: World, q: PressQuestion): Situation {
  const c = world.state.career
  const me = c.nationId!
  const opp = q.opp
  const squad = world.state.nations[me].squad
    .map((id) => world.state.players[id])
    .filter(Boolean)
    .sort(byAbility)
  const p = q.playerId ? world.state.players[q.playerId] : undefined
  const s = standing(world, me)
  return {
    s,
    confidence: c.confidence,
    rival: opp ? rivalry(me, opp) : 0,
    oppStronger: !!opp && standing(world, opp) < s - 0.08,
    star: !!p && !!squad[0] && p.ca >= squad[0].ca - T.starGap,
  }
}

/** The manager answers the next question; what it does is applied at once. */
export function answerPress(world: World, index: number, tone: PressTone): PressAnswer | null {
  const conf = world.state.pendingPress
  const q = conf?.questions[index]
  if (!conf || !q || q.answer) return null
  const [board, fans, morale] = effect(q, tone, situation(world, q))
  const net = board + 0.7 * fans
  const kind = net >= T.warm ? "good" : net <= T.cool ? "bad" : "flat"
  const answer: PressAnswer = {
    tone,
    board,
    fans,
    morale: q.playerId ? morale : undefined,
    reaction: msg(`press.react.${kind}${index % 2}`),
  }
  q.answer = answer
  if (board) nudgeConfidence(world, board)
  if (fans) nudgeSupport(world, fans)
  const p = q.playerId ? world.state.players[q.playerId] : undefined
  if (p && morale) p.morale = clamp(p.morale + morale, 0, 100)
  return answer
}

/** The conference ends: questions left cost goodwill, and the papers have their say. */
export function finishPress(world: World) {
  const conf = world.state.pendingPress
  if (!conf) return
  let board = 0
  let fans = 0
  let left = 0
  for (const q of conf.questions) {
    if (q.answer) {
      board += q.answer.board
      fans += q.answer.fans
    } else left++
  }
  if (left) {
    nudgeConfidence(world, T.skipBoard * left)
    nudgeSupport(world, T.skipFans * left)
    board += T.skipBoard * left
    fans += T.skipFans * left
  }
  const net = board + 0.7 * fans
  const mood = net >= T.warm * 2 ? "warm" : net <= T.cool * 2 ? "cold" : "mixed"
  world.news(
    "career",
    msg("press.news.title", { comp: compInst(world, conf.compId) }),
    msg(`press.news.${mood}`, { comp: compInst(world, conf.compId) }),
    true
  )
  world.state.pendingPress = null
}

function compInst(world: World, compId: string): Msg {
  const inst = world.state.competitions[compId]
  return inst ? compText(inst.defId, inst.year) : msg("fx.window")
}

/** The assistant takes the questions: careful answers throughout. */
export function assistantPress(world: World) {
  const conf = world.state.pendingPress
  if (!conf) return
  conf.questions.forEach((q, i) => {
    if (!q.answer) answerPress(world, i, "calm")
  })
  finishPress(world)
}

/** A press conference left over from a nation the manager no longer has is dropped. */
export function dropStalePress(world: World) {
  const conf = world.state.pendingPress
  if (conf && conf.nationId !== world.state.career.nationId) world.state.pendingPress = null
}
