import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { detectLocale, setLocale, type Locale } from "@/i18n"

export type Theme = "light" | "dark"
/** Game minutes per real second is 2 at 1x, so a match runs about 45 seconds. */
export type LiveMatchSpeed = 1 | 2 | 4
/** How far one press of Continue goes: days, or up to the next match. */
export type AdvanceStep = 1 | 7 | 30 | "match"
/** When the game saves itself: after every change, once a game week/month, or never. */
export type AutoSave = "always" | "weekly" | "monthly" | "off"

/** How much of the job the assistant takes: one choice that sets the switches below it. */
export type AssistLevel = "beginner" | "manager" | "expert"

interface Assist {
  assistantPicks: boolean
  watchDraws: boolean
  assistantBoard: boolean
  assistantPress: boolean
  showIntake: boolean
  quietNotices: boolean
}

const ASSIST: Record<AssistLevel, Assist> = {
  // The assistant does the paperwork; the user picks tactics and plays the matches.
  beginner: {
    assistantPicks: true,
    watchDraws: false,
    assistantBoard: true,
    assistantPress: true,
    showIntake: false,
    quietNotices: true,
  },
  manager: {
    assistantPicks: false,
    watchDraws: true,
    assistantBoard: false,
    assistantPress: false,
    showIntake: true,
    quietNotices: true,
  },
  // Every decision stops the game, as it comes.
  expert: {
    assistantPicks: false,
    watchDraws: true,
    assistantBoard: false,
    assistantPress: false,
    showIntake: true,
    quietNotices: false,
  },
}

export const useSettingsStore = defineStore("settings", () => {
  const theme = ref<Theme>("dark")
  // Phone language on first launch; a saved choice replaces it when settings hydrate.
  const locale = ref<Locale>(detectLocale())
  const liveMatchSpeed = ref<LiveMatchSpeed>(2)
  const advanceStep = ref<AdvanceStep>(1)
  const autoSave = ref<AutoSave>("always")
  /** The assistant names every squad and picks every eleven. */
  const assistantPicks = ref(false)
  /** Stop for the user's draws and show them live. */
  const watchDraws = ref(true)
  /** Agree every objective as the board sets it, without a meeting. */
  const assistantBoard = ref(false)
  /** The assistant takes the press conferences before tournaments. */
  const assistantPress = ref(false)
  /** Stop on 1 January to show the year's youngsters. */
  const showIntake = ref(true)
  /** News and optional choices wait on the home screen instead of stopping the calendar. */
  const quietNotices = ref(true)
  /** Stop the commentary on goals and red cards so they are not scrolled past. */
  const pauseOnKeyEvents = ref(true)
  /** Show the minor commentary lines (fouls, corners, offsides) in the feed. */
  const verboseCommentary = ref(true)

  /** The level the switches add up to, or "custom" when they match none. */
  const assistRefs = {
    assistantPicks,
    watchDraws,
    assistantBoard,
    assistantPress,
    showIntake,
    quietNotices,
  }
  const assistLevel = computed<AssistLevel | "custom">(
    () =>
      (Object.keys(ASSIST) as AssistLevel[]).find((level) =>
        (Object.keys(assistRefs) as (keyof Assist)[]).every(
          (key) => assistRefs[key].value === ASSIST[level][key]
        )
      ) ?? "custom"
  )

  function setAssistLevel(level: AssistLevel) {
    for (const key of Object.keys(assistRefs) as (keyof Assist)[])
      assistRefs[key].value = ASSIST[level][key]
  }

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

  function resetAll() {
    theme.value = "dark"
    locale.value = detectLocale()
    liveMatchSpeed.value = 2
    advanceStep.value = 1
    autoSave.value = "always"
    assistantPicks.value = false
    watchDraws.value = true
    assistantBoard.value = false
    assistantPress.value = false
    showIntake.value = true
    quietNotices.value = true
    pauseOnKeyEvents.value = true
    verboseCommentary.value = true
  }

  return {
    theme,
    locale,
    liveMatchSpeed,
    advanceStep,
    autoSave,
    assistantPicks,
    watchDraws,
    assistantBoard,
    assistantPress,
    showIntake,
    quietNotices,
    pauseOnKeyEvents,
    verboseCommentary,
    assistLevel,
    setAssistLevel,
    resetAll,
  }
})
