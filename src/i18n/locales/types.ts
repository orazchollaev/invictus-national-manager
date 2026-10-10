import type { CommentaryText } from "@/engine/match/commentary"

/** What a language folder under `locales/<code>/index.ts` exports. */
export interface LocaleModule {
  /** The language named in itself, so it can be found whatever the current one is. */
  name: string
  /** Circle-flag code of the country shown beside the name in the language picker. */
  flag: string
  /** Every message of the app: the screens and the text the engine produces. */
  messages: object
  /** Live match commentary; without it the engine's English set is used. */
  commentary?: CommentaryText
}
