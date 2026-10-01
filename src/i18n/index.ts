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

export const LOCALES: { value: Locale; label: string }[] = Object.entries(modules)
  .map(([value, m]) => ({ value, label: m.name }))
  .sort((a, b) =>
    a.value === DEFAULT_LOCALE
      ? -1
      : b.value === DEFAULT_LOCALE
        ? 1
        : a.label.localeCompare(b.label)
  )

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
