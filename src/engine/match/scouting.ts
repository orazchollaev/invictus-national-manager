/**
 * What the manager's staff can tell him about an opponent before a match, and what they
 * would change. Everything here is read from the same rules the match engine plays by:
 * the matchup table says which of the opponent's habits can be exploited, so the report
 * never promises anything the match will not deliver.
 */
import type { Player } from "../types"
import { matchAbility, positionGroup } from "../players/ability"
import { ARCHETYPES, archetypeOf } from "../players/archetypes"
import { combineStyle, ROLES } from "./roles"
import { firing, instructionsOf, meet, styleOf, type PlayStyle, type Rule } from "./matchup"
import type { Formation, Level, Tactics, TeamSheet } from "./types"

export const LINE_NAMES = ["Deep", "Standard", "High"] as const
export const WIDTH_NAMES = ["Narrow", "Standard", "Wide"] as const

/** How a side plays, in a few words. */
export function traitsOf(t: Tactics): string[] {
  const i = instructionsOf(t)
  const out: string[] = []
  if (t.mentality >= 1) out.push("Attack-minded")
  if (t.mentality <= -1) out.push("Cautious")
  if (i.line === 2) out.push("High line")
  if (i.line === 0) out.push("Deep line")
  if (i.width === 2) out.push("Plays wide")
  if (i.width === 0) out.push("Plays narrow")
  if (i.counter) out.push("Counter-attacking")
  if (t.pressing === 2) out.push("High press")
  if (t.pressing === 0) out.push("Drops off")
  if (t.tempo === 2) out.push("Direct")
  if (t.tempo === 0) out.push("Patient")
  return out.length ? out : ["Balanced"]
}

export type KeyReason = "star" | "threat" | "creator" | "weak"

export interface KeyPlayer {
  playerId: string
  reason: KeyReason
  /** What to say about him. */
  note: string
  archetype: string
  role: string | null
}

const REASON_NOTE: Record<KeyReason, string> = {
  star: "Their best player",
  threat: "Their main goal threat",
  creator: "Creates most of their chances",
  weak: "The weak link",
}

/** The players to watch in a sheet, and the one place to hit. */
export function keyPlayers(
  sheet: TeamSheet,
  byId: (id: string) => Player | undefined
): KeyPlayer[] {
  const picks = sheet.xi
    .map((slot) => ({ slot, p: byId(slot.playerId) }))
    .filter((x): x is { slot: (typeof sheet.xi)[number]; p: Player } => !!x.p)
  const outfield = picks.filter((x) => x.slot.pos !== "GK")
  if (!outfield.length) return []
  const used = new Set<string>()
  const out: KeyPlayer[] = []
  const add = (x: (typeof picks)[number] | undefined, reason: KeyReason) => {
    if (!x || used.has(x.p.id)) return
    used.add(x.p.id)
    out.push({
      playerId: x.p.id,
      reason,
      note: REASON_NOTE[reason],
      archetype: ARCHETYPES[archetypeOf(x.p)].label,
      role: x.slot.role ? ROLES[x.slot.role].label : null,
    })
  }
  const style = (x: (typeof picks)[number]) => combineStyle(archetypeOf(x.p), x.slot.role)
  const best = (xs: typeof picks, value: (x: (typeof picks)[number]) => number) =>
    xs.reduce<(typeof picks)[number] | undefined>(
      (a, b) => (!a || value(b) > value(a) ? b : a),
      undefined
    )

  add(
    best(picks, (x) => matchAbility(x.p)),
    "star"
  )
  const attackers = outfield.filter((x) => ["FWD", "MID"].includes(positionGroup(x.slot.pos)))
  add(
    best(
      attackers.filter((x) => !used.has(x.p.id)),
      (x) => matchAbility(x.p) * style(x).score * (positionGroup(x.slot.pos) === "FWD" ? 1.3 : 1)
    ),
    "threat"
  )
  add(
    best(
      outfield.filter((x) => !used.has(x.p.id) && x.slot.pos !== "CB"),
      (x) => matchAbility(x.p) * style(x).assist
    ),
    "creator"
  )
  // The weakest outfielder for his slot: where an attack should go.
  const weak = best(outfield, (x) => -matchAbility(x.p))
  if (weak && !used.has(weak.p.id)) add(weak, "weak")
  return out
}

export interface MatchupLine {
  id: Rule["id"]
  label: string
  /** Above 1 the matchup helps the side it is listed for. */
  factor: number
}

function lines(rules: Rule[]): MatchupLine[] {
  return rules.map((r) => ({ id: r.id, label: r.label, factor: r.factor }))
}

/** Net advantage of `a`'s way of playing over `b`'s, as a log ratio. */
export function advantage(a: PlayStyle, b: PlayStyle): number {
  const x = meet(a, b)
  const y = meet(b, a)
  return Math.log((x.att * x.mid * x.def) / (y.att * y.mid * y.def))
}

export interface Advice {
  /** What to change in the tactics, to apply as they are. */
  patch: Partial<Pick<Tactics, "line" | "width" | "counter">>
  /** The same in words, one line per change. */
  changes: string[]
  /** The matchups this wins or avoids. */
  reasons: string[]
  /** How much better the matchup gets, as a log ratio (0.01 is about one per cent). */
  gain: number
}

/** Below this the staff see no reason to change anything. */
export const ADVICE_THRESHOLD = 0.01

const LEVELS: Level[] = [0, 1, 2]

/**
 * The best defensive line, width and counter-attack setting against an opponent, with
 * everything else left as it is. Tempo and pressing are not touched: their costs are
 * paid in stamina and chance quality, which a matchup table does not see.
 */
export function advise(mine: Tactics, theirs: Tactics): Advice {
  const own = instructionsOf(mine)
  const opp = styleOf(theirs)
  const base = styleOf(mine)
  const now = advantage(base, opp)

  const options: { line: Level; width: Level; counter: boolean; gain: number; changes: number }[] =
    []
  for (const line of LEVELS)
    for (const width of LEVELS)
      for (const counter of [false, true])
        options.push({
          line,
          width,
          counter,
          gain: advantage({ ...base, line, width, counter }, opp) - now,
          changes: +(line !== own.line) + +(width !== own.width) + +(counter !== own.counter),
        })
  const top = Math.max(...options.map((o) => o.gain))
  // Within a whisker of the best, the smaller change wins.
  const best = options
    .filter((o) => o.gain >= top - 0.002)
    .sort((x, y) => x.changes - y.changes || y.gain - x.gain)[0]
  const bestGain = best.gain

  const patch: Advice["patch"] = {}
  const changes: string[] = []
  if (best.line !== own.line) {
    patch.line = best.line
    changes.push(`Defensive line: ${LINE_NAMES[own.line]} → ${LINE_NAMES[best.line]}`)
  }
  if (best.width !== own.width) {
    patch.width = best.width
    changes.push(`Width: ${WIDTH_NAMES[own.width]} → ${WIDTH_NAMES[best.width]}`)
  }
  if (best.counter !== own.counter) {
    patch.counter = best.counter
    changes.push(`Counter-attack: ${own.counter ? "on" : "off"} → ${best.counter ? "on" : "off"}`)
  }

  if (!changes.length || bestGain < ADVICE_THRESHOLD)
    return { patch: {}, changes: [], reasons: [], gain: 0 }

  const after = { ...base, ...best }
  const ids = (rules: Rule[]) => new Set(rules.map((r) => r.id))
  const hadMine = ids(firing(base, opp))
  const hadTheirs = ids(firing(opp, base))
  const reasons = [
    ...firing(after, opp).filter((r) => r.factor > 1 && !hadMine.has(r.id)),
    ...firing(base, opp).filter((r) => r.factor < 1 && !ids(firing(after, opp)).has(r.id)),
    ...firing(opp, base).filter((r) => r.factor > 1 && !ids(firing(opp, after)).has(r.id)),
    ...firing(opp, after).filter((r) => r.factor < 1 && !hadTheirs.has(r.id)),
  ].map((r) => r.label)
  return { patch, changes, reasons: [...new Set(reasons)], gain: bestGain }
}

export interface ScoutReport {
  nationId: string
  formation: Formation
  traits: string[]
  key: KeyPlayer[]
  /** How your way of playing meets theirs, for and against you. */
  yours: MatchupLine[]
  /** How their way of playing meets yours, for and against them. */
  theirs: MatchupLine[]
  advice: Advice
}

/** The report on an opponent: their expected sheet against the tactics you would play. */
export function scoutReport(
  sheet: TeamSheet,
  mine: Tactics,
  byId: (id: string) => Player | undefined
): ScoutReport {
  const a = styleOf(mine)
  const b = styleOf(sheet.tactics)
  return {
    nationId: sheet.nationId,
    formation: sheet.tactics.formation,
    traits: traitsOf(sheet.tactics),
    key: keyPlayers(sheet, byId),
    yours: lines(firing(a, b)),
    theirs: lines(firing(b, a)),
    advice: advise(mine, sheet.tactics),
  }
}
