import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { USER_EDGE, World } from "../world/world"
import type { BoardObjective, WorldState } from "../world/types"
import type { CompetitionInstance, Fixture } from "../competition/types"
import type { MatchReport, PlayerLine } from "../match/types"
import { playMatch } from "../match/engine"
import { ageOn } from "../players/ability"
import { addDays } from "../calendar/dates"
import {
  acceptOffer,
  afterUserResult,
  ambitionChoices,
  CAREER_TUNING,
  checkObjectives,
  decideContract,
  monthlyDrift,
  playerMoments,
  setAmbition,
  setContract,
  shiftObjective,
  youthObjective,
} from "../career/career"
import { award, checkMilestones } from "../career/milestones"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId = "TUR", seed = 21) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

/** A debuts objective already past its deadline: judged "failed" on the next check. */
function lapsed(critical: boolean): BoardObjective {
  return {
    id: "youth-2025:debuts",
    comp: "youth",
    compInstance: "youth-2025",
    kind: "debuts",
    count: 3,
    progress: 0,
    until: "2025-12-31",
    text: "Hand international debuts to 3 players aged 21 or under in 2025",
    status: "open",
    critical,
  }
}

function fixture(w: World, opp: string, importance: Fixture["importance"], h: number, a: number) {
  const me = w.state.career.nationId!
  return {
    id: `t:${opp}:${h}${a}`,
    compId: "friendly",
    stage: "",
    label: "",
    date: w.state.date,
    home: me,
    away: opp,
    atHome: true,
    importance,
    result: { h, a },
  } satisfies Fixture
}

function line(playerId: string, extra: Partial<PlayerLine> = {}): PlayerLine {
  return {
    playerId,
    side: "home",
    pos: "CM",
    started: true,
    minutes: 90,
    goals: 0,
    assists: 0,
    shots: 0,
    onTarget: 0,
    saves: 0,
    yellow: 0,
    red: 0,
    injured: false,
    rating: 7,
    ...extra,
  }
}

/**
 * Run the calendar with the AI in the dugout for the user too, settling every
 * other interrupt as the assistant would.
 */
function playOn(w: World, until: string, onEach?: (i: ReturnType<World["advance"]>) => void) {
  for (let guard = 0; guard < 2000 && w.state.date < until; guard++) {
    const i = w.advance(30)
    onEach?.(i)
    if (w.settle(i)) continue
    if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
    else if (i.kind === "match") {
      const f = w.state.fixtures[i.fixtureId]
      w.applyReport(f, playMatch(w.matchSetup(f, w.aiSheet(f.home, f), w.aiSheet(f.away, f))), true)
    }
  }
}

describe("the board meeting", () => {
  it("asks for the manager's word on each finals objective before moving on", () => {
    const w = newWorld("TUR")
    const open = w.state.career.objectives.filter((o) => o.agreed === false)
    expect(open.length).toBeGreaterThan(0)
    // Other news first, then the board.
    w.clearHosting()
    w.clearOffer()
    const i = w.advance(5)
    expect(i).toEqual({ kind: "board", objectiveId: open[0].id })
    expect(setAmbition(w, open[0].id, 0)).toBe(true)
    expect(open[0].agreed).toBe(true)
    // Agreeing twice is refused.
    expect(setAmbition(w, open[0].id, 1)).toBe(false)
  })

  it("raises and lowers objectives one step", () => {
    const w = newWorld("TUR")
    const reach: BoardObjective = {
      id: "x:reach",
      comp: "euro",
      compInstance: "euro-2028",
      kind: "reach",
      stage: "Quarter-finals",
      text: "",
      status: "open",
      critical: false,
      agreed: false,
    }
    const up = shiftObjective(w, reach, 1)!
    expect(up.stage).toBe("Semi-finals")
    expect(up.critical).toBe(true)
    expect(up.text).toBe("Reach the semi-finals of the UEFA Euro 2028")
    const down = shiftObjective(w, reach, -1)!
    expect(down.stage).toBe("knockout")
    const final = shiftObjective(w, { ...reach, stage: "Final" }, 1)!
    expect(final.kind).toBe("win")
    expect(shiftObjective(w, final, 1)).toBeNull()

    const qualify: BoardObjective = {
      ...reach,
      kind: "qualify",
      stage: undefined,
      text: "Qualify for the FIFA World Cup 2030",
      critical: true,
    }
    expect(shiftObjective(w, qualify, 1)!.text).toBe("Qualify for the FIFA World Cup 2030 unbeaten")
    expect(shiftObjective(w, qualify, -1)!.critical).toBe(false)
    expect(shiftObjective(w, { ...qualify, critical: false }, -1)).toBeNull()
  })

  it("only lets a trusted manager talk the target down, and charges for it", () => {
    const w = newWorld("TUR")
    const obj = w.state.career.objectives.find((o) => o.agreed === false)!
    w.state.career.confidence = CAREER_TUNING.lowerNeeds - 1
    const low = ambitionChoices(w, obj.id).find((c) => c.level === -1)
    if (!low) return // Nothing to lower to for this objective.
    expect(low.allowed).toBe(false)
    expect(setAmbition(w, obj.id, -1)).toBe(false)
    w.state.career.confidence = 60
    expect(setAmbition(w, obj.id, -1)).toBe(true)
    expect(w.state.career.confidence).toBe(60 - CAREER_TUNING.lowerCost)
    expect(obj.ambition).toBe(-1)
  })

  it("pays more for a raised objective met, and less for a lowered one", () => {
    const met = (ambition: -1 | 0 | 1) => {
      const w = newWorld("TUR")
      const c = w.state.career
      c.objectives = [{ ...lapsed(false), progress: 3, ambition, until: "2099-12-31" }]
      c.confidence = 50
      const youth = w.state.nations.TUR.youthLevel
      checkObjectives(w)
      return { confidence: c.confidence, youth: w.state.nations.TUR.youthLevel - youth }
    }
    const asked = met(0)
    expect(asked.confidence).toBe(50 + CAREER_TUNING.met)
    expect(asked.youth).toBeGreaterThan(0)
    expect(met(1).confidence).toBeGreaterThan(asked.confidence)
    expect(met(-1).confidence).toBeLessThan(asked.confidence)
  })
})

describe("a broken promise", () => {
  it("costs confidence and falls back to the board's own target", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    // A qualifying campaign under way, with one defeat already.
    w.state.competitions["fake-2027"] = {
      id: "fake-2027",
      defId: "fake",
      name: "Test Qualifying",
      year: 2027,
      status: "running",
      stages: [],
      outcome: {},
    } as unknown as CompetitionInstance
    w.state.fixtures["fake:1"] = {
      ...fixture(w, "SMR", "qualifier", 0, 1),
      id: "fake:1",
      compId: "fake-2027",
    }
    c.objectives = [
      {
        id: "fake-2027:qualify",
        comp: "fake",
        compInstance: "fake-2027",
        kind: "qualify",
        text: "Qualify for the Test Cup",
        status: "open",
        critical: true,
        agreed: false,
      },
    ]
    c.confidence = 60
    expect(setAmbition(w, "fake-2027:qualify", 1)).toBe(true)
    checkObjectives(w)
    const obj = c.objectives[0]
    expect(obj.status).toBe("open")
    expect(obj.broken).toBe(true)
    expect(obj.unbeaten).toBeFalsy()
    expect(obj.text).toBe("Qualify for the Test Cup")
    expect(c.confidence).toBe(60 - CAREER_TUNING.brokenPromise)
    expect(c.nationId).toBe("TUR")
  })
})

describe("pressure and the sack", () => {
  it("sacks the manager who misses a key objective without the board's faith", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.objectives = [lapsed(true)]
    c.confidence = 50
    checkObjectives(w)
    // 50 − 30 = 20, below the 25 the board needs to keep faith.
    expect(c.nationId).toBeNull()
    expect(c.history[0].left).toBe("sacked")
    expect(w.state.pendingSacked).toBe(true)
    expect(w.advance(1)).toEqual({ kind: "sacked" })
    w.clearSacked()
    expect(c.offers.length).toBeGreaterThan(0)
  })

  it("keeps a manager with enough credit after a missed key objective", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.objectives = [lapsed(true)]
    c.confidence = 95
    checkObjectives(w)
    expect(c.nationId).toBe("TUR")
    expect(c.confidence).toBe(95 + CAREER_TUNING.failedCritical)
  })

  it("puts a struggling manager on a final warning and lifts it when results come", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.objectives = [lapsed(false)]
    c.confidence = 40
    checkObjectives(w)
    expect(c.confidence).toBe(40 + CAREER_TUNING.failed)
    expect(c.nationId).toBe("TUR")
    expect(c.ultimatum?.matches).toBe(CAREER_TUNING.ultimatumMatches)
    expect(w.pendingInterrupt()?.kind).toBe("ultimatum")
    w.clearUltimatum()

    c.confidence = CAREER_TUNING.ultimatumLifted
    checkObjectives(w)
    expect(c.ultimatum).toBeNull()
  })

  it("sacks a manager on a final warning who keeps losing", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.confidence = 18
    c.ultimatum = { since: w.state.date, matches: 3 }
    afterUserResult(w, fixture(w, "SMR", "qualifier", 0, 2))
    expect(c.nationId).toBeNull()
    expect(c.history[0].left).toBe("sacked")
  })

  it("ends a final warning after three competitive matches either way", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.confidence = 33
    c.ultimatum = { since: w.state.date, matches: 1 }
    // A friendly does not count down.
    afterUserResult(w, fixture(w, "SMR", "friendly", 1, 1))
    expect(c.ultimatum?.matches).toBe(1)
    c.confidence = 33
    afterUserResult(w, fixture(w, "SMR", "qualifier", 1, 0))
    expect(c.nationId).toBe("TUR")
    expect(c.ultimatum).toBeNull()
  })
})

describe("the board's memory", () => {
  it("fades a month at a time towards the middle", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.confidence = 80
    monthlyDrift(w)
    expect(c.confidence).toBe(80 - CAREER_TUNING.driftPerMonth)
    c.confidence = 20
    monthlyDrift(w)
    expect(c.confidence).toBe(20 + CAREER_TUNING.driftPerMonth)
    c.confidence = CAREER_TUNING.settle
    monthlyDrift(w)
    expect(c.confidence).toBe(CAREER_TUNING.settle)
  })
})

describe("reputation", () => {
  it("grows month by month in a job, and slips only when the board is losing faith", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.reputation = 50
    c.confidence = 60
    monthlyDrift(w)
    expect(c.reputation).toBeCloseTo(50 + CAREER_TUNING.reputationMonthly)
    c.reputation = 50
    c.confidence = 10
    monthlyDrift(w)
    expect(c.reputation).toBeCloseTo(
      50 - CAREER_TUNING.reputationMonthly * CAREER_TUNING.reputationLossScale
    )
  })

  it("loses less than it gains for the same result against expectation", () => {
    const up = newWorld("SMR")
    const before = up.state.career.reputation
    afterUserResult(up, fixture(up, "ESP", "qualifier", 1, 0))
    const gain = up.state.career.reputation - before
    const down = newWorld("ESP")
    const start = down.state.career.reputation
    afterUserResult(down, fixture(down, "SMR", "qualifier", 0, 1))
    const loss = start - down.state.career.reputation
    expect(gain).toBeGreaterThan(0)
    expect(loss).toBeGreaterThan(0)
    expect(loss).toBeLessThan(gain)
  })
})

describe("starting out of work", () => {
  const unemployed = (reputation: number) =>
    createWorld(
      {
        seed: 21,
        start: "2026-09-01",
        managerName: "Test",
        nationality: "TUR",
        nationId: null,
        reputation,
      },
      statics(),
      playerRows as unknown as Record<string, PlayerRow[]>
    )

  it("brings offers matching the chosen reputation on day one", () => {
    const low = unemployed(25)
    const high = unemployed(95)
    for (const w of [low, high]) {
      expect(w.state.career.nationId).toBeNull()
      expect(w.state.career.history).toEqual([])
      expect(w.state.career.offers.length).toBeGreaterThan(0)
      expect(w.advance(1).kind).toBe("offer")
    }
    expect(low.state.career.reputation).toBe(25)
    const rank = (w: World) =>
      Math.min(...w.state.career.offers.map((o) => w.ctx().ranked().indexOf(o.nationId)))
    // A bigger name hears from much stronger nations.
    expect(rank(high)).toBeLessThan(rank(low) - 50)
  })

  it("keeps the calendar going until a job is taken", () => {
    const w = unemployed(50)
    const offer = w.state.career.offers[0].nationId
    w.clearOffer()
    acceptOffer(w, offer)
    expect(w.state.career.nationId).toBe(offer)
    expect(w.state.career.history).toHaveLength(1)
    expect(w.state.career.contractUntil).toBeTruthy()
  })
})

describe("the contract", () => {
  it("runs to the end of the next major finals", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    expect(c.contractFor).toMatch(/^(wc|euro)-/)
    expect(c.contractUntil).toBe(w.state.competitions[c.contractFor!].end)
  })

  it("is renewed, extended for a year or ended by the board's confidence", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.confidence = 70
    const until = c.contractUntil!
    w.state.date = until
    expect(decideContract(w)).toBe("renewed")
    expect(c.contractUntil! > until).toBe(true)

    c.confidence = 40
    expect(decideContract(w)).toBe("extended")
    expect(c.contractFor).toBeUndefined()
    expect(c.contractUntil).toBe(addDays(w.state.date, 365))

    c.confidence = 20
    expect(decideContract(w)).toBe("expired")
    expect(c.nationId).toBeNull()
    expect(c.history.at(-1)!.left).toBe("expired")
    expect(w.pendingInterrupt()?.kind).toBe("sacked")
  })

  it("is decided on its date when no finals decide it", () => {
    const w = newWorld("TUR")
    const c = w.state.career
    c.contractFor = undefined
    c.contractUntil = w.state.date
    c.confidence = 10
    w.nextDay()
    expect(c.nationId).toBeNull()
  })
})

describe("the review of a competition", () => {
  it("reviews the Nations League when it ends", { timeout: 300000 }, () => {
    const w = newWorld("TUR")
    const reviews: string[] = []
    playOn(w, "2027-07-01", (i) => {
      if (i.kind === "review") reviews.push(i.id)
      // Job security is not what this test is about.
      if (w.state.career.nationId) w.state.career.confidence = 70
    })
    expect(reviews).toContain("unl-2026")
    const r = w.state.career.reviews!.find((x) => x.id === "unl-2026")!
    expect(r.played).toBeGreaterThan(0)
    expect(r.won + r.drawn + r.lost).toBe(r.played)
    expect(r.objectives.length).toBeGreaterThan(0)
    expect(r.reached).toMatch(/League|Champions/)
    expect(r.message.length).toBeGreaterThan(20)
    expect(r.stars.length).toBeGreaterThan(0)
    expect(w.state.pendingReview).toBeNull()
  })
})

describe("youth", () => {
  it("counts debuts, youngsters towards the debuts objective", () => {
    const w = newWorld("ENG")
    const c = w.state.career
    w.state.date = "2027-01-01"
    youthObjective(w)
    const obj = c.objectives.find((o) => o.kind === "debuts")!
    expect(obj).toBeDefined()
    const young = w
      .pool("ENG")
      .filter((p) => p.caps === 0 && ageOn(p.born, w.state.date) <= 21)
      .slice(0, obj.count!)
    // An established player's first game in the save is no debut: the pools start uncapped.
    const veteran = w.pool("ENG").find((p) => p.caps === 0 && ageOn(p.born, w.state.date) >= 26)!
    const f = fixture(w, "SMR", "friendly", 3, 0)
    const report = { lines: [...young, veteran].map((p) => line(p.id)) } as MatchReport
    playerMoments(w, f, report)
    expect(c.debuts).toBe(young.length)
    expect(obj.progress).toBe(young.length)
    expect(w.state.news[0].title).toMatch(/debut|First cap/)
    checkObjectives(w)
    expect(obj.status).toBe("met")
  })

  it("stops for the year's intake and asks for debuts", () => {
    const w = newWorld("ENG")
    let intake = 0
    playOn(w, "2027-01-02", (i) => {
      if (i.kind === "intake") intake = w.state.pendingIntake?.ids.length ?? 0
      if (w.state.career.nationId) w.state.career.confidence = 70
    })
    expect(intake).toBeGreaterThan(0)
    expect(w.state.pendingIntake ?? null).toBeNull()
    expect(w.state.career.objectives.some((o) => o.id === "youth-2027:debuts")).toBe(true)
  })

  it("tracks international minutes and ratings through the season", () => {
    const w = newWorld("TUR")
    const f: Fixture = { ...fixture(w, "SMR", "friendly", 0, 0), result: undefined }
    const report = playMatch(w.matchSetup(f, w.aiSheet("TUR", f), w.aiSheet("SMR", f)))
    const mine = report.lines.find((l) => l.side === "home" && l.minutes >= 30)!
    w.applyReport(f, report, true)
    const p = w.player(mine.playerId)
    expect(p.intlMin).toBe(mine.minutes)
    expect(p.intlRating?.[1]).toBe(1)
  })
})

describe("the manager's touch", () => {
  it("lifts the user's side in his matches only", () => {
    const w = newWorld("TUR")
    const f = fixture(w, "SMR", "friendly", 0, 0)
    const mine = w.matchSetup(f, w.aiSheet("TUR", f), w.aiSheet("SMR", f))
    expect(mine.edge).toEqual({ side: "home", value: USER_EDGE.match })
    const other = { ...f, home: "ESP", away: "SMR" }
    expect(
      w.matchSetup(other, w.aiSheet("ESP", other), w.aiSheet("SMR", other)).edge
    ).toBeUndefined()
  })

  it("wins a few more even matches for the user", () => {
    const w = newWorld("TUR")
    const f: Fixture = { ...fixture(w, "AUT", "friendly", 0, 0), result: undefined, atHome: false }
    const home = w.aiSheet("TUR", f)
    const away = w.aiSheet("AUT", f)
    const points = (edge: boolean) => {
      let pts = 0
      for (let i = 0; i < 300; i++) {
        const setup = { ...w.matchSetup(f, home, away), seed: i }
        if (!edge) setup.edge = undefined
        const r = playMatch(setup).result
        pts += r.home > r.away ? 3 : r.home === r.away ? 1 : 0
      }
      return pts
    }
    expect(points(true)).toBeGreaterThan(points(false))
  })
})

describe("the starting eleven", () => {
  it("is checked for empty places and unavailable players before kick-off", () => {
    const w = newWorld("TUR")
    const f = fixture(w, "SMR", "qualifier", 0, 0)
    const sheet = w.aiSheet("TUR", f)
    w.state.nations.TUR.squad = sheet.xi.map((s) => s.playerId).concat(sheet.bench)
    w.state.userTeam = { tactics: sheet.tactics, xi: sheet.xi, bench: sheet.bench }
    expect(w.lineupProblems(f)).toEqual([])

    const [a, b, c] = sheet.xi.map((s) => w.player(s.playerId))
    a.injury = { until: "2099-01-01", label: "Knee" }
    b.banned = 1
    w.state.userTeam.xi = sheet.xi.slice(0, 10)
    const problems = w.lineupProblems(f)
    expect(problems.some((p) => p.includes("injured"))).toBe(true)
    expect(problems.some((p) => p.includes("suspended"))).toBe(true)
    expect(problems.some((p) => p.startsWith("No one is playing"))).toBe(true)

    w.state.nations.TUR.squad = w.state.nations.TUR.squad.filter((id) => id !== c.id)
    expect(w.lineupProblems(f).some((p) => p.includes("not in the squad"))).toBe(true)
  })

  it("is not checked when no eleven has been saved", () => {
    const w = newWorld("TUR")
    w.state.userTeam = null
    expect(w.lineupProblems(fixture(w, "SMR", "qualifier", 0, 0))).toEqual([])
  })
})

describe("milestones", () => {
  it("are earned once", () => {
    const w = newWorld("TUR")
    expect(award(w, "x", "Something")).toBe(true)
    expect(award(w, "x", "Something")).toBe(false)
    w.state.career.history[0].won = 1
    w.state.career.history[0].played = 25
    checkMilestones(w)
    checkMilestones(w)
    const ids = w.state.career.milestones!.map((m) => m.id)
    expect(ids.filter((id) => id === "first-win")).toHaveLength(1)
    expect(ids).toContain("matches-25")
  })

  it("puts surprising results in the news", () => {
    const w = newWorld("SMR")
    afterUserResult(w, fixture(w, "ESP", "qualifier", 1, 0))
    const result = w.state.news.find((n) => n.kind === "result")
    expect(result?.title).toMatch(/Shock win/)
  })
})

describe("old saves", () => {
  it("load without the new career fields", () => {
    const w = newWorld("TUR")
    const state = JSON.parse(JSON.stringify(w.state)) as WorldState
    const c = state.career as Partial<WorldState["career"]>
    delete c.contractUntil
    delete c.contractFor
    delete c.reviews
    delete c.milestones
    delete c.watchlist
    const loaded = new World(state, statics())
    expect(loaded.state.career.contractUntil).toBeTruthy()
    expect(loaded.state.career.reviews).toEqual([])
    expect(() => loaded.advance(3)).not.toThrow()
  })

  it("set a contract when a job is taken", () => {
    const w = newWorld("TUR")
    w.state.career.contractUntil = undefined
    setContract(w)
    expect(w.state.career.contractUntil).toBeTruthy()
  })
})
