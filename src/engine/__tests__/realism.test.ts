import { describe, expect, it } from "vitest"
import { createMatch, playMatch, step } from "../match/engine"
import { sendOff } from "../match/discipline"
import type { MatchState, Phase } from "../match/state"
import type {
  MatchEvent,
  MatchEventKind,
  MatchReport,
  ShotType,
  Side,
  Tactics,
} from "../match/types"
import type { Position } from "../types"
import { archetypesFor } from "../players/archetypes"
import {
  levelSetup as setupFor,
  playLevel as playLevels,
  playMany,
  playerWith,
  setupOf,
  sideOf,
  type TestSide,
} from "./helpers"

// The match engine against real football: international matches between sides of a
// level average about 12 shots, a third of them on target, 1.3–1.4 goals, 5 corners,
// 11–12 fouls, 2 bookings and 2 offsides each. These tests pin those totals, the shape of
// the chances behind them, and how far a gap in class goes — which the rest of the game
// (rankings, qualifying, careers) is balanced on.

/** Work something out once, the first time a test asks for it. */
function once<T>(make: () => T): () => T {
  let value: T | undefined
  return () => (value ??= make())
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const share = (part: number, whole: number) => part / whole

const SHOT_KINDS: ReadonlySet<MatchEventKind> = new Set([
  "goal",
  "shot-saved",
  "shot-wide",
  "shot-blocked",
  "woodwork",
  "big-chance-missed",
])
const isShot = (e: MatchEvent) => SHOT_KINDS.has(e.kind)
const isGoal = (e: MatchEvent) =>
  e.kind === "goal" || e.kind === "pen-goal" || e.kind === "own-goal"
const shotsOf = (rs: MatchReport[]) => rs.flatMap((r) => r.events.filter(isShot))
/** A stat for both sides, per side per match. */
const perSide = (rs: MatchReport[], stat: (r: MatchReport, i: 0 | 1) => number) =>
  mean(rs.map((r) => (stat(r, 0) + stat(r, 1)) / 2))
const goals = (r: MatchReport) => r.result.home + r.result.away
const margin = (rs: MatchReport[]) => mean(rs.map((r) => r.result.home - r.result.away))
const homeWins = (rs: MatchReport[]) =>
  share(rs.filter((r) => r.result.home > r.result.away).length, rs.length)
const awayWins = (rs: MatchReport[]) =>
  share(rs.filter((r) => r.result.home < r.result.away).length, rs.length)

const even = once(() => playLevels(70, 70, 600))

describe("a match between equals plays like real football", () => {
  it("totals what international matches total", () => {
    const rs = even()
    expect(mean(rs.map(goals))).toBeGreaterThan(2.4)
    expect(mean(rs.map(goals))).toBeLessThan(3.1)
    const shots = perSide(rs, (r, i) => r.stats[i].shots)
    expect(shots).toBeGreaterThan(10)
    expect(shots).toBeLessThan(14)
    const onTarget = perSide(rs, (r, i) => r.stats[i].onTarget)
    expect(onTarget / shots).toBeGreaterThan(0.28)
    expect(onTarget / shots).toBeLessThan(0.4)
    const corners = perSide(rs, (r, i) => r.stats[i].corners)
    expect(corners).toBeGreaterThan(4)
    expect(corners).toBeLessThan(6.5)
    const offsides = perSide(rs, (r, i) => r.stats[i].offsides)
    expect(offsides).toBeGreaterThan(1.1)
    expect(offsides).toBeLessThan(2.5)
  })

  it("scores about as many as its chances are worth", () => {
    const rs = even()
    const xg = perSide(rs, (r, i) => r.stats[i].xg)
    const scored = mean(rs.map(goals)) / 2
    expect(xg / perSide(rs, (r, i) => r.stats[i].shots)).toBeGreaterThan(0.08)
    expect(xg / perSide(rs, (r, i) => r.stats[i].shots)).toBeLessThan(0.14)
    expect(scored / xg).toBeGreaterThan(0.85)
    expect(scored / xg).toBeLessThan(1.15)
  })

  it("ends in realistic scorelines: draws common, goalless ones rarer, cricket scores rarer still", () => {
    const rs = even()
    const draws = share(rs.filter((r) => r.result.home === r.result.away).length, rs.length)
    const goalless = share(rs.filter((r) => goals(r) === 0).length, rs.length)
    const glut = share(rs.filter((r) => goals(r) >= 7).length, rs.length)
    expect(draws).toBeGreaterThan(0.2)
    expect(draws).toBeLessThan(0.34)
    expect(goalless).toBeGreaterThan(0.03)
    expect(goalless).toBeLessThan(0.12)
    expect(glut).toBeLessThan(0.04)
  })

  it("books and sends off about as often as referees do", () => {
    const rs = even()
    const fouls = perSide(rs, (r, i) => r.stats[i].fouls)
    const yellows = perSide(rs, (r, i) => r.stats[i].yellows)
    const reds = perSide(rs, (r, i) => r.stats[i].reds)
    expect(fouls).toBeGreaterThan(9.5)
    expect(fouls).toBeLessThan(13.5)
    expect(yellows).toBeGreaterThan(1.4)
    expect(yellows).toBeLessThan(2.4)
    expect(reds).toBeGreaterThan(0.03)
    expect(reds).toBeLessThan(0.16)
  })

  it("gives a penalty every few matches, and most of them go in", () => {
    const rs = even()
    const kicks = rs.flatMap((r) =>
      r.events.filter(
        (e) => e.kind === "pen-goal" || e.kind === "pen-saved" || e.kind === "pen-miss"
      )
    )
    expect(kicks.length / rs.length / 2).toBeGreaterThan(0.08)
    expect(kicks.length / rs.length / 2).toBeLessThan(0.22)
    const scored = share(kicks.filter((e) => e.kind === "pen-goal").length, kicks.length)
    expect(scored).toBeGreaterThan(0.65)
    expect(scored).toBeLessThan(0.9)
  })

  it("scores more late on, when legs tire and sides chase the game", () => {
    const all = even().flatMap((r) => r.events.filter(isGoal))
    const early = all.filter((e) => e.minute <= 15).length
    const late = all.filter((e) => e.minute > 75).length
    expect(late).toBeGreaterThan(early * 1.2)
  })

  it("shares the ball evenly", () => {
    const possession = mean(even().map((r) => r.stats[0].possession))
    expect(possession).toBeGreaterThan(46)
    expect(possession).toBeLessThan(54)
  })
})

describe("shots", () => {
  const typeOf = (e: MatchEvent) => e.shot as ShotType
  const byType = once(() => {
    const out = new Map<ShotType, { n: number; goals: number; xg: number }>()
    for (const e of shotsOf(even())) {
      const t = out.get(typeOf(e)) ?? { n: 0, goals: 0, xg: 0 }
      t.n++
      t.xg += e.xg ?? 0
      if (e.kind === "goal") t.goals++
      out.set(typeOf(e), t)
    }
    return out
  })
  const conversion = (t: ShotType) => byType().get(t)!.goals / byType().get(t)!.n
  const xgOf = (t: ShotType) => byType().get(t)!.xg / byType().get(t)!.n
  const shareOf = (t: ShotType) => byType().get(t)!.n / shotsOf(even()).length

  it("says what kind of shot every shot was, and only set pieces come without a lane", () => {
    for (const e of shotsOf(even())) {
      expect(e.shot).toBeDefined()
      expect(e.xg).toBeGreaterThan(0)
      if (e.move === "set-piece") expect(e.lane).toBeUndefined()
      else expect(e.lane).toBeDefined()
    }
  })

  it("has a realistic mix: plenty from distance, some headers, a few clear chances", () => {
    expect(shareOf("long")).toBeGreaterThan(0.22)
    expect(shareOf("long")).toBeLessThan(0.42)
    expect(shareOf("header")).toBeGreaterThan(0.1)
    expect(shareOf("header")).toBeLessThan(0.3)
    const clear = shareOf("close") + shareOf("one-on-one") + shareOf("rebound")
    expect(clear).toBeGreaterThan(0.1)
    expect(clear).toBeLessThan(0.3)
    expect(shareOf("free-kick")).toBeGreaterThan(0.01)
    expect(shareOf("free-kick")).toBeLessThan(0.1)
  })

  it("rates and converts chances by how good they are", () => {
    expect(xgOf("one-on-one")).toBeGreaterThan(xgOf("box"))
    expect(xgOf("close")).toBeGreaterThan(xgOf("box"))
    expect(xgOf("box")).toBeGreaterThan(xgOf("long"))
    expect(xgOf("header")).toBeGreaterThan(xgOf("long"))
    expect(conversion("one-on-one")).toBeGreaterThan(conversion("box") * 2)
    expect(conversion("close")).toBeGreaterThan(conversion("box") * 2)
    expect(conversion("box")).toBeGreaterThan(conversion("long"))
    expect(conversion("long")).toBeLessThan(0.08)
  })

  it("only follows up a save the keeper could not hold", () => {
    for (const r of even()) {
      r.events.forEach((e, i) => {
        if (e.shot !== "rebound") return
        const before = r.events[i - 1]
        expect(before.kind).toBe("shot-saved")
        expect(before.side).toBe(e.side)
        expect(before.minute).toBe(e.minute)
      })
    }
    expect(byType().get("rebound")!.n).toBeGreaterThan(10)
  })
})

describe("class", () => {
  // These pin how far a gap in ability goes: the world is balanced on them.
  const modest = once(() => playLevels(75, 70, 400))
  const clear = once(() => playLevels(80, 70, 400))
  const mismatch = once(() => playLevels(88, 45, 200))

  it("gives a modest edge a modest margin", () => {
    expect(homeWins(modest())).toBeGreaterThan(0.5)
    expect(homeWins(modest())).toBeLessThan(0.68)
    expect(margin(modest())).toBeGreaterThan(0.8)
    expect(margin(modest())).toBeLessThan(1.35)
  })

  it("lets a clearly better side win most of the time, by about two goals", () => {
    expect(homeWins(clear())).toBeGreaterThan(0.72)
    expect(homeWins(clear())).toBeLessThan(0.9)
    expect(margin(clear())).toBeGreaterThan(1.7)
    expect(margin(clear())).toBeLessThan(2.6)
  })

  it("lets a giant thrash a minnow without making every match a cricket score", () => {
    expect(homeWins(mismatch())).toBeGreaterThan(0.97)
    expect(margin(mismatch())).toBeGreaterThan(4.5)
    expect(margin(mismatch())).toBeLessThan(7.5)
  })

  it("gives the better side the ball, and more of it the bigger the gap", () => {
    const poss = (rs: MatchReport[]) => mean(rs.map((r) => r.stats[0].possession))
    expect(poss(modest())).toBeGreaterThan(52)
    expect(poss(clear())).toBeGreaterThan(poss(modest()))
    expect(poss(clear())).toBeGreaterThan(57)
    expect(poss(clear())).toBeLessThan(70)
    expect(poss(mismatch())).toBeGreaterThan(70)
  })

  it("has the better side out-shoot the weaker by more as the gap grows", () => {
    const ratio = (rs: MatchReport[]) =>
      sum(rs.map((r) => r.stats[0].shots)) / sum(rs.map((r) => r.stats[1].shots))
    expect(ratio(modest())).toBeGreaterThan(1.2)
    expect(ratio(clear())).toBeGreaterThan(ratio(modest()))
    expect(ratio(mismatch())).toBeGreaterThan(ratio(clear()))
  })
})

describe("home advantage", () => {
  const atHome = once(() => playLevels(70, 70, 500, { homeAdvantage: true }))

  it("wins the home side more matches, about as much as at international level", () => {
    const edge = homeWins(atHome()) - awayWins(atHome())
    expect(edge).toBeGreaterThan(0.1)
    expect(edge).toBeLessThan(0.32)
  })

  it("books away sides more than home sides", () => {
    const home = sum(atHome().map((r) => r.stats[0].yellows))
    const away = sum(atHome().map((r) => r.stats[1].yellows))
    expect(away).toBeGreaterThan(home)
  })
})

describe("the game state", () => {
  it("has the side behind take more of the shots after the hour", () => {
    let behind = 0
    let ahead = 0
    for (const r of even()) {
      const at60 = r.events.filter((e) => isGoal(e) && e.minute <= 60)
      const home = at60.filter((e) => e.side === "home").length
      const away = at60.length - home
      if (home === away) continue
      const trailing: Side = home < away ? "home" : "away"
      for (const e of r.events)
        if (isShot(e) && e.minute > 60) e.side === trailing ? behind++ : ahead++
    }
    expect(behind / (behind + ahead)).toBeGreaterThan(0.53)
  })
})

describe("transitions", () => {
  const first = (pos: Parameters<typeof archetypesFor>[0]) => archetypesFor(pos)[0]
  const moveShare = (rs: MatchReport[], side: Side, move: "counter" | "press") => {
    const shots = shotsOf(rs).filter((e) => e.side === side)
    return shots.filter((e) => e.move === move).length / shots.length
  }
  const vs = (home: Partial<Tactics>, away: Partial<Tactics>, n = 300) =>
    playMany(sideOf("h", first, { tactics: home }), sideOf("a", first, { tactics: away }), n)

  it("lets a counter-attacking side get more of its shots on the break", () => {
    expect(moveShare(vs({ counter: true }, {}), "home", "counter")).toBeGreaterThan(
      moveShare(vs({}, {}), "home", "counter") * 1.2
    )
  })

  it("leaves a high line more exposed to breaks than a deep one", () => {
    expect(moveShare(vs({}, { line: 2 }), "home", "counter")).toBeGreaterThan(
      moveShare(vs({}, { line: 0 }), "home", "counter")
    )
  })

  it("wins the ball high up the pitch more often for a side that presses", () => {
    expect(moveShare(vs({ pressing: 2 }, {}), "home", "press")).toBeGreaterThan(
      moveShare(vs({ pressing: 0 }, {}), "home", "press") * 1.2
    )
  })

  it("catches out more offsides with a high line", () => {
    const offsides = (rs: MatchReport[]) => sum(rs.map((r) => r.stats[0].offsides))
    expect(offsides(vs({}, { line: 2 }))).toBeGreaterThan(offsides(vs({}, { line: 0 })) * 1.5)
  })
})

/** The stoppage added to each half, by stepping through a match. */
function stoppages(seed: number) {
  const state = createMatch(setupFor(70, 70, seed))
  let first = 0
  let second = 0
  let lateEvents = 0
  // Read through a function: stepping changes the phase behind the type checker's back.
  const phase = (): Phase => state.phase
  while (phase() !== "done") {
    const out = step(state)
    if (phase() === "half-time") first = state.addedTotal
    if (phase() === "done") second = state.addedTotal
    if (phase() === "second-half" || phase() === "done")
      lateEvents += out.filter(
        (e) => isGoal(e) || e.kind === "sub" || e.kind === "injury" || e.kind === "yellow"
      ).length
  }
  return { first, second, lateEvents }
}

describe("stoppage time", () => {
  const halves = once(() => Array.from({ length: 200 }, (_, i) => stoppages(i + 1)))

  it("adds a few minutes to the first half and more to the second", () => {
    const first = mean(halves().map((h) => h.first))
    const second = mean(halves().map((h) => h.second))
    expect(first).toBeGreaterThan(1.5)
    expect(first).toBeLessThan(4)
    expect(second).toBeGreaterThan(4)
    expect(second).toBeLessThan(8)
    for (const h of halves()) {
      expect(h.first).toBeGreaterThanOrEqual(1)
      expect(h.second).toBeGreaterThanOrEqual(3)
    }
  })

  it("adds more after an eventful half", () => {
    const sorted = [...halves()].sort((a, b) => a.lateEvents - b.lateEvents)
    const calm = sorted.slice(0, 60)
    const busy = sorted.slice(-60)
    expect(mean(busy.map((h) => h.second))).toBeGreaterThan(mean(calm.map((h) => h.second)) + 0.5)
  })
})

describe("the AI coach", () => {
  const first = (pos: Parameters<typeof archetypesFor>[0]) => archetypesFor(pos)[0]

  /** Changes made while the ball was in play, as distinct stoppages, for one side. */
  function windowsUsed(events: MatchEvent[], side: Side): number {
    const used = new Set<string>()
    let inBreak = false
    for (const e of events) {
      if (e.kind === "half-time" || e.kind === "et-half-time" || e.kind === "full-time")
        inBreak = true
      if (e.kind === "second-half" || e.kind === "et-start" || e.kind === "et-second-half")
        inBreak = false
      if (e.kind === "sub" && e.side === side && !inBreak) used.add(`${e.minute}:${e.added ?? 0}`)
    }
    return used.size
  }

  it("keeps to five changes in three windows, most of them in the second half", () => {
    const rs = [...even(), ...playLevels(70, 70, 100, { knockout: { extraTime: true } })]
    let firstHalf = 0
    let all = 0
    for (const r of rs)
      for (const s of ["home", "away"] as Side[]) {
        const subs = r.events.filter((e) => e.kind === "sub" && e.side === s)
        expect(subs.length).toBeLessThanOrEqual(5)
        expect(windowsUsed(r.events, s)).toBeLessThanOrEqual(3)
        firstHalf += subs.filter((e) => e.minute < 45).length
        all += subs.length
      }
    expect(all / rs.length / 2).toBeGreaterThan(3)
    expect(firstHalf / all).toBeLessThan(0.1)
  })

  /** A side with a national team's bench, so its coach has every kind of change to make. */
  function fullBench(prefix: string): TestSide {
    const side = sideOf(prefix, first)
    const extra = (["CB", "DM", "RB", "LB", "CM", "AM", "RW", "LW", "ST"] as Position[]).map(
      (pos, i) => playerWith(`${prefix}x${i}-`, pos, first(pos), 67)
    )
    return {
      players: [...side.players, ...extra],
      sheet: { ...side.sheet, bench: [...side.sheet.bench, ...extra.map((p) => p.id)] },
    }
  }
  const home = once(() => fullBench("h"))
  const away = once(() => fullBench("a"))

  it("throws on a striker and goes to two up front when chasing a game", () => {
    let reshaped = 0
    for (let seed = 1; seed <= 80; seed++) {
      const state = createMatch(setupOf(home(), away(), seed))
      // A weaker home side, so it is often behind.
      for (const p of state.home.pitch) p.base -= 8
      while (state.phase !== "done") step(state)
      if (!state.home.reshaped || state.home.tactics.formation === "4-2-3-1") continue
      if (state.home.tactics.formation !== "4-4-2") continue
      reshaped++
      expect(state.home.appeared.some((p) => !p.started && p.natural === "ST")).toBe(true)
    }
    expect(reshaped).toBeGreaterThan(5)
  })

  it("brings on a defender and goes to a back five to see out a narrow lead", () => {
    let reshaped = 0
    for (let seed = 1; seed <= 120; seed++) {
      const state = createMatch(setupOf(home(), away(), seed))
      for (const p of state.home.pitch) p.base += 6
      while (state.phase !== "done") step(state)
      if (state.home.tactics.formation !== "5-4-1") continue
      reshaped++
      expect(
        state.home.appeared.some((p) => !p.started && (p.natural === "CB" || p.natural === "DM"))
      ).toBe(true)
    }
    expect(reshaped).toBeGreaterThan(3)
  })

  it("fills a hole at the back after a red card with a defender for a forward", () => {
    const state = createMatch(setupOf(home(), away(), 3))
    while (state.minute < 30) step(state)
    const cb = state.home.pitch.find((p) => p.slot === "CB")!
    const forwards = () => state.home.pitch.filter((p) => ["ST", "AM", "LW", "RW"].includes(p.slot))
    const before = forwards().length
    const players = state.home.pitch.length
    const centreBacks = state.home.pitch.filter((p) => p.slot === "CB").length
    sendOff(state, [], "home", cb, "red")
    expect(state.home.refill).toBe("CB")
    const out = step(state)
    expect(state.home.refill).toBeNull()
    expect(out.some((e) => e.kind === "sub" && e.side === "home")).toBe(true)
    expect(state.home.pitch.filter((p) => p.slot === "CB").length).toBe(centreBacks)
    expect(forwards().length).toBe(before - 1)
    expect(state.home.pitch.length).toBe(players - 1)
  })

  it("never touches the managed side", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const setup = setupFor(70, 75, seed)
      const state: MatchState = createMatch({ ...setup, managed: "home" })
      while (state.phase !== "done") step(state)
      expect(
        state.events.some((e) => e.side === "home" && (e.kind === "sub" || e.kind === "tactics"))
      ).toBe(false)
      expect(state.home.tactics).toEqual(setup.home.tactics)
    }
  })
})

describe("the referee", () => {
  it("varies: some matches pass without a booking, some see a flurry", () => {
    const cards = even().map((r) => r.stats[0].yellows + r.stats[1].yellows)
    expect(cards.filter((c) => c === 0).length).toBeGreaterThan(5)
    expect(cards.filter((c) => c >= 7).length).toBeGreaterThan(5)
  })
})

describe("penalty shootouts", () => {
  const shootouts = once(() =>
    playLevels(70, 70, 300, { knockout: { extraTime: true } }).filter((r) => r.result.pens)
  )

  it("are decided like real ones: most kicks scored, a winner every time", () => {
    const kicks = shootouts().flatMap((r) =>
      r.events.filter((e) => e.kind === "shootout-goal" || e.kind === "shootout-miss")
    )
    expect(shootouts().length).toBeGreaterThan(15)
    const scored = share(kicks.filter((e) => e.kind === "shootout-goal").length, kicks.length)
    expect(scored).toBeGreaterThan(0.62)
    expect(scored).toBeLessThan(0.88)
    for (const r of shootouts()) {
      expect(r.result.pens![0]).not.toBe(r.result.pens![1])
      expect(r.result.winner).toBe(r.result.pens![0] > r.result.pens![1] ? "home" : "away")
    }
  })

  it("lets neither side use more takers than the other has players", () => {
    for (let seed = 1; seed <= 400; seed++) {
      const state = createMatch(setupFor(70, 70, seed, { knockout: { extraTime: true } }))
      while (state.phase !== "done" && state.phase !== "shootout") step(state)
      if (state.phase !== "shootout") continue
      state.home.pitch = state.home.pitch.slice(0, 3)
      const out = step(state)
      const takers = (s: Side) =>
        new Set(
          out
            .filter((e) => e.side === s && e.kind.startsWith("shootout-") && e.playerId)
            .map((e) => e.playerId)
        )
      expect(takers("home").size).toBeLessThanOrEqual(3)
      expect(takers("away").size).toBeLessThanOrEqual(3)
      return
    }
    throw new Error("no match went to penalties")
  })
})

describe("ratings", () => {
  it("centre on six and a half, reward the winners and the scorers", () => {
    const lines = even().flatMap((r) =>
      r.lines.filter((l) => l.minutes >= 60).map((l) => ({ ...l, r }))
    )
    const avg = mean(lines.map((l) => l.rating))
    expect(avg).toBeGreaterThan(6.3)
    expect(avg).toBeLessThan(6.9)
    const won = lines.filter(
      (l) => (l.side === "home" ? 1 : -1) * (l.r.result.home - l.r.result.away) > 0
    )
    const lost = lines.filter(
      (l) => (l.side === "home" ? 1 : -1) * (l.r.result.home - l.r.result.away) < 0
    )
    expect(mean(won.map((l) => l.rating))).toBeGreaterThan(mean(lost.map((l) => l.rating)) + 0.3)
    const braces = lines.filter((l) => l.goals >= 2)
    expect(braces.length).toBeGreaterThan(10)
    expect(braces.filter((l) => l.rating >= 7.5).length / braces.length).toBeGreaterThan(0.85)
  })

  it("rates a keeper who keeps a clean sheet above one who lets in three", () => {
    const cleanSheets = even().flatMap((r) =>
      r.lines.filter(
        (l) =>
          l.pos === "GK" &&
          l.minutes >= 90 &&
          (l.side === "home" ? r.result.away : r.result.home) === 0
      )
    )
    const leaky = even().flatMap((r) =>
      r.lines.filter(
        (l) =>
          l.pos === "GK" &&
          l.minutes >= 90 &&
          (l.side === "home" ? r.result.away : r.result.home) >= 3
      )
    )
    expect(cleanSheets.length).toBeGreaterThan(20)
    expect(leaky.length).toBeGreaterThan(20)
    expect(mean(cleanSheets.map((l) => l.rating))).toBeGreaterThan(
      mean(leaky.map((l) => l.rating)) + 1
    )
  })
})

describe("speed", () => {
  it("plays a match in a few milliseconds, so a whole season of them takes seconds", () => {
    const setups = Array.from({ length: 200 }, (_, i) => setupFor(65 + (i % 15), 70, 1000 + i))
    for (const s of setups.slice(0, 30)) playMatch(s)
    const t0 = performance.now()
    for (const s of setups) playMatch(s)
    expect((performance.now() - t0) / setups.length).toBeLessThan(8)
  })
})
