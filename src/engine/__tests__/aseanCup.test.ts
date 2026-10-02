import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { ASEAN_CUP_2026 } from "@/data/start"

describe("FIFA ASEAN Cup 2026", () => {
  it("plays the real groups, then the final and the bronze final", { timeout: 300000 }, () => {
    const w = createWorld(
      { seed: 5, start: "2026-09-01", managerName: "H", nationality: "TUR", nationId: "TUR" },
      { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    w.state.career.nationId = null
    while (w.state.date < "2026-10-12") w.nextDay()

    const cup = w.state.competitions["asean-cup-2026"]
    const challenge = w.state.competitions["asean-challenge-2026"]
    expect(cup.hosts).toEqual(["IDN"])
    expect(challenge.hosts).toEqual(["HKG"])
    expect(cup.stages[0].groups!.map((g) => g.teams)).toEqual(ASEAN_CUP_2026.cup)
    expect(challenge.stages[0].groups!.map((g) => g.teams)).toEqual(ASEAN_CUP_2026.challenge)

    expect(cup.status).toBe("done")
    const bronze = cup.stages.find((s) => s.key === "bronze")!
    const [final, third] = [cup.stages[1].rounds![0].ties[0], bronze.rounds![0].ties[0]]
    expect(final.fixtures).toHaveLength(1)
    expect(third.fixtures).toHaveLength(1)
    expect(cup.outcome.third).toBe(third.winner)
    expect(cup.outcome.winner).toBe(final.winner)
    expect(cup.outcome.placings).toHaveLength(8)

    expect(challenge.status).toBe("done")
    expect(challenge.stages).toHaveLength(2)
    expect(challenge.outcome.winner).toBeTruthy()
  })
})
