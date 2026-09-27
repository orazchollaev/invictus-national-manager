import { createApp } from "vue"
import { createPinia } from "pinia"
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2"

import router from "./router"
import App from "./App.vue"
import i18n from "./i18n"
import { idbStorage } from "./lib/idbStorage"
import { useSettingsStore } from "./modules/settings/store"

import "@fontsource-variable/ibm-plex-sans"
import "./assets/style/index.css"

// Android WebViews older than Chromium 93 don't have Object.hasOwn — Pinia's
// $patch (used on every hydration) calls it directly, and it throwing there
// crashes hydration before app.mount() ever runs.
if (typeof Object.hasOwn !== "function") {
  Object.hasOwn = (obj: object, prop: PropertyKey) =>
    Object.prototype.hasOwnProperty.call(obj, prop)
}

const pinia = createPinia()
// Only small preference stores use the plugin; the world is saved by hand
// (modules/world/services/saves.ts) because it is far too large to stringify
// on every mutation.
pinia.use(createPersistedStatePlugin({ storage: idbStorage }))

async function bootstrap() {
  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(i18n)

  const settings = useSettingsStore()
  try {
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000))
    await Promise.race([settings.$persistedState.isReady(), timeout])
  } catch {}

  app.mount("#app")
}

void bootstrap()
