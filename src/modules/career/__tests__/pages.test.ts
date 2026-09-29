import { describe, expect, it } from "vitest"
import { createSSRApp, h, type Component } from "vue"
import { renderToString } from "vue/server-renderer"
import { createPinia, setActivePinia } from "pinia"
import { createRouter, createMemoryHistory, RouterView } from "vue-router"
import i18n from "@/i18n"
import { useWorldStore } from "@/modules/world/store"
import type { World } from "@/engine/world/world"
import { createWorld, type PlayerRow } from "@/engine/world/create"
import { statics } from "@/modules/world/services/statics"
import playerRows from "@/data/players.json"
import { leaveJob } from "@/engine/career/career"
import { award } from "@/engine/career/milestones"
import type { CareerReview } from "@/engine/world/types"

function newWorld() {
  return createWorld(
    { seed: 5, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
    statics(),
    playerRows as unknown as Record<string, PlayerRow[]>
  )
}

function review(w: World): CareerReview {
  const [a, b] = w.pool("TUR")
  return {
    id: "unl-2026",
    name: "UEFA Nations League 2026–27",
    nationId: "TUR",
    date: w.state.date,
    reached: "Stayed in League A",
    winner: "ESP",
    played: 6,
    won: 3,
    drawn: 1,
    lost: 2,
    gf: 9,
    ga: 7,
    objectives: [{ text: "Avoid relegation from League A", status: "met", critical: false }],
    before: { confidence: 60, reputation: 55, youth: 70 },
    after: { confidence: 72, reputation: 58, youth: 70.3 },
    stars: [{ id: a.id, name: `${a.first} ${a.last}`, apps: 6, goals: 3, rating: 7.4 }],
    youngsters: [{ id: b.id, name: `${b.first} ${b.last}`, age: 20, apps: 2 }],
    verdict: "satisfied",
    message: "The federation is satisfied.",
    contract: "renewed",
    contractUntil: "2030-07-19",
  }
}

/** Server-render one route with the given world; returns the HTML and any errors. */
async function render(w: World, path: string, url: string, loader: () => Promise<unknown>) {
  const errors: string[] = []
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path, component: loader as () => Promise<Component> },
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
  app.config.errorHandler = (e) => errors.push(`${url}: ${(e as Error).stack?.split("\n")[0]}`)
  app.config.warnHandler = (m) => {
    if (!/Failed to resolve component|extraneous/.test(m)) errors.push(`${url} warn: ${m}`)
  }
  await router.push(url)
  await router.isReady()
  const html = await renderToString(app)
  return { html, errors }
}

describe("career pages", () => {
  it("render the review, career and prospects pages", { timeout: 60000 }, async () => {
    const w = newWorld()
    w.state.career.reviews = [review(w)]
    w.state.pendingReview = "unl-2026"
    w.state.career.ultimatum = { since: w.state.date, matches: 2 }
    w.state.career.history[0].trophies.push("UEFA Nations League 2026–27")
    award(w, "first-win", "Your first win as an international head coach.")
    w.state.career.watchlist = [w.pool("TUR")[0].id]

    const r = await render(
      w,
      "/career/review/:id",
      "/career/review/unl-2026",
      () => import("../pages/ReviewPage.vue")
    )
    expect(r.errors).toEqual([])
    expect(r.html).toContain("Stayed in League A")
    expect(r.html).toContain("Satisfied")
    expect(r.html).toContain("contract has been renewed")

    const c = await render(w, "/career", "/career", () => import("../pages/CareerPage.vue"))
    expect(c.errors).toEqual([])
    expect(c.html).toContain("Trophy cabinet")
    expect(c.html).toContain("Final warning")
    expect(c.html).toContain("Your first win")

    const p = await render(
      w,
      "/squad/prospects",
      "/squad/prospects",
      () => import("@/modules/squad/pages/ProspectsPage.vue")
    )
    expect(p.errors).toEqual([])
    expect(p.html).toContain("Prospects")
  })

  it("renders the farewell once the job is lost", async () => {
    const w = newWorld()
    leaveJob(w, "sacked")
    const f = await render(
      w,
      "/career/farewell",
      "/career/farewell",
      () => import("../pages/FarewellPage.vue")
    )
    expect(f.errors).toEqual([])
    expect(f.html).toContain("Sacked")
    expect(f.html).toContain("See job offers")
  })

  it("renders the home page and each new popup in turn", async () => {
    const w = newWorld()
    w.clearHosting()
    w.clearOffer()
    const popups = () => import("@/modules/core/components/popups/GamePopups.vue")
    const home = () => import("@/modules/core/pages/HomePage.vue")
    const tur = w.pool("TUR")
    w.state.pendingUltimatum = true
    w.state.pendingIntake = { year: 2027, ids: tur.slice(0, 3).map((p) => p.id) }
    expect((await render(w, "/home", "/home", home)).errors).toEqual([])
    // Ultimatum, then the board meeting, then the intake.
    for (const step of ["ultimatum", "board", "intake"]) {
      const r = await render(w, "/home", "/home", popups)
      expect(r.errors, step).toEqual([])
      const i = w.pendingInterrupt()
      if (i?.kind === "board")
        while (w.pendingInterrupt()?.kind === "board") w.settle(w.pendingInterrupt()!)
      else if (i) w.settle(i)
    }
    expect(w.pendingInterrupt()).toBeNull()
  })
})
