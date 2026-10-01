/**
 * Text the engine produces for the player to read: news, objectives, reviews and the
 * like. It is stored as data (a message key with its parameters) and turned into words
 * by the UI in the language being played, so a saved game follows the language chosen
 * in Settings. Plain strings are still text: saves from before this existed keep theirs.
 */

export type MsgParam = string | number | Msg | Msg[]

export interface Msg {
  /** Message key (see i18n/locales/<code>/engine.ts), or a `@` name resolved by the UI. */
  k: string
  p?: Record<string, MsgParam>
  /** Start the result with a lower-case letter, to run it into a sentence. */
  lc?: boolean
}

export type Text = string | Msg

export function msg(k: string, p?: Record<string, MsgParam>): Msg {
  return p ? { k, p } : { k }
}

/** The same message, set to start in lower case. */
export function lower(m: Msg): Msg {
  return { ...m, lc: true }
}

/** A competition's name or short name, in the language being played. */
export function compText(defId: string, year: number, form: "name" | "short" = "name"): Msg {
  return msg("@comp", { def: defId, year, form })
}

/** The name of a stage, round or group label ("Quarter-finals", "Group stage"…). */
export function stageText(name: string): Msg {
  return msg("@stage", { name })
}

/** A nation's name in the language being played. */
export function nationText(id: string): Msg {
  return msg("@nation", { id })
}

/** Several texts run together with a separator. */
export function joinText(items: Msg[], sep = ", "): Msg {
  return msg("@join", { items, sep })
}

/** A group's name: "A" reads "Group A", longer names stand alone. */
export function groupText(name: string): Msg {
  return name.length <= 2 ? msg("stage.group", { name }) : stageText(name)
}
