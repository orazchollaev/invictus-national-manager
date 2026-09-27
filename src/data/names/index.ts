import type { NameAlias, NamePool } from "./types"
import { EUROPE } from "./europe"
import { AMERICAS } from "./americas"
import { AFRICA } from "./africa"
import { ASIA } from "./asia"
import { EXTRA_EUROPE } from "./extra-europe"
import { EXTRA_WORLD } from "./extra-world"

export type { NameAlias, NamePool } from "./types"

const merge = (a = "", b = "") => [...new Set(`${a} ${b}`.split(/\s+/).filter(Boolean))].join(" ")

const base: Record<string, NamePool> = { ...EUROPE, ...AMERICAS, ...AFRICA, ...ASIA }
const extra: Record<string, NamePool> = { ...EXTRA_EUROPE, ...EXTRA_WORLD }

/** Base pools with the extra lists folded in, duplicates removed. */
export const NAME_POOLS: Record<string, NamePool> = Object.fromEntries(
  Object.entries(base).map(([k, p]) => [
    k,
    { first: merge(p.first, extra[k]?.first), last: merge(p.last, extra[k]?.last) },
  ])
)

/** Cultures too small for their own lists, drawn from neighbours by weight. */
export const NAME_ALIASES: Record<string, NameAlias> = {
  comorian: [
    ["maghreb", 50],
    ["west-african-franco", 50],
  ],
  mauritian: [
    ["french", 50],
    ["south-asian", 50],
  ],
  maldivian: [
    ["arabic-gulf", 60],
    ["south-asian", 40],
  ],
  "arabic-sudan": [
    ["arabic-egypt", 70],
    ["east-african", 30],
  ],
  "dutch-caribbean": [
    ["dutch", 40],
    ["caribbean-anglo", 60],
  ],
}
