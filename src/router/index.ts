import { createRouter, createWebHashHistory } from "vue-router"
import { useWorldStore } from "@/modules/world/store"

const RELOAD_FLAG = "ntm:chunk-reload"

function isMissingChunk(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Importing a module script failed|ChunkLoadError|Failed to fetch/i.test(
    message
  )
}

/** Routes that work without a game loaded. */
const OPEN = new Set(["/menu", "/load", "/new", "/settings"])

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, left: 0 }
  },
  routes: [
    {
      path: "/",
      redirect: () => (useWorldStore().world ? "/home" : "/menu"),
    },
    { path: "/menu", component: () => import("../modules/career/pages/MainMenuPage.vue") },
    { path: "/load", component: () => import("../modules/career/pages/LoadGamePage.vue") },
    { path: "/saves", redirect: "/load" },
    { path: "/new", component: () => import("../modules/career/pages/NewGamePage.vue") },
    { path: "/mods", component: () => import("../modules/mods/pages/ModsPage.vue") },
    { path: "/mods/:id", component: () => import("../modules/mods/pages/ModEditorPage.vue") },
    { path: "/home", component: () => import("../modules/core/pages/HomePage.vue") },
    { path: "/career", component: () => import("../modules/career/pages/CareerPage.vue") },
    {
      path: "/career/federation",
      component: () => import("../modules/career/pages/FederationPage.vue"),
    },
    {
      path: "/career/review/:id",
      component: () => import("../modules/career/pages/ReviewPage.vue"),
    },
    {
      path: "/career/farewell",
      component: () => import("../modules/career/pages/FarewellPage.vue"),
    },

    { path: "/squad", component: () => import("../modules/squad/pages/SquadPage.vue") },
    { path: "/squad/callup", component: () => import("../modules/squad/pages/CallUpPage.vue") },
    { path: "/squad/tactics", component: () => import("../modules/squad/pages/TacticsPage.vue") },
    {
      path: "/squad/prospects",
      component: () => import("../modules/squad/pages/ProspectsPage.vue"),
    },
    { path: "/player/:id", component: () => import("../modules/squad/pages/PlayerPage.vue") },

    { path: "/match/:id", component: () => import("../modules/match/pages/MatchPage.vue") },
    { path: "/report/:id", component: () => import("../modules/match/pages/ReportPage.vue") },

    {
      path: "/competitions",
      component: () => import("../modules/competitions/pages/CompetitionsPage.vue"),
    },
    {
      path: "/competitions/:id",
      component: () => import("../modules/competitions/pages/CompetitionPage.vue"),
    },
    {
      path: "/draw/:comp/:stage",
      component: () => import("../modules/competitions/pages/DrawPage.vue"),
    },
    { path: "/rankings", component: () => import("../modules/competitions/pages/RankingPage.vue") },
    { path: "/honours", component: () => import("../modules/competitions/pages/HonoursPage.vue") },
    {
      path: "/calendar",
      component: () => import("../modules/competitions/pages/CalendarPage.vue"),
    },

    { path: "/nation/:id", component: () => import("../modules/nations/pages/NationPage.vue") },
    { path: "/stadiums", component: () => import("../modules/stadiums/pages/StadiumsPage.vue") },
    {
      path: "/stadiums/:id",
      component: () => import("../modules/stadiums/pages/StadiumsPage.vue"),
    },

    { path: "/inbox", component: () => import("../modules/news/pages/InboxPage.vue") },
    { path: "/more", component: () => import("../modules/core/pages/MorePage.vue") },
    { path: "/settings", component: () => import("../modules/settings/pages/SettingsPage.vue") },

    { path: "/:pathMatch(.*)*", component: () => import("../modules/core/pages/NotFoundPage.vue") },
  ],
})

// Every game screen needs a loaded world: resume the last save, or pick one.
router.beforeEach(async (to) => {
  if (OPEN.has(to.path) || to.path.startsWith("/mods")) return true
  const world = useWorldStore()
  if (world.world) return true
  const ok = await world.resume()
  return ok ? true : "/menu"
})

router.onError((error, to) => {
  if (!isMissingChunk(error)) return
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return
    sessionStorage.setItem(RELOAD_FLAG, "1")
  } catch {
    return
  }
  window.location.hash = to.fullPath
  window.location.reload()
})

router.afterEach(() => {
  try {
    sessionStorage.removeItem(RELOAD_FLAG)
  } catch {}
})

export default router
