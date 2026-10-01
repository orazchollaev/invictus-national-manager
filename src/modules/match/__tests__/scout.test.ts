import { describe, expect, it } from "vitest"
import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { createMemoryHistory, createRouter } from "vue-router"
import i18n from "@/i18n"
import { makePlayer, sideOf } from "@/engine/__tests__/helpers"
import { msg } from "@/engine/text"
import { resolveText as say } from "@/i18n/text"
import { archetypesFor } from "@/engine/players/archetypes"
import { scoutReport, type MatchupLine, type ScoutReport } from "@/engine/match/scouting"
import type { Tactics } from "@/engine/match/types"
import type { Position } from "@/engine/types"
import ScoutReportCard from "../components/scout/ScoutReportCard.vue"
import { matchupNotes } from "../utils/scout"

const line = (id: MatchupLine["id"], _label: string, factor: number): MatchupLine => ({
  id,
  label: msg(`rule.${id}`),
  factor,
})

const base: ScoutReport = {
  nationId: "o",
  formation: "4-2-3-1",
  traits: [msg("scout.trait.balanced")],
  key: [],
  yours: [],
  theirs: [],
  advice: { patch: {}, changes: [], reasons: [], gain: 0 },
}

describe("matchupNotes", () => {
  it("sorts what works for the manager from what works against him", () => {
    const r: ScoutReport = {
      ...base,
      yours: [
        line("behind-high-line", "Balls in behind a high line", 1.05),
        line("patience-into-press", "Patient build-up against a high press", 0.96),
      ],
      theirs: [
        line("width-into-back-five", "Width is wasted against a back five", 0.96),
        line("midfield-numbers", "More players through the middle", 1.03),
      ],
    }
    const say2 = (ns: { who: string; label: Parameters<typeof say>[0] }[]) =>
      ns.map((n) => ({ who: n.who, label: say(n.label) }))
    const { good: good0, bad: bad0 } = matchupNotes(r)
    const good = say2(good0)
    const bad = say2(bad0)
    expect(good).toEqual([
      { who: "you", label: "Balls in behind a high line" },
      { who: "them", label: "Width is wasted against a back five" },
    ])
    expect(bad).toEqual([
      { who: "you", label: "Patient build-up against a high press" },
      { who: "them", label: "More players through the middle" },
    ])
  })

  it("is empty when nothing applies", () => {
    expect(matchupNotes(base)).toEqual({ good: [], bad: [] })
  })
})

async function render(report: ScoutReport, assisted = false, players = new Map()) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:rest(.*)*", component: { render: () => null } }],
  })
  const app = createSSRApp({
    render: () =>
      h(ScoutReportCard, {
        report,
        name: "Brazil",
        player: (id: string) => players.get(id),
        assisted,
      }),
  })
  app.use(router).use(i18n)
  await router.push("/")
  await router.isReady()
  return renderToString(app)
}

describe("ScoutReportCard", () => {
  const first = (pos: Position) => archetypesFor(pos)[0]
  const tactics: Tactics = { formation: "4-2-3-1", mentality: 0, pressing: 1, tempo: 1, line: 2 }

  function reportAgainst(counter: boolean) {
    const opp = sideOf("o", first, { tactics: { counter, tempo: counter ? 2 : 1 } })
    const byId = new Map(opp.players.map((p) => [p.id, p]))
    return { report: scoutReport(opp.sheet, tactics, (id) => byId.get(id)), byId }
  }

  it("shows the opponent, how they play and who to watch", async () => {
    const { report, byId } = reportAgainst(true)
    const html = await render(report, false, byId)
    expect(html).toContain("Scouting: Brazil")
    expect(html).toContain("4-2-3-1")
    expect(html).toContain("Counter-attacking")
    expect(html).toContain("Players to watch")
    const star = byId.get(report.key[0].playerId)!
    expect(html).toContain(star.last)
    expect(html).toContain(`/player/${star.id}`)
  })

  it("lists the matchups and offers the assistant's advice", async () => {
    const { report, byId } = reportAgainst(true)
    const html = await render(report, false, byId)
    expect(html).toContain("Balls in behind a high line")
    expect(html).toContain("Your assistant suggests")
    expect(html).toContain("Defensive line: High")
    expect(html).toContain("Apply to my tactics")
  })

  it("does not offer a button when the assistant sets the team up himself", async () => {
    const { report, byId } = reportAgainst(true)
    const html = await render(report, true, byId)
    expect(html).toContain("Your assistant suggests")
    expect(html).toContain("sets this up for you")
    expect(html).not.toContain("Apply to my tactics")
  })

  it("says so when nothing needs changing", async () => {
    const { report, byId } = reportAgainst(false)
    const calm = { ...report, advice: { patch: {}, changes: [], reasons: [], gain: 0 } }
    const html = await render(calm, false, byId)
    expect(html).toContain("No changes needed")
    expect(html).not.toContain("Apply to my tactics")
  })

  it("names a role only when it adds something to the player's style", async () => {
    const { report, byId } = reportAgainst(false)
    const same = {
      ...report,
      key: [
        { ...report.key[0], archetype: msg("arch.poacher.label"), role: msg("role.poacher.label") },
      ],
    }
    expect(await render(same, false, byId)).not.toContain("(Poacher)")
    const other = {
      ...report,
      key: [
        {
          ...report.key[0],
          archetype: msg("arch.poacher.label"),
          role: msg("role.target-man.label"),
        },
      ],
    }
    expect(await render(other, false, byId)).toContain("(Target man)")
  })

  it("copes with a player who is gone", async () => {
    const { report } = reportAgainst(true)
    const html = await render(report, false, new Map([["x", makePlayer("x", "ST", 70)]]))
    expect(html).toContain("Scouting: Brazil")
  })
})

describe("applying the advice from the store", () => {
  it("saves the recommended instructions as the user's team", async () => {
    const { createPinia, setActivePinia } = await import("pinia")
    const { useWorldStore } = await import("@/modules/world/store")
    const { useSettingsStore } = await import("@/modules/settings/store")
    const nations = (await import("@/data/nations.json")).default
    const clubRows = (await import("@/data/clubs.json")).default
    const playerRows = (await import("@/data/players.json")).default
    const { clubsFromRows, createWorld } = await import("@/engine/world/create")
    setActivePinia(createPinia())
    useSettingsStore().autoSave = "off"
    const w = createWorld(
      { seed: 1, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
      {
        nations: nations as never,
        clubs: clubsFromRows(clubRows as never),
      },
      playerRows as never
    )
    const f = Object.values(w.state.fixtures).find((x) => x.home === "TUR" || x.away === "TUR")!
    w.setSquad(
      "TUR",
      w.squadKey(f, "TUR"),
      w
        .pool("TUR")
        .slice(0, 26)
        .map((p) => p.id)
    )
    const sheet = w.userSheet(f)
    const opp = f.home === "TUR" ? f.away : f.home
    const theirs = w.expectedSheet(opp, f).tactics
    const { advise } = await import("@/engine/match/scouting")
    const setting = [0, 1, 2]
      .map((line) => ({ line: line as 0 | 1 | 2, width: 1 as const, counter: true }))
      .find((c) => advise({ ...sheet.tactics, ...c }, theirs).changes.length > 0)!
    w.state.userTeam = {
      tactics: { ...sheet.tactics, ...setting },
      xi: sheet.xi,
      bench: sheet.bench,
    }
    const store = useWorldStore()
    store.world = w
    store.touch()
    const expected = w.adviceFor(f)!
    expect(expected).not.toBeNull()
    store.applyAdvice(f)
    expect(w.state.userTeam!.tactics).toEqual(expected.tactics)
    expect(w.state.userTeam!.tactics).not.toEqual({ ...sheet.tactics, ...setting })
    // Taken once, there is nothing left to apply.
    expect(w.adviceFor(f)).toBeNull()
  })
})
