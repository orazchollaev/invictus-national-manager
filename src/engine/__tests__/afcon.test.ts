import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { afconYears } from "../competition/defs/helpers"
import { formatProblems } from "../competition/invariants"

describe("AFCON every two years (CAF, October 2026)", () => {
  it("is played in 2027, 2028, 2031 and 2033, then every odd year", () => {
    expect(afconYears(2026, 2037)).toEqual([2027, 2028, 2031, 2033, 2035, 2037])
    expect(afconYears(2029, 2032)).toEqual([2031])
  })

  it(
    "keeps its fixtures clear of every other competition, qualifying included",
    { timeout: 600000 },
    () => {
      const w = createWorld(
        { seed: 3, start: "2026-09-01", managerName: "A", nationality: "TUR", nationId: "TUR" },
        { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
        playerRows as unknown as Record<string, PlayerRow[]>
      )
      w.state.career.nationId = null
      while (w.state.date < "2031-08-01") w.nextDay()

      const comps = w.state.competitions
      for (const id of ["afcon-2027", "afcon-2028", "afcon-2031"]) expect(comps[id]).toBeTruthy()
      for (const id of ["afcon-2029", "afcon-2030", "afcon-2032"]) expect(comps[id]).toBeUndefined()
      // COSAFA and WAFU stand aside in AFCON years.
      expect(comps["cosafa-2031"]).toBeUndefined()
      expect(comps["wafu-2031"]).toBeUndefined()

      // The 2031 qualifiers follow the 2030 World Cup: autumn 2030 to March 2031.
      const dates = Object.values(w.state.fixtures)
        .filter((f) => f.compId === "afconq-2031")
        .map((f) => f.date)
        .sort()
      expect(dates[0] >= "2030-03-01").toBe(true)
      expect(dates[dates.length - 1] <= "2031-04-01").toBe(true)
      expect(comps["afconq-2031"].status).toBe("done")

      // No team plays two matches on one day.
      const seen = new Map<string, string>()
      const clashes: string[] = []
      for (const f of Object.values(w.state.fixtures)) {
        for (const t of [f.home, f.away]) {
          const key = `${t}@${f.date}`
          const other = seen.get(key)
          if (other && /^afcon/.test(f.compId + other))
            clashes.push(`${t} ${f.date}: ${f.compId} v ${other}`)
          seen.set(key, f.compId)
        }
      }
      expect(clashes).toEqual([])
      expect(formatProblems(w).filter((p) => p.includes("afcon"))).toEqual([])
    }
  )
})
