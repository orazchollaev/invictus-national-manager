import { i18n } from "@/i18n"

const t = (key: string) => i18n.global.t(key)

export const mentalityOptions = () => [
  { value: "-2", label: t("tactics.mentality.-2") },
  { value: "-1", label: t("tactics.mentality.-1") },
  { value: "0", label: t("tactics.mentality.0") },
  { value: "1", label: t("tactics.mentality.1") },
  { value: "2", label: t("tactics.mentality.2") },
]

export const pressingOptions = () => [
  { value: "0", label: t("tactics.pressing.0") },
  { value: "1", label: t("tactics.pressing.1") },
  { value: "2", label: t("tactics.pressing.2") },
]

export const lineOptions = () => [
  { value: "0", label: t("tactics.line.0") },
  { value: "1", label: t("tactics.line.1") },
  { value: "2", label: t("tactics.line.2") },
]

export const widthOptions = () => [
  { value: "0", label: t("tactics.width.0") },
  { value: "1", label: t("tactics.width.1") },
  { value: "2", label: t("tactics.width.2") },
]

export const tempoOptions = () => [
  { value: "0", label: t("tactics.tempo.0") },
  { value: "1", label: t("tactics.tempo.1") },
  { value: "2", label: t("tactics.tempo.2") },
]
