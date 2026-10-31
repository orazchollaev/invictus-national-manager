import { createI18n } from "vue-i18n"
import type { CommentaryText } from "@/engine/match/commentary"
import en from "./locales/en"
import type { LocaleMeta, LocaleModule } from "./locales/types"
import { textHelpers } from "./text"

/**
 * Every folder under `locales/` is a language: drop a new `<code>/meta.ts` and
 * `<code>/index.ts` in and it is registered here, offered in Settings and nothing else
 * needs touching. Only English (the fallback) ships in the startup chunk; the others
 * are fetched when chosen, so a launch parses one language, not twenty.
 */
const metas = import.meta.glob<{ default: LocaleMeta }>("./locales/*/meta.ts", { eager: true })
const loaders = import.meta.glob<{ default: LocaleModule }>([
  "./locales/*/index.ts",
  "!./locales/en/index.ts",
])
const codeOf = (path: string) => path.split("/")[2]
const known: Record<string, LocaleMeta> = {}
for (const [path, mod] of Object.entries(metas)) known[codeOf(path)] = mod.default

/** The languages whose messages are in memory. */
const modules: Record<string, LocaleModule> = { en }

export type Locale = string
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALES: { value: Locale; label: string; flag: string }[] = Object.entries(known)
  .map(([value, m]) => ({ value, label: m.name, flag: m.flag }))
  .sort((a, b) =>
    a.value === DEFAULT_LOCALE
      ? -1
      : b.value === DEFAULT_LOCALE
        ? 1
        : a.label.localeCompare(b.label)
  )

/** Our `in` is Hindi, not the legacy Indonesian code, so `hi` maps onto it. */
const DEVICE_ALIASES: Record<string, Locale> = { hi: "in" }

/**
 * The phone's language if we ship it, else English. Used as the default before the
 * player has chosen anything, so a first launch opens in their own language.
 */
export function detectLocale(): Locale {
  const tags = typeof navigator === "undefined" ? [] : (navigator.languages ?? [navigator.language])
  for (const tag of tags) {
    if (!tag) continue
    if (known[tag]) return tag
    const base = tag.split("-")[0]
    const alias = DEVICE_ALIASES[base] ?? base
    if (known[alias]) return alias
  }
  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { [DEFAULT_LOCALE]: en.messages } as Record<string, Record<string, string>>,
})

const loading = new Map<Locale, Promise<void>>()

/** Fetch a language's messages (once). Resolves quietly if it cannot be had: English stays. */
export function loadLocale(locale: Locale): Promise<void> {
  const load = loaders[`./locales/${locale}/index.ts`]
  if (modules[locale] || !load) return Promise.resolve()
  let pending = loading.get(locale)
  if (!pending) {
    pending = load()
      .then((mod) => {
        modules[locale] = mod.default
        i18n.global.setLocaleMessage(locale, mod.default.messages as Record<string, string>)
      })
      .catch(() => {})
      .finally(() => loading.delete(locale))
    loading.set(locale, pending)
  }
  return pending
}

// Installing the i18n plugin also gives every template `$tx`, `$comp` and `$stage`.
const install = i18n.install.bind(i18n)
i18n.install = (app, ...options) => {
  install(app, ...options)
  Object.assign(app.config.globalProperties, textHelpers)
}

/** The live commentary for the current language; undefined keeps the engine's English. */
export function commentaryText(): CommentaryText | undefined {
  return modules[i18n.global.locale.value]?.commentary
}

let wanted: Locale = DEFAULT_LOCALE

/** Switch language once its messages are in; until then the screen stays as it is. */
export async function setLocale(locale: Locale) {
  if (!known[locale]) locale = DEFAULT_LOCALE
  wanted = locale
  await loadLocale(locale)
  // A newer choice may have come in while this one was loading; it wins.
  if (wanted !== locale) return
  if (!modules[locale]) locale = DEFAULT_LOCALE
  i18n.global.locale.value = locale
  if (typeof document !== "undefined") document.documentElement.lang = locale
}

export default i18n
