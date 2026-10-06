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
    const stats: { size: number; avgAge: number; drift: number; from: number }[] = []
    for (const id of ids) {
      const pool = w.pool(id)
      const s = squadStrength(pool, w.state.date)
      const avgAge = pool.reduce((a, p) => a + ageOn(p.born, w.state.date), 0) / pool.length
      lines.push(
        `${id} pool=${pool.length} age=${avgAge.toFixed(1)} xi ${start.get(id)!.toFixed(1)} -> ${s.toFixed(1)}`
      )
      stats.push({ size: pool.length, avgAge, drift: s - start.get(id)!, from: start.get(id)! })
    }
    console.log(w.state.date + "\n" + lines.join("\n"))
    const wc = Object.values(w.state.competitions)
      .filter((c) => c.defId === "wc")
      .map((c) => `${c.year}: ${c.outcome.winner}`)
    console.log(wc.join(", "))
    // Hosts chosen in-game, and whether their grounds were ready (works included).
    const hosted = Object.values(w.state.competitions)
      .filter((c) => (c.kind === "world-cup" || c.kind === "continental") && c.year >= 2033)
      .map((c) => ({
        id: c.id,
        hosts: c.hosts,
        ready: w.hostReadiness(c.hosts, c.kind === "world-cup" ? "world-cup" : "continental"),
      }))
    console.log(hosted.map((h) => `${h.id}: ${h.hosts.join("+")} ${h.ready}`).join("\n"))
    for (const h of hosted) expect(h.ready, h.id).toBeGreaterThanOrEqual(0.9)
    // Every edition of the new formats ran to the end.
    for (const c of Object.values(w.state.competitions))
      if (["unl", "euroq", "wcq-uefa"].includes(c.defId) && c.end < "2046-01-01")
        expect(c.status, c.id).toBe("done")
    for (const n of Object.values(w.state.nations))
      expect(n.projects?.length ?? 0, n.id).toBeLessThanOrEqual(12)
    for (const st of stats) {
      expect(st.size).toBeGreaterThan(65)
      expect(st.size).toBeLessThan(100)
      expect(st.avgAge).toBeGreaterThan(23)
      expect(st.avgAge).toBeLessThan(28.5)
      // The weakest pools (San Marino, ~54) swing by several points from one intake to
      // the next with an unchanged academy level; the rest must hold within 7. One pool
      // at one moment is a noisy reading: across seeds the drifts reach about 6.5 with no
      // pattern by strength, so a tighter bound fails on luck, not on a real drift.
      expect(Math.abs(st.drift)).toBeLessThan(st.from < 60 ? 9 : 7)
    }
  })
})
