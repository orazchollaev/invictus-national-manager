import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { ageOn } from "../players/ability"
import { squadStrength } from "../ai/squad"

// Twenty seasons headless: the pool must look like football in 2046 as much as 2026.
// Slow (~1.5 min); run with LONGRUN=1.
const env =
  (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}

describe.runIf(env.LONGRUN)("twenty seasons", () => {
  it("keeps pools, ages and national strength stable", { timeout: 600000 }, () => {
    const statics = { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) }
    const w = createWorld(
      { seed: 11, start: "2026-09-01", managerName: "X", nationality: "TUR", nationId: "TUR" },
      statics,
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    w.state.career.nationId = null
    const ids = [
      "ESP",
      "FRA",
      "BRA",
      "ARG",
      "ENG",
      "GER",
      "JPN",
      "MAR",
      "USA",
      "TUR",
      "NZL",
      "SMR",
      "IND",
      "FIJ",
    ]
    const start = new Map(ids.map((id) => [id, squadStrength(w.pool(id), w.state.date)]))
    for (let i = 0; i < Math.round(20 * 365.25); i++) w.nextDay()
    const lines: string[] = []
    const stats: { size: number; avgAge: number; drift: number }[] = []
    for (const id of ids) {
      const pool = w.pool(id)
      const s = squadStrength(pool, w.state.date)
      const avgAge = pool.reduce((a, p) => a + ageOn(p.born, w.state.date), 0) / pool.length
      lines.push(
        `${id} pool=${pool.length} age=${avgAge.toFixed(1)} xi ${start.get(id)!.toFixed(1)} -> ${s.toFixed(1)}`
      )
      stats.push({ size: pool.length, avgAge, drift: s - start.get(id)! })
    }
    console.log(w.state.date + "\n" + lines.join("\n"))
    const wc = Object.values(w.state.competitions)
      .filter((c) => c.defId === "wc")
      .map((c) => `${c.year}: ${c.outcome.winner}`)
    console.log(wc.join(", "))
    for (const st of stats) {
      expect(st.size).toBeGreaterThan(65)
      expect(st.size).toBeLessThan(100)
      expect(st.avgAge).toBeGreaterThan(23)
      expect(st.avgAge).toBeLessThan(28.5)
      expect(Math.abs(st.drift)).toBeLessThan(6)
    }
  })
})
