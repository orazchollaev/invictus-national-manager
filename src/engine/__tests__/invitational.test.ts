import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { World } from "../world/world"
import { playMatch } from "../match/engine"
import { addDays, daysBetween } from "../calendar/dates"
import { windowsForYear, type MatchWindow } from "../calendar/windows"
import {
  fits,
  formatsFor,
  INVITATIONAL_DRAW_DAYS,
  matchDays,
  roundsOf,
  windowById,
} from "../competition/defs/invitational"
import {
  acceptInvite,
  candidatesFor,
  checkSetup,
  commitments,
  createInvitational,
  declineInvite,
  maybeInvite,
  openWindows,
  suggestedWindow,
} from "../world/invitational"
import type { InvitationalFormat } from "../competition/types"
import { competitionDef } from "../competition/defs"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId = "BRA", seed = 21) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

/** Run the world, playing the user's matches and answering everything as the assistant. */
function runUntil(w: World, done: () => boolean, limit = 400) {
  for (let g = 0; g < limit && !done(); g++) {
    w.state.career.confidence = 80
    const i = w.advance(1)
    if (w.settle(i)) continue
    if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
    else if (i.kind === "match") {
      const f = w.state.fixtures[i.fixtureId]
      w.applyReport(f, playMatch(w.matchSetup(f, w.aiSheet(f.home, f), w.aiSheet(f.away, f))), true)
    }
  }
}

const twoMatch = windowsForYear(2027)[0]
const fourMatch = windowsForYear(2027).find((x) => x.slots.length === 4)!

/** A tournament for the user in his first free window, with the closest candidates. */
function setUp(w: World, size: 4 | 8, format: InvitationalFormat) {
  const me = w.userNation!
  const win = openWindows(w, me).find((x) => fits(x, format, size))!
  const teams = [
    me,
    ...candidatesFor(w, me, win)
      .slice(0, size - 1)
      .map((c) => c.id),
  ]
  const out = createInvitational(w, win.id, teams, format)
  if (!("id" in out)) throw new Error(`set-up refused: ${out.problem}`)
  return { win, teams, id: out.id }
}

function windowFixtures(w: World, win: MatchWindow, teams: string[]) {
  const set = new Set(teams)
  return Object.values(w.state.fixtures).filter(
    (f) =>
      f.date >= win.start && f.date <= addDays(win.end, 6) && (set.has(f.home) || set.has(f.away))
  )
}

describe("invitational schedule", () => {
  it("fits every format into a two-match window, two or three days apart", () => {
    for (const size of [4, 8]) {
      for (const format of formatsFor(size)) {
        const days = matchDays(twoMatch, roundsOf(format, size))!
        expect(days).not.toBeNull()
        expect(days[0] > twoMatch.start).toBe(true)
        expect(days[days.length - 1] < twoMatch.end).toBe(true)
        for (let i = 1; i < days.length; i++) {
          const gap = daysBetween(days[i - 1], days[i])
          expect(gap).toBeGreaterThanOrEqual(2)
          expect(gap).toBeLessThanOrEqual(3)
        }
      }
    }
  })

  it("rests three days between rounds in the long autumn window", () => {
    const days = matchDays(fourMatch, 4)!
    for (let i = 1; i < days.length; i++) expect(daysBetween(days[i - 1], days[i])).toBe(3)
  })

  it("offers knockout and league for four, knockout and groups for eight", () => {
    expect(formatsFor(4)).toEqual(["knockout", "league"])
    expect(formatsFor(8)).toEqual(["knockout", "groups"])
    expect(formatsFor(6)).toEqual([])
    expect(fits(twoMatch, "groups", 4)).toBe(false)
    expect(fits(twoMatch, "league", 8)).toBe(false)
  })

  it("finds windows by id", () => {
    expect(windowById(twoMatch.id)).toEqual(twoMatch)
    expect(windowById("2027-01-01")).toBeUndefined()
  })
})

describe("setting up a tournament", () => {
  it("lists only free windows and keen nations close in strength", () => {
    const w = newWorld("BRA")
    const wins = openWindows(w, "BRA")
    expect(wins.length).toBeGreaterThan(0)
    for (const win of wins) {
      expect(daysBetween(w.state.date, win.start)).toBeGreaterThanOrEqual(16)
      const taken = commitments(w, win)
      expect(taken("BRA")).toBe(false)
      const cands = candidatesFor(w, "BRA", win)
      expect(cands.length).toBeGreaterThan(0)
      for (const c of cands) {
        expect(c.id).not.toBe("BRA")
        expect(taken(c.id)).toBe(false)
        expect(Math.abs(c.points - w.nation("BRA").points)).toBeLessThanOrEqual(320)
      }
      // Closest first.
      const gaps = cands.map((c) => Math.abs(c.points - w.nation("BRA").points))
      expect([...gaps].sort((a, b) => a - b)).toEqual(gaps)
    }
  })

  it("refuses a bad set-up", () => {
    const w = newWorld("BRA")
    const win = openWindows(w, "BRA")[0]
    const cands = candidatesFor(w, "BRA", win).map((c) => c.id)
    const four = ["BRA", ...cands.slice(0, 3)]
    expect(checkSetup(w, win.id, ["BRA", ...cands.slice(0, 4)], "knockout")).toBe("size")
    expect(checkSetup(w, win.id, ["BRA", "BRA", cands[0], cands[1]], "knockout")).toBe("duplicate")
    expect(checkSetup(w, win.id, four, "groups")).toBe("format")
    expect(checkSetup(w, "2026-09-02", four, "knockout")).toBe("window")
    // A nation in a competition that window cannot come.
    const busy = Object.values(w.state.fixtures).find(
      (f) => f.compId !== "friendly" && f.date >= win.start && f.date <= win.end
    )
    if (busy)
      expect(checkSetup(w, win.id, ["BRA", busy.home, ...cands.slice(0, 2)], "knockout")).toBe(
        "busy"
      )
    expect(checkSetup(w, win.id, four, "knockout")).toBeNull()
    expect("id" in createInvitational(w, win.id, four, "knockout")).toBe(true)
    // One tournament per window, and its teams are spoken for.
    expect(checkSetup(w, win.id, four, "league")).toBe("taken")
    expect(commitments(w, win)("BRA")).toBe(true)
    expect(openWindows(w, "BRA").some((x) => x.id === win.id)).toBe(false)
  })

  it(
    "plays a four-team knockout at the user's home, drawn two weeks before",
    { timeout: 300000 },
    () => {
      const w = newWorld("BRA")
      const { win, teams, id } = setUp(w, 4, "knockout")
      const inst = w.state.competitions[id]
      expect(inst.hosts).toEqual(["BRA"])
      expect(inst.kind).toBe("invitational")
      runUntil(w, () => w.state.date >= addDays(win.start, -INVITATIONAL_DRAW_DAYS - 1))
      expect(inst.stages[0].status).toBe("waiting")
      runUntil(w, () => w.state.competitions[id].status === "done")
      const done = w.state.competitions[id]
      expect(done.status).toBe("done")
      expect(teams).toContain(done.outcome.winner)
      expect(new Set(done.outcome.placings)).toEqual(new Set(teams))
      const fx = Object.values(w.state.fixtures).filter((f) => f.compId === id)
      // Two semi-finals, the final and the match for third place.
      expect(fx).toHaveLength(4)
      for (const f of fx) {
        expect(f.date >= win.start && f.date <= win.end).toBe(true)
        expect(f.importance).toBe("friendly")
        // The host plays at home; everyone else on neutral ground.
        expect(f.atHome).toBe(f.home === "BRA")
        expect(f.away).not.toBe("BRA")
      }
      // Nothing else for the four in that window.
      expect(windowFixtures(w, win, teams).every((f) => f.compId === id)).toBe(true)
      expect(w.state.honours[done.defId]?.some((h) => h.comp === id)).toBe(true)
    }
  )

  it("plays a four-team league: everyone meets once", { timeout: 300000 }, () => {
    const w = newWorld("JPN")
    const { teams, id } = setUp(w, 4, "league")
    runUntil(w, () => w.state.competitions[id].status === "done")
    const fx = Object.values(w.state.fixtures).filter((f) => f.compId === id)
    expect(fx).toHaveLength(6)
    for (const t of teams) expect(fx.filter((f) => f.home === t || f.away === t)).toHaveLength(3)
    expect(w.state.competitions[id].outcome.placings).toHaveLength(4)
  })

  it(
    "plays eight in two groups: winners in the final, runners-up for third",
    { timeout: 300000 },
    () => {
      const w = newWorld("NZL")
      const { teams, id } = setUp(w, 8, "groups")
      runUntil(w, () => w.state.competitions[id].status === "done")
      const inst = w.state.competitions[id]
      const groups = inst.stages[0].groups!
      expect(groups).toHaveLength(2)
      // The host heads group A.
      expect(groups[0].teams[0]).toBe("NZL")
      expect(new Set(groups.flatMap((g) => g.teams))).toEqual(new Set(teams))
      const fx = Object.values(w.state.fixtures).filter((f) => f.compId === id)
      expect(fx).toHaveLength(12 + 2)
      const final = inst.stages.find((s) => s.key === "final")!.rounds![0].ties[0]
      const firstOf = (g: number) =>
        groups[g].teams.find((t) => [final.home, final.away].includes(t))
      expect(firstOf(0)).toBeTruthy()
      expect(firstOf(1)).toBeTruthy()
      expect(inst.outcome.winner).toBe(final.winner)
      expect(inst.outcome.placings).toHaveLength(8)
      // The final's line-up is set by the tables: no draw to watch.
      expect(w.state.pendingDraw?.compId === id && w.state.pendingDraw.stageKey !== "groups").toBe(
        false
      )
    }
  )

  it("plays an eight-team knockout with a match for third", { timeout: 300000 }, () => {
    const w = newWorld("USA")
    const { id } = setUp(w, 8, "knockout")
    runUntil(w, () => w.state.competitions[id].status === "done")
    const fx = Object.values(w.state.fixtures).filter((f) => f.compId === id)
    expect(fx).toHaveLength(4 + 2 + 1 + 1)
    expect(w.state.competitions[id].outcome.third).toBeTruthy()
  })

  it("clears friendlies already arranged for its teams", { timeout: 300000 }, () => {
    const w = newWorld("BRA")
    const win = openWindows(w, "BRA").find((x) => daysBetween(w.state.date, x.start) > 40)!
    // Past the day friendlies are arranged (24 days before), but still in time.
    runUntil(w, () => w.state.date >= addDays(win.start, -20))
    const before = windowFixtures(w, win, ["BRA"]).filter((f) => f.compId === "friendly")
    expect(before.length).toBeGreaterThan(0)
    const cands = candidatesFor(w, "BRA", win).map((c) => c.id)
    const out = createInvitational(w, win.id, ["BRA", ...cands.slice(0, 3)], "knockout")
    expect("id" in out).toBe(true)
    const teams = ["BRA", ...cands.slice(0, 3)]
    for (const f of windowFixtures(w, win, teams)) expect(f.compId).not.toBe("friendly")
    // And none are arranged again.
    runUntil(w, () => w.state.date >= win.end)
    for (const f of windowFixtures(w, win, teams)) expect(f.compId).not.toBe("friendly")
  })
})

describe("the suggested window", () => {
  it("is the first free window with no match, and gone once a tournament is set", () => {
    const w = newWorld("BRA")
    const win = suggestedWindow(w, "BRA")!
    expect(win).toBeTruthy()
    expect(w.fixturesOf("BRA", win.start, win.end)).toHaveLength(0)
    expect(daysBetween(w.state.date, win.start)).toBeLessThanOrEqual(120)
    expect(openWindows(w, "BRA").map((x) => x.id)).toContain(win.id)
    const cands = candidatesFor(w, "BRA", win).map((c) => c.id)
    createInvitational(w, win.id, ["BRA", ...cands.slice(0, 3)], "knockout")
    expect(suggestedWindow(w, "BRA")?.id).not.toBe(win.id)
  })

  it("is not offered for a window with a match in it", () => {
    const w = newWorld("TUR")
    const win = suggestedWindow(w, "TUR")
    if (win) expect(w.fixturesOf("TUR", win.start, win.end)).toHaveLength(0)
  })
})

describe("free windows", () => {
  /** Live stages not drawn yet, played in a window, whose stages before are not over. */
  function undrawn(w: World) {
    const ctx = w.ctx()
    const out: { inst: string; confed: string; kind: string; win: MatchWindow }[] = []
    const wins = [...windowsForYear(2027), ...windowsForYear(2028)].filter(
      (x) => x.start > w.state.date
    )
    for (const inst of Object.values(w.state.competitions)) {
      if (inst.status === "done" || inst.invitational) continue
      const plans = competitionDef(inst.defId).plan(inst, ctx)
      plans.forEach((p, i) => {
        if (inst.stages.find((s) => s.key === p.key)?.status !== "waiting") return
        const deps =
          p.after === undefined ? (i > 0 ? [plans[i - 1].key] : []) : [p.after ?? []].flat()
        if (deps.every((k) => inst.stages.find((s) => s.key === k)?.status === "done")) return
        const dates = [
          ...(p.groups?.dates ?? []),
          ...(p.knockout?.rounds.flatMap((r) => r.dates) ?? []),
        ]
        for (const win of wins)
          if (dates.some((d) => d >= win.start && d <= win.end))
            out.push({ inst: inst.id, confed: inst.confed, kind: inst.kind, win })
      })
    }
    return out
  }

  it("are not free while a qualifier's draw there is still to come", { timeout: 300000 }, () => {
    const w = newWorld("BRA")
    for (let i = 0; i < 300; i++) w.nextDay()
    const cases = undrawn(w).filter((c) => c.kind !== "regional" && c.confed !== "FIFA")
    expect(cases.length).toBeGreaterThan(0)
    for (const c of cases) {
      const taken = commitments(w, c.win)
      const members = (nations as NationDef[]).filter(
        (n) => n.confed === c.confed && !n.nonFifa && w.state.nations[n.id]
      )
      for (const n of members) expect(taken(n.id), `${n.id} in ${c.inst} ${c.win.id}`).toBe(true)
    }
  })

  it("count editions the calendar has not created yet", () => {
    const w = newWorld("BRA")
    const wcq = Object.keys(w.state.competitions).find((id) => id.startsWith("wcq-conmebol"))!
    expect(wcq).toBeTruthy()
    // A window South America's qualifying claims, with no match of Brazil's in it yet.
    const win = [...windowsForYear(2027), ...windowsForYear(2028)].find(
      (x) =>
        x.start > w.state.date &&
        !w.fixturesOf("BRA", x.start, x.end).length &&
        commitments(w, x)("BRA")
    )!
    expect(win).toBeTruthy()
    // The same world before that edition was created: its dates still count.
    const state = JSON.parse(JSON.stringify(w.state))
    delete state.competitions[wcq]
    const before = new World(state, statics())
    expect(before.state.competitions[wcq]).toBeUndefined()
    expect(commitments(before, win)("BRA")).toBe(true)
  })

  it("let a regional cup claim only its own teams", { timeout: 300000 }, () => {
    const w = newWorld("JPN")
    w.state.career.nationId = null
    for (let i = 0; i < 360; i++) w.nextDay()
    const regional = undrawn(w).filter((c) => c.kind === "regional")
    for (const c of regional) {
      const inst = w.state.competitions[c.inst]
      const teams = new Set(
        inst.stages.flatMap((s) => [
          ...(s.groups?.flatMap((g) => g.teams) ?? []),
          ...(s.rounds?.flatMap((r) => r.ties.flatMap((t) => [t.home, t.away])) ?? []),
        ])
      )
      const taken = commitments(w, c.win)
      for (const t of teams) if (t) expect(taken(t)).toBe(true)
      // Somebody of that confederation outside the cup, with no match there, is free.
      const outside = (nations as NationDef[]).find(
        (n) =>
          n.confed === c.confed &&
          !teams.has(n.id) &&
          !w.fixturesOf(n.id, c.win.start, c.win.end).some((f) => f.compId !== "friendly") &&
          !undrawn(w).some(
            (o) => o.win.id === c.win.id && o.kind !== "regional" && o.confed === n.confed
          )
      )
      if (outside) expect(taken(outside.id)).toBe(false)
    }
  })
})

describe("invitations", () => {
  /** A world where an invitation has just arrived for the user. */
  function invited(): World {
    const w = newWorld("BRA")
    const win = openWindows(w, "BRA").find((x) => daysBetween(w.state.date, x.start) > 50)!
    w.state.date = addDays(win.start, -50)
    // Only the invitation is waiting.
    for (let i = w.pendingInterrupt(); i; i = w.pendingInterrupt()) w.settle(i)
    for (let seed = 1; seed < 200 && !w.state.invite; seed++) {
      w.state.seed = seed
      maybeInvite(w)
    }
    if (!w.state.invite) throw new Error("no invitation in 200 seeds")
    return w
  }

  it("come from a free host of similar strength, with the user among the guests", () => {
    const w = invited()
    const inv = w.state.invite!
    expect([4, 8]).toContain(inv.teams.length)
    expect(inv.teams[0]).not.toBe("BRA")
    expect(inv.teams).toContain("BRA")
    expect(new Set(inv.teams).size).toBe(inv.teams.length)
    expect(Math.abs(w.nation(inv.teams[0]).points - w.nation("BRA").points)).toBeLessThanOrEqual(
      220
    )
    expect(fits(windowById(inv.window)!, inv.format, inv.teams.length)).toBe(true)
    expect(w.pendingInterrupt()).toEqual({ kind: "invite" })
    expect(w.state.news[0].link).toBe("/invitational")
  })

  it("stop the calendar once, then wait for an answer", () => {
    const w = invited()
    expect(w.settle({ kind: "invite" })).toBe(true)
    expect(w.pendingInterrupt()).toBeNull()
    expect(w.state.invite).toBeTruthy()
  })

  it("set up the host's tournament when accepted", () => {
    const w = invited()
    const inv = { ...w.state.invite! }
    const out = acceptInvite(w)
    expect("id" in out).toBe(true)
    const inst = w.state.competitions[(out as { id: string }).id]
    expect(inst.hosts).toEqual([inv.teams[0]])
    expect(inst.invitational?.teams).toEqual(inv.teams)
    expect(w.state.invite).toBeNull()
  })

  it("leave nothing behind when declined", () => {
    const w = invited()
    const win = windowById(w.state.invite!.window)!
    declineInvite(w)
    expect(w.state.invite).toBeNull()
    expect(Object.values(w.state.competitions).some((c) => c.kind === "invitational")).toBe(false)
    expect(commitments(w, win)("BRA")).toBe(false)
  })

  it("lapse unanswered", () => {
    const w = invited()
    const expires = w.state.invite!.expires
    w.settle({ kind: "invite" })
    w.state.date = addDays(expires, -1)
    w.nextDay()
    expect(w.state.invite).toBeTruthy()
    w.nextDay()
    expect(w.state.invite).toBeNull()
    expect(w.state.news[0].title).toEqual({ k: "news.inviteLapsed.title" })
  })

  it("survive a save and load", () => {
    const w = invited()
    const loaded = new World(JSON.parse(JSON.stringify(w.state)), statics())
    expect(loaded.state.invite).toEqual(w.state.invite)
  })
})
