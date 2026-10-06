import { describe, expect, it } from "vitest"
import { resolveText as say } from "@/i18n/text"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef, Player, Position } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { FORMATION_LIST } from "../match/formations"
import { RULES, styleOf } from "../match/matchup"
import {
  ADVICE_THRESHOLD,
  advantage,
  advise,
  keyPlayers,
  scoutReport,
  traitsOf,
} from "../match/scouting"
import type { Formation, Level, Tactics } from "../match/types"
import { archetypesFor } from "../players/archetypes"
import { plainAttrs, sideOf } from "./helpers"

const tactics = (formation: Formation = "4-2-3-1", extra: Partial<Tactics> = {}): Tactics => ({
  formation,
  mentality: 0,
  pressing: 1,
  tempo: 1,
  ...extra,
})

const first = (pos: Position) => archetypesFor(pos)[0]

describe("traitsOf", () => {
  it("calls a plain side balanced", () => {
    expect(traitsOf(tactics()).map(say)).toEqual(["Balanced"])
  })

  it("names the ways a side plays", () => {
    const t = traitsOf(
      tactics("4-4-2", { mentality: -1, line: 0, counter: true, tempo: 2, pressing: 0 })
    )
    expect(t.map(say)).toEqual([
      "Cautious",
      "Deep line",
      "Counter-attacking",
      "Drops off",
      "Direct",
    ])
    expect(
      traitsOf(tactics("4-3-3", { mentality: 2, line: 2, width: 2, pressing: 2, tempo: 0 })).map(
        say
      )
    ).toEqual(["Attack-minded", "High line", "Plays wide", "High press", "Patient"])
  })
})

describe("keyPlayers", () => {
  function squad() {
    const side = sideOf("o", first)
    const byId = new Map<string, Player>(side.players.map((p) => [p.id, p]))
    const at = (pos: Position) => side.sheet.xi.findIndex((s) => s.pos === pos)
    return { side, byId, at, lookup: (id: string) => byId.get(id) }
  }

  it("names the best player, the goal threat, the creator and the weak link", () => {
    const { side, byId, at, lookup } = squad()
    const set = (i: number, ca: number) => {
      const p = byId.get(side.sheet.xi[i].playerId)!
      p.ca = ca
      p.attrs = plainAttrs(p.pos, ca)
    }
    set(at("CB"), 88) // best player
    set(at("ST"), 80) // threat
    set(at("AM"), 79) // creator
    set(at("LB"), 55) // weak
    const out = keyPlayers(side.sheet, lookup)
    expect(out.map((k) => k.reason)).toEqual(["star", "threat", "creator", "weak"])
    expect(out[0].playerId).toBe(side.sheet.xi[at("CB")].playerId)
    expect(out[1].playerId).toBe(side.sheet.xi[at("ST")].playerId)
    expect(out[2].playerId).toBe(side.sheet.xi[at("AM")].playerId)
    expect(out[3].playerId).toBe(side.sheet.xi[at("LB")].playerId)
  })

  it("never names a player twice", () => {
    const { side, byId, at, lookup } = squad()
    byId.get(side.sheet.xi[at("AM")].playerId)!.ca = 95
    const ids = keyPlayers(side.sheet, lookup).map((k) => k.playerId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("says what kind of player and in which role", () => {
    const { side, lookup } = squad()
    side.sheet.xi[side.sheet.xi.findIndex((s) => s.pos === "ST")].role = "poacher"
    const out = keyPlayers(side.sheet, lookup)
    for (const k of out) expect(say(k.archetype).length).toBeGreaterThan(0)
    expect(out.some((k) => k.role && say(k.role) === "Poacher")).toBe(true)
  })

  it("has nothing to say about players it cannot find", () => {
    const { side } = squad()
    expect(keyPlayers(side.sheet, () => undefined)).toEqual([])
  })
})

describe("advise", () => {
  it("has no advice against a side that does the same", () => {
    expect(advise(tactics(), tactics())).toEqual({ patch: {}, changes: [], reasons: [], gain: 0 })
  })

  it("tells a high-line side to drop off against a counter-attacking one", () => {
    const a = advise(tactics("4-2-3-1", { line: 2 }), tactics("4-4-2", { counter: true, tempo: 2 }))
    expect(a.patch.line).toBeLessThan(2)
    expect(say(a.changes[0])).toContain("Defensive line: High →")
    expect(a.reasons.map(say)).toContain("Balls in behind a high line")
    expect(a.gain).toBeGreaterThan(ADVICE_THRESHOLD)
  })

  it("tells a side to go wide against a back four with open flanks", () => {
    const a = advise(tactics("4-2-3-1"), tactics("4-3-1-2"))
    expect(a.patch.width).toBe(2)
    expect(a.reasons.map(say)).toContain("Width against a flat four with open flanks")
  })

  it("only ever touches line, width and counter-attack", () => {
    for (const f of FORMATION_LIST) {
      const a = advise(
        tactics("4-4-2", { mentality: 1, tempo: 2, pressing: 2 }),
        tactics(f, { line: 2 })
      )
      for (const k of Object.keys(a.patch)) expect(["line", "width", "counter"]).toContain(k)
    }
  })

  it("explains itself with real matchups", () => {
    const labels = new Set(RULES.map((r) => `rule.${r.id}`))
    for (const f of FORMATION_LIST)
      for (const line of [0, 1, 2] as Level[])
        for (const counter of [false, true]) {
          const a = advise(tactics("4-2-3-1"), tactics(f, { line, counter, width: 2 }))
          for (const r of a.reasons) expect(labels.has(r.k)).toBe(true)
          if (a.changes.length) expect(a.reasons.length).toBeGreaterThan(0)
        }
  })

  it("always leaves you better off, and leaves nothing on the table", () => {
    const L = [0, 1, 2] as Level[]
    for (const fa of ["4-2-3-1", "3-5-2", "4-3-1-2"] as Formation[])
      for (const fb of FORMATION_LIST)
        for (const line of L)
          for (const counter of [false, true]) {
            const mine = tactics(fa, { width: 0 })
            const theirs = tactics(fb, { line, counter, width: 2, tempo: 2 })
            const a = advise(mine, theirs)
            const opp = styleOf(theirs)
            const now = advantage(styleOf(mine), opp)
            const after = advantage(styleOf({ ...mine, ...a.patch }), opp)
            if (a.changes.length) {
              expect(after - now).toBeGreaterThanOrEqual(ADVICE_THRESHOLD - 1e-9)
              expect(after - now).toBeCloseTo(a.gain, 6)
            } else {
              // Nothing suggested: no setting is worth more than the threshold.
              for (const l of L)
                for (const w of L)
                  for (const c of [false, true])
                    expect(
                      advantage(styleOf({ ...mine, line: l, width: w, counter: c }), opp) - now
                    ).toBeLessThan(ADVICE_THRESHOLD + 0.002)
            }
          }
  })

  it("gives the same advice every time", () => {
    const m = tactics("4-2-3-1", { line: 2 })
    const t = tactics("5-3-2", { counter: true })
    expect(advise(m, t)).toEqual(advise(m, t))
  })
})

describe("scoutReport", () => {
  it("lists the matchups on both sides and the advice", () => {
    const opp = sideOf("o", first, { tactics: { counter: true, tempo: 2 } })
    const byId = new Map(opp.players.map((p) => [p.id, p]))
    const mine = tactics("4-2-3-1", { line: 2 })
    const r = scoutReport(opp.sheet, mine, (id) => byId.get(id))
    expect(r.nationId).toBe("o")
    expect(r.formation).toBe("4-2-3-1")
    expect(r.traits.map(say)).toEqual(["Counter-attacking", "Direct"])
    expect(r.theirs.map((l) => l.id)).toContain("behind-high-line")
    expect(r.yours.map((l) => l.id)).not.toContain("behind-high-line")
    expect(r.key.length).toBeGreaterThan(0)
    expect(r.advice.patch.line).toBeLessThan(2)
  })
})

describe("scouting in the world", () => {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  const newWorld = () =>
    createWorld(
      { seed: 1, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
      statics,
      playerRows as unknown as Record<string, PlayerRow[]>
    )
  const fixtureOf = (w: ReturnType<typeof newWorld>, pred: (h: string, a: string) => boolean) =>
    Object.values(w.state.fixtures).find((f) => pred(f.home, f.away))!
  const mineOf = (w: ReturnType<typeof newWorld>) =>
    fixtureOf(w, (h, a) => h === "TUR" || a === "TUR")
  const oppOf = (f: { home: string; away: string }) => (f.home === "TUR" ? f.away : f.home)

  it("reports on the opponent and on nobody else in another nation's match", () => {
    const w = newWorld()
    const f = mineOf(w)
    const other = fixtureOf(w, (h, a) => h !== "TUR" && a !== "TUR")
    const r = w.scout(f)!
    expect(r.nationId).toBe(oppOf(f))
    expect(r.key.length).toBeGreaterThan(0)
    expect(w.scout(other)).toBeNull()
  })

  it("changes nothing by looking", () => {
    const w = newWorld()
    const f = mineOf(w)
    const snapshot = () =>
      JSON.stringify([
        w.state.nations[oppOf(f)],
        w.state.nations.TUR,
        w.pool(oppOf(f)).map((p) => [p.morale, p.lastCall]),
        w.pool("TUR").map((p) => [p.morale, p.lastCall]),
      ])
    const before = snapshot()
    w.scout(f)
    expect(snapshot() === before).toBe(true)
  })

  it("expects the sheet the opponent then sends out", () => {
    const w = newWorld()
    const f = mineOf(w)
    const expected = w.expectedSheet(oppOf(f), f)
    w.aiCallUp(oppOf(f), w.squadKey(f, oppOf(f)), f.compId)
    expect(w.aiSheet(oppOf(f), f)).toEqual(expected)
  })

  it("reads the matchups against the tactics it is given", () => {
    const w = newWorld()
    const f = mineOf(w)
    const given = tactics("4-2-3-1", { line: 2, counter: true, width: 2 })
    const r = w.scout(f, given)!
    const theirs = styleOf(w.expectedSheet(oppOf(f), f).tactics)
    const mine = styleOf(given)
    expect(r.yours.map((l) => l.id).sort()).toEqual(
      RULES.filter((x) => x.applies(mine, theirs))
        .map((x) => x.id)
        .sort()
    )
  })

  it("has the assistant set up the instructions the staff recommend", () => {
    const w = newWorld()
    const f = mineOf(w)
    w.setSquad(
      "TUR",
      w.squadKey(f, "TUR"),
      w
        .pool("TUR")
        .slice(0, 26)
        .map((p) => p.id)
    )
    const plain = w.aiSheet("TUR", f)
    const sheet = w.assistantSheet(f)
    const advice = advise(plain.tactics, w.expectedSheet(oppOf(f), f).tactics)
    expect(sheet.tactics).toEqual({ ...plain.tactics, ...advice.patch })
    expect(sheet.xi).toEqual(plain.xi)
  })
})

describe("taking the staff's advice", () => {
  const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
  const setup = () => {
    const w = createWorld(
      { seed: 1, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
      statics,
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    const f = Object.values(w.state.fixtures).find((x) => x.home === "TUR" || x.away === "TUR")!
    w.setSquad(
      "TUR",
      w.squadKey(f, "TUR"),
      w
        .pool("TUR")
        .slice(0, 26)
        .map((p) => p.id)
    )
    return { w, f, opp: f.home === "TUR" ? f.away : f.home }
  }

  /** Some setting the staff would change against this opponent: there always is one. */
  function poorSetting(
    w: ReturnType<typeof setup>["w"],
    f: ReturnType<typeof setup>["f"],
    opp: string
  ) {
    const sheet = w.userSheet(f)
    const theirs = w.expectedSheet(opp, f).tactics
    const found = ([0, 1, 2] as Level[])
      .flatMap((line) => ([0, 1, 2] as Level[]).map((width) => ({ line, width, counter: true })))
      .find((c) => advise({ ...sheet.tactics, ...c }, theirs).changes.length > 0)
    expect(found).toBeDefined()
    return { sheet, setting: found!, theirs }
  }

  it("builds a team with the recommended instructions, and nothing else changed", () => {
    const { w, f, opp } = setup()
    const { sheet, setting, theirs } = poorSetting(w, f, opp)
    w.state.userTeam = {
      tactics: { ...sheet.tactics, ...setting },
      xi: sheet.xi,
      bench: sheet.bench,
    }
    const team = w.adviceFor(f)!
    const advice = advise(w.state.userTeam.tactics, theirs)
    expect(team.tactics).toEqual({ ...w.state.userTeam.tactics, ...advice.patch })
    expect(team.xi).toEqual(w.userSheet(f).xi)
    expect(team.bench).toEqual(w.userSheet(f).bench)
  })

  it("has nothing more to say once the advice is taken", () => {
    const { w, f, opp } = setup()
    const { sheet, setting } = poorSetting(w, f, opp)
    w.state.userTeam = {
      tactics: { ...sheet.tactics, ...setting },
      xi: sheet.xi,
      bench: sheet.bench,
    }
    const team = w.adviceFor(f)
    expect(team).not.toBeNull()
    w.state.userTeam = team
    expect(w.adviceFor(f)).toBeNull()
  })

  it("has no advice for a nation with no user", () => {
    const { w, f } = setup()
    w.state.career.nationId = null
    expect(w.adviceFor(f)).toBeNull()
  })
})
