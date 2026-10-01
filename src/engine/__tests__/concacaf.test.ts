import { describe, expect, it } from "vitest"
import { resolveText as say } from "@/i18n/text"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "../types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "../world/create"
import { goldCupRoutes } from "../competition/defs/concacaf"
import type { StageState } from "../competition/types"

/**
 * The CONCACAF Nations League as the way into the Gold Cup: the real 2026–27 draw,
 * League A's Swiss groups, the quarter-finals and Play-In, the Prelims and the Gold Cup.
 */
describe("CONCACAF Nations League and Gold Cup", { timeout: 600000 }, () => {
  const w = createWorld(
    { seed: 23, start: "2026-09-01", managerName: "C", nationality: "MEX", nationId: "MEX" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  w.state.career.nationId = null
  const until = (date: string) => {
    while (w.state.date < date) w.nextDay()
  }
  const nl = () => w.state.competitions["cnl-2026"]
  const stage = (key: string): StageState => nl().stages.find((s) => s.key === key)!
  const ties = (s: StageState) => s.rounds![0].ties

  it("draws the real leagues, the top four straight into the quarter-finals", () => {
    until("2026-09-02")
    const teams = (key: string) => stage(key).groups!.map((g) => g.teams)
    expect(teams("league-a")).toEqual([
      ["CRC", "HAI", "TRI", "CUW", "NCA", "DOM"],
      ["HON", "JAM", "GUA", "SUR", "MTQ", "SLV"],
    ])
    expect(teams("league-b").map((g) => g.length)).toEqual([4, 4, 4, 4])
    expect(teams("league-c").map((g) => g.length)).toEqual([3, 3, 3])
    const all = ["league-a", "league-b", "league-c"].flatMap((k) => teams(k).flat())
    for (const bye of ["MEX", "USA", "CAN", "PAN"]) expect(all).not.toContain(bye)
    // All 41 members, the six outside FIFA included.
    expect(all).toHaveLength(37)
    for (const t of ["MTQ", "GLP", "GUF", "BOE", "SXM", "SMN"]) expect(all).toContain(t)
  })

  it("keeps teams outside FIFA out of World Cup qualifying and the ranking", () => {
    const wcq = w.state.competitions["wcq-concacaf-2030"]
    const def = w.ctx()
    for (const t of ["MTQ", "GLP", "GUF", "BOE", "SXM", "SMN"]) {
      expect(def.fifa(t)).toBe(false)
      expect(def.confedMember(t)).toBe(true)
      expect(w.fifaRank(t)).toBe(0)
    }
    for (const t of ["REU", "ZAN", "KIR", "TUV"]) expect(def.confedMember(t)).toBe(false)
    expect(wcq).toBeDefined()
  })

  it("plays League A's Swiss groups: four matches each, two at home", () => {
    const a = stage("league-a").groups![0]
    const fixtures = a.fixtures.map((id) => w.state.fixtures[id])
    expect(fixtures).toHaveLength(12)
    for (const t of a.teams) {
      expect(fixtures.filter((f) => f.home === t)).toHaveLength(2)
      expect(fixtures.filter((f) => f.away === t)).toHaveLength(2)
    }
    // Real opening fixtures (23–26 September 2026).
    const first = fixtures.filter((f) => say(f.label).endsWith("Matchday 1")).map((f) => f.home)
    expect(first.sort()).toEqual(["CRC", "DOM", "HAI"])
    // Every league match is inside the September–October window.
    const league = ["league-a", "league-c"].flatMap((k) =>
      stage(k).groups!.flatMap((g) => g.fixtures.map((id) => w.state.fixtures[id].date))
    )
    for (const d of league) expect(d >= "2026-09-21" && d <= "2026-10-06", d).toBe(true)
  })

  it("pairs the quarter-finals with the byes and the Play-In with League C", () => {
    until("2026-11-20")
    const qf = ties(stage("qf"))
    expect(qf).toHaveLength(4)
    // The best-ranked bye meets the other runner-up, at home in the second leg.
    expect(qf.map((t) => t.away)).toEqual(["PAN", "CAN", "USA", "MEX"])
    const playIn = ties(stage("playin"))
    expect(playIn).toHaveLength(4)
    const c = stage("league-c").groups!.flatMap((g) => g.teams)
    for (const t of playIn) expect(c).toContain(t.home)
  })

  it("sends fourteen teams to the Prelims and eight straight into the Gold Cup", () => {
    until("2026-12-01")
    const routes = goldCupRoutes(nl(), w.ctx())
    expect(routes.settled).toBe(true)
    expect(routes.direct).toHaveLength(8)
    expect(routes.prelims).toHaveLength(14)
    const prelims = w.state.competitions["gcq-2027"]
    const drawn = ties(prelims.stages[0]).flatMap((t) => [t.home, t.away])
    expect(drawn.sort()).toEqual([...routes.prelims].sort())
  })

  it("fills the Gold Cup with the Nations League, the Prelims and one guest", () => {
    until("2027-04-15")
    const routes = goldCupRoutes(nl(), w.ctx())
    const prelims = w.state.competitions["gcq-2027"].outcome.qualified!
    expect(prelims).toHaveLength(7)
    const teams = w.state.competitions["gold-cup-2027"].stages[0].groups!.flatMap((g) => g.teams)
    expect(teams).toHaveLength(16)
    for (const t of [...routes.direct, ...prelims]) expect(teams).toContain(t)
    const guests = teams.filter((t) => w.def(t).confed !== "CONCACAF")
    expect(guests).toHaveLength(1)
    expect(w.def(guests[0]).confed).toBe("AFC")
  })

  it("finishes the Nations League with its three Finals and 16-16-9 leagues next time", () => {
    until("2027-04-15")
    expect(nl().status).toBe("done")
    for (const key of ["a-finals", "b-finals", "c-finals"]) expect(stage(key).status).toBe("done")
    expect(nl().outcome.winner).toBeTruthy()
    until("2028-07-24")
    const next = w.state.competitions["cnl-2028"]
    const size = (key: string) =>
      next.stages.find((s) => s.key === key)!.groups!.flatMap((g) => g.teams).length
    expect(size("league-a")).toBe(12)
    expect(size("league-b")).toBe(16)
    expect(size("league-c")).toBe(9)
    // World Cup qualifying: the 35 FIFA members only; Martinique's points never move.
    const wcq = w.state.competitions["wcq-concacaf-2030"]
    const inWcq = new Set(
      wcq.stages
        .flatMap((st) => [
          ...(st.groups ?? []).flatMap((g) => g.teams),
          ...(st.rounds?.[0]?.ties ?? []).flatMap((t) => [t.home, t.away]),
        ])
        .filter((t): t is string => !!t)
    )
    expect(inWcq.size).toBe(35)
    for (const t of inWcq) expect(w.def(t).nonFifa, t).toBeUndefined()
    expect(w.state.nations.MTQ.points).toBe(w.def("MTQ").points)
  })
})
