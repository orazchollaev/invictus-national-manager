import { describe, expect, it } from "vitest"
import nations from "@/data/nations.json"
import clubRows from "@/data/clubs.json"
import playerRows from "@/data/players.json"
import type { NationDef } from "@/engine/types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "@/engine/world/create"
import { competitionDef } from "@/engine/competition/defs"
import { groupStandings } from "@/engine/competition/tables"
import { AWARDED_HOSTS } from "@/data/start"
import { zonesFor } from "../utils/zones"

/**
 * The coloured markers on a table promise where a position leads. This plays four
 * years and checks every finished competition kept those promises.
 */
describe("table zones match what actually happens", () => {
  it("for every group of every finished competition", { timeout: 300000 }, () => {
    const w = createWorld(
      { seed: 17, start: "2026-09-01", managerName: "Z", nationality: "TUR", nationId: "TUR" },
      { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    w.state.career.nationId = null
    while (w.state.date < "2030-08-01") w.nextDay()

    const ctx = w.ctx()
    const problems: string[] = []
    let checked = 0

    for (const inst of Object.values(w.state.competitions)) {
      if (inst.status !== "done") continue
      const plans = competitionDef(inst.defId).plan(inst, ctx)
      const groupStages = inst.stages.filter((s) => s.kind === "groups" && s.groups?.length)

      const knockout = new Set(
        inst.stages
          .filter((s) => s.kind === "knockout" && s.key !== "playoffs")
          .flatMap((s) => s.rounds?.[0]?.ties.flatMap((t) => [t.home, t.away]) ?? [])
          .filter((t): t is string => !!t)
      )
      const qualified = new Set([
        ...(inst.outcome.qualified ?? []),
        ...(inst.outcome.interconf ?? []),
      ])
      // Hosts playing their own finals' qualifying (AFCON, the Asian Cup's).
      const finalsId = competitionDef(inst.defId).finals?.(inst.year)
      const hosts = new Set([
        ...inst.hosts,
        ...(finalsId
          ? (w.state.competitions[finalsId]?.hosts ?? AWARDED_HOSTS[finalsId] ?? [])
          : []),
      ])
      // Teams can also reach play-offs through the Nations League (UEFA), from any position.
      const playoffRoute = new Set(
        (inst.stages.find((st) => st.key === "playoff")?.rounds?.[0]?.ties ?? []).flatMap((t) => [
          t.home,
          t.away,
        ])
      )
      const tierOf = (t: string) =>
        Object.entries(inst.outcome.tiers ?? {}).find(([, list]) => list.includes(t))?.[0]
      /** Everyone in the stages after `key`. */
      const after = (key: string) =>
        new Set(
          inst.stages
            .slice(inst.stages.findIndex((s) => s.key === key) + 1)
            .flatMap((s) => [
              ...(s.groups ?? []).flatMap((g) => g.teams),
              ...(s.rounds?.[0]?.ties ?? []).flatMap((t) => [t.home, t.away]),
            ])
        )
      const asianCupQ = w.state.competitions[`asian-cupq-${inst.year + 1}`]
      const inAsianCupQ = new Set(
        asianCupQ?.stages.flatMap((s) => [
          ...(s.groups ?? []).flatMap((g) => g.teams),
          ...(s.rounds?.[0]?.ties ?? []).flatMap((t) => [t.home, t.away]),
        ]) ?? []
      )

      for (const groupStage of groupStages) {
        const rule = plans.find((p) => p.key === groupStage.key)?.groups?.tiebreak ?? "gd"
        const next = after(groupStage.key)
        // Only the last group stage decides places; earlier ones lead on.
        const final = groupStage === groupStages.at(-1)
        for (const g of groupStage.groups!) {
          const rows = groupStandings(g, ctx.fixture, rule, ctx.points)
          const zones = zonesFor(inst, g.name, rows.length, ctx, groupStage.key)
          rows.forEach((r, pos) => {
            const zone = zones[pos]
            const where = `${inst.id} ${groupStage.key} ${g.name} #${pos + 1} ${r.team} (${zone ?? "none"})`
            checked++
            if (inst.kind === "nations-league") {
              const letter = g.name.replace(/\d+$/, "")
              const now = tierOf(r.team)
              if (zone === "up" && !(now && now < letter))
                problems.push(`${where}: not promoted (${now})`)
              if (zone === "down" && !(now && now > letter))
                problems.push(`${where}: not relegated (${now})`)
              if (zone === "qf" && !knockout.has(r.team))
                problems.push(`${where}: not in the quarter-finals`)
              if (zone === null && now !== letter) problems.push(`${where}: moved to ${now}`)
            } else if (inst.kind === "qualifier") {
              if (hosts.has(r.team)) return
              if ((zone === "wc-ac" || zone === "next") && !next.has(r.team))
                problems.push(`${where}: did not go on`)
              if (zone === "acq" && asianCupQ && !inAsianCupQ.has(r.team))
                problems.push(`${where}: not in Asian Cup qualifying`)
              if (!final) return
              if (zone === "through" && !qualified.has(r.team))
                problems.push(`${where}: did not qualify`)
              if (zone === null && qualified.has(r.team) && !playoffRoute.has(r.team))
                problems.push(`${where}: qualified without a marker`)
            } else if (knockout.size) {
              if (zone === "advance" && !knockout.has(r.team))
                problems.push(`${where}: did not reach the knockout stage`)
              if (zone === null && knockout.has(r.team))
                problems.push(`${where}: reached the knockout stage unmarked`)
            }
          })
        }
      }
    }
    expect(checked).toBeGreaterThan(500)
    expect(problems).toEqual([])
  })
})
