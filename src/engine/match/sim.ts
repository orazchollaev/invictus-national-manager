/**
 * The live match engine, played by an agent-based pitch simulation.
 *
 * A match the user watches and manages is played by `@bleckert/football-simulator`'s
 * RealTimeEngine: twenty-two simulated players chase the ball a quarter of a second at
 * a time, and everything the match is — attacks, shots, goals, cards, fouls, corners,
 * injuries, added minutes — is whatever those ticks add up to. The tactics sheet and
 * the manager's changes during play (mentality, pressing, tempo, line, width, shape,
 * substitutions, team talk) drive the engine live.
 *
 * What is *watched* is the simulator; what is *written down* is the game's own match
 * state. The shapes of `state.ts`, `changes.ts` and `report.ts` are unchanged, so the
 * live screen, the stats sheet, the shoot-out and the world's paperwork read the
 * shapes they always have. Matches nobody watches — the calendar's — still run the
 * tested minute-by-minute engine, so long-run calibration is untouched.
 *
 * Extra time is one more engine whose pitch is 30 minutes long (two 15-minute halves
 * reading as minutes 91–120); a tie that still stands goes to the game's own
 * shoot-out.
 */
import {
  Player as SimPlayer,
  Position as SimPos,
  RealTimeEngine,
  Team as SimTeam,
  type RealTimeMatchEvent,
  type SimulatedPlayer,
  type Tactics as SimTactics,
  type TeamSide,
} from "@bleckert/football-simulator"
import { clamp, streamFor, type Rng } from "../rng"
import { matchAbility } from "../players/ability"
import { ensureAttrs } from "../players/attributes"
import type { Player, Position } from "../types"
import {
  emit,
  goalDiff,
  keeper,
  other,
  refreshOutfield,
  sideOf,
  type LivePlayer,
  type LiveSide,
  type MatchSetup,
  type MatchState,
} from "./state"
import { createRawMatch } from "./engine"
import { bringOn } from "./changes"
import { playShootout } from "./shootout"
import { refreshMinute } from "./strength"
import type { Lane, MatchEvent, MatchEventKind, ShotType, Side, Tactics } from "./types"

/** Where a thing stands on the pitch, in percent. */
export interface Spot {
  x: number
  y: number
}

/** A player on the pitch, for the live view. */
export interface LiveDot extends Spot {
  id: string
}

/** The simulator's picture of the pitch, ready for the screen. */
export interface SimFrame {
  /** The ball, in the home side's attacking frame. */
  ball: Spot
  /** Each side's players, in that side's own attacking frame. */
  home: LiveDot[]
  away: LiveDot[]
}

interface SimRun {
  engine: RealTimeEngine
  /** One half of the engine, in seconds (2700 regulation, 900 in extra time). */
  half: number
  /** Length of the engine's whole match, in seconds (5400, 1800 in extra time). */
  length: number
  /** Match-clock minute where period 1 (base1) and 2 (base2) of the engine begin. */
  base1: number
  base2: number
  /** How many of the engine's events the story has read. */
  seen: number
  /** The bench players, so a change can bring the right man on. */
  bench: Record<Side, SimulatedPlayer[]>
  /** Time on the ball credited so far, in seconds. */
  pos: { home: number; away: number; side: TeamSide | null; since: number }
  /** The last pass's passer, in case it turns into a chance. */
  lastPass: { side: TeamSide; id: string } | null
}

interface SimState extends MatchState {
  sim: SimRun
}

const run = (state: MatchState): SimState => state as SimState

/** Extra time, for the engine that plays it, is 30 minutes of football. */
const ET_LENGTH = 30 * 60
/** A penalty is worth about three quarters of a goal. */
const PEN_XG = 0.76

// ── Cast: the game's team sheets into the simulator's teams ─────────────────

/** The game's slots on the simulator's playing positions. */
export const SIM_POS: Record<Position, SimPos> = {
  GK: SimPos.GK,
  CB: SimPos.CB,
  LB: SimPos.LB,
  RB: SimPos.RB,
  DM: SimPos.DM,
  CM: SimPos.CM,
  AM: SimPos.COM,
  LW: SimPos.LW,
  RW: SimPos.RW,
  ST: SimPos.ST,
}

/** The game's −2…+2 mentality on the simulator's three. */
const MENTALITY = ["defensive", "defensive", "balanced", "attacking", "attacking"] as const

/** The game's 0/1/2 levels on the simulator's 0–100 sliders. */
const SLIDERS = {
  press: [20, 55, 90],
  tempo: [35, 60, 85],
  width: [30, 50, 70],
  line: [30, 50, 72],
} as const

function simStyle(t: Tactics): SimTactics["style"] {
  if (t.counter) return "counter"
  if (t.pressing === 2) return "high_press"
  if (t.tempo === 2) return "direct"
  if (t.pressing === 0) return "low_block"
  return t.tempo === 0 ? "possession" : "balanced"
}

/** The tactics sheet as the simulator's `Tactics` reads it. */
function simTacticsOf(t: Tactics): Partial<SimTactics> {
  const width = t.width ?? 1
  return {
    formation: t.formation,
    style: simStyle(t),
    press: SLIDERS.press[t.pressing],
    tempo: SLIDERS.tempo[t.tempo],
    width: SLIDERS.width[width],
    mentality: MENTALITY[t.mentality + 2],
    defensiveLine: SLIDERS.line[t.line ?? 1],
    compactness: 50,
    focus: width === 2 ? "wide" : width === 0 ? "central" : "balanced",
  }
}

/**
 * A player of the game as one the simulator plays with. Attributes read the game's
 * own (1–99) on the simulator's 1–20 canvas: every gap between two players stays, so
 * a 99 finisher and a 71 finisher remain nine tenths and five tenths apart. What the
 * game has no model of takes the floor. `boost` is this side's lift in ability points.
 */
function toSim(p: Player, boost: number, side: TeamSide, number: number): SimPlayer {
  ensureAttrs(p)
  const a = p.attrs ?? {}
  const isKeeper = p.pos === "GK"
  const lift = (boost + (side === "home" ? 1 : 0)) / 5
  const n = (key: keyof typeof a) =>
    clamp(Math.round((a[key] ?? matchAbility(p)) / 5 + lift), 1, 20)
  const nerve = clamp(Math.round(p.pers.temperament / 5), 1, 20)
  const calm = clamp(Math.round(p.pers.consistency / 5), 1, 20)
  const attributes = {
    // Technical — the game's twelve outward to the simulator's fourteen.
    corners: n("passing"),
    crossing: n("dribbling"),
    dribbling: n("dribbling"),
    finishing: n("finishing"),
    firstTouch: n("passing"),
    freeKickTaking: n("passing"),
    heading: n("heading"),
    longShots: n("shooting"),
    longThrows: n("strength"),
    marking: n("tackling"),
    passing: n("passing"),
    penaltyTaking: n("finishing"),
    tackling: n("tackling"),
    technique: n("dribbling"),
    // Physical
    acceleration: n("acceleration"),
    agility: isKeeper ? n("agility") : n("pace"),
    balance: n("strength"),
    jumpingReach: n("jumping"),
    naturalFitness: n("stamina"),
    pace: isKeeper ? clamp(n("agility") - 2, 1, 20) : n("pace"),
    stamina: n("stamina"),
    strength: n("strength"),
    // Mental — personality values where the game stores a personality.
    aggression: isKeeper ? 5 : nerve,
    anticipation: n("vision"),
    bravery: n("strength"),
    composure: clamp(calm - 2, 1, 20),
    concentration: clamp(calm - 2, 1, 20),
    decisions: n("vision"),
    determination: clamp(Math.round(p.pers.ambition / 5), 1, 20),
    flair: n("dribbling"),
    leadership: clamp(Math.round((p.pers.loyalty + p.pers.ambition) / 5), 1, 20),
    offTheBall: n("pace"),
    positioning: n("tackling"),
    teamwork: n("vision"),
    vision: n("vision"),
    workRate: n("stamina"),
    // Goalkeeper — 1 where an outfielder has no business, the keeper's own where he does.
    aerialReach: isKeeper ? n("aerial") : 1,
    commandOfArea: isKeeper ? n("positioning") : 1,
    communication: isKeeper ? n("distribution") : 1,
    eccentricity: 2,
    handling: isKeeper ? n("reflexes") : 1,
    oneOnOnes: isKeeper ? n("oneOnOne") : 1,
    reflexes: isKeeper ? n("reflexes") : 1,
    rushingOut: isKeeper ? n("oneOnOne") : 1,
    tendencyToPunch: 2,
    throwing: isKeeper ? n("distribution") : 1,
  }
  // The sim's players read people by name; the game's player id goes in as his name.
  return new SimPlayer(
    { name: p.id, number },
    { height: 182, weight: 76 },
    attributes,
    SIM_POS[p.pos] ?? SimPos.CB
  )
}

/** The simulator's team for one side: the eleven first, in their places, then the bench. */
function simTeam(side: TeamSide, name: string, setup: MatchSetup, cast: string[]): SimTeam {
  const boost =
    (side === "home" && setup.homeAdvantage ? (setup.homeBoost ?? 1) : 0) +
    (setup.edge?.side === side ? setup.edge.value : 0) +
    (setup.hosts?.includes(side) ? 1 : 0)
  const players = cast.map((id, i) => toSim(setup.player(id), boost, side, i + 1))
  return new SimTeam(side === "home", name, players)
}

/** Everyone a side may field, in the order the engine builds an eleven from. */
function castOf(state: MatchState, s: Side): string[] {
  const side = sideOf(state, s)
  return [...side.pitch.map((p) => p.id), ...side.bench.map((p) => p.id), ...stackOf(side)]
}

/** Everyone who started and has fallen out: padding, so the engine keeps eleven. */
function stackOf(side: LiveSide): string[] {
  const on = new Set([...side.pitch, ...side.bench].map((p) => p.id))
  return side.appeared.filter((p) => !on.has(p.id)).map((p) => p.id)
}

// ── Setup ───────────────────────────────────────────────────────────────────

function buildRun(
  state: MatchState,
  length: number,
  base1: number,
  base2: number,
  rng: Rng
): SimRun {
  const teamHome = simTeam("home", state.setup.home.nationId, state.setup, castOf(state, "home"))
  const teamAway = simTeam("away", state.setup.away.nationId, state.setup, castOf(state, "away"))
  const engine = new RealTimeEngine(teamHome, teamAway, {
    random: rng,
    homeTactics: simTacticsOf(state.home.tactics),
    awayTactics: simTacticsOf(state.away.tactics),
  })
  engine.start()
  const r: SimRun = {
    engine,
    half: length / 2,
    length,
    base1,
    base2,
    seen: 0,
    bench: { home: [...engine.state.bench.home], away: [...engine.state.bench.away] },
    pos: { home: 0, away: 0, side: null, since: engine.state.time },
    lastPass: null,
  }
  mapRun(state, r)
  // The manager's own side never takes an AI change; no one on the bench may do it for him.
  if (state.setup.managed) engine.state.bench[state.setup.managed] = []
  return r
}

/**
 * Bind the engine's cast to the game's state, and prune: a rebuild in extra time may
 * have pulled a bench man into the eleven to fill the quota, and ghosts are not
 * footballers. The legs the side has carried over are the engine's people.
 */
function mapRun(state: MatchState, r: SimRun) {
  for (const s of ["home", "away"] as Side[]) {
    const side = sideOf(state, s)
    const known = new Set([...side.pitch, ...side.bench].map((p) => p.id))
    for (const p of side.pitch) {
      const sp = r.engine.state.players.find((x) => x.player.info.name === p.id)
      if (sp) sp.stamina = Math.max(1, p.stamina)
    }
    r.engine.state.players = r.engine.state.players.filter((x) => known.has(x.player.info.name))
    r.engine.state.bench[s] = r.engine.state.bench[s].filter((x) => known.has(x.player.info.name))
    r.bench[s] = [...r.engine.state.bench[s]]
  }
  if (state.setup.managed) r.engine.state.bench[state.setup.managed] = []
}

/** The match state, wearing the simulator it plays with. */
export function createSimMatch(setup: MatchSetup): MatchState {
  const state = createRawMatch(setup) as SimState
  state.sim = buildRun(state, 90 * 60, 0, 45, streamFor(setup.seed, "sim"))
  return state
}

export function isSim(state: MatchState): boolean {
  return (state as Partial<SimState>).sim !== undefined
}

/** Restart the run in extra time: one more engine, thirty minutes long. */
function etRun(state: MatchState) {
  run(state).sim = buildRun(state, ET_LENGTH, 90, 105, state.rng)
}

// ── The clock ───────────────────────────────────────────────────────────────

const ceilMinute = (t: number) => Math.max(1, Math.ceil(t / 60))

/**
 * Where a second of an engine's clock reads on the match clock. The engine's half is
 * `r.half` seconds long; the stoppage the engine itself adds stretches each period.
 * A taker of the last stretch reads as stoppage time on the match board.
 */
function clockOf(r: SimRun, t: number): { minute: number; added: number } {
  const half = r.half
  const a1 = r.engine.state.addedTime.firstHalf
  if (r.engine.state.period === 1) {
    if (t < half) return { minute: r.base1 + ceilMinute(t), added: 0 }
    return { minute: r.base1 + half / 60, added: Math.max(1, Math.ceil((t - half) / 60)) }
  }
  const e = t - (half + a1)
  if (e <= 0) return { minute: r.base2, added: Math.max(0, Math.ceil(-e / 60)) }
  if (e < half) return { minute: r.base2 + Math.max(1, Math.ceil(e / 60)), added: 0 }
  return { minute: r.base2 + half / 60, added: Math.max(1, Math.ceil((e - half) / 60)) }
}

/** Where a chunk may stop: the next minute boundary, or else the period's end. */
function chunkEnd(r: SimRun, until: number): number {
  const a = r.engine.state.addedTime
  if (r.engine.state.period === 1) return Math.min(until, r.half + a.firstHalf)
  return Math.min(until, r.length + a.secondHalf)
}

function advanceEngine(r: SimRun, until: number) {
  const engine = r.engine
  if (!engine.gameStarted) engine.start()
  const initialPeriod = engine.state.period
  while (engine.state.period !== "ended" && engine.state.time < until) {
    engine.tick()
    if (engine.state.period !== initialPeriod) break
  }
}

function setTime(state: MatchState, r: SimRun, t: number) {
  const { minute, added } = clockOf(r, t)
  state.minute = minute
  state.added = added
}

// ── The story: turning the engine's events into the match's ─────────────────

/** Which way a side attacks, on the pitch, in the period the engine is in. */
function dirOf(r: SimRun, side: TeamSide): 1 | -1 {
  return (side === "home") === (r.engine.state.period === 1) ? 1 : -1
}

/** Where y on the pitch puts an attack, from the attacking side's point of view. */
function laneOf(r: SimRun, side: TeamSide, y: number): Lane {
  const own = dirOf(r, side) > 0 ? y : 68 - y
  return own < 23 ? "left" : own > 45 ? "right" : "centre"
}

/** How deep into enemy ground an attack is, on thirds of the pitch. */
function depthOf(x: number): 1 | 2 | 3 {
  return x < 35 ? 1 : x < 70 ? 2 : 3
}

/** A player of the game, by the name the engine knows him under. */
function liveOf(state: MatchState, name: string | undefined): LivePlayer | undefined {
  if (!name) return undefined
  for (const s of ["home", "away"] as Side[]) {
    const p = sideOf(state, s).appeared.find((x) => x.id === name)
    if (p) return p
  }
  return undefined
}

/** What kind of shot it was, from the route it came down. */
function shotOf(ev: RealTimeMatchEvent): ShotType | undefined {
  const route = (ev.outcome ?? "").replace(/(_goal|_deflected_behind|_miss|_save)$/, "")
  if (ev.possession.setPieceOrigin === "free_kick") return "free-kick"
  if (/cross/.test(route)) return "header"
  if (/rebound/.test(route)) return "rebound"
  if (/one/.test(route) || /cutback/.test(route)) return "close"
  if (ev.fieldZones.includes("byline")) return "close"
  if (ev.fieldZones.includes("box") || ev.fieldZones.includes("final_third")) return "box"
  return "long"
}

/** How the chance came about, when it did not come from settled play. */
function moveOf(ev: RealTimeMatchEvent): "set-piece" | "counter" | "press" | undefined {
  if (ev.possession.setPieceOrigin) return "set-piece"
  return undefined
}

const scoreOf = (state: MatchState): [number, number] => [state.home.goals, state.away.goals]

/** A goal went in — on the run of play or from the spot, for either side. */
function markGoal(
  state: MatchState,
  r: SimRun,
  ev: RealTimeMatchEvent,
  out: MatchEvent[],
  kind: MatchEventKind,
  lane?: Lane,
  xg?: number
) {
  const side = ev.teamSide
  if (!side) return
  const scorer = liveOf(state, ev.player?.info.name)
  if (scorer) {
    scorer.goals++
    scorer.onTarget++
  }
  const s = sideOf(state, side)
  s.goals++
  s.stats.onTarget++
  s.stats.xg += xg ?? 0
  // The keeper it beat has it against him.
  const beaten = keeper(sideOf(state, other(side)))
  if (beaten) beaten.conceded++
  // The pass that set it up was the assist.
  if (scorer && r.lastPass && r.lastPass.side === side && r.lastPass.id !== scorer.id) {
    const made = liveOf(state, r.lastPass.id)
    if (made) made.assists++
  }
  r.lastPass = null
  emit(state, out, kind, side, {
    playerId: scorer?.id,
    score: scoreOf(state),
    lane,
    xg,
    shot: kind === "pen-goal" ? undefined : shotOf(ev),
    move: moveOf(ev),
  })
}

/** An attempt: the kick off, or where it fell short. */
function markShot(state: MatchState, r: SimRun, ev: RealTimeMatchEvent, out: MatchEvent[]) {
  const side = ev.teamSide
  if (!side) return
  const lane = laneOf(r, side, ev.position.y)
  const shot = shotOf(ev)
  const move = moveOf(ev)
  const s = sideOf(state, side)
  switch (ev.type) {
    case "shot": {
      const shooter = liveOf(state, ev.player?.info.name)
      // A pass that set the chance up was a key pass.
      if (shooter && r.lastPass && r.lastPass.side === side && r.lastPass.id !== shooter.id) {
        const made = liveOf(state, r.lastPass.id)
        if (made) made.keyPasses++
      }
      if (shooter) shooter.shots++
      s.stats.shots++
      s.stats.xg += ev.chanceQuality ?? 0
      emit(state, out, "attack", side, { playerId: shooter?.id, lane, shot, move })
      break
    }
    case "save": {
      const keeperP = liveOf(state, ev.player?.info.name)
      const shooter = liveOf(state, ev.secondaryPlayer?.info.name)
      if (shooter) shooter.onTarget++
      s.stats.onTarget++
      if (keeperP) keeperP.saves++
      sideOf(state, other(side)).stats.saves++
      emit(state, out, "shot-saved", side, {
        playerId: shooter?.id,
        otherId: keeperP?.id,
        lane,
        shot,
        move,
      })
      break
    }
    case "blocked_shot": {
      const blocker = liveOf(state, ev.player?.info.name)
      const shooter = liveOf(state, ev.secondaryPlayer?.info.name)
      if (blocker) blocker.tackles++
      emit(state, out, "shot-blocked", side, {
        playerId: shooter?.id,
        otherId: blocker?.id,
        lane,
        shot,
        move,
      })
      break
    }
    case "miss": {
      const shooter = liveOf(state, ev.player?.info.name)
      const behind = /deflected_behind/.test(ev.outcome ?? "")
      if (behind) s.stats.corners++
      const big = (ev.chanceQuality ?? 0) >= 0.3
      emit(state, out, big ? "big-chance-missed" : "shot-wide", side, {
        playerId: shooter?.id,
        lane,
        shot,
        xg: big ? ev.chanceQuality : undefined,
        move,
      })
      break
    }
  }
}

/** One stretch of the engine's decisions, in the game's own language. */
function story(state: MatchState, r: SimRun, out: MatchEvent[]) {
  const engine = r.engine
  const evs = engine.events
  let seen = r.seen
  while (seen < evs.length) {
    const ev = evs[seen++]
    r.seen = seen
    setTime(state, r, ev.time)
    const side: Side | null = ev.teamSide ?? null
    const lane = side ? laneOf(r, side, ev.position.y) : undefined
    switch (ev.type) {
      case "goal": {
        if (/^penalty/.test(ev.outcome ?? "")) break // the spot kick's own line covers it
        markGoal(state, r, ev, out, "goal", lane, ev.chanceQuality ?? 0)
        break
      }
      case "shot":
      case "save":
      case "miss":
      case "blocked_shot":
        markShot(state, r, ev, out)
        break
      case "penalty": {
        emit(state, out, "penalty-awarded", side, { playerId: ev.player?.info.name, lane })
        const taker = liveOf(state, ev.player?.info.name)
        if (side) {
          const s = sideOf(state, side)
          s.stats.shots++
          s.stats.xg += PEN_XG
          if (taker) taker.shots++
        }
        const saved = /save/.test(ev.outcome ?? "")
        if ((ev.outcome ?? "") === "goal") {
          markGoal(state, r, ev, out, "pen-goal", lane, PEN_XG)
        } else if (saved) {
          const keeperP = liveOf(state, ev.secondaryPlayer?.info.name)
          if (taker) taker.onTarget++
          if (side) {
            sideOf(state, side).stats.onTarget++
            sideOf(state, other(side)).stats.saves++
          }
          if (keeperP) keeperP.saves++
          emit(state, out, "pen-saved", side, { playerId: taker?.id, otherId: keeperP?.id, lane })
        } else {
          emit(state, out, "pen-miss", side, { playerId: taker?.id, lane })
        }
        break
      }
      case "foul": {
        const fouler = liveOf(state, ev.player?.info.name)
        const fouled = liveOf(state, ev.secondaryPlayer?.info.name)
        if (fouler) fouler.fouls++
        if (side) sideOf(state, side).stats.fouls++
        emit(state, out, "foul", side, { playerId: fouler?.id, otherId: fouled?.id })
        break
      }
      case "yellow_card": {
        const p = liveOf(state, ev.player?.info.name)
        if (!p || !side) break
        p.yellow++
        sideOf(state, side).stats.yellows++
        if (/second_yellow/.test(ev.outcome ?? "")) {
          bookGone(state, side, p.id)
          emit(state, out, "second-yellow", side, { playerId: p.id })
        } else {
          emit(state, out, "yellow", side, { playerId: p.id })
        }
        break
      }
      case "red_card": {
        if (!side || /second_yellow/.test(ev.outcome ?? "")) break // the yellow already told it
        const p = liveOf(state, ev.player?.info.name)
        if (p) {
          bookGone(state, side, p.id)
          emit(state, out, "red", side, { playerId: p.id })
        }
        break
      }
      case "injury": {
        const p = liveOf(state, ev.player?.info.name)
        if (!p) break
        const knock = (ev.outcome ?? "") === "knock"
        p.injured = true
        state.lost += 0.4
        if (state.setup.managed === side && !knock) state.pendingInjuries.push(p.id)
        emit(state, out, "injury", side, { playerId: p.id })
        break
      }
      case "substitution": {
        // The engine made a change; write it into the ledger the game keeps.
        const leavingId = ev.secondaryPlayer?.info.name
        const joiningId = ev.player?.info.name
        if (!side || !leavingId || !joiningId) break
        const s = sideOf(state, side)
        const leaving = s.pitch.find((x) => x.id === leavingId)
        const joining = s.bench.find((x) => x.id === joiningId)
        if (leaving && joining) bringOn(state, side, leaving, joining, out)
        break
      }
      case "tackle":
      case "interception": {
        const winner = liveOf(state, ev.player?.info.name)
        if (winner) winner.tackles++
        break
      }
      case "corner": {
        if (side) sideOf(state, side).stats.corners++
        emit(state, out, "corner", side, { lane })
        break
      }
      case "free_kick": {
        emit(state, out, "free-kick", side, { lane })
        break
      }
      case "half_time":
        endHalf(state, out)
        break
      case "full_time":
        endGame(state, out)
        break
    }
    // Time on the ball: every stretch goes to the side holding it.
    const posSide = ev.possession.teamSide
    if (posSide !== r.pos.side) {
      credit(r, ev.time, r.pos.side)
      r.pos.side = posSide
    }
  }
  credit(r, engine.state.time, r.pos.side)
}

/** Add the stretch the engine just played to whoever held the ball through it. */
function credit(r: SimRun, until: number, side: TeamSide | null) {
  const dt = until - r.pos.since
  r.pos.since = until
  if (!side || dt <= 0) return
  r.pos[side] += dt
}

/** A red, or a second yellow, takes the man from the pitch. */
function bookGone(state: MatchState, side: Side, id: string) {
  const s = sideOf(state, side)
  const p = s.pitch.find((x) => x.id === id)
  if (!p) return
  p.sentOff = true
  p.off ??= state.minute
  s.pitch = s.pitch.filter((x) => x.id !== id)
  s.stats.reds++
  refreshOutfield(s)
}

/** The half is over: the board reads the added minutes the engine played. */
function endHalf(state: MatchState, out: MatchEvent[]) {
  const r = run(state).sim
  const { added } = clockOf(r, r.half + r.engine.state.addedTime.firstHalf)
  state.addedTotal = added
  state.added = 0
  if (state.phase === "first-half") {
    state.ht = scoreOf(state)
    state.phase = "half-time"
    emit(state, out, "half-time", null)
  } else {
    state.phase = "et-half-time"
    emit(state, out, "et-half-time", null)
  }
}

/** The match's last minute is up: a winner, or extra time, or penalties. */
function endGame(state: MatchState, out: MatchEvent[]) {
  const r = run(state).sim
  const { added } = clockOf(r, r.engine.state.time)
  state.addedTotal = added
  state.added = 0
  const tie = goalDiff(state, "home") === 0
  if (state.phase === "second-half") {
    const ko = state.setup.knockout
    if (ko?.extraTime && tie) {
      state.ft = scoreOf(state)
      state.phase = "et-break"
      emit(state, out, "full-time", null)
    } else {
      state.phase = "done"
      emit(state, out, "full-time", null)
    }
    return
  }
  if (tie) {
    state.phase = "shootout"
    emit(state, out, "et-end", null)
    return
  }
  state.phase = "done"
  emit(state, out, "full-time", null)
}

// ── The picture of the pitch ────────────────────────────────────────────────

/** Every player on the pitch and the ball, mapped to screen coordinates (Home left, Away right). */
function frameOf(r: SimRun): SimFrame {
  const flip = r.engine.state.period === 2
  const toScreen = (x: number, y: number): Spot => ({
    x: ((flip ? 105 - x : x) / 105) * 100,
    y: ((flip ? 68 - y : y) / 68) * 100,
  })
  return {
    ball: toScreen(r.engine.state.ball.x, r.engine.state.ball.y),
    home: r.engine.state.players
      .filter((p) => p.side === "home" && p.onPitch)
      .map((p) => ({ id: p.player.info.name, ...toScreen(p.x, p.y) })),
    away: r.engine.state.players
      .filter((p) => p.side === "away" && p.onPitch)
      .map((p) => ({ id: p.player.info.name, ...toScreen(p.x, p.y) })),
  }
}

/** The live pitch: the simulator's real positions, for the screen. */
export function simFrame(state: MatchState): SimFrame | null {
  if (!isSim(state)) return null
  return frameOf(run(state).sim)
}

// ── The changes: what the manager does goes to the engine too ───────────────

/** The side's tactics, mirrored onto the engine. */
function pushTactics(state: MatchState, side: Side) {
  run(state).sim.engine.applyTacticalChange(
    side,
    simTacticsOf(sideOf(state, side).tactics) as Partial<SimTactics>,
    "manager_tactical_change"
  )
}

/** A substitution: the game's ledger first, then the engine's man off and on. */
export function simSubstitute(
  state: MatchState,
  s: Side,
  outId: string,
  inId: string,
  out: MatchEvent[] = []
): MatchEvent | null {
  const side = sideOf(state, s)
  const leaving = side.pitch.find((p) => p.id === outId)
  const joining = side.bench.find((p) => p.id === inId)
  if (!leaving || !joining) return null
  const ev = bringOn(state, s, leaving, joining, out)
  const r = run(state).sim
  const outer = r.engine.state.players.find((x) => x.player.info.name === outId)
  const inner = r.bench[s].find((x) => x.player.info.name === inId)
  if (outer && inner) {
    r.bench[s] = r.bench[s].filter((x) => x !== inner)
    outer.onPitch = false
    inner.onPitch = true
    inner.role = outer.role
    inner.x = outer.x
    inner.y = outer.y
    inner.target = { ...outer.target }
    inner.currentIntent = { ...outer.currentIntent }
    inner.actionCooldown = 1
    r.engine.state.players = r.engine.state.players.map((x) => (x === outer ? inner : x))
    if (r.engine.state.ball.owner === outer) r.engine.state.ball.owner = inner
  }
  return ev
}

/** An instruction or a shape change; the engine takes the new sheet. */
export function simTacticsChanged(state: MatchState, side: Side) {
  pushTactics(state, side)
}

/** A player slid into another role; the engine moves him to the slot's place. */
export function simRoleChange(state: MatchState, playerId: string, slot: Position) {
  run(state).sim.engine.applyRoleChange(playerId, SIM_POS[slot] ?? SimPos.CB, "manager_role_change")
}

// ── One minute of play ──────────────────────────────────────────────────────

/**
 * Play the next stretch of the match: advance the engine by up to a minute of its own
 * clock, then read whatever it decided. Returns this stretch's events.
 */
export function simStep(state: MatchState): MatchEvent[] {
  const out: MatchEvent[] = []
  if (state.phase === "done") return out
  if (state.phase === "half-time") {
    state.phase = "second-half"
    state.minute = 45
    state.added = 0
    emit(state, out, "second-half", null)
    return out
  }
  if (state.phase === "et-break") {
    state.phase = "et-first"
    state.minute = 90
    state.added = 0
    etRun(state)
    emit(state, out, "et-start", null)
    return out
  }
  if (state.phase === "et-half-time") {
    state.phase = "et-second"
    state.minute = 105
    state.added = 0
    emit(state, out, "et-second-half", null)
    return out
  }
  if (state.phase === "shootout") {
    playShootout(state, out)
    return out
  }

  const r = run(state).sim
  // In play: advance the engine to the end of the next minute (or the period's end).
  advanceEngine(r, chunkEnd(r, r.engine.state.time + 60))
  story(state, r, out)
  syncFrame(state, r)
  refreshMinute(state)
  return out
}

/** The legs the engine wears down are the game's own, and the ball's place with them. */
function syncFrame(state: MatchState, r: SimRun) {
  for (const s of ["home", "away"] as Side[]) {
    const side = sideOf(state, s)
    for (const p of side.pitch) {
      const sp = r.engine.state.players.find((x) => x.player.info.name === p.id)
      if (sp) p.stamina = Math.max(0, Math.round(sp.stamina))
    }
    side.possessionMinutes = r.pos[s] / 60
  }
  const ball = r.engine.state.ball
  const posSide = r.engine.state.possession.teamSide ?? ball.lastTouchSide
  if (posSide) {
    const x = dirOf(r, posSide) > 0 ? ball.x : 105 - ball.x
    state.ball = { side: posSide, lane: laneOf(r, posSide, ball.y), depth: depthOf(x) }
  }
}

// ── The end ─────────────────────────────────────────────────────────────────

/** Play whatever is left of the match without stopping, in bigger strides. */
export function simPlayToEnd(state: MatchState): void {
  state.setup.managed = null
  state.pendingInjuries = []
  const r = run(state).sim
  // From here on the AI is on both benches, so give the engine back its hands.
  r.engine.state.bench.home = r.bench.home
  r.engine.state.bench.away = r.bench.away
  let guard = 0
  while (state.phase !== "done" && guard++ < 200) {
    run(state).sim.engine.tickSeconds = 1
    simStep(state)
  }
  run(state).sim.engine.tickSeconds = 0.25
}
