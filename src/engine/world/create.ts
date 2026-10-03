import type { Club, NationDef, Player, Position } from "../types"
import { deriveSeed, makeRng } from "../rng"
import { addDays } from "../calendar/dates"
import { windowsForYear } from "../calendar/windows"
import { roleAt } from "../players/clubs"
import { initialNationState, World, type WorldStatics } from "./world"
import type { WorldState } from "./types"
import { makeOffers, openStartingJobs, refreshObjectives, setContract } from "../career/career"

export const WORLD_VERSION = 2

/** Compact rows as written by scripts/generate-world.ts. */
export type PlayerRow = [
  string,
  string,
  string,
  string,
  Position,
  string,
  string,
  number,
  number,
  string,
  string,
]
export type ClubRow = [string, string, string, number]

export function clubsFromRows(rows: ClubRow[]): Club[] {
  return rows.map(([id, name, nationId, tier]) => ({ id, name, nationId, tier }))
}

export function playersFromRows(
  byNation: Record<string, PlayerRow[]>,
  clubs: Map<string, Club>,
  seed: number
): Player[] {
  const rng = makeRng(deriveSeed(seed, "hydrate"))
  const out: Player[] = []
  for (const [nationId, rows] of Object.entries(byNation)) {
    for (const [id, first, last, born, pos, alt, foot, ca, pa, pers, clubId] of rows) {
      const [professionalism, ambition, temperament, consistency, bigMatch, injuryProne, loyalty] =
        pers.split(",").map(Number)
      const tier = clubs.get(clubId)?.tier ?? 5
      const role = roleAt(ca, tier, rng)
      out.push({
        id,
        nationId,
        first,
        last,
        born,
        pos,
        alt: alt ? (alt.split(",") as Position[]) : [],
        foot: foot as Player["foot"],
        ca,
        pa,
        pers: {
          professionalism,
          ambition,
          temperament,
          consistency,
          bigMatch,
          injuryProne,
          loyalty,
        },
        clubId,
        role,
        form: Math.round((rng() * 4 - 2) * 10) / 10,
        sharp: role === "reserve" ? 45 : role === "bench" ? 60 : 85,
        morale: 65,
        injury: null,
        caps: 0,
        goals: 0,
        assists: 0,
        history: [],
      })
    }
  }
  return out
}

export interface NewWorldOptions {
  seed: number
  start: string
  managerName: string
  nationality: string
  /** The nation to take charge of, or null to start out of work. */
  nationId: string | null
  /** Starting reputation 1–100 when out of work (a job sets its own). */
  reputation?: number
}

/** 20 for the smallest job, 80 for the best-ranked nation. */
function startingReputation(nations: NationDef[], id: string): number {
  const ranked = [...nations].sort((a, b) => b.points - a.points)
  const rank = Math.max(
    0,
    ranked.findIndex((n) => n.id === id)
  )
  return Math.round(20 + 60 * (1 - rank / ranked.length))
}

export function createWorld(
  opts: NewWorldOptions,
  statics: WorldStatics,
  playerRows: Record<string, PlayerRow[]>
): World {
  const clubs = new Map(statics.clubs.map((c) => [c.id, c]))
  const players = playersFromRows(playerRows, clubs, opts.seed)
  const state: WorldState = {
    version: WORLD_VERSION,
    seed: opts.seed,
    date: opts.start,
    nations: {},
    players: Object.fromEntries(players.map((p) => [p.id, p])),
    nextId: 1,
    competitions: {},
    fixtures: {},
    reports: {},
    news: [],
    nextNewsId: 1,
    honours: {},
    retired: [],
    career: {
      managerName: opts.managerName,
      nationality: opts.nationality,
      nationId: opts.nationId,
      confidence: 60,
      // A manager trusted with a big nation starts with a name to match; one out
      // of work starts with the name he chose.
      reputation: opts.nationId
        ? startingReputation(statics.nations, opts.nationId)
        : Math.round(Math.min(100, Math.max(1, opts.reputation ?? 30))),
      since: opts.start,
      objectives: [],
      offers: [],
      history: opts.nationId
        ? [
            {
              nationId: opts.nationId,
              from: opts.start,
              to: null,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              trophies: [],
            },
          ]
        : [],
    },
    pendingCallup: null,
    friendlyRequests: {},
    userTeam: null,
  }
  for (const def of statics.nations) {
    const n = initialNationState(def, opts.seed, opts.start)
    state.nations[def.id] = n
  }

  const world = new World(state, statics)
  world.ensureCompetitions()
  // Draws already made in the real world, and anything due by the start date.
  world.nextDayCompetitionsOnly()
  world.clearDraw()
  // Windows whose friendly planning date has passed but which have not started.
  for (const w of windowsForYear(Number(opts.start.slice(0, 4)))) {
    if (addDays(w.start, -24) < opts.start && w.start >= opts.start) world.arrangeFriendlies(w)
  }
  refreshObjectives(world)
  setContract(world)
  // Out of work: federations whose standing matches the chosen name call at once.
  if (!opts.nationId) {
    openStartingJobs(world)
    makeOffers(world, true)
  }
  return world
}
