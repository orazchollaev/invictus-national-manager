import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import type { World } from "../world/world"
import {
  answerPress,
  assistantPress,
  finishPress,
  pressCorps,
  PRESS_TONES,
  PRESS_TUNING,
} from "../career/press"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function newWorld(nationId: string, seed = 21) {
  return createWorld(
    { seed, start: "2026-09-01", managerName: "Test", nationality: nationId, nationId },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

/** A world where the March and September windows have had their conferences: only tournaments are left. */
function tournamentsOnly(nationId: string) {
  const w = newWorld(nationId)
  w.state.career.pressed = ["2026-09-21", "2027-03-22", "2027-09-20"]
  return w
}

/** Play on, naming the squads as the AI would, until the press is called (or the date passes). */
function untilPress(w: World, last = "2027-12-31") {
  for (let g = 0; g < 600 && w.state.date < last; g++) {
    w.state.career.confidence = 60
    const i = w.advance(1)
    if (i.kind === "press") return true
    if (w.settle(i)) continue
    if (i.kind === "callup")
      w.aiCallUp(i.nationId, i.squadFor, w.state.competitions[i.squadFor]?.id)
    else if (i.kind === "match") w.state.fixtures[i.fixtureId].result = { h: 1, a: 1 }
  }
  return false
}

describe("press conference", () => {
  it("is called when the squad for a tournament is named, once", () => {
    const w = tournamentsOnly("KOR")
    expect(untilPress(w)).toBe(true)
    const conf = w.state.pendingPress!
    expect(conf.nationId).toBe("KOR")
    expect(w.state.competitions[conf.compId]).toBeTruthy()
    expect(conf.questions).toHaveLength(PRESS_TUNING.questions)
    expect(conf.questions[0].topic).toBe("goal")
    expect(conf.questions.some((q) => q.topic === "federation")).toBe(true)
    expect(new Set(conf.questions.map((q) => q.topic)).size).toBe(conf.questions.length)
    for (const q of conf.questions) {
      if (q.playerId) expect(w.state.players[q.playerId]).toBeTruthy()
      expect(q.reporter.last).toBeTruthy()
    }
    expect(w.state.career.pressed).toContain(conf.compId)
    assistantPress(w)
    expect(w.state.pendingPress).toBeNull()
    // The same squad named again does not call the press again.
    w.aiCallUp("KOR", conf.compId, conf.compId)
    expect(w.state.pendingPress ?? null).toBeNull()
  })

  it("moves confidence, support and morale by the answer", () => {
    const w = tournamentsOnly("KOR")
    expect(untilPress(w)).toBe(true)
    const c = w.state.career
    const conf = w.state.pendingPress!
    const i = conf.questions.findIndex((q) => q.topic === "federation")
    const before = c.confidence
    const a = answerPress(w, i, "bold")!
    expect(a.tone).toBe("bold")
    expect(c.confidence).toBe(Math.round(before + a.board))
    expect(answerPress(w, i, "calm")).toBeNull()
    const j = conf.questions.findIndex((q) => q.playerId)
    if (j >= 0) {
      const p = w.state.players[conf.questions[j].playerId!]
      p.morale = 50
      const r = answerPress(w, j, "bold")!
      expect(p.morale).toBe(50 + r.morale!)
    }
  })

  it("charges for every question left unanswered", () => {
    const w = tournamentsOnly("KOR")
    expect(untilPress(w)).toBe(true)
    const c = w.state.career
    const support = c.support ?? 55
    const before = c.confidence
    finishPress(w)
    expect(w.state.pendingPress).toBeNull()
    expect(c.confidence).toBeLessThan(before)
    expect(c.support!).toBeLessThan(support)
    expect(w.state.news[0].title).toMatchObject({ k: "press.news.title" })
  })

  it("has the same press corps every time, with a face each", () => {
    const a = pressCorps(newWorld("KOR"), "KOR")
    const b = pressCorps(newWorld("KOR"), "KOR")
    expect(a).toEqual(b)
    expect(a).toHaveLength(PRESS_TUNING.corps)
    expect(new Set(a.map((r) => r.face)).size).toBe(a.length)
    expect(PRESS_TONES).toHaveLength(3)
  })

  it("is called for the September window, without a question about the aim", () => {
    const w = newWorld("KOR")
    expect(untilPress(w, "2026-12-31")).toBe(true)
    const conf = w.state.pendingPress!
    expect(conf.compId).toBe("2026-09-21")
    expect(conf.questions.some((q) => q.topic === "goal")).toBe(false)
    expect(conf.questions.some((q) => q.topic === "federation")).toBe(true)
  })

  it("is not called for the June or November windows", () => {
    const w = newWorld("KOR")
    w.state.career.pressed = ["2026-09-21"]
    for (let g = 0; g < 80 && w.state.date < "2026-12-31"; g++) {
      const i = w.advance(1)
      expect(i.kind).not.toBe("press")
      if (w.settle(i)) continue
      if (i.kind === "callup") w.aiCallUp(i.nationId, i.squadFor)
      else if (i.kind === "match") w.state.fixtures[i.fixtureId].result = { h: 1, a: 1 }
    }
  })
})
