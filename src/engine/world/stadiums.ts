/**
 * Stadiums, city by city, after True Football National Manager: every nation has
 * grounds with a capacity in its cities; tournaments ask for a number of grounds
 * above a size and one showpiece for the opening match and final. A federation whose
 * team does well invests — expanding what it has or building new grounds, which take
 * years — and a nation awarded a tournament builds what it still lacks in time for it.
 *
 * The stadiums set a nation's stadium level (1–5), which gives the home advantage,
 * and how ready it is to host, which weighs in when hosts are chosen.
 */
import type { Confed, ISODate, NationDef } from "../types"
import type { CompetitionKind } from "../competition/types"
import { CAPITALS, CITIES, STADIUMS, UNDER_CONSTRUCTION } from "@/data/stadiums"
import { addDays, daysBetween, yearOf } from "../calendar/dates"
import { clamp, pick, randInt, type Rng } from "../rng"
import type { NationState, Stadium, StadiumProject } from "./types"

export type HostLevel = "world-cup" | "continental" | "regional"
export const HOST_LEVELS: HostLevel[] = ["world-cup", "continental", "regional"]

export interface HostRequirement {
  level: HostLevel
  /** Grounds needed at `minCapacity` or more. */
  venues: number
  minCapacity: number
  /** One ground of this size for the opening match and final. */
  showpiece: number
}

/** What a tournament asks of its hosts (together, when there are several). */
export function hostRequirement(level: HostLevel, confed: Confed): HostRequirement {
  if (level === "world-cup") return { level, venues: 12, minCapacity: 40000, showpiece: 80000 }
  if (level === "regional") {
    return confed === "OFC"
      ? { level, venues: 1, minCapacity: 5000, showpiece: 8000 }
      : { level, venues: 2, minCapacity: 10000, showpiece: 20000 }
  }
  const byConfed: Record<Confed, [number, number, number]> = {
    UEFA: [10, 30000, 60000],
    CONMEBOL: [8, 25000, 50000],
    CONCACAF: [8, 30000, 60000],
    CAF: [6, 20000, 40000],
    AFC: [8, 20000, 40000],
    OFC: [2, 5000, 10000],
  }
  const [venues, minCapacity, showpiece] = byConfed[confed]
  return { level, venues, minCapacity, showpiece }
}

export function hostLevelOf(kind: CompetitionKind): HostLevel | null {
  if (kind === "world-cup") return "world-cup"
  if (kind === "continental") return "continental"
  if (kind === "regional") return "regional"
  return null
}

export interface HostCheck {
  venues: number
  needed: number
  showpiece: boolean
  biggest: number
  /** 0–1: 1 means the requirement is met. */
  score: number
  ready: boolean
}

/** How far a set of stadiums (one nation's, or co-hosts' together) meets a requirement. */
export function hostCheck(stadiums: Stadium[], req: HostRequirement): HostCheck {
  const venues = stadiums.filter((s) => s.capacity >= req.minCapacity).length
  const biggest = Math.max(0, ...stadiums.map((s) => s.capacity))
  const showpiece = biggest >= req.showpiece
  const score = Math.min(1, venues / req.venues) * (showpiece ? 1 : 0.75)
  return {
    venues,
    needed: req.venues,
    showpiece,
    biggest,
    score: Math.round(score * 100) / 100,
    ready: venues >= req.venues && showpiece,
  }
}

/** Stadium level 1–5 from the biggest ground and how many big ones there are. */
export function stadiumLevel(stadiums: Stadium[]): number {
  const sorted = stadiums.map((s) => s.capacity).sort((a, b) => b - a)
  const big = sorted[0] ?? 0
  const base = big >= 60000 ? 5 : big >= 40000 ? 4 : big >= 25000 ? 3 : big >= 12000 ? 2 : 1
  // One big ground and nothing else holds a level back.
  const depth = sorted.filter((c) => c >= big * 0.45).length
  return clamp(base - (base >= 4 && depth < 3 ? 1 : 0), 1, 5)
}

export const totalCapacity = (stadiums: Stadium[]) => stadiums.reduce((a, s) => a + s.capacity, 0)

const round500 = (n: number) => Math.round(n / 500) * 500

/** The biggest ground a federation of this standing aims for. */
export function targetShowpiece(reputation: number): number {
  return clamp(round500(4000 + reputation ** 1.7 * 1700), 5000, 95000)
}

/** How many sizeable grounds a federation of this standing aims for. */
export function targetVenues(reputation: number): number {
  return clamp(Math.round(1 + reputation * 1.1), 1, 14)
}

function parse(row: string): { city: string; name: string; capacity: number } {
  const [city, name, capacity] = row.split("|")
  return { city, name, capacity: Number(capacity) }
}

/** The grounds a nation starts with, and the ones it is building on the start date. */
export function initialStadiums(
  def: NationDef,
  reputation: number,
  date: ISODate
): { stadiums: Stadium[]; projects: StadiumProject[] } {
  const rows = STADIUMS[def.id]
  const stadiums: Stadium[] = rows
    ? rows.map((r, i) => ({ id: `${def.id}-s${i}`, ...parse(r) }))
    : [
        {
          id: `${def.id}-s0`,
          city: CAPITALS[def.id] ?? def.name,
          name: "National Stadium",
          capacity: round500(Math.max(2000, 3000 + reputation ** 1.5 * 1500)),
        },
      ]
  const projects: StadiumProject[] = UNDER_CONSTRUCTION.filter(
    ([id, , done]) => id === def.id && done > date
  ).map(([, row, done], i) => ({
    id: `${def.id}-p${i}`,
    kind: "build",
    ...parse(row),
    started: addDays(date, -540),
    done,
  }))
  return { stadiums, projects }
}

/** Fill the fields a save from before stadiums existed does not have. */
export function ensureStadiums(n: NationState, def: NationDef | undefined, date: ISODate) {
  if (n.stadiums?.length || !def) return
  const init = initialStadiums(def, n.reputation, date)
  n.stadiums = init.stadiums
  n.projects = init.projects
  n.stadium = stadiumLevel(n.stadiums)
}

function nextId(n: NationState, prefix: "s" | "p"): string {
  const used = new Set([...(n.stadiums ?? []), ...(n.projects ?? [])].map((x) => x.id))
  for (let i = 0; ; i++) if (!used.has(`${n.id}-${prefix}${i}`)) return `${n.id}-${prefix}${i}`
}

/** Cities with a ground, then towns without one yet. */
export function citiesOf(n: NationState): string[] {
  const own = [...new Set((n.stadiums ?? []).map((s) => s.city))]
  return [...own, ...(CITIES[n.id] ?? []).filter((c) => !own.includes(c))]
}

const NEW_NAMES = ["{c} Arena", "New {c} Stadium", "{c} Olympic Stadium", "{c} Municipal Stadium"]

function newStadiumName(n: NationState, city: string, national: boolean, rng: Rng): string {
  const taken = new Set([...(n.stadiums ?? []), ...(n.projects ?? [])].map((s) => s.name))
  if (national && !taken.has("New National Stadium")) return "New National Stadium"
  const options = NEW_NAMES.map((t) => t.replace("{c}", city)).filter((x) => !taken.has(x))
  return options.length ? pick(rng, options) : `${city} Stadium ${taken.size + 1}`
}

/** Where a new ground goes: a town without one first, else the city with the fewest. */
function cityForNewGround(n: NationState, rng: Rng): string {
  const busy = (c: string) =>
    [...(n.stadiums ?? []), ...(n.projects ?? [])].filter((s) => s.city === c).length
  const cities = citiesOf(n)
  const free = cities.filter((c) => busy(c) === 0)
  if (free.length) return pick(rng, free.slice(0, 3))
  return [...cities].sort((a, b) => busy(a) - busy(b))[0] ?? n.id
}

function project(
  n: NationState,
  p: Omit<StadiumProject, "id" | "started" | "done">,
  date: ISODate,
  days: number,
  deadline?: ISODate
): StadiumProject {
  let done = addDays(date, days)
  if (deadline && done > deadline)
    done = deadline < addDays(date, 180) ? addDays(date, 180) : deadline
  const out: StadiumProject = { id: nextId(n, "p"), ...p, started: date, done }
  ;(n.projects ??= []).push(out)
  return out
}

function expand(
  n: NationState,
  s: Stadium,
  capacity: number,
  date: ISODate,
  rng: Rng,
  deadline?: ISODate,
  forComp?: string
) {
  return project(
    n,
    {
      kind: "expand",
      stadiumId: s.id,
      city: s.city,
      name: s.name,
      capacity: round500(capacity),
      forComp,
    },
    date,
    randInt(rng, 330, 700),
    deadline
  )
}

function build(
  n: NationState,
  capacity: number,
  date: ISODate,
  rng: Rng,
  opts: { national?: boolean; deadline?: ISODate; forComp?: string } = {}
) {
  const city = opts.national ? (n.stadiums?.[0]?.city ?? citiesOf(n)[0]) : cityForNewGround(n, rng)
  return project(
    n,
    {
      kind: "build",
      city,
      name: newStadiumName(n, city, !!opts.national, rng),
      capacity: round500(capacity),
      forComp: opts.forComp,
    },
    date,
    randInt(rng, 720, 1300),
    opts.deadline
  )
}

/** Stadiums as they will be once the projects under way are finished. */
export function withProjects(n: NationState): Stadium[] {
  const list = (n.stadiums ?? []).map((s) => ({ ...s }))
  for (const p of n.projects ?? []) {
    const s = p.stadiumId ? list.find((x) => x.id === p.stadiumId) : undefined
    if (s) s.capacity = Math.max(s.capacity, p.capacity)
    else list.push({ id: p.id, city: p.city, name: p.name, capacity: p.capacity })
  }
  return list
}

/**
 * Once a year: a federation with the standing (and the results) to show for it
 * starts a project — the showpiece first, then more big grounds.
 */
export function yearlyInvestment(
  n: NationState,
  baseline: number,
  date: ISODate,
  rng: Rng
): StadiumProject | null {
  const running = n.projects?.length ?? 0
  if (running >= (n.reputation >= 7 ? 2 : 1)) return null
  const chance = clamp(
    0.1 + 0.05 * n.reputation + 0.25 * Math.max(0, n.reputation - baseline),
    0.1,
    0.9
  )
  if (rng() >= chance) return null
  const planned = withProjects(n)
  const big = targetShowpiece(n.reputation)
  const mid = round500(big * 0.5)
  const biggest = [...planned].sort((a, b) => b.capacity - a.capacity)[0]
  if (!biggest || biggest.capacity < big * 0.9) {
    const s = biggest ? n.stadiums?.find((x) => x.id === biggest.id) : undefined
    if (s && s.capacity >= big * 0.6 && !n.projects?.some((p) => p.stadiumId === s.id))
      return expand(n, s, Math.min(big, s.capacity * 1.35), date, rng)
    return build(n, big, date, rng, { national: true })
  }
  const sizeable = planned.filter((s) => s.capacity >= mid).length
  if (sizeable >= targetVenues(n.reputation)) return null
  const candidate = (n.stadiums ?? [])
    .filter((s) => s.capacity < mid && s.capacity >= mid * 0.55)
    .filter((s) => !n.projects?.some((p) => p.stadiumId === s.id))
    .sort((a, b) => b.capacity - a.capacity)[0]
  if (candidate) return expand(n, candidate, mid * (1 + rng() * 0.2), date, rng)
  return build(n, mid * (1 + rng() * 0.3), date, rng)
}

/**
 * A nation awarded a tournament builds what it still lacks, finished before
 * `deadline`. Co-hosts share the work: each looks at the grounds of all of them.
 */
export function prepareToHost(
  hosts: NationState[],
  req: HostRequirement,
  date: ISODate,
  deadline: ISODate,
  rng: Rng,
  forComp: string
): StadiumProject[] {
  const started: StadiumProject[] = []
  if (!hosts.length) return started
  const combined = () => hosts.flatMap((h) => withProjects(h))
  for (let i = 0; i < 30 && !hostCheck(combined(), req).ready; i++) {
    const check = hostCheck(combined(), req)
    // The main host (the first) builds the showpiece; the work is then shared.
    const n = check.showpiece ? hosts[i % hosts.length] : hosts[0]
    if (!check.showpiece) {
      const biggest = [...(n.stadiums ?? [])].sort((a, b) => b.capacity - a.capacity)[0]
      const busy = n.projects?.some((p) => p.stadiumId === biggest?.id)
      started.push(
        biggest && !busy && biggest.capacity >= req.showpiece * 0.65
          ? expand(n, biggest, req.showpiece * 1.05, date, rng, deadline, forComp)
          : build(n, req.showpiece * 1.05, date, rng, { national: true, deadline, forComp })
      )
      continue
    }
    const near = (n.stadiums ?? [])
      .filter((s) => s.capacity < req.minCapacity && s.capacity >= req.minCapacity * 0.5)
      .filter((s) => !n.projects?.some((p) => p.stadiumId === s.id))
      .sort((a, b) => b.capacity - a.capacity)[0]
    started.push(
      near
        ? expand(n, near, req.minCapacity * 1.1, date, rng, deadline, forComp)
        : build(n, req.minCapacity * (1.1 + rng() * 0.3), date, rng, { deadline, forComp })
    )
  }
  return started
}

/** Finish the projects due by `date`. Returns what opened. */
export function completeProjects(n: NationState, date: ISODate): StadiumProject[] {
  const due = (n.projects ?? []).filter((p) => p.done <= date)
  if (!due.length) return []
  n.stadiums ??= []
  for (const p of due) {
    const s = p.stadiumId ? n.stadiums.find((x) => x.id === p.stadiumId) : undefined
    if (s) s.capacity = Math.max(s.capacity, p.capacity)
    else
      n.stadiums.push({
        id: nextId(n, "s"),
        city: p.city,
        name: p.name,
        capacity: p.capacity,
        opened: yearOf(p.done),
      })
  }
  n.projects = (n.projects ?? []).filter((p) => !due.includes(p))
  n.stadiums.sort((a, b) => b.capacity - a.capacity)
  n.stadium = stadiumLevel(n.stadiums)
  return due
}

/** Where a match is played: a hash of the fixture picks among the eligible grounds. */
export function venueOf(stadiums: Stadium[], fixtureId: string, big: boolean): Stadium | null {
  if (!stadiums.length) return null
  const sorted = [...stadiums].sort((a, b) => b.capacity - a.capacity)
  const pool = big ? sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2))) : sorted
  let h = 0
  for (const ch of fixtureId) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  // The showpiece takes the biggest matches (openers, finals) when asked.
  return big && /:(r\d+t0|3rd|final)/.test(fixtureId) ? sorted[0] : pool[h % pool.length]
}

/** Days until a project opens, for the countdown. */
export function daysLeft(p: StadiumProject, date: ISODate) {
  return Math.max(0, daysBetween(date, p.done))
}
