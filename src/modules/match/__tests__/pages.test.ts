import { it, expect } from "vitest"
import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { createPinia, setActivePinia } from "pinia"
import { createRouter, createMemoryHistory, RouterView } from "vue-router"
import i18n from "@/i18n"
import { useWorldStore } from "@/modules/world/store"
import { World } from "@/engine/world/world"
import { createWorld } from "@/engine/world/create"
import { statics } from "@/modules/world/services/statics"
import playerRows from "@/data/players.json"
import { buildReport, createMatch, step } from "@/engine/match/engine"
import { pickSquad } from "@/engine/ai/squad"
import type { PlayerRow } from "@/engine/world/create"

const pages: Record<string, () => Promise<unknown>> = {
  "/report/:id": () => import("../pages/ReportPage.vue"),
  "/match/:id": () => import("../pages/MatchPage.vue"),
  "/home": () => import("@/modules/core/pages/HomePage.vue"),
  "/menu": () => import("@/modules/career/pages/MainMenuPage.vue"),
  "/load": () => import("@/modules/career/pages/LoadGamePage.vue"),
  "/new": () => import("@/modules/career/pages/NewGamePage.vue"),
  "/competitions/:id": () => import("@/modules/competitions/pages/CompetitionPage.vue"),
  "/squad": () => import("@/modules/squad/pages/SquadPage.vue"),
  "/nation/:id": () => import("@/modules/nations/pages/NationPage.vue"),
  "/career": () => import("@/modules/career/pages/CareerPage.vue"),
  "/inbox": () => import("@/modules/news/pages/InboxPage.vue"),
  "/rankings": () => import("@/modules/competitions/pages/RankingPage.vue"),
  "/competitions": () => import("@/modules/competitions/pages/CompetitionsPage.vue"),
  "/squad/tactics": () => import("@/modules/squad/pages/TacticsPage.vue"),
  "/squad/callup": () => import("@/modules/squad/pages/CallUpPage.vue"),
}

it("renders every main page after a real match", { timeout: 120000 }, async () => {
  const w: World = createWorld(
    { seed: 5, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  let fixtureId = ""
  for (let g = 0; g < 40 && !fixtureId; g++) {
    const i = w.advance(30)
    if (w.settle(i)) continue
    if (i.kind === "callup")
      w.setSquad(i.nationId, i.squadFor, pickSquad(w.pool(i.nationId), w.state.date, 26))
    if (i.kind === "match") {
      const f = w.state.fixtures[i.fixtureId]
      const mine = f.home === "TUR" ? "home" : "away"
      const m = createMatch({
        ...w.matchSetup(
          f,
          mine === "home" ? w.userSheet(f) : w.aiSheet(f.home, f),
          mine === "away" ? w.userSheet(f) : w.aiSheet(f.away, f)
        ),
        managed: mine,
      })
      while (m.phase !== "done") {
        step(m)
        m.pendingInjuries = []
      }
      w.applyReport(f, buildReport(m), true)
      fixtureId = f.id
    }
  }
  const errors: string[] = []
  for (const [path, loader] of Object.entries(pages)) {
    const url = path.replace(
      ":id",
      path.startsWith("/nation")
        ? "TUR"
        : path.startsWith("/competitions/")
          ? "unl-2026"
          : fixtureId
    )
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path, component: loader as never },
        { path: "/:rest(.*)*", component: { render: () => null } },
      ],
    })
    const app = createSSRApp({ render: () => h(RouterView) })
    const pinia = createPinia()
    app.use(pinia).use(router).use(i18n)
    setActivePinia(pinia)
    const store = useWorldStore()
    store.world = w
    store.touch()
    app.config.errorHandler = (e) =>
      errors.push(`${url}: ${(e as Error).stack?.split("\n").slice(0, 4).join(" | ")}`)
    app.config.warnHandler = (m) => {
      if (!/Failed to resolve component|extraneous/.test(m)) errors.push(`${url} warn: ${m}`)
    }
    await router.push(url)
    await router.isReady()
    try {
      await renderToString(app)
    } catch (e) {
      errors.push(`${url}: ${(e as Error).stack?.split("\n").slice(0, 5).join(" | ")}`)
    }
  }
  console.log(errors.join("\n"))
  expect(errors).toEqual([])
})
