import { describe, expect, it } from "vitest"
import pt from "@/i18n/locales/pt/commentary"
import {
  DEFAULT_COMMENTARY,
  commentaryLine,
  type CommentaryNames,
  type CommentaryText,
  type ShotKind,
} from "../match/commentary"
import type { MatchEvent, ShotType } from "../match/types"
import { playLevel } from "./helpers"

const names: CommentaryNames = {
  player: (id) => (id ? `P${id}` : "someone"),
  team: (side) => (side === "home" ? "Home" : "Away"),
}
const event = (extra: Partial<MatchEvent>): MatchEvent => ({
  minute: 10,
  kind: "goal",
  side: "home",
  playerId: "1",
  otherId: "2",
  ...extra,
})
const LANGUAGES: [string, CommentaryText][] = [
  ["en", DEFAULT_COMMENTARY],
  ["pt", pt],
]
const PLACEHOLDER = /\{[a-z:]+\}/

describe("commentary for the kind of shot", () => {
  it("calls a header a header and a free kick a free kick", () => {
    for (let i = 0; i < 4; i++) {
      expect(commentaryLine(event({ shot: "header" }), i, names)).toMatch(/head/i)
      expect(commentaryLine(event({ shot: "free-kick" }), i, names)).toMatch(/free kick/i)
      expect(commentaryLine(event({ kind: "shot-saved", shot: "one-on-one" }), i, names)).toMatch(
        /one-on-one|clean through/i
      )
    }
  })

  it("falls back to the plain lines for a shot it has nothing special to say about", () => {
    for (let i = 0; i < 5; i++)
      expect(commentaryLine(event({ shot: "box" }), i, names)).toBe(
        commentaryLine(event({}), i, names)
      )
  })

  it("says when a chance came on the break or from a ball won high, but not from a set piece", () => {
    expect(commentaryLine(event({ shot: "box", move: "counter" }), 0, names)).toMatch(
      /counter-attack\.$/
    )
    expect(
      commentaryLine(event({ kind: "shot-saved", shot: "box", move: "press" }), 0, names)
    ).toMatch(/^Won back high up the pitch! /)
    const setPiece = commentaryLine(
      event({ kind: "shot-wide", shot: "header", move: "set-piece" }),
      0,
      names
    )
    expect(setPiece).not.toMatch(/^On the break|^Won back/)
  })

  it("still reads an old saved event that has no kind of shot", () => {
    expect(commentaryLine(event({}), 0, names)).toMatch(/^GOAL!/)
  })
})

describe("every language", () => {
  it("has the same kinds of shot and moves as English, with every name filled in", () => {
    const shots = DEFAULT_COMMENTARY.shots!
    for (const [code, text] of LANGUAGES) {
      for (const type of Object.keys(shots) as ShotType[])
        for (const kind of Object.keys(shots[type]!) as ShotKind[]) {
          const lines = text.shots?.[type]?.[kind]
          expect(lines?.length, `${code} ${type} ${kind}`).toBeGreaterThan(0)
          lines!.forEach((_, i) => {
            const line = commentaryLine(event({ kind, shot: type }), i, names, text)
            expect(line.length).toBeGreaterThan(5)
            expect(line).not.toMatch(PLACEHOLDER)
          })
        }
      expect(Object.keys(text.moves ?? {}).sort()).toEqual(
        Object.keys(DEFAULT_COMMENTARY.moves!).sort()
      )
    }
  })

  it("has a line, names filled in, for everything the engine says in a match", () => {
    const reports = [
      ...playLevel(70, 70, 20),
      ...playLevel(70, 70, 20, { knockout: { extraTime: true } }),
    ]
    for (const [code, text] of LANGUAGES)
      for (const r of reports)
        r.events.forEach((ev, i) => {
          const line = commentaryLine(ev, i, names, text)
          expect(line.length, `${code} ${ev.kind}`).toBeGreaterThan(3)
          expect(line).not.toMatch(PLACEHOLDER)
        })
  })
})
