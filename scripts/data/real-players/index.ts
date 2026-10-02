/**
 * Real players, at the top of each nation's starting pool, every name changed a little
 * (Cristiano Rolando) so no player's own name appears as such. The rest of the pool
 * (back-ups, youngsters) stays fictional. Clubs are their real clubs on 1 September 2026,
 * by the names in leagues.ts.
 *
 * One player per line, best first, fields split by "|":
 *
 *   pos[,alt...] foot | First | Last | born | ca[/pa] | club
 *
 *   RW,ST L | Lamine | Yamel | 2007-07-13 | 92/96 | Barcelona
 *
 * `ca` is current ability on the game's scale (engine/players/quality.ts); `pa` defaults
 * from age. The generator moves a nation's list up or down together so it keeps the
 * strength its Elo gives it: what counts is the order and the gaps. `club` is a club name
 * from leagues.ts, "XXX:name" when two nations share it, or "-" to let the generator place
 * him.
 */
import type { Position } from "@/engine/types"
import { UEFA } from "./uefa"
import { CONMEBOL } from "./conmebol"
import { CONCACAF } from "./concacaf"
import { CAF } from "./caf"
import { AFC } from "./afc"
import { OFC } from "./ofc"

export interface RealPlayer {
  pos: Position
  alt: Position[]
  foot: "L" | "R" | "B"
  first: string
  last: string
  born: string
  ca: number
  pa: number | null
  club: string
}

const POSITIONS = new Set(["GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"])

function parse(nation: string, line: string): RealPlayer {
  const fail = (why: string) => new Error(`${nation}: ${why} in "${line}"`)
  const f = line.split("|").map((s) => s.trim())
  if (f.length !== 6) throw fail("expected 6 fields")
  const [posFoot, first, last, born, ability, club] = f
  const [posList, foot] = posFoot.split(/\s+/)
  const [pos, ...alt] = posList.split(",")
  for (const p of [pos, ...alt]) if (!POSITIONS.has(p)) throw fail(`bad position ${p}`)
  if (foot !== "L" && foot !== "R" && foot !== "B") throw fail("bad foot")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(born)) throw fail("bad date")
  const [ca, pa] = ability.split("/").map(Number)
  if (!(ca > 0 && ca <= 96) || (pa !== undefined && !(pa >= ca && pa <= 96)))
    throw fail("bad ability")
  return {
    pos: pos as Position,
    alt: alt as Position[],
    foot,
    first,
    last,
    born,
    ca,
    pa: pa ?? null,
    club,
  }
}

const SOURCES: Record<string, string>[] = [UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC]

export const REAL_PLAYERS: Record<string, RealPlayer[]> = {}
for (const source of SOURCES)
  for (const [nation, block] of Object.entries(source)) {
    if (REAL_PLAYERS[nation]) throw new Error(`${nation}: real players listed twice`)
    REAL_PLAYERS[nation] = block
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => parse(nation, l))
  }
