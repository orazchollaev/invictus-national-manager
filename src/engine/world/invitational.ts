/**
 * Invitational tournaments in the world: which windows a nation is free in, who
 * would come, setting one up, and other federations inviting the user's nation to
 * theirs (an invitation he accepts or turns down).
 *
 * A nation is free in a window when it has nothing but friendlies there and no
 * competition still to be drawn could put it there. Friendlies already arranged
 * for the teams of a new tournament make way for it.
 */
import type { ISODate } from "../types"
import { addDays, daysBetween, yearOf } from "../calendar/dates"
import { windowsForYear, type MatchWindow } from "../calendar/windows"
import { COMPETITION_DEFS, competitionDef } from "../competition/defs"
import { fits, formatsFor, invitationalDefId, windowById } from "../competition/defs/invitational"
import {
  createInstance,
  type CompContext,
  type CompetitionDef,
  type StagePlan,
} from "../competition/runtime"
import { isPlaceholder } from "../competition/placeholders"
import type { CompetitionInstance, InvitationalFormat } from "../competition/types"
import { pick, pickWeighted, streamFor } from "../rng"
import { compText, joinText, msg, nationText } from "../text"
import type { World } from "./world"

export const INVITATIONAL_TUNING = {
  /** A tournament is set up at least this many days before its window… */
  minLead: 16,
  /** …and at most this many. */
  maxLead: 400,
  /** Ranking points apart beyond which a nation is not interested. */
  maxGap: 320,
  /** Chance a nation at the same level says yes; it falls with the gap. */
  keenAtLevel: 0.9,
  keenPerPoint: 1 / 450,
  /** Days ahead a free window is suggested on the home screen. */
  suggestHorizon: 120,
  /** Candidates offered to the user, closest in strength first. */
  candidates: 20,
  /** Invitations: days before the window one comes, and the chance it does. */
  inviteLead: 50,
  inviteChance: 0.3,
  /** Days the user has to answer. */
  inviteDays: 20,
  /** Hosts close enough in strength to invite the user's nation. */
  inviteGap: 220,
} as const

const T = INVITATIONAL_TUNING

/** The windows from today on, this year and next. */
function windowsAhead(date: ISODate): MatchWindow[] {
  const y = yearOf(date)
  return [...windowsForYear(y), ...windowsForYear(y + 1)].filter((w) => w.start > date)
}

/** Every date a stage plan is played on, as a first and last day. */
function planSpan(p: StagePlan) {
  const dates: ISODate[] = [
    ...(p.groups?.dates ?? []),
    ...(p.knockout?.rounds.flatMap((r) => r.dates.map((d) => addDays(d, (r.spread ?? 1) - 1))) ??
      []),
    ...(p.knockout?.thirdPlace ? [p.knockout.thirdPlace] : []),
  ].sort()
  if (!dates.length) return null
  // A group stage's later rounds follow its listed dates at the same spacing.
  const last = dates[dates.length - 1]
  return { from: dates[0], to: p.groups ? addDays(last, 7) : last }
}

/** Teams and whole confederations ("FIFA": every member) that a window's draws may claim. */
interface Planned {
  teams: Set<string>
  confeds: Set<string>
}

/** A competition edition not created yet, enough to read its plan's dates. */
function skeleton(def: CompetitionDef, year: number): CompetitionInstance {
  return {
    id: `${def.id}-${year}`,
    defId: def.id,
    name: "",
    short: def.short,
    year,
    confed: def.confed,
    kind: def.kind,
    hosts: [],
    offWindow: !!def.offWindow,
    status: "upcoming",
    start: "",
    end: "",
    stages: [],
    outcome: {},
  }
}

/**
 * Stages not drawn yet that are played in the window, and who they may take.
 * Only a stage whose stages before it are over says exactly who plays (and only
 * if it names real teams); any other — a qualifier whose draw has not been made,
 * an edition not even created yet, the play-offs after a group stage still under
 * way — claims every team that could be in it: its confederation (a regional cup,
 * its entrants).
 */
function planned(world: World, w: MatchWindow): Planned {
  const ctx = world.ctx()
  const out: Planned = { teams: new Set(), confeds: new Set() }
  const known = (p: StagePlan, inst: CompetitionInstance): string[] | null => {
    try {
      const list = p.entrants(ctx, inst)
      return list.length && !list.some((t) => isPlaceholder(t)) ? list : null
    } catch {
      return null
    }
  }
  /** A regional cup's teams: the ones already drawn, or those its first stage takes. */
  const regionals = (inst: CompetitionInstance, plans: StagePlan[]): string[] | null => {
    const drawn = new Set<string>()
    for (const s of inst.stages) {
      for (const g of s.groups ?? []) for (const t of g.teams) drawn.add(t)
      for (const r of s.rounds ?? [])
        for (const tie of r.ties) for (const t of [tie.home, tie.away]) if (t) drawn.add(t)
    }
    return drawn.size ? [...drawn] : plans[0] ? known(plans[0], inst) : null
  }
  const consider = (inst: CompetitionInstance, def: CompetitionDef) => {
    let plans: StagePlan[]
    try {
      plans = def.plan(inst, ctx)
      for (const slot of w.slots)
        for (const t of def.reserved?.(inst, ctx, slot) ?? []) out.teams.add(t)
    } catch {
      return
    }
    plans.forEach((p, i) => {
      const stage = inst.stages.find((s) => s.key === p.key)
      if (stage && stage.status !== "waiting") return
      const span = planSpan(p)
      if (!span || span.to < w.start || span.from > w.end) return
      const deps =
        p.after === undefined ? (i > 0 ? [plans[i - 1].key] : []) : [p.after ?? []].flat()
      const ready = deps.every((k) => inst.stages.find((s) => s.key === k)?.status === "done")
      const list = ready ? known(p, inst) : inst.kind === "regional" ? regionals(inst, plans) : null
      if (list) for (const t of list) out.teams.add(t)
      else out.confeds.add(inst.confed)
    })
  }
  for (const inst of Object.values(world.state.competitions))
    if (inst.status !== "done" && !inst.invitational) consider(inst, competitionDef(inst.defId))
  // Editions the calendar has not created yet still have their dates.
  const y = yearOf(w.start)
  for (const def of COMPETITION_DEFS) {
    if (def.kind === "invitational") continue
    // Qualifying is named for its finals, played up to three years later.
    for (const year of def.editions(y - 2, y + 4))
      if (!world.state.competitions[`${def.id}-${year}`]) consider(skeleton(def, year), def)
  }
  return out
}

/** `planned` per window, worked out once a day: it reads every competition's plan. */
const plannedCache = new WeakMap<World, { date: ISODate; byWindow: Map<string, Planned> }>()

function plannedOnce(world: World, w: MatchWindow): Planned {
  let cache = plannedCache.get(world)
  if (!cache || cache.date !== world.state.date)
    plannedCache.set(world, (cache = { date: world.state.date, byWindow: new Map() }))
  let p = cache.byWindow.get(w.id)
  if (!p) cache.byWindow.set(w.id, (p = planned(world, w)))
  return p
}

/**
 * Who is spoken for in a window: a test for each team. Fixtures other than
 * friendlies, an invitational already set there, and stages still to be drawn
 * there (see `planned`).
 */
export function commitments(world: World, w: MatchWindow): (team: string) => boolean {
  const busy = new Set<string>()
  for (let d = w.start; d <= w.end; d = addDays(d, 1))
    for (const f of world.fixturesOn(d))
      if (f.compId !== "friendly") {
        busy.add(f.home)
        busy.add(f.away)
      }
  for (const inst of Object.values(world.state.competitions))
    if (inst.status !== "done" && inst.invitational?.window === w.id)
      for (const t of inst.invitational.teams) busy.add(t)
  const { teams, confeds } = plannedOnce(world, w)
  return (team) =>
    busy.has(team) ||
    teams.has(team) ||
    confeds.has(world.def(team).confed) ||
    (confeds.has("FIFA") && !world.def(team).nonFifa)
}

/** Windows a nation could hold a tournament in: far enough ahead and free. */
export function openWindows(world: World, nationId: string): MatchWindow[] {
  const date = world.state.date
  return windowsAhead(date).filter((w) => {
    const lead = daysBetween(date, w.start)
    return lead >= T.minLead && lead <= T.maxLead && !commitments(world, w)(nationId)
  })
}

export interface InvitationalCandidate {
  id: string
  points: number
  /** FIFA ranking position, 0 outside FIFA. */
  rank: number
}

/** Whether a nation would come to a host's tournament in this window (fixed per window). */
export function keen(world: World, host: string, team: string, w: MatchWindow): boolean {
  const gap = Math.abs(world.nation(team).points - world.nation(host).points)
  if (gap > T.maxGap) return false
  const chance = T.keenAtLevel - gap * T.keenPerPoint
  return streamFor(world.state.seed, "inv-keen", w.id, host, team)() < chance
}

/** Nations free in the window that want to come, closest in strength first. */
export function candidatesFor(
  world: World,
  host: string,
  w: MatchWindow,
  limit: number = T.candidates
): InvitationalCandidate[] {
  const taken = commitments(world, w)
  const pts = world.nation(host).points
  return world
    .ctx()
    .ranked((t) => t !== host && !taken(t) && world.pool(t).length >= 16)
    .filter((t) => keen(world, host, t, w))
    .sort((a, b) => Math.abs(world.nation(a).points - pts) - Math.abs(world.nation(b).points - pts))
    .slice(0, limit)
    .map((id) => ({ id, points: world.nation(id).points, rank: world.fifaRank(id) }))
}

/**
 * The window to suggest a tournament for: the first one within `horizon` days
 * where the nation has no match at all yet, is free, three nations would come
 * and no invitation waiting. Checks one window at a time, nearest first, so it
 * is cheap enough to run every day.
 */
export function suggestedWindow(
  world: World,
  nationId: string,
  horizon = T.suggestHorizon
): MatchWindow | null {
  const date = world.state.date
  for (const w of windowsAhead(date)) {
    const lead = daysBetween(date, w.start)
    if (lead > horizon) break
    if (lead < T.minLead || world.state.invite?.window === w.id) continue
    if (world.fixturesOf(nationId, w.start, w.end).length) continue
    if (commitments(world, w)(nationId)) continue
    if (candidatesFor(world, nationId, w, 3).length < 3) continue
    return w
  }
  return null
}

export type SetupProblem = "size" | "format" | "window" | "taken" | "busy" | "duplicate"

/** What is wrong with a tournament set-up, or null when it can go ahead. */
export function checkSetup(
  world: World,
  windowId: string,
  teams: string[],
  format: InvitationalFormat
): SetupProblem | null {
  const w = windowById(windowId)
  if (!w) return "window"
  if (teams.length !== 4 && teams.length !== 8) return "size"
  if (new Set(teams).size !== teams.length) return "duplicate"
  if (!formatsFor(teams.length).includes(format) || !fits(w, format, teams.length)) return "format"
  const lead = daysBetween(world.state.date, w.start)
  if (lead < T.minLead || lead > T.maxLead) return "window"
  if (world.state.competitions[`${invitationalDefId(w)}-${yearOf(w.start)}`]) return "taken"
  const taken = commitments(world, w)
  if (teams.some((t) => !world.state.nations[t] || taken(t))) return "busy"
  return null
}

/** Friendlies already arranged in the window for these teams make way. */
function clearFriendlies(world: World, w: MatchWindow, teams: string[]) {
  const set = new Set(teams)
  let removed = false
  for (let d = w.start; d <= w.end; d = addDays(d, 1))
    for (const f of world.fixturesOn(d))
      if (f.compId === "friendly" && !f.result && (set.has(f.home) || set.has(f.away))) {
        delete world.state.fixtures[f.id]
        removed = true
      }
  if (removed) world.reindex()
}

/**
 * Set up a tournament hosted by `teams[0]`. Returns the new competition's id, or
 * the problem that stopped it.
 */
export function createInvitational(
  world: World,
  windowId: string,
  teams: string[],
  format: InvitationalFormat
): { id: string } | { problem: SetupProblem } {
  const problem = checkSetup(world, windowId, teams, format)
  if (problem) return { problem }
  const w = windowById(windowId)!
  clearFriendlies(world, w, teams)
  const def = competitionDef(invitationalDefId(w))
  const year = yearOf(w.start)
  const ctx: CompContext = world.ctx()
  const inst = createInstance(def, year, ctx, {
    hosts: [teams[0]],
    invitational: { window: w.id, format, teams: [...teams] },
  })
  world.state.competitions[inst.id] = inst
  const me = world.userNation
  const comp = compText(inst.defId, inst.year)
  const others = teams.filter((t) => t !== teams[0]).map((t) => nationText(t))
  world.news(
    "tournament",
    msg("news.invitational.title", { host: nationText(teams[0]), comp }),
    msg("news.invitational.body", {
      host: nationText(teams[0]),
      comp,
      teams: joinText(others),
      date: w.start,
    }),
    !!me && teams.includes(me),
    `/competitions/${inst.id}`
  )
  return { id: inst.id }
}

// ── Invitations to the user's nation ────────────────────────────────────────

/**
 * Daily: some weeks before a window, another federation may invite the user's
 * nation to a tournament there — when both are free and close enough in strength.
 */
export function maybeInvite(world: World) {
  const s = world.state
  const me = world.userNation
  if (!me || s.invite) return
  const date = s.date
  for (const w of windowsAhead(date)) {
    if (daysBetween(date, w.start) !== T.inviteLead) continue
    const rng = streamFor(s.seed, "invite", w.id)
    if (rng() >= T.inviteChance) continue
    const taken = commitments(world, w)
    if (taken(me)) continue
    const pts = world.nation(me).points
    const free = world
      .ctx()
      .ranked(
        (t) =>
          t !== me &&
          !taken(t) &&
          world.pool(t).length >= 16 &&
          Math.abs(world.nation(t).points - pts) <= T.inviteGap
      )
    const hosts = free.filter((t) => world.nation(t).stadium >= 2)
    if (!hosts.length) continue
    const host = pickWeighted(rng, hosts, (t) => world.nation(t).reputation)
    const size = rng() < 0.7 ? 4 : 8
    const guests = free
      .filter((t) => t !== host && keen(world, host, t, w))
      .sort(
        (a, b) =>
          Math.abs(world.nation(a).points - world.nation(host).points) -
          Math.abs(world.nation(b).points - world.nation(host).points)
      )
      .slice(0, size + 2)
    if (guests.length < size - 2) continue
    const others: string[] = []
    while (others.length < size - 2) {
      const t = pick(rng, guests)
      if (!others.includes(t)) others.push(t)
    }
    const formats = formatsFor(size).filter((f) => fits(w, f, size))
    if (!formats.length) continue
    s.invite = {
      window: w.id,
      format: pick(rng, formats),
      teams: [host, me, ...others],
      expires: addDays(date, T.inviteDays),
    }
    world.news(
      "tournament",
      msg("news.invite.title", { host: nationText(host) }),
      msg("news.invite.body", { host: nationText(host), n: size, date: w.start }),
      true,
      "/invitational"
    )
    return
  }
}

/** Daily: an invitation not answered in time lapses. */
export function expireInvite(world: World) {
  const s = world.state
  if (!s.invite || s.date <= s.invite.expires) return
  const host = s.invite.teams[0]
  s.invite = null
  world.news(
    "tournament",
    msg("news.inviteLapsed.title"),
    msg("news.inviteLapsed.body", { host: nationText(host) }),
    true
  )
}

/** Yes to the invitation: the tournament is set up, if everyone is still free. */
export function acceptInvite(world: World): { id: string } | { problem: SetupProblem } {
  const inv = world.state.invite
  if (!inv) return { problem: "window" }
  world.state.invite = null
  const out = createInvitational(world, inv.window, inv.teams, inv.format)
  if ("problem" in out)
    world.news(
      "tournament",
      msg("news.inviteOff.title"),
      msg("news.inviteOff.body", { host: nationText(inv.teams[0]) }),
      true
    )
  return out
}

/** No to the invitation. */
export function declineInvite(world: World) {
  world.state.invite = null
}

/** The invitation has been seen; it still waits for an answer on its page. */
export function seenInvite(world: World) {
  if (world.state.invite) world.state.invite.seen = true
}
