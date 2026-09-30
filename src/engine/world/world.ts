/**
 * The world: every nation, player, competition and fixture, moved forward one day at
 * a time. Pure engine code — the app's store owns an instance and persists `state`.
 *
 * `advance()` runs days until something needs the user (his call-up is due, his team
 * plays, a job event) and returns that interrupt.
 */
import type { Club, Confed, ISODate, NationDef, Player } from "../types"
import type { CompContext } from "../competition/runtime"
import { advanceCompetition, createInstance } from "../competition/runtime"
import { COMPETITION_DEFS, competitionDef } from "../competition/defs"
import type {
  CompactResult,
  CompetitionInstance,
  Fixture,
  FixtureEvent,
  Importance,
} from "../competition/types"
import { addDays, daysBetween, yearOf } from "../calendar/dates"
import { windowNear, windowsForYear, type MatchWindow } from "../calendar/windows"
import { deriveSeed, makeRng, pick, shuffle, streamFor } from "../rng"
import { playMatch } from "../match/engine"
import type { MatchReport, SheetSlot, Side, Tactics, TeamSheet } from "../match/types"
import { advise, scoutReport, type ScoutReport } from "../match/scouting"
import { suggestedRole, validRole } from "../match/roles"
import { archetypeOf } from "../players/archetypes"
import { rankingUpdate } from "../ranking"
import {
  aiMentality,
  aiTeamSheet,
  available,
  pickBench,
  pickSquad,
  pickTakers,
  squadStrength,
} from "../ai/squad"
import { FORMATIONS } from "../match/formations"
import { matchAbility, positionFit } from "../players/ability"
import { ageOn, fullName } from "../players/ability"
import { indexClubs, showcased, summerMove, type ClubIndex } from "../players/clubs"
import { nationTop } from "../players/quality"
import {
  isPlaceholder,
  makePlaceholder,
  parsePlaceholder,
  placeholderConfed,
  placeholderLabel,
} from "../competition/placeholders"
import {
  baselineReputation,
  ensureFederation,
  homeBoost,
  initialStadium,
  reputationAfter,
  yearlyFederation,
} from "./federation"
import {
  completeProjects,
  ensureStadiums,
  hostCheck,
  hostLevelOf,
  hostRequirement,
  initialStadiums,
  prepareToHost,
  stadiumLevel,
  withProjects,
  yearlyInvestment,
  type HostLevel,
} from "./stadiums"
import {
  clubWeek,
  developSeason,
  intakeSize,
  intlRetirementChance,
  matchInjury,
  newgen,
  retirementChance,
} from "../players/lifecycle"
import type {
  FriendlyChoice,
  Interrupt,
  NationState,
  NewsItem,
  NewsKind,
  UserTeam,
  WorldState,
} from "./types"
import {
  afterCompetition,
  afterUserResult,
  checkContract,
  checkObjectives,
  ensureCareer,
  expireOffers,
  monthlyDrift,
  playerMoments,
  refreshObjectives,
  setAmbition,
  youthObjective,
} from "../career/career"
import { checkMilestones } from "../career/milestones"

export interface WorldStatics {
  nations: NationDef[]
  clubs: Club[]
}

const DECISIVE_IMPORTANCE: Importance[] = [
  "continental-ko",
  "world-cup-ko",
  "nations-league-finals",
]
const SQUAD_KEY_TOURNAMENT = new Set(["world-cup", "continental", "regional", "super-cup"])

/**
 * The user's nation plays and grows a little above its means, so good management
 * shows: a small lift in ability points in every match, and faster development.
 */
export const USER_EDGE = { match: 0.8, growth: 0.15 } as const

export class World {
  state: WorldState
  readonly defs = new Map<string, NationDef>()
  readonly clubs = new Map<string, Club>()
  readonly clubIndex: ClubIndex
  private byDate = new Map<ISODate, string[]>()
  private busyIndex = new Set<string>()
  private poolIndex = new Map<string, string[]>()
  private strengthCache = new Map<string, number>()
  /** nation|window → squad key, cleared whenever fixtures are added. */
  private periodCache = new Map<string, string>()

  constructor(state: WorldState, statics: WorldStatics) {
    this.state = state
    for (const n of statics.nations) this.defs.set(n.id, n)
    for (const c of statics.clubs) this.clubs.set(c.id, c)
    this.clubIndex = indexClubs(statics.clubs)
    for (const n of Object.values(state.nations)) {
      ensureFederation(n)
      ensureStadiums(n, this.defs.get(n.id), state.date)
    }
    this.reindex()
    ensureCareer(this)
    this.settleHeldFriendlies()
  }

  // ── Indexes ───────────────────────────────────────────────────────────────

  reindex() {
    this.byDate.clear()
    this.busyIndex.clear()
    for (const f of Object.values(this.state.fixtures)) this.indexFixture(f)
    this.poolIndex.clear()
    for (const p of Object.values(this.state.players)) this.addToPool(p)
  }

  private indexFixture(f: Fixture) {
    this.periodCache.clear()
    const list = this.byDate.get(f.date)
    if (list) list.push(f.id)
    else this.byDate.set(f.date, [f.id])
    this.busyIndex.add(`${f.home}|${f.date}`)
    this.busyIndex.add(`${f.away}|${f.date}`)
  }

  private addToPool(p: Player) {
    const list = this.poolIndex.get(p.nationId)
    if (list) list.push(p.id)
    else this.poolIndex.set(p.nationId, [p.id])
  }

  pool(nationId: string): Player[] {
    return (this.poolIndex.get(nationId) ?? []).map((id) => this.state.players[id]).filter(Boolean)
  }

  player(id: string): Player {
    return this.state.players[id]
  }

  nation(id: string): NationState {
    return this.state.nations[id] ?? placeholderNation(id)
  }

  /** A nation's static facts; a placeholder gets a stand-in with its label as name. */
  def(id: string): NationDef {
    return this.defs.get(id) ?? placeholderDef(id)
  }

  /** FIFA ranking position, or 0 for a team outside FIFA. */
  fifaRank(id: string): number {
    if (this.def(id).nonFifa) return 0
    return (
      this.ctx()
        .ranked((t) => !this.def(t).nonFifa)
        .indexOf(id) + 1
    )
  }

  fixturesOn(date: ISODate): Fixture[] {
    return (this.byDate.get(date) ?? []).map((id) => this.state.fixtures[id]).filter(Boolean)
  }

  fixturesOf(nationId: string, from?: ISODate, to?: ISODate): Fixture[] {
    return Object.values(this.state.fixtures)
      .filter(
        (f) =>
          (f.home === nationId || f.away === nationId) &&
          (!from || f.date >= from) &&
          (!to || f.date <= to)
      )
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  }

  get userNation(): string | null {
    return this.state.career.nationId
  }

  // ── Competition context ───────────────────────────────────────────────────

  ctx(): CompContext {
    const s = this.state
    return {
      date: s.date,
      seed: s.seed,
      confedOf: (t) =>
        isPlaceholder(t) ? (placeholderConfed(t) as Confed) : (this.def(t)?.confed ?? "UEFA"),
      subFeds: (t) => this.def(t)?.subFeds ?? [],
      points: (t) => s.nations[t]?.points ?? 0,
      ranked: (filter) =>
        Object.values(s.nations)
          .filter((n) => !this.def(n.id).banned && (!filter || filter(n.id)))
          .sort((a, b) => b.points - a.points)
          .map((n) => n.id),
      fifa: (t) => !this.def(t).nonFifa,
      confedMember: (t) => this.def(t).nonFifa !== "regional",
      instance: (id) => s.competitions[id],
      fixture: (id) => s.fixtures[id],
      addFixture: (f) => {
        s.fixtures[f.id] = f
        this.indexFixture(f)
      },
      busy: (team, date) =>
        this.busyIndex.has(`${team}|${date}`) ||
        this.busyIndex.has(`${team}|${addDays(date, -1)}`) ||
        this.busyIndex.has(`${team}|${addDays(date, 1)}`),
      stature: (t) => (s.nations[t]?.reputation ?? 5) * (s.nations[t]?.stadium ?? 3),
      readiness: (teams, level) => this.hostReadiness(teams, level),
      bid: (t, level) => t === s.career.nationId && !!s.career.bids?.includes(level),
      busyBetween: (team, from, to) => {
        for (let d = from; d <= to; d = addDays(d, 1))
          if (this.busyIndex.has(`${team}|${d}`)) return true
        return false
      },
    }
  }

  /**
   * How far these nations' grounds together — counting what they are building —
   * meet a tournament level's requirements (the first nation's confederation's).
   */
  hostReadiness(teams: string[], level: HostLevel): number {
    const first = teams.find((t) => this.state.nations[t])
    if (!first) return 0
    const req = hostRequirement(level, this.def(first).confed)
    const grounds = teams.flatMap((t) =>
      this.state.nations[t] ? withProjects(this.state.nations[t]) : []
    )
    return hostCheck(grounds, req).score
  }

  /** Create the editions that are due (and not already over). */
  ensureCompetitions() {
    const ctx = this.ctx()
    const year = yearOf(this.state.date)
    for (const def of COMPETITION_DEFS) {
      for (const y of def.editions(year - 4, year + 7)) {
        const id = `${def.id}-${y}`
        if (this.state.competitions[id]) continue
        const inst = createInstance(def, y, ctx)
        const firstDraw = def.plan(inst, ctx)[0]?.drawDate ?? inst.start
        if (inst.end < this.state.date) continue
        // Hosts are chosen years ahead, so finals exist (and are announced) early;
        // qualifying competitions appear about a year before their first draw.
        const early =
          inst.kind === "qualifier"
            ? daysBetween(this.state.date, firstDraw) > 420
            : daysBetween(this.state.date, inst.start) > 6 * 365
        if (early) continue
        this.state.competitions[id] = inst
        this.announceHosts(inst)
      }
    }
  }

  /** Run draws and progress that are due without moving the date. */
  nextDayCompetitionsOnly() {
    this.advanceCompetitions()
  }

  private advanceCompetitions(onlyId?: string) {
    const ctx = this.ctx()
    for (const inst of Object.values(this.state.competitions)) {
      if (inst.status === "done") continue
      if (onlyId && inst.id !== onlyId) continue
      const def = competitionDef(inst.defId)
      const wasDrawn = inst.stages.map((s) => s.status)
      advanceCompetition(inst, def, ctx)
      inst.stages.forEach((s, i) => {
        if (wasDrawn[i] === "waiting" && s.status !== "waiting") this.onDraw(inst.id, s.key)
      })
      if ((inst.status as string) === "done") this.onCompetitionDone(inst.id)
    }
  }

  // ── The day ───────────────────────────────────────────────────────────────

  /**
   * Run days until the user is needed or `maxDays` pass. The user's own fixtures
   * and call-ups stop the loop; everything else plays itself.
   */
  advance(maxDays = 60): Interrupt {
    const waiting = this.pendingInterrupt()
    if (waiting) return waiting
    for (let i = 0; i < maxDays; i++) {
      const due = this.userMatchDue()
      if (due) return { kind: "match", fixtureId: due.id }
      this.nextDay()
      const next = this.pendingInterrupt()
      if (next) return next
      const match = this.userMatchDue()
      if (match) return { kind: "match", fixtureId: match.id }
      if (this.state.career.offers.length && this.state.career.nationId === null)
        return { kind: "offer" }
    }
    return { kind: "none" }
  }

  /**
   * What the user must see or decide before the calendar moves on, most pressing
   * first: his squad, his draw, the end of a competition or of his job, a warning,
   * then news and choices.
   */
  pendingInterrupt(): Interrupt | null {
    const s = this.state
    if (s.pendingCallup) return s.pendingCallup
    if (s.pendingDraw) return { kind: "draw", ...s.pendingDraw }
    if (s.pendingReview) return { kind: "review", id: s.pendingReview }
    if (s.pendingSacked) return { kind: "sacked" }
    if (s.pendingUltimatum) return { kind: "ultimatum" }
    if (s.pendingOffer) return { kind: "offer", nationId: s.pendingOffer }
    if (s.pendingHosting) return { kind: "hosting", compId: s.pendingHosting }
    const board = s.career.objectives.find((o) => o.agreed === false)
    if (board) return { kind: "board", objectiveId: board.id }
    if (s.pendingIntake) return { kind: "intake" }
    return null
  }

  /**
   * Answer an interrupt the way the assistant would: agree objectives as asked
   * and close anything that is only news. The
   * user's squad and matches are not settled here. Returns whether it was.
   */
  settle(i: Interrupt): boolean {
    switch (i.kind) {
      case "draw":
        this.clearDraw()
        return true
      case "offer":
        this.clearOffer()
        return true
      case "hosting":
        this.clearHosting()
        return true
      case "review":
        this.clearReview()
        return true
      case "sacked":
        this.clearSacked()
        return true
      case "ultimatum":
        this.clearUltimatum()
        return true
      case "board":
        setAmbition(this, i.objectiveId, 0)
        return true
      case "intake":
        this.clearIntake()
        return true
      default:
        return false
    }
  }

  /** The user's unplayed match today, if any. */
  userMatchDue(): Fixture | null {
    const me = this.userNation
    if (!me) return null
    return (
      this.fixturesOn(this.state.date).find((f) => !f.result && (f.home === me || f.away === me)) ??
      null
    )
  }

  /** Play everything left today, move to tomorrow and run tomorrow's events. */
  nextDay() {
    const s = this.state
    this.catchUp()
    for (const f of this.fixturesOn(s.date)) {
      if (f.result || this.isUserFixture(f) || isPlaceholder(f.home) || isPlaceholder(f.away))
        continue
      this.playAi(f)
    }
    this.advanceCompetitions()

    s.date = addDays(s.date, 1)
    const date = s.date
    const [, m, d] = date.split("-").map(Number)

    if (d === 1 && (m === 1 || m === 7)) this.ensureCompetitions()
    this.advanceCompetitions()
    if (d === 1) {
      this.monthEnd()
      this.openStadiums()
      monthlyDrift(this)
      // Objectives with a deadline (debuts by the year's end) are judged by date.
      checkObjectives(this)
      refreshObjectives(this)
      checkMilestones(this, true)
    }
    expireOffers(this)
    checkContract(this)
    if (m === 1 && d === 1) this.yearTurn()
    if (m === 7 && d === 1) this.seasonRollover()
    if (new Date(date + "T00:00:00Z").getUTCDay() === 1) this.clubWeek()
    this.planFriendlies()
    this.callUps()
  }

  /**
   * Safety net: a fixture left behind in the past (never expected, but a stuck
   * competition would stall the world for good) is moved to today.
   */
  private catchUp() {
    if (this.state.date.endsWith("-01") === false) return
    for (const f of Object.values(this.state.fixtures)) {
      if (f.result || f.date >= this.state.date) continue
      f.date = this.state.date
      this.indexFixture(f)
    }
  }

  private isUserFixture(f: Fixture) {
    const me = this.userNation
    return !!me && (f.home === me || f.away === me)
  }

  // ── Friendlies ────────────────────────────────────────────────────────────

  private planFriendlies() {
    const date = this.state.date
    // Three and a half weeks before each window, fill everyone's free dates.
    for (const w of [...windowsForYear(yearOf(date)), ...windowsForYear(yearOf(date) + 1)]) {
      if (addDays(w.start, -24) !== date) continue
      this.arrangeFriendlies(w)
    }
  }

  /**
   * How much two nations have seen of each other lately, as a score penalty: each
   * meeting in the last two years, and more for a friendly in the last eight months.
   */
  private recentPenalty(a: string, b: string): number {
    const date = this.state.date
    let penalty = 0
    for (const r of this.state.nations[a]?.results ?? []) {
      if (r.opp !== b) continue
      const days = daysBetween(r.date, date)
      if (days <= 730) penalty += 220
      if (r.comp === "Friendly" && days <= 240) penalty += 400
    }
    return penalty
  }

  arrangeFriendlies(w: MatchWindow) {
    const ctx = this.ctx()
    const rng = streamFor(this.state.seed, "friendlies", w.id)
    const nations = ctx.ranked()
    const live = Object.values(this.state.competitions).filter((c) => c.status !== "done")
    const me = this.userNation
    for (const slot of w.slots) {
      const reserved = new Set(
        live.flatMap((c) => competitionDef(c.defId).reserved?.(c, ctx, slot) ?? [])
      )
      const free = shuffle(
        rng,
        nations.filter(
          (n) =>
            !ctx.busy(n, slot) &&
            !reserved.has(n) &&
            (n === me || rng() < (this.state.nations[n].points > 1150 ? 0.9 : 0.65))
        )
      )
      const taken = new Set<string>()
      for (const a of free) {
        if (taken.has(a)) continue
        const confed = this.def(a).confed
        const pa = this.state.nations[a].points
        const options = free
          .filter((b) => b !== a && !taken.has(b))
          .map((b) => ({
            b,
            score:
              Math.abs(this.state.nations[b].points - pa) +
              (this.def(b).confed === confed ? 0 : 110) +
              this.recentPenalty(a, b) +
              rng() * 120,
          }))
          .sort((x, y) => x.score - y.score)
        if (!options.length) continue
        const b = pick(rng, options.slice(0, 5)).b
        taken.add(a)
        taken.add(b)
        const home =
          rng() < 0.5 + (this.state.nations[a].points - this.state.nations[b].points) / 2000
        this.addFriendly(slot, home ? a : b, home ? b : a)
      }
    }
  }

  private addFriendly(slot: ISODate, home: string, away: string) {
    this.ctx().addFixture({
      id: `friendly:${slot}:${home}`,
      compId: "friendly",
      stage: "friendly",
      label: "International friendly",
      date: slot,
      home,
      away,
      atHome: true,
      importance: "friendly",
    })
  }

  /**
   * Saves from when the user picked friendly opponents may still hold dates
   * waiting for a pick: the federation takes the first on each list, and the
   * teams passed over are paired up among themselves.
   */
  private settleHeldFriendlies() {
    const held = this.state.pendingFriendly ?? []
    delete this.state.pendingFriendly
    for (const choice of held) this.settleHeldFriendly(choice)
  }

  private settleHeldFriendly(choice: FriendlyChoice) {
    const { slot } = choice
    const me = this.userNation
    const ctx = this.ctx()
    const taken = choice.options[0]
    const rest = choice.options.slice(1).map((o) => o.nationId)
    if (me && taken && !ctx.busy(me, slot) && !ctx.busy(taken.nationId, slot))
      this.addFriendly(slot, taken.home ? me : taken.nationId, taken.home ? taken.nationId : me)
    // The two closest of the rest still get a match.
    const free = rest.filter((n) => !ctx.busy(n, slot))
    const pts = (n: string) => this.state.nations[n].points
    let pair: [string, string] | null = null
    for (let i = 0; i < free.length; i++)
      for (let j = i + 1; j < free.length; j++)
        if (!pair || Math.abs(pts(free[i]) - pts(free[j])) < Math.abs(pts(pair[0]) - pts(pair[1])))
          pair = [free[i], free[j]]
    if (pair) {
      const [a, b] = pts(pair[0]) >= pts(pair[1]) ? pair : [pair[1], pair[0]]
      this.addFriendly(slot, a, b)
    }
  }

  // ── Call-ups ──────────────────────────────────────────────────────────────

  /**
   * The key a squad is named under for a fixture: its tournament, or its window —
   * unless the nation plays a tournament starting within a few weeks of that
   * window, in which case the warm-up friendlies use the tournament squad too. One
   * squad per period, named once.
   */
  squadKey(f: Fixture, nationId: string): string {
    const inst = this.state.competitions[f.compId]
    if (inst && SQUAD_KEY_TOURNAMENT.has(inst.kind)) return inst.id
    const w = windowNear(f.date)
    if (!w) return f.compId
    const cacheKey = `${nationId}|${w.id}`
    let key = this.periodCache.get(cacheKey)
    if (key === undefined) {
      key = w.id
      for (let d = w.start; d <= addDays(w.end, 25) && key === w.id; d = addDays(d, 1)) {
        for (const g of this.fixturesOn(d)) {
          if (g.home !== nationId && g.away !== nationId) continue
          const t = this.state.competitions[g.compId]
          if (t && SQUAD_KEY_TOURNAMENT.has(t.kind)) {
            key = t.id
            break
          }
        }
      }
      this.periodCache.set(cacheKey, key)
    }
    return key
  }

  private callUps() {
    const date = this.state.date
    const horizon = addDays(date, 10)
    const due = new Map<string, { key: string; label: string; first: ISODate; comp?: string }>()
    for (let d = date; d <= horizon; d = addDays(d, 1)) {
      for (const f of this.fixturesOn(d)) {
        if (f.result) continue
        for (const n of [f.home, f.away]) {
          if (isPlaceholder(n)) continue
          const key = this.squadKey(f, n)
          if (this.state.nations[n].squadFor === key || due.has(n)) continue
          const inst = this.state.competitions[key]
          due.set(n, {
            key,
            label: inst ? inst.name : "International window",
            first: f.date,
            comp: inst?.id,
          })
        }
      }
    }
    for (const [n, info] of due) {
      if (n === this.userNation) {
        this.state.pendingCallup = {
          kind: "callup",
          nationId: n,
          squadFor: info.key,
          label: info.label,
          deadline: info.first,
          size: 26,
        }
        continue
      }
      this.aiCallUp(n, info.key, info.comp)
    }
  }

  /** Clubs keep their players for matches outside FIFA dates, unless they play at home. */
  released(p: Player, compId?: string): boolean {
    const inst = compId ? this.state.competitions[compId] : undefined
    if (!inst?.offWindow) return true
    const club = this.clubs.get(p.clubId)
    return !club || club.tier >= 3 || club.nationId === p.nationId
  }

  aiCallUp(nationId: string, key: string, compId?: string) {
    const n = this.state.nations[nationId]
    const squad = pickSquad(this.pool(nationId), this.state.date, 26, n.squad, (p) =>
      this.released(p, compId)
    )
    this.setSquad(nationId, key, squad)
  }

  /** Name a squad (AI or user). Records the call for each player. */
  setSquad(nationId: string, key: string, ids: string[]) {
    const n = this.state.nations[nationId]
    const dropped = n.squad.filter((id) => !ids.includes(id))
    n.squad = ids
    n.squadFor = key
    for (const id of ids) {
      const p = this.state.players[id]
      if (!p) continue
      p.lastCall = this.state.date
      p.morale = Math.min(100, p.morale + 4)
    }
    for (const id of dropped) {
      const p = this.state.players[id]
      if (p) p.morale = Math.max(0, p.morale - 6)
    }
    this.strengthCache.delete(nationId)
    if (nationId === this.userNation) this.state.pendingCallup = null
  }

  private squadFor(nationId: string, f: Fixture): Player[] {
    const n = this.state.nations[nationId]
    const key = this.squadKey(f, nationId)
    if (n.squadFor !== key) this.aiCallUp(nationId, key, f.compId)
    return n.squad.map((id) => this.state.players[id]).filter(Boolean)
  }

  strengthOf(nationId: string): number {
    let v = this.strengthCache.get(nationId)
    if (v === undefined) {
      const n = this.state.nations[nationId]
      const squad = n.squad.length
        ? n.squad.map((id) => this.state.players[id]).filter(Boolean)
        : this.pool(nationId)
      v = squadStrength(squad, this.state.date)
      this.strengthCache.set(nationId, v)
    }
    return v
  }

  // ── Matches ───────────────────────────────────────────────────────────────

  /** Team sheet an AI coach sends out for this fixture. */
  aiSheet(nationId: string, f: Fixture): TeamSheet {
    return this.sheetFrom(nationId, f, this.squadFor(nationId, f))
  }

  private sheetFrom(nationId: string, f: Fixture, squad: Player[]): TeamSheet {
    const opp = nationId === f.home ? f.away : f.home
    const mentality = aiMentality(this.strengthOf(nationId), this.strengthOf(opp))
    return aiTeamSheet(
      nationId,
      squad.filter((p) => !p.banned),
      f.date,
      { mentality },
      this.state.nations[nationId].formation
    )
  }

  /**
   * The sheet an opponent is expected to send out. Squads are named ten days before a
   * match, so earlier than that the staff can only say who would be picked today; nothing
   * is named or changed by looking.
   */
  expectedSheet(nationId: string, f: Fixture): TeamSheet {
    const n = this.state.nations[nationId]
    if (n.squadFor === this.squadKey(f, nationId)) return this.aiSheet(nationId, f)
    const ids = pickSquad(this.pool(nationId), f.date, 26, n.squad, (p) =>
      this.released(p, f.compId)
    )
    return this.sheetFrom(
      nationId,
      f,
      ids.map((id) => this.state.players[id])
    )
  }

  /** The staff's report on the user's opponent, against the tactics he would play. */
  scout(f: Fixture, mine?: Tactics): ScoutReport | null {
    const me = this.userNation
    if (!me || (f.home !== me && f.away !== me)) return null
    const opp = f.home === me ? f.away : f.home
    const sheet = this.expectedSheet(opp, f)
    const tactics = mine ?? this.state.userTeam?.tactics ?? this.expectedSheet(me, f).tactics
    return scoutReport(sheet, tactics, (id) => this.state.players[id])
  }

  /**
   * The user's team with the staff's recommended instructions against this opponent, to
   * save as his own; null when his set-up already suits them.
   */
  adviceFor(f: Fixture): UserTeam | null {
    const me = this.userNation
    if (!me) return null
    const sheet = this.userSheet(f)
    const opp = f.home === me ? f.away : f.home
    const advice = advise(sheet.tactics, this.expectedSheet(opp, f).tactics)
    if (!advice.changes.length) return null
    return {
      tactics: { ...sheet.tactics, ...advice.patch },
      xi: sheet.xi,
      bench: sheet.bench,
      captainId: sheet.captainId,
      penaltyTakerId: sheet.penaltyTakerId,
      setPieceTakerId: sheet.setPieceTakerId,
    }
  }

  /**
   * The sheet the user's assistant sends out when he picks the team: the eleven and
   * tactics of an AI coach, with the instructions the staff recommend against this
   * opponent.
   */
  assistantSheet(f: Fixture): TeamSheet {
    const me = this.userNation!
    const sheet = this.aiSheet(me, f)
    const opp = f.home === me ? f.away : f.home
    const advice = advise(sheet.tactics, this.expectedSheet(opp, f).tactics)
    return { ...sheet, tactics: { ...sheet.tactics, ...advice.patch } }
  }

  /**
   * What is wrong with the user's saved eleven for a fixture: empty positions, and
   * players who are not in the squad, injured or suspended. Empty when there is no
   * saved eleven (the best available is picked for him).
   */
  lineupProblems(f: Fixture): string[] {
    const me = this.userNation
    const ut = this.state.userTeam
    if (!me || !ut) return []
    const squad = new Set(this.state.nations[me].squad)
    const out: string[] = []
    FORMATIONS[ut.tactics.formation].forEach((pos, i) => {
      const id = ut.xi[i]?.playerId
      const p = id ? this.state.players[id] : undefined
      if (!p) return out.push(`No one is playing ${pos}`)
      const name = `${p.first} ${p.last}`
      if (!squad.has(p.id)) out.push(`${name} (${pos}) is not in the squad`)
      else if (p.injury && p.injury.until > f.date)
        out.push(`${name} (${pos}) is injured (${p.injury.label})`)
      else if (p.banned) out.push(`${name} (${pos}) is suspended`)
    })
    return out
  }

  /** Players the user can pick for a fixture: his squad, fit and not suspended. */
  userSquad(f: Fixture): Player[] {
    const me = this.userNation!
    return this.squadFor(me, f).filter((p) => !p.banned && available(p, f.date))
  }

  /**
   * The user's sheet for a fixture: his saved eleven where those players are still
   * available, the best fits for any gaps, and his instructions.
   */
  userSheet(f: Fixture): TeamSheet {
    const me = this.userNation!
    const squad = this.userSquad(f)
    const ut = this.state.userTeam
    if (!ut) return this.aiSheet(me, f)
    const ids = new Set(squad.map((p) => p.id))
    const roles = FORMATIONS[ut.tactics.formation]
    const used = new Set<string>()
    const xi = roles.map((pos, i): SheetSlot | null => {
      const pick = ut.xi[i]
      if (pick && ids.has(pick.playerId) && !used.has(pick.playerId)) {
        used.add(pick.playerId)
        return {
          playerId: pick.playerId,
          pos,
          role: validRole(pick.role, pos) ? pick.role : undefined,
        }
      }
      return null
    })
    xi.forEach((slot, i) => {
      if (slot) return
      const pos = roles[i]
      const best = squad
        .filter((p) => !used.has(p.id))
        .sort(
          (a, b) => matchAbility(b) * positionFit(b, pos) - matchAbility(a) * positionFit(a, pos)
        )[0]
      if (best) {
        used.add(best.id)
        xi[i] = { playerId: best.id, pos, role: suggestedRole(archetypeOf(best), pos) }
      }
    })
    const sheetXi = xi.filter((s): s is SheetSlot => !!s)
    const bench = [
      ...ut.bench.filter((id) => ids.has(id) && !used.has(id)),
      ...pickBench(squad, sheetXi, f.date),
    ]
    const takers = pickTakers(squad, sheetXi)
    const onPitch = (id?: string) => (id && used.has(id) ? id : undefined)
    return {
      nationId: me,
      xi: sheetXi,
      bench: [...new Set(bench)].slice(0, 12),
      tactics: { ...ut.tactics },
      captainId: onPitch(ut.captainId) ?? takers.captainId,
      penaltyTakerId: onPitch(ut.penaltyTakerId) ?? takers.penaltyTakerId,
      setPieceTakerId: onPitch(ut.setPieceTakerId) ?? takers.setPieceTakerId,
    }
  }

  /** Aggregate going into a second leg, from that match's home side. */
  aggregateFor(f: Fixture): [number, number] | undefined {
    if (!f.knockout || f.knockout.leg !== 2) return undefined
    const first = this.state.fixtures[f.id.replace(/:2$/, ":1")]
    if (!first?.result) return undefined
    return [first.result.a, first.result.h]
  }

  matchSetup(f: Fixture, home: TeamSheet, away: TeamSheet) {
    const me = this.userNation
    const side: Side | null = !me ? null : f.home === me ? "home" : f.away === me ? "away" : null
    return {
      edge: side ? { side, value: USER_EDGE.match } : undefined,
      id: f.id,
      date: f.date,
      home,
      away,
      player: (id: string) => this.state.players[id],
      homeAdvantage: f.atHome,
      homeBoost: homeBoost(this.state.nations[f.home]?.stadium ?? 3),
      knockout: f.knockout?.decisive
        ? { aggregate: this.aggregateFor(f), extraTime: true }
        : undefined,
      bigMatch: DECISIVE_IMPORTANCE.includes(f.importance) || f.importance === "world-cup",
      seed: deriveSeed(this.state.seed, "match", f.id),
    }
  }

  private playAi(f: Fixture) {
    const report = playMatch(this.matchSetup(f, this.aiSheet(f.home, f), this.aiSheet(f.away, f)))
    this.applyReport(f, report, false)
  }

  /** Record a finished match: result, players, ranking, competition. */
  applyReport(f: Fixture, report: MatchReport, keepFull: boolean) {
    const s = this.state
    const r = report.result
    const result: CompactResult = { h: r.home, a: r.away, ht: r.ht }
    if (r.ft) result.ft = r.ft
    if (r.pens) result.pens = r.pens
    if (r.winner) result.w = r.winner
    f.result = result

    const events: FixtureEvent[] = []
    const rng = streamFor(s.seed, "after", f.id)
    for (const e of report.events) {
      const side = e.side === "home" ? 0 : 1
      if (e.kind === "goal" || e.kind === "pen-goal" || e.kind === "own-goal") {
        events.push({
          m: e.minute,
          k: e.kind === "goal" ? "g" : e.kind === "pen-goal" ? "pg" : "og",
          s: side,
          p: e.playerId,
          a: e.otherId,
        })
      } else if (e.kind === "red" || e.kind === "second-yellow") {
        events.push({ m: e.minute, k: "r", s: side, p: e.playerId })
        const p = e.playerId ? s.players[e.playerId] : undefined
        if (p) p.banned = 1
      } else if (e.kind === "injury") {
        events.push({ m: e.minute, k: "i", s: side, p: e.playerId })
        const p = e.playerId ? s.players[e.playerId] : undefined
        if (p) matchInjury(p, f.date, rng)
      } else if (keepFull && e.kind === "yellow") {
        events.push({ m: e.minute, k: "y", s: side, p: e.playerId })
      }
    }
    f.events = events
    if (keepFull) s.reports[f.id] = report

    // Players: debuts and landmarks, then caps, goals, minutes and bans served.
    if (this.isUserFixture(f)) playerMoments(this, f, report)
    for (const line of report.lines) {
      const p = s.players[line.playerId]
      if (!p) continue
      p.caps++
      p.goals += line.goals
      p.assists += line.assists
      p.morale = Math.min(100, p.morale + (line.rating >= 7.5 ? 4 : line.rating < 5.5 ? -3 : 1))
      p.intlMin = (p.intlMin ?? 0) + line.minutes
      if (line.minutes >= 30) {
        const [sum, n] = p.intlRating ?? [0, 0]
        p.intlRating = [Math.round((sum + line.rating) * 10) / 10, n + 1]
      }
    }
    // A suspension is served by the nation's next match, whether or not the player
    // is in the squad — otherwise a suspended player could never be picked again.
    const sentOff = new Set(report.lines.filter((l) => l.red).map((l) => l.playerId))
    for (const nationId of [f.home, f.away]) {
      for (const p of this.pool(nationId)) {
        if (p.banned && !sentOff.has(p.id)) p.banned = Math.max(0, p.banned - 1)
      }
    }

    // Ranking: matches against teams outside FIFA do not count.
    const home = s.nations[f.home]
    const away = s.nations[f.away]
    const shootout = r.pens ? (r.pens[0] > r.pens[1] ? "home" : "away") : undefined
    if (!this.def(f.home).nonFifa && !this.def(f.away).nonFifa)
      [home.points, away.points] = rankingUpdate(
        home.points,
        away.points,
        { home: r.home, away: r.away, shootout },
        f.importance,
        !!f.knockout
      )

    const comp =
      f.compId === "friendly" ? "Friendly" : (s.competitions[f.compId]?.short ?? f.compId)
    const record = (n: NationState, opp: string, gf: number, ga: number, pens?: "W" | "L") => {
      n.results.push({ fixture: f.id, date: f.date, opp, gf, ga, pens, comp })
      if (n.results.length > 40) n.results.shift()
    }
    record(home, f.away, r.home, r.away, shootout ? (shootout === "home" ? "W" : "L") : undefined)
    record(away, f.home, r.away, r.home, shootout ? (shootout === "away" ? "W" : "L") : undefined)

    this.strengthCache.delete(f.home)
    this.strengthCache.delete(f.away)
    // The result counts for the manager before it can finish the competition, so
    // the competition's review sees it.
    this.onResult(f)
    if (f.compId !== "friendly") {
      this.advanceCompetitions(f.compId)
      // Through to the next round: a "reach" objective may be met now.
      if (this.isUserFixture(f)) checkObjectives(this)
    }
  }

  // ── Calendar events ───────────────────────────────────────────────────────

  private clubWeek() {
    const s = this.state
    const rng = streamFor(s.seed, "week", s.date)
    const me = this.userNation
    for (const p of Object.values(s.players)) {
      const injury = clubWeek(p, s.date, ageOn(p.born, s.date), rng)
      if (
        injury &&
        me &&
        p.nationId === me &&
        p.lastCall &&
        daysBetween(p.lastCall, s.date) < 400
      ) {
        this.news(
          "injury",
          `${fullName(p)} injured`,
          `${fullName(p)} has picked up a ${injury.toLowerCase()} at club level and will be out until ${p.injury!.until}.`,
          true
        )
      }
    }
    this.strengthCache.clear()
  }

  private monthEnd() {
    for (const n of Object.values(this.state.nations)) {
      n.pointsHistory.push([this.state.date, Math.round(n.points)])
      if (n.pointsHistory.length > 240) n.pointsHistory.shift()
    }
  }

  private playersByNation(): Map<string, Player[]> {
    const byNation = new Map<string, Player[]>()
    for (const p of Object.values(this.state.players)) {
      const list = byNation.get(p.nationId)
      if (list) list.push(p)
      else byNation.set(p.nationId, [p])
    }
    return byNation
  }

  /** 1 July: a season of development, and the summer transfer window. */
  private seasonRollover() {
    const s = this.state
    const season = yearOf(s.date)
    const me = this.userNation
    const rng = streamFor(s.seed, "season", season)
    const watched = new Set(s.career.watchlist ?? [])
    const progress: string[] = []
    for (const [nationId, players] of this.playersByNation()) {
      const def = this.def(nationId)
      for (const p of players) {
        const age = ageOn(p.born, s.date)
        const tier = this.clubs.get(p.clubId)?.tier ?? 5
        p.history.push({
          season: season - 1,
          ca: p.ca,
          clubId: p.clubId,
          caps: p.caps,
          goals: p.goals,
        })
        if (p.history.length > 25) p.history.shift()
        const gained = developSeason(
          p,
          age,
          tier,
          p.intlMin ?? 0,
          rng,
          nationId === me ? USER_EDGE.growth : 0
        )
        const showcase = showcased(p, age)
        const moved = summerMove(p, this.clubs, this.clubIndex, def.confed, age, rng, showcase)
        const newTier = this.clubs.get(p.clubId)?.tier ?? 5
        if (moved && nationId === me && (p.lastCall || watched.has(p.id))) {
          const club = this.clubs.get(p.clubId)?.name ?? "a new club"
          const breakthrough = showcase && newTier < tier
          this.news(
            "transfer",
            breakthrough ? `${fullName(p)} earns a big move` : `${fullName(p)} on the move`,
            breakthrough
              ? `${fullName(p)} joins ${club} on the back of his international breakthrough.`
              : `${fullName(p)} joins ${club}.`,
            true
          )
        }
        if (nationId === me && watched.has(p.id))
          progress.push(`${fullName(p)} ${gained >= 0 ? "+" : ""}${gained.toFixed(1)}`)
        delete p.intlMin
        delete p.intlRating
      }
    }
    this.strengthCache.clear()
    if (progress.length)
      this.news(
        "wonderkid",
        "Your prospects this season",
        `How the youngsters you are watching developed: ${progress.join("; ")}.`,
        true,
        "/squad/prospects"
      )
    this.news(
      "season",
      `Season ${season}–${String(season + 1).slice(2)} begins`,
      "Players have developed over the last season and the summer transfer window has closed.",
      true
    )
  }

  /**
   * 1 January: veterans retire and the year's youngsters come through, so every
   * pool is refreshed once a year at a fixed, visible moment.
   */
  private yearTurn() {
    const s = this.state
    const year = yearOf(s.date)
    const me = this.userNation
    const rng = streamFor(s.seed, "year", year)
    const retiredNames: string[] = []
    const newNames: string[] = []
    const intake: string[] = []

    for (const [nationId, players] of this.playersByNation()) {
      const def = this.def(nationId)
      const nation = s.nations[nationId]
      for (const p of players) {
        const age = ageOn(p.born, s.date)
        const tier = this.clubs.get(p.clubId)?.tier ?? 5
        if (rng() < retirementChance(p, age, tier)) {
          delete s.players[p.id]
          if (p.caps >= 10) {
            s.retired.push({
              id: p.id,
              nationId,
              name: fullName(p),
              pos: p.pos,
              caps: p.caps,
              goals: p.goals,
              retired: s.date,
            })
          }
          if (nationId === me)
            retiredNames.push(
              `${fullName(p)} (${p.pos}, ${age}${p.caps ? `, ${p.caps} caps` : ""})`
            )
          continue
        }
        const months = p.lastCall ? daysBetween(p.lastCall, s.date) / 30 : 99
        if (p.caps > 0 && rng() < intlRetirementChance(p, age, months)) {
          p.intlRetired = true
          if (nationId === me)
            this.news(
              "retirement",
              `${fullName(p)} quits international football`,
              `${fullName(p)} (${age}, ${p.caps} caps) has announced his retirement from international football.`,
              true
            )
        }
      }

      const remaining = players.filter((p) => s.players[p.id])
      const count = intakeSize(remaining.length, rng)
      for (let i = 0; i < count; i++) {
        const id = `n${s.nextId++}`
        const p = newgen(
          id,
          { ...def, youthLevel: nation.youthLevel },
          remaining,
          s.date,
          this.clubIndex,
          rng
        )
        s.players[id] = p
        remaining.push(p)
        if (nationId === me) {
          intake.push(id)
          newNames.push(
            `${fullName(p)} (${p.pos}, ${ageOn(p.born, s.date)}, ${this.clubs.get(p.clubId)?.name ?? "—"})`
          )
          if (p.pa >= nationTop(nation.youthLevel) - 3)
            this.news(
              "wonderkid",
              `Wonderkid emerges: ${fullName(p)}`,
              `Scouts are raving about ${fullName(p)}, a ${ageOn(p.born, s.date)}-year-old ${p.pos} at ${this.clubs.get(p.clubId)?.name}.`,
              true
            )
        }
      }

      // The federation's standing feeds the academies and the stadiums.
      yearlyFederation(nation, def)
      const started = yearlyInvestment(
        nation,
        baselineReputation(def.points),
        s.date,
        streamFor(s.seed, "stadiums", nationId, year)
      )
      if (started && nationId === me) {
        const seats = started.capacity.toLocaleString("en")
        this.news(
          "stadium",
          started.kind === "build"
            ? `Work begins on the ${started.name}`
            : `${started.name} to be expanded`,
          started.kind === "build"
            ? `The federation is building a ${seats}-seat stadium in ${started.city}, due to open on ${started.done}.`
            : `The ${started.name} in ${started.city} will hold ${seats} once the work is done, on ${started.done}.`,
          true,
          "/stadiums"
        )
      }
    }
    this.reindex()
    this.strengthCache.clear()
    if (me) {
      if (retiredNames.length)
        this.news(
          "retirement",
          `${retiredNames.length} players retire`,
          `These players have hung up their boots: ${retiredNames.join("; ")}.`,
          true
        )
      if (newNames.length)
        this.news(
          "wonderkid",
          `${newNames.length} youngsters come through`,
          `The new generation eligible for us: ${newNames.join("; ")}.`,
          true,
          "/squad/prospects"
        )
      if (intake.length) s.pendingIntake = { year, ids: intake }
      youthObjective(this)
    }
    // Players who have left the game drop off the watchlist.
    const c = s.career
    if (c.watchlist?.length) c.watchlist = c.watchlist.filter((id) => s.players[id])
  }

  /** Month start: grounds whose work is done open their doors. */
  private openStadiums() {
    const me = this.userNation
    for (const n of Object.values(this.state.nations)) {
      if (!n.projects?.length) continue
      for (const p of completeProjects(n, this.state.date)) {
        const mine = n.id === me
        if (!mine && p.capacity < 60000) continue
        const comp = p.forComp ? this.state.competitions[p.forComp]?.name : undefined
        this.news(
          "stadium",
          p.kind === "build" ? `${this.def(n.id).name} open the ${p.name}` : `${p.name} expanded`,
          `The ${p.name} in ${p.city} now holds ${p.capacity.toLocaleString("en")}${comp ? `, ready for the ${comp}` : ""}.`,
          mine,
          mine ? "/stadiums" : `/stadiums/${n.id}`
        )
      }
    }
  }

  // ── Hooks and news ────────────────────────────────────────────────────────

  onResult(f: Fixture) {
    if (this.isUserFixture(f)) afterUserResult(this, f)
  }

  onCompetitionDone(id: string) {
    this.recordHonour(id)
    this.resolvePlaceholders(id)
    const inst = this.state.competitions[id]
    if (inst) reputationAfter(inst, this.state.nations)
    afterCompetition(this, id)
  }

  private recordHonour(id: string) {
    const inst = this.state.competitions[id]
    if (!inst?.outcome.winner) return
    ;(this.state.honours[inst.defId] ??= []).push({
      year: inst.year,
      comp: inst.id,
      winner: inst.outcome.winner,
      runnerUp: inst.outcome.runnerUp,
      third: inst.outcome.third,
      hosts: inst.hosts,
    })
    const me = this.userNation
    const involved = me && inst.outcome.placings?.includes(me)
    this.news(
      "tournament",
      `${this.def(inst.outcome.winner).name} win the ${inst.name}`,
      `${this.def(inst.outcome.winner).name} are champions${inst.outcome.runnerUp ? `, beating ${this.def(inst.outcome.runnerUp).name} in the final` : ""}.`,
      !!involved || inst.kind === "world-cup"
    )
  }
  onDraw(compId: string, stageKey: string) {
    const me = this.userNation
    const inst = this.state.competitions[compId]
    const stage = inst?.stages.find((s) => s.key === stageKey)
    if (!inst || !stage || !me) return
    const group = stage.groups?.find((g) => g.teams.includes(me))
    const tie = stage.rounds?.[0]?.ties.find((t) => t.home === me || t.away === me)
    // The user gets to watch his own draws.
    if ((group && (stage.groups?.length ?? 0) > 1) || tie)
      this.state.pendingDraw = { compId, stageKey }
    if (group) {
      const others = group.teams.filter((t) => t !== me).map((t) => this.def(t).name)
      this.news(
        "draw",
        `${inst.name}: ${group.name.length <= 2 ? `Group ${group.name}` : group.name}`,
        `The draw is made. We face ${others.join(", ")}.`,
        true,
        `/competitions/${inst.id}`
      )
    } else if (tie) {
      const opp = tie.home === me ? tie.away : tie.home
      if (opp)
        this.news(
          "draw",
          `${inst.name}: ${stage.name}`,
          `We have been drawn against ${this.def(opp).name}.`,
          true,
          `/competitions/${inst.id}`
        )
    }
  }

  /** "Kenya, Tanzania and Uganda will host the Africa Cup of Nations 2027." */
  private announceHosts(inst: CompetitionInstance) {
    if (!inst.hosts.length || inst.kind === "qualifier") return
    const names = inst.hosts.map((h) => this.def(h)?.name ?? h)
    const list =
      names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]
    const me = this.userNation
    // Hosts build what they still lack, finished a few months before kick-off.
    const level = hostLevelOf(inst.kind)
    const hosts = inst.hosts.map((h) => this.state.nations[h]).filter(Boolean)
    if (level && hosts.length && inst.start > this.state.date) {
      prepareToHost(
        hosts,
        hostRequirement(level, this.def(inst.hosts[0]).confed),
        this.state.date,
        addDays(inst.start, -120),
        streamFor(this.state.seed, "host-build", inst.id),
        inst.id
      )
    }
    if (me && inst.hosts.includes(me) && inst.start > this.state.date)
      this.state.pendingHosting = inst.id
    const mine =
      !!me &&
      (inst.hosts.includes(me) || inst.kind === "world-cup" || inst.confed === this.def(me)?.confed)
    this.news(
      "tournament",
      `${list} to host the ${inst.name}`,
      `${list} ${names.length > 1 ? "will co-host" : "will host"} the ${inst.name}, starting ${inst.start}.`,
      mine,
      `/competitions/${inst.id}`
    )
  }

  /**
   * A competition that decides placeholder places has finished: put the winners
   * into every group, tie and fixture that was drawn with their placeholder.
   */
  private resolvePlaceholders(compId: string) {
    const inst = this.state.competitions[compId]
    const def = inst ? competitionDef(inst.defId) : undefined
    if (!inst || !def?.placeholderWinner) return
    // The slots actually drawn for this competition — not a fixed range, since a
    // play-off here can have as many ties as there are places to fill (euroq-2032's
    // League format runs to ten, past the old fixed-paths cap that once lived here).
    const slots = new Set<number>()
    const collect = (t: string | null | undefined) => {
      if (isPlaceholder(t) && parsePlaceholder(t).compId === compId)
        slots.add(parsePlaceholder(t).slot)
    }
    for (const c of Object.values(this.state.competitions)) {
      for (const st of c.stages) {
        for (const g of st.groups ?? []) g.teams.forEach(collect)
        for (const r of st.rounds ?? [])
          for (const tie of r.ties) {
            collect(tie.home)
            collect(tie.away)
          }
      }
    }
    for (const fx of Object.values(this.state.fixtures)) {
      collect(fx.home)
      collect(fx.away)
    }
    const map = new Map<string, string>()
    for (const slot of slots) {
      const team = def.placeholderWinner(inst, slot)
      if (team) map.set(makePlaceholder(compId, slot), team)
    }
    if (!map.size) return
    const swap = (t: string | null) => (t && map.get(t)) ?? t
    let used = false
    for (const c of Object.values(this.state.competitions)) {
      for (const st of c.stages) {
        for (const g of st.groups ?? []) {
          if (g.teams.some((t) => map.has(t))) used = true
          g.teams = g.teams.map((t) => swap(t)!)
        }
        for (const r of st.rounds ?? [])
          for (const tie of r.ties) {
            tie.home = swap(tie.home)
            tie.away = swap(tie.away)
          }
      }
    }
    for (const fx of Object.values(this.state.fixtures)) {
      fx.home = swap(fx.home)!
      fx.away = swap(fx.away)!
    }
    if (!used) return
    this.reindex()
    const me = this.userNation
    for (const [ph, team] of map) {
      this.news(
        "tournament",
        `${this.def(team).name} take their place`,
        `${this.def(team).name} win the ${placeholderLabel(ph).replace(/ winner$/, "")} and fill that place in the draw.`,
        team === me,
        `/nation/${team}`
      )
    }
  }

  /** The user has watched (or skipped) the draw he was stopped for. */
  clearDraw() {
    this.state.pendingDraw = null
  }

  /** The user has seen the job offer he was stopped for. */
  clearOffer() {
    this.state.pendingOffer = null
  }

  /** The user has seen the news that his nation will host a tournament. */
  clearHosting() {
    this.state.pendingHosting = null
  }

  /** The user has read the federation's review of a competition. */
  clearReview() {
    this.state.pendingReview = null
  }

  /** The user has seen that he lost his job. */
  clearSacked() {
    this.state.pendingSacked = false
  }

  /** The user has seen his final warning. */
  clearUltimatum() {
    this.state.pendingUltimatum = false
  }

  /** The user has seen the year's youngsters. */
  clearIntake() {
    this.state.pendingIntake = null
  }

  /** Add or remove a player from the manager's watchlist. */
  toggleWatch(playerId: string) {
    const c = this.state.career
    const list = (c.watchlist ??= [])
    c.watchlist = list.includes(playerId)
      ? list.filter((id) => id !== playerId)
      : [...list, playerId]
  }

  news(kind: NewsKind, title: string, body: string, mine: boolean, link?: string) {
    const s = this.state
    const item: NewsItem = { id: s.nextNewsId++, date: s.date, kind, title, body, mine, link }
    s.news.unshift(item)
    if (s.news.length > 300) s.news.length = 300
    return item
  }
}

function placeholderDef(id: string): NationDef {
  return {
    id,
    name: isPlaceholder(id) ? placeholderLabel(id) : id,
    flag: "",
    confed: isPlaceholder(id)
      ? ((placeholderConfed(id) === "PLAYOFF" ? "UEFA" : placeholderConfed(id)) as Confed)
      : "UEFA",
    subFeds: [],
    color: "#5b6b7a",
    youthLevel: 0,
    points: 0,
    cultures: [],
  }
}

function placeholderNation(id: string): NationState {
  return {
    id,
    points: 0,
    youthLevel: 0,
    coach: "",
    formation: "4-2-3-1",
    squad: [],
    squadFor: null,
    results: [],
    pointsHistory: [],
    reputation: 1,
    stadium: 1,
    stadiums: [],
    projects: [],
  }
}

/** Nations drawn into a fresh world with their starting ranking points. */
export function initialNationState(
  def: NationDef,
  rngSeed: number,
  date: ISODate = "2026-09-01"
): NationState {
  const rng = makeRng(deriveSeed(rngSeed, "coach", def.id))
  const formations = ["4-2-3-1", "4-3-3", "4-4-2", "3-5-2", "4-1-4-1"] as const
  const reputation = baselineReputation(def.points)
  const grounds = initialStadiums(def, reputation, date)
  return {
    id: def.id,
    points: def.points,
    youthLevel: def.youthLevel,
    coach: "",
    formation: formations[Math.floor(rng() * formations.length)],
    squad: [],
    squadFor: null,
    results: [],
    pointsHistory: [],
    reputation,
    stadium: grounds.stadiums.length ? stadiumLevel(grounds.stadiums) : initialStadium(reputation),
    stadiums: grounds.stadiums,
    projects: grounds.projects,
  }
}
