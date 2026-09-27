import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"

const statics = () => ({
  nations: nations as NationDef[],
  clubs: clubsFromRows(clubRows as ClubRow[]),
})

function run(years: number, seed = 7) {
  const w = createWorld(
    { seed, start: "2026-09-01", managerName: "Soak", nationality: "TUR", nationId: "TUR" },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  w.state.career.nationId = null
  const days = Math.round(years * 365.25)
  for (let i = 0; i < days; i++) w.nextDay()
  return w
}

describe("long-run world", () => {
  it("plays five years of competitions to completion", () => {
    const t0 = Date.now()
    const w = run(5)
    const done = Object.values(w.state.competitions).filter((c) => c.status === "done")
    const log = done
      .sort((a, b) => (a.end < b.end ? -1 : 1))
      .map(
        (c) =>
          `${c.name}: ${c.outcome.winner ?? "-"} ${c.outcome.qualified ? `q=${c.outcome.qualified.length}` : ""}`
      )
    console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s\n` + log.join("\n"))
    const names = done.map((c) => c.id)
    for (const id of [
      "unl-2026",
      "asian-cup-2027",
      "afcon-2027",
      "euro-2028",
      "copa-2028",
      "wcq-uefa-2030",
      "wcq-caf-2030",
      "wcq-afc-2030",
      "wcq-conmebol-2030",
      "wc-2030",
    ]) {
      expect(names).toContain(id)
    }
    expect(w.state.competitions["wc-2030"].stages[0].groups?.flatMap((g) => g.teams).length).toBe(
      48
    )
    const top = Object.values(w.state.nations)
      .sort((a, b) => b.points - a.points)
      .slice(0, 15)
      .map((n) => `${n.id} ${Math.round(n.points)}`)
    console.log(top.join(", "))
  })
})
