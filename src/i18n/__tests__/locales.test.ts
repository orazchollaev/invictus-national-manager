import { describe, expect, it } from "vitest"
import clubRows from "@/data/clubs.json"
import nations from "@/data/nations.json"
import playerRows from "@/data/players.json"
import { COMPETITION_DEFS } from "@/engine/competition/defs"
import type { NationDef } from "@/engine/types"
import { clubsFromRows, createWorld, type ClubRow, type PlayerRow } from "@/engine/world/create"
import type { Msg, Text } from "@/engine/text"
import { i18n, LOCALES, setLocale } from "@/i18n"
import { resolveText } from "@/i18n/text"

type Tree = { [k: string]: string | Tree }

const flatten = (tree: Tree, prefix = ""): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>((out, [k, v]) => {
    if (typeof v === "string") out[prefix + k] = v
    else Object.assign(out, flatten(v, `${prefix}${k}.`))
    return out
  }, {})

const placeholders = (s: string) => [...new Set(s.match(/\{\w+\}/g) ?? [])].sort()

const messages = (code: string) => flatten(i18n.global.getLocaleMessage(code) as Tree)

describe("locales", () => {
  const en = messages("en")

  for (const { value: code } of LOCALES.filter((l) => l.value !== "en")) {
    it(`${code} translates every message, with the same placeholders`, () => {
      const other = messages(code)
      const missing = Object.keys(en).filter((k) => !(k in other))
      expect(missing).toEqual([])
      const extra = Object.keys(other).filter((k) => !(k in en))
      expect(extra).toEqual([])
      const drift = Object.keys(en).filter(
        (k) => JSON.stringify(placeholders(en[k])) !== JSON.stringify(placeholders(other[k]))
      )
      expect(drift).toEqual([])
    })
  }

  it("names every competition", () => {
    for (const { value: code } of LOCALES) {
      const m = messages(code)
      for (const d of COMPETITION_DEFS)
        for (const form of ["name", "short", "plain"])
          expect(m[`comp.${d.id}.${form}`]).toBeTruthy()
    }
  })
})

describe("engine text in the world", () => {
  const world = createWorld(
    { seed: 21, start: "2026-09-01", managerName: "T", nationality: "KOR", nationId: "KOR" },
    { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
    playerRows as unknown as Record<string, PlayerRow[]>
  )
  while (world.state.date < "2027-07-01") {
    const i = world.advance(60)
    if (world.settle(i)) continue
    if (i.kind === "callup") world.aiCallUp(i.nationId, i.squadFor)
    else if (i.kind === "match") {
      const f = world.state.fixtures[i.fixtureId]
      f.result = { h: 1, a: 1 }
    }
  }

  const texts: Text[] = []
  const collect = (t: Text | undefined) => t && texts.push(t)
  for (const n of world.state.news) {
    collect(n.title)
    collect(n.body)
  }
  for (const o of world.state.career.objectives) collect(o.text)
  for (const inst of Object.values(world.state.competitions)) {
    for (const s of inst.stages) {
      collect({ k: "@stage", p: { name: s.name } })
      for (const r of s.rounds ?? []) collect({ k: "@stage", p: { name: r.name } })
    }
    collect({ k: "@comp", p: { def: inst.defId, year: inst.year, form: "name" } })
  }
  for (const f of Object.values(world.state.fixtures)) collect(f.label)

  const looksLikeKey = (s: string) => /^[a-z@][\w-]*(\.[\w-]+)+$/.test(s)

  for (const { value: code } of LOCALES) {
    it(`${code} reads every news item, objective, name and label`, () => {
      setLocale(code)
      try {
        expect(texts.length).toBeGreaterThan(100)
        for (const t of texts) {
          const out = resolveText(t)
          expect(out, JSON.stringify(t)).not.toBe("")
          expect(looksLikeKey(out), `${code}: ${JSON.stringify(t as Msg)} → ${out}`).toBe(false)
        }
      } finally {
        setLocale("en")
      }
    })
  }
})

describe("stage names", () => {
  it("are translated wherever the engine can name a stage", () => {
    const world = createWorld(
      { seed: 5, start: "2026-09-01", managerName: "T", nationality: "TUR", nationId: "TUR" },
      { nations: nations as NationDef[], clubs: clubsFromRows(clubRows as ClubRow[]) },
      playerRows as unknown as Record<string, PlayerRow[]>
    )
    const names = new Set<string>()
    for (const inst of Object.values(world.state.competitions))
      for (const s of inst.stages) {
        names.add(s.name)
        for (const r of s.rounds ?? []) names.add(r.name)
      }
    // Every definition's stages, planned for a year it is run.
    const same = new Set(["Final", "Play-In"])
    setLocale("pt")
    try {
      const missing = [...names].filter(
        (n) => !same.has(n) && resolveText({ k: "@stage", p: { name: n } }) === n
      )
      expect(missing).toEqual([])
    } finally {
      setLocale("en")
    }
  })
})
