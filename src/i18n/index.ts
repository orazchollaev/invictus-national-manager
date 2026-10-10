import { createI18n } from "vue-i18n"
import type { CommentaryText } from "@/engine/match/commentary"
import type { LocaleModule } from "./locales/types"
import { textHelpers } from "./text"

/**
 * Every folder under `locales/` is a language: drop a new `<code>/index.ts` in and it
 * is registered here, offered in Settings and nothing else needs touching.
 */
const found = import.meta.glob<{ default: LocaleModule }>("./locales/*/index.ts", { eager: true })
const modules: Record<string, LocaleModule> = {}
for (const [path, mod] of Object.entries(found)) modules[path.split("/")[2]] = mod.default

export type Locale = string
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALES: { value: Locale; label: string; flag: string }[] = Object.entries(modules)
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
    if (modules[tag]) return tag
    const base = tag.split("-")[0]
    const alias = DEVICE_ALIASES[base] ?? base
    if (modules[alias]) return alias
  }
  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: Object.fromEntries(
    Object.entries(modules).map(([code, m]) => [code, m.messages])
  ) as Record<string, Record<string, string>>,
})

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

export function setLocale(locale: Locale) {
  if (!modules[locale]) locale = DEFAULT_LOCALE
  i18n.global.locale.value = locale
  if (typeof document !== "undefined") document.documentElement.lang = locale
}

export default i18n
