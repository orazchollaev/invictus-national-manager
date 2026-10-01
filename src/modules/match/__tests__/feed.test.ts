import { describe, expect, it } from "vitest"
import { createSSRApp, h, type Component } from "vue"
import { renderToString } from "vue/server-renderer"
import i18n from "@/i18n"
import { commentaryLine } from "@/engine/match/commentary"
import { laneCounts } from "@/engine/match/lanes"
import type { Lane, MatchEvent, TeamStats } from "@/engine/match/types"
import CommentaryFeed from "../components/live/CommentaryFeed.vue"
import StatsPanel from "../components/live/StatsPanel.vue"

const names = {
  player: (id?: string) => (id ? `Player ${id}` : "—"),
  team: (s: "home" | "away") => (s === "home" ? "Brazil" : "Italy"),
}

const attack = (
  lane: Lane | undefined,
  side: "home" | "away" = "home",
  minute = 10
): MatchEvent => ({
  minute,
  kind: "attack",
  side,
  playerId: "a",
  otherId: "b",
  lane,
})

const render = (component: Component, props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(component, props) }).use(i18n))

describe("commentary with lanes", () => {
  it("says where an attack came from, for every variant of the line", () => {
    const phrase: Record<Lane, string> = {
      left: "down the left",
      centre: "through the middle",
      right: "down the right",
    }
    for (const lane of ["left", "centre", "right"] as Lane[]) {
      const lines = new Set<string>()
      for (let i = 0; i < 12; i++) lines.add(commentaryLine(attack(lane, "home", i + 3), i, names))
      expect([...lines].some((l) => l.includes(phrase[lane]))).toBe(true)
      for (const l of lines) expect(l).not.toContain("{lane}")
    }
  })

  it("does not leave a hole in a line when the lane is unknown", () => {
    for (let i = 0; i < 12; i++) {
      const line = commentaryLine(attack(undefined, "home", i + 3), i, names)
      expect(line).not.toContain("{")
      expect(line).not.toMatch(/undefined/)
    }
  })
})

describe("CommentaryFeed", () => {
  it("draws an arrow for the lane of an attack, leaning the way it went", async () => {
    const html = await render(CommentaryFeed, {
      events: [attack("left"), attack("centre", "home", 11), attack("right", "away", 12)],
      names,
      verbose: true,
      mine: "home",
    })
    expect(html).toContain('aria-label="Attack down the left"')
    expect(html).toContain('aria-label="Attack through the middle"')
    expect(html).toContain('aria-label="Attack down the right"')
  })

  it("draws no arrow on a line with no lane", async () => {
    const html = await render(CommentaryFeed, {
      events: [{ minute: 5, kind: "goal", side: "home", playerId: "a", score: [1, 0] }],
      names,
      verbose: false,
    })
    expect(html).not.toContain("Attack down")
    expect(html).not.toContain("Attack through")
  })

  it("shows an arrow on a goal, which is always in the short feed", async () => {
    const html = await render(CommentaryFeed, {
      events: [
        { minute: 5, kind: "goal", side: "home", playerId: "a", lane: "right", score: [1, 0] },
      ],
      names,
      verbose: false,
    })
    expect(html).toContain('aria-label="Attack down the right"')
  })
})

describe("StatsPanel attack zones", () => {
  const stats: TeamStats = {
    possession: 50,
    shots: 1,
    onTarget: 1,
    xg: 1,
    corners: 1,
    fouls: 1,
    yellows: 0,
    reds: 0,
    offsides: 0,
    saves: 0,
  }

  it("lists attacks by side when it has the events", async () => {
    const lanes = laneCounts([attack("left"), attack("left"), attack("right", "away")])
    const html = await render(StatsPanel, { home: stats, away: stats, lanes })
    expect(html).toContain("Down the left")
    expect(html).toContain("Through the middle")
    expect(html).toContain("Down the right")
    expect(html).toContain("own left and right")
  })

  it("leaves the section out when it does not", async () => {
    const html = await render(StatsPanel, { home: stats, away: stats })
    expect(html).not.toContain("Down the left")
  })
})
