import { defineStore } from "pinia"
import { ref, watch } from "vue"
import { detectLocale, setLocale, type Locale } from "@/i18n"

export type Theme = "light" | "dark"
/** Platform look: shape, elevation, type scale and neutrals — never the accent. */
export type DesignLanguage = "ios" | "android"
/** Game minutes per real second is 2 at 1x, so a match runs about 45 seconds. */
export type LiveMatchSpeed = 1 | 2 | 4
/** How far one press of Continue goes: days, or up to the next match. */
export type AdvanceStep = 1 | 7 | 30 | "match"
/** When the game saves itself: after every change, once a game week/month, or never. */
export type AutoSave = "always" | "weekly" | "monthly" | "off"

export const useSettingsStore = defineStore("settings", () => {
  const theme = ref<Theme>("dark")
  // Phone language on first launch; a saved choice replaces it when settings hydrate.
  const locale = ref<Locale>(detectLocale())
  const designLanguage = ref<DesignLanguage>("ios")
  const liveMatchSpeed = ref<LiveMatchSpeed>(2)
  const advanceStep = ref<AdvanceStep>(1)
  const autoSave = ref<AutoSave>("always")
  /** The assistant names every squad and picks every eleven. */
  const assistantPicks = ref(false)
  /** Stop for the user's draws and show them live. */
  const watchDraws = ref(true)
  /** Agree every objective as the board sets it, without a meeting. */
  const assistantBoard = ref(false)
  /** Stop on 1 January to show the year's youngsters. */
  const showIntake = ref(true)
  /** Stop the commentary on goals and red cards so they are not scrolled past. */
  const pauseOnKeyEvents = ref(true)
  /** Show the minor commentary lines (fouls, corners, offsides) in the feed. */
  const verboseCommentary = ref(true)

  // Saves from when 10× existed: fall back to the fastest speed left.
  watch(
    liveMatchSpeed,
    (val) => {
      if ((val as number) > 4) liveMatchSpeed.value = 4
    },
    { immediate: true }
  )

  watch(locale, (val) => setLocale(val), { immediate: true })

  watch(
    theme,
    (val) => {
      if (typeof document !== "undefined") document.documentElement.setAttribute("data-theme", val)
    },
    { immediate: true }
  )

  watch(
    designLanguage,
    (val) => {
      if (typeof document !== "undefined") document.documentElement.setAttribute("data-design", val)
    },
    { immediate: true }
  )

  function resetAll() {
    theme.value = "dark"
    locale.value = detectLocale()
    designLanguage.value = "ios"
    liveMatchSpeed.value = 2
    advanceStep.value = 1
    autoSave.value = "always"
    assistantPicks.value = false
    watchDraws.value = true
    assistantBoard.value = false
    showIntake.value = true
    pauseOnKeyEvents.value = true
    verboseCommentary.value = true
  }

  return {
    theme,
    locale,
    designLanguage,
    liveMatchSpeed,
    advanceStep,
    autoSave,
    assistantPicks,
    watchDraws,
    assistantBoard,
    showIntake,
    pauseOnKeyEvents,
    verboseCommentary,
    resetAll,
  }
})
