import { createI18n } from "vue-i18n"
import en from "./locales/en"

// The game ships in English only. vue-i18n stays in place so every string
// already lives in one table if another locale is ever added.
export type Locale = "en"

export const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: { en },
})

export default i18n
