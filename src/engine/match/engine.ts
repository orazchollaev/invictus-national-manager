/**
 * The match engine. A match is played one minute at a time, from kick-off to the
 * last minute of stoppage time. Each minute is a few ticks of play in which the side
 * on the ball tries to work it from its own third to the other side's box, and the
 * side without it tries to win it back: possession, chances, set pieces, fouls and
 * goals are whatever those ticks add up to — nothing is decided up front.
 *
 * The same engine plays the managed match (stepped by the UI, with the manager
 * changing tactics and players between minutes) and every other match in the world
 * (played straight through by `playMatch`).
 *
 * The work is split by subject:
 * - `state.ts`: the live state and its helpers.
 * - `strength.ts`: what each player and each side is worth this minute.
 * - `play.ts`: the ball moving, chances, shots and set pieces.
 * - `discipline.ts`: fouls, cards, injuries and the referee.
 * - `changes.ts`: substitutions, shape, instructions, the team talk.
 * - `touchline.ts`: the AI coach.
 * - `shootout.ts` and `report.ts`.
 */
import type { ISODate, Player, Position } from "../types"
import { clamp, makeRng, type Rng } from "../rng"
import { ageOn, matchAbility } from "../players/ability"
import { ARCHETYPES, TIRES_EARLY_AGE, archetypeOf } from "../players/archetypes"
import { BOND_POINTS, bondBetween } from "../players/bonds"
import type { Role } from "./roles"
import type { MatchEvent, MatchReport, Side, TeamSheet } from "./types"
import { assign, rebond, refreshMinute } from "./strength"
import { knocks, refereeStrictness } from "./discipline"
import { playTicks } from "./play"
import { aiBreak, aiManage, planChanges } from "./touchline"
import { playShootout } from "./shootout"
import { buildReport } from "./report"
import {
  emit,
  goalDiff,
  refreshOutfield,
  score,
  sideOf,
  type LivePlayer,
  type LiveSide,
  type MatchSetup,
  type MatchState,
} from "./state"

export type { LivePlayer, LiveSide, MatchSetup, MatchState, Phase, Units } from "./state"
export { teamUnits } from "./strength"
export {
  changeFormation,
  dismissInjury,
  setSlot,
  setTactics,
  substitute,
  teamTalk,
  type TeamTalk,
} from "./changes"
export { buildReport } from "./report"

const STAMINA_DRAIN = 0.42
/** A player's chance of a knock in any minute, for an average injury record. */
const KNOCK = 0.0001
const NO_EDGE = { def: 1, mid: 1, att: 1 }
/** Extra time is played on tired legs. */
const EXTRA_TIME_DRAIN = 1.15

// ── Setup ───────────────────────────────────────────────────────────────────

function livePlayer(
  p: Player,
  slot: Position,
  date: ISODate,
  started: boolean,
  minute: number,
  role?: Role
): LivePlayer {
  const arch = archetypeOf(p)
  const live: LivePlayer = {
    id: p.id,
    natural: p.pos,
    alt: p.alt,
    arch,
    role: null,
    mod: ARCHETYPES[arch],
    suited: false,
    bond: 0,
    slot,
    base: matchAbility(p),
    eff: 0,
    fit: 1,
    fitFor: null,
    knock: KNOCK * (1 + (p.pers.injuryProne - 8) * 0.08),
    age: ageOn(p.born, date),
    stamina: 100 - (p.injury ? 30 : 0),
    temperament: p.pers.temperament,
    injuryProne: p.pers.injuryProne,
    consistency: p.pers.consistency,
    bigMatch: p.pers.bigMatch,
    started,
    on: minute,
    off: null,
    yellow: 0,
    sentOff: false,
    injured: false,
    goals: 0,
    assists: 0,
    shots: 0,
    onTarget: 0,
    saves: 0,
    tackles: 0,
    keyPasses: 0,
    fouls: 0,
    errors: 0,
    conceded: 0,
    ratingAdj: 0,
  }
  assign(live, slot, role)
  return live
}

function bondPointsFor(setup: MatchSetup): LiveSide["bondPoints"] {
  const cache = new Map<string, number>()
  return (a, b) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    let v = cache.get(key)
    if (v === undefined) {
      const kind = bondBetween(setup.player(a), setup.player(b))
      v = kind ? BOND_POINTS[kind] : 0
      cache.set(key, v)
    }
    return v
  }
}

function buildSide(sheet: TeamSheet, setup: MatchSetup, rng: Rng): LiveSide {
  const pitch = sheet.xi.map((s) =>
    livePlayer(setup.player(s.playerId), s.pos, setup.date, true, 0, s.role)
  )
  const bench = sheet.bench.map((id) => {
    const p = setup.player(id)
    return livePlayer(p, p.pos, setup.date, false, 0)
  })
  const t = sheet.tactics
  const side: LiveSide = {
    sheet,
    bondPoints: bondPointsFor(setup),
    tactics: { ...t },
    baseMentality: t.mentality,
    baseTempo: t.tempo,
    basePressing: t.pressing,
    baseLine: t.line ?? 1,
    pitch,
    outfield: [],
    bench,
    appeared: [...pitch],
    subsUsed: 0,
    windows: 0,
    lastChange: "",
    plan: planChanges(rng, bench.length, setup.maxSubs ?? 5),
    reshaped: false,
    refill: null,
    goals: 0,
    stats: {
      possession: 50,
      shots: 0,
      onTarget: 0,
      xg: 0,
      corners: 0,
      fouls: 0,
      yellows: 0,
      reds: 0,
      offsides: 0,
      saves: 0,
    },
    possessionMinutes: 0,
    freshness: 100,
    threat: [0, 0, 0],
    play: NO_EDGE,
    playFor: -1,
  }
  refreshOutfield(side)
  rebond(side)
  return side
}

export function createMatch(setup: MatchSetup): MatchState {
  const rng = makeRng(setup.seed)
  const home = buildSide(setup.home, setup, rng)
  const away = buildSide(setup.away, setup, rng)
  const state: MatchState = {
    setup,
    rng,
    phase: "first-half",
    minute: 0,
    added: 0,
    addedTotal: 0,
    home,
    away,
    events: [],
    pendingInjuries: [],
    ball: { side: "home", lane: "centre", depth: 1 },
    flow: "settled",
    culprit: null,
    strictness: refereeStrictness(rng),
    lost: 0,
    units: { home: { def: 0, mid: 0, att: 0, gk: 0 }, away: { def: 0, mid: 0, att: 0, gk: 0 } },
  }
  refreshMinute(state)
  state.events.push({ minute: 0, kind: "kickoff", side: null })
  return state
}

// ── The clock ───────────────────────────────────────────────────────────────

const PERIOD_END = { "first-half": 45, "second-half": 90, "et-first": 105, "et-second": 120 }

/** Start a new period: the clock, the kick-off, the time lost so far. */
function startPeriod(state: MatchState, minute: number, kickOff: Side) {
  state.minute = minute
  state.added = 0
  state.addedTotal = 0
  state.lost = 0
  state.ball = { side: kickOff, lane: "centre", depth: 1 }
  state.flow = "settled"
}

/** The AI coaches use a break in play for changes. */
function breakChanges(state: MatchState, out: MatchEvent[]) {
  for (const s of ["home", "away"] as Side[]) if (state.setup.managed !== s) aiBreak(state, s, out)
}

/** Play one minute (or one stoppage minute, or a whole shootout). Returns its events. */
export function step(state: MatchState): MatchEvent[] {
  const out: MatchEvent[] = []
  switch (state.phase) {
    case "done":
      return out
    case "half-time":
      breakChanges(state, out)
      state.phase = "second-half"
      startPeriod(state, 45, "away")
      emit(state, out, "second-half", null)
      return out
    case "et-break":
      breakChanges(state, out)
      state.phase = "et-first"
      startPeriod(state, 90, "home")
      emit(state, out, "et-start", null)
      return out
    case "et-half-time":
      breakChanges(state, out)
      state.phase = "et-second"
      startPeriod(state, 105, "away")
      emit(state, out, "et-second-half", null)
      return out
    case "shootout":
      playShootout(state, out)
      return out
  }

  const periodEnd = PERIOD_END[state.phase]
  if (state.minute < periodEnd) state.minute++
  else state.added++

  playMinute(state, out)

  // The stoppage announced at the end of each half is the time lost in it.
  if (state.minute === periodEnd && state.added === 0 && state.addedTotal === 0)
    state.addedTotal = stoppage(state)
  if (state.minute === periodEnd && state.added >= state.addedTotal) endPeriod(state, out)
  return out
}

/**
 * Minutes added at the end of a period: a base, the time lost to goals, changes,
 * injuries and cards, a little more when the side in front has been running down the
 * clock, and the referee's own reading of it.
 */
function stoppage(state: MatchState): number {
  const rng = state.rng
  const lost = state.lost
  switch (state.phase) {
    case "first-half":
      return clamp(Math.round(0.8 + lost + rng() * 1.2), 1, 6)
    case "second-half": {
      const close = Math.abs(goalDiff(state, "home")) === 1 ? 0.6 : 0
      return clamp(Math.round(1.6 + lost + close + rng() * 1.6), 3, 10)
    }
    default:
      return clamp(Math.round(lost * 0.5 + rng() * 1.5), 0, 3)
  }
}

function endPeriod(state: MatchState, out: MatchEvent[]) {
  state.added = 0
  switch (state.phase) {
    case "first-half":
      state.ht = score(state)
      state.phase = "half-time"
      emit(state, out, "half-time", null)
      break
    case "second-half": {
      const ko = state.setup.knockout
      if (ko?.extraTime && tieLevel(state)) {
        state.ft = score(state)
        state.phase = "et-break"
        emit(state, out, "full-time", null)
        refresh(state, 12)
      } else {
        finish(state, out)
      }
      break
    }
    case "et-first":
      state.phase = "et-half-time"
      emit(state, out, "et-half-time", null)
      break
    case "et-second":
      if (tieLevel(state)) {
        state.phase = "shootout"
        emit(state, out, "et-end", null)
      } else finish(state, out)
      break
  }
}

function refresh(state: MatchState, amount: number) {
  for (const p of [...state.home.pitch, ...state.away.pitch])
    p.stamina = Math.min(100, p.stamina + amount)
}

function tieLevel(state: MatchState): boolean {
  return goalDiff(state, "home") === 0
}

function finish(state: MatchState, out: MatchEvent[]) {
  state.phase = "done"
  emit(state, out, "full-time", null)
}

/** The touchline and tired legs, for one side, at the start of a minute. */
function prepare(state: MatchState, s: Side, out: MatchEvent[], extra: boolean) {
  const side = sideOf(state, s)
  if (state.setup.managed !== s) aiManage(state, s, out)
  const drain =
    STAMINA_DRAIN *
    (1 + 0.25 * (side.tactics.pressing - 1)) *
    (1 + 0.1 * (side.tactics.tempo - 1)) *
    (extra ? EXTRA_TIME_DRAIN : 1)
  for (const p of side.pitch) {
    const own = drain * (p.age >= TIRES_EARLY_AGE ? 1.12 : 1) * (p.slot === "GK" ? 0.3 : 1)
    p.stamina = Math.max(0, p.stamina - own)
  }
}

function playMinute(state: MatchState, out: MatchEvent[]) {
  const extra = state.phase === "et-first" || state.phase === "et-second"
  prepare(state, "home", out, extra)
  prepare(state, "away", out, extra)
  refreshMinute(state)
  playTicks(state, out)
  knocks(state, out)
}

// ── Result ──────────────────────────────────────────────────────────────────

export function isFinished(state: MatchState): boolean {
  return state.phase === "done"
}

/** Play whatever is left of the match without stopping. */
export function playToEnd(state: MatchState): void {
  // A managed side left alone is looked after by the AI from here on.
  state.setup.managed = null
  state.pendingInjuries = []
  let guard = 0
  while (state.phase !== "done" && guard++ < 400) step(state)
}

/** Play a whole match in one call — every match the user is not watching. */
export function playMatch(setup: MatchSetup): MatchReport {
  const state = createMatch({ ...setup, managed: null })
  playToEnd(state)
  return buildReport(state)
}
