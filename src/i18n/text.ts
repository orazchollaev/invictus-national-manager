import nations from "@/data/nations.json"
import { placeholderText, isPlaceholder } from "@/engine/competition/placeholders"
import { compText, type Msg, type MsgParam, type Text } from "@/engine/text"
import { formatDate } from "./dates"
import { i18n } from "./index"

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

function stageName(name: string): string {
  const { t, te } = i18n.global
  const key = `stage.${slug(name)}`
  if (te(key)) return t(key)
  const round = /^Round of (\d+)$/.exec(name)
  if (round) return t("stage.roundOf", { n: round[1] })
  const league = /^League (\w+)$/.exec(name)
  if (league) return t("stage.leagueN", { x: league[1] })
  const group = /^Group (\w+)$/.exec(name)
  if (group) return t("stage.group", { name: group[1] })
  return name
}

const DEFS = new Map(nations.map((n) => [n.id, n]))
const displayNames = new Map<string, Intl.DisplayNames>()

/** A nation's name in the language being played, from its flag's region (English where it has none). */
export function nationName(id: string | null | undefined): string {
  if (!id) return ""
  if (isPlaceholder(id)) return resolveText(placeholderText(id))
  const def = DEFS.get(id)
  if (!def) return id
  const locale = i18n.global.locale.value
  if (locale === "en" || !/^[a-z]{2}$/.test(def.flag)) return def.name
  let names = displayNames.get(locale)
  if (!names)
    displayNames.set(locale, (names = new Intl.DisplayNames([locale], { type: "region" })))
  try {
    const name = names.of(def.flag.toUpperCase())
    return name && name !== def.flag.toUpperCase() ? name : def.name
  } catch {
    return def.name
  }
}

function param(v: MsgParam): string | number {
  if (Array.isArray(v)) return v.map((x) => resolveText(x)).join("; ")
  if (typeof v === "object") return resolveText(v)
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? formatDate(v) : v
}

/** The words for a piece of engine text, in the language being played. */
export function resolveText(text: Text | null | undefined): string {
  if (text == null) return ""
  if (typeof text === "string") return text
  const m: Msg = text
  const { t } = i18n.global
  let out: string
  const p = m.p ?? {}
  if (m.k === "@stage") out = stageName(String(p.name))
  else if (m.k === "@nation") out = nationName(String(p.id))
  else if (m.k === "@join")
    out = ((p.items ?? []) as Msg[]).map((x) => resolveText(x)).join(String(p.sep ?? ", "))
  else if (m.k === "@comp") {
    const year = Number(p.year)
    out = t(`comp.${p.def}.${p.form}`, { year, year2: String(year + 1).slice(2) })
  } else {
    const named: Record<string, string | number> = {}
    for (const [k, v] of Object.entries(p)) named[k] = param(v)
    out = typeof named.n === "number" ? t(m.k, named, named.n) : t(m.k, named)
  }
  return m.lc && out ? out.charAt(0).toLowerCase() + out.slice(1) : out
}

/** A competition's name in the language being played: `form` is name, short or plain (no year). */
export function compName(
  inst: { defId: string; year: number },
  form: "name" | "short" | "plain" = "name"
): string {
  return resolveText(compText(inst.defId, inst.year, form as "name" | "short"))
}

/** The name of a stage, round or group in the language being played. */
export function stageLabel(name: string): string {
  return stageName(name)
}

export const textHelpers = {
  $tx: resolveText,
  $comp: compName,
  $stage: stageLabel,
  $nation: nationName,
}

declare module "vue" {
  interface ComponentCustomProperties {
    /** Engine text (news, objectives…) in the language being played. */
    $tx: typeof resolveText
    /** A competition instance's name (or short name) in the language being played. */
    $comp: typeof compName
    /** A nation's name in the language being played. */
    $nation: typeof nationName
    /** A stage or round name in the language being played. */
    $stage: typeof stageLabel
  }
}
