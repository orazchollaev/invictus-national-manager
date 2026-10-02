<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue"
import { useRouter } from "vue-router"
import { App } from "@capacitor/app"
import { AppHeader, AppMobileBottomNav, ErrorBoundary } from "@/components/layout"
import { AppDialog } from "@/components/ui"
import { useSettingsStore } from "@/modules/settings/store"
import { useWorldStore } from "@/modules/world/store"
import { useStatusBar } from "@/composables/useStatusBar"
import { BusyOverlay } from "@/modules/core/components"
import { GamePopups } from "@/modules/core/components/popups"

const settings = useSettingsStore()
const world = useWorldStore()
const { setTheme } = useStatusBar()
watch(() => settings.theme, setTheme, { immediate: true })

const router = useRouter()
const ROOT_PATHS = ["/home", "/squad", "/competitions", "/inbox", "/more", "/menu"]

/** Full-screen flows hide the bottom navigation. */
const FULLSCREEN = [
  /^\/match\//,
  /^\/new$/,
  /^\/menu$/,
  /^\/load$/,
  /^\/mods/,
  /^\/squad\/callup$/,
  /^\/draw\//,
]
// Without a game loaded there is nothing for the header or the tabs to open.
const hideNav = computed(
  () => !world.world || FULLSCREEN.some((p) => p.test(router.currentRoute.value.path))
)

let backButtonListener: (() => void) | null = null

onMounted(async () => {
  const handle = await App.addListener("backButton", () => {
    const path = router.currentRoute.value.path
    if (ROOT_PATHS.includes(path)) App.exitApp()
    else router.back()
  })
  backButtonListener = () => handle.remove()

  // Save when the app goes to the background: Android may kill it there.
  const state = await App.addListener("appStateChange", ({ isActive }) => {
    if (!isActive) void world.autoSave()
  })
  const prev = backButtonListener
  backButtonListener = () => {
    prev()
    state.remove()
  }
})

onUnmounted(() => backButtonListener?.())
</script>

<template>
  <div class="app-root">
    <!-- No route, header or tab-bar animations: screens swap in place, without sliding
         or fading, so nothing on screen moves under the user's eyes. -->
    <AppHeader v-if="!hideNav" />
    <main class="app-main" :class="{ 'app-main--no-nav': hideNav }">
      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
    </main>
    <AppDialog />
    <GamePopups />
    <BusyOverlay />
    <AppMobileBottomNav v-if="!hideNav" />
  </div>
</template>

<style>
/* 100% rather than 100vh: <html> already pads the status bar (--safe-top),
   so #app is shorter than the viewport and 100vh would overflow it by that
   inset, leaving a small scroll on Android. */
.app-root {
  min-height: 100%;
  background: var(--bg);
}

.app-main::after {
  content: "";
  display: block;
  height: calc(var(--mobile-nav-offset) + var(--sp-4));
}

.app-main--no-nav::after {
  height: var(--safe-bottom);
}
</style>
