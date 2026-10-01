import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import type { Fixture } from "../competition/types"

/** The manager is told when his team goes through a group or a tie, or goes out. */
describe("progress news", { timeout: 300000 }, () => {
  const w = createWorld(
    { seed: 3, start: "2026-09-01", managerName: "N", nationality: "KSA", nationId: "KSA" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  // The user's own matches are left to him: play them for him.
  const play = (w as unknown as { playAi(f: Fixture): void }).playAi.bind(w)
  while (w.state.date < "2027-02-20") {
    for (const f of Object.values(w.state.fixtures))
      if (f.date === w.state.date && !f.result && (f.home === "KSA" || f.away === "KSA")) play(f)
    w.nextDay()
  }
  const inst = w.state.competitions["asian-cup-2027"]
  const mine = w.state.news.filter((n) => n.mine && n.link === `/competitions/${inst.id}`)
  const titles = mine.map((n) => n.title)

  it("reports the group stage once, through or out", () => {
    const groupNews = titles.filter((t) => /: (through|out)$/.test(t))
    const stage = inst.stages.find((s) => s.key === "knockout")!
    const went = stage.rounds![0].ties.some((t) => t.home === "KSA" || t.away === "KSA")
    expect(groupNews.length).toBeGreaterThanOrEqual(1)
    expect(groupNews[groupNews.length - 1]).toBe(
      went ? `${inst.name}: through` : `${inst.name}: out`
    )
    // Said once, not on every later result.
    const first = mine.filter(
      (n) =>
        n.body.startsWith("We finished") || n.body.startsWith("We are through to the Round of 16")
    )
    expect(first.length).toBeLessThanOrEqual(1)
  })

  it("reports each tie the team plays after that, win or lose, never twice", () => {
    const ties = inst.stages
      .find((s) => s.key === "knockout")!
      .rounds!.flatMap((r) => r.ties)
      .filter((t) => (t.home === "KSA" || t.away === "KSA") && t.winner)
    const bodies = mine.map((n) => n.body)
    expect(new Set(bodies).size).toBe(bodies.length)
    const rounds = inst.stages.find((s) => s.key === "knockout")!.rounds!
    const last = rounds[rounds.length - 1].ties
    // Winning the final is told as the title, not as progress.
    const told = ties.filter((t) => !(last.includes(t) && t.winner === "KSA")).length
    const tieNews = mine.filter((n) => /through to the|knocked out|lost the final/.test(n.body))
    // The group stage's own "through" is told as well, when the team went on.
    const wentOn = rounds[0].ties.some((t) => t.home === "KSA" || t.away === "KSA")
    expect(tieNews).toHaveLength(told + (wentOn ? 1 : 0))
  })
})
