/**
 * Mods in IndexedDB: one JSON string per mod, with a list of small meta records so
 * the mod list never parses a whole dataset. The bundled data is never touched.
 */
import { del, get, set } from "idb-keyval"
import { CITIES } from "@/data/stadiums"
import { START_DATE } from "@/data/start"
import type { NationDef } from "@/engine/types"
import { baselineReputation } from "@/engine/world/federation"
import { initialStadiums } from "@/engine/world/stadiums"
import { NATION_DEFS, BASE_CLUB_ROWS, startingPlayers } from "@/modules/world/services/statics"
import { exportTextFile, pickTextFile } from "@/lib/files"
import {
  MOD_FORMAT,
  MOD_VERSION,
  exportName,
  metaOf,
  newModId,
  normalizeMod,
  type ModData,
  type ModMeta,
} from "../utils/format"

const LIST_KEY = "ntm:mods"
const dataKey = (id: string) => `ntm:mod:${id}`

export async function listMods(): Promise<ModMeta[]> {
  const list = ((await get(LIST_KEY)) as ModMeta[] | undefined) ?? []
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function loadMod(id: string): Promise<ModData | null> {
  const raw = (await get(dataKey(id))) as string | undefined
  return raw ? (JSON.parse(raw) as ModData) : null
}

export async function saveMod(mod: ModData): Promise<void> {
  await set(dataKey(mod.id), JSON.stringify(mod))
  const list = ((await get(LIST_KEY)) as ModMeta[] | undefined) ?? []
  await set(LIST_KEY, [...list.filter((m) => m.id !== mod.id), metaOf(mod)])
}

export async function deleteMod(id: string): Promise<void> {
  await del(dataKey(id))
  const list = ((await get(LIST_KEY)) as ModMeta[] | undefined) ?? []
  await set(
    LIST_KEY,
    list.filter((m) => m.id !== id)
  )
}

/** The bundled nations with their grounds and towns written out, so a mod can edit them. */
function baseNations(): NationDef[] {
  return NATION_DEFS.map((def) => ({
    ...structuredClone(def),
    grounds: initialStadiums(def, baselineReputation(def.points), START_DATE).stadiums.map(
      ({ city, name, capacity }) => ({ city, name, capacity })
    ),
    cities: [...(CITIES[def.id] ?? [])],
  }))
}

/** A new mod: a copy of the bundled dataset under a name of its own. */
export async function createMod(name: string, author = ""): Promise<ModData> {
  const now = Date.now()
  const mod: ModData = {
    format: MOD_FORMAT,
    version: MOD_VERSION,
    id: newModId(),
    name: name.trim().slice(0, 40) || "Mod",
    author,
    createdAt: now,
    updatedAt: now,
    nations: baseNations(),
    clubs: structuredClone(BASE_CLUB_ROWS),
    players: structuredClone(await startingPlayers()),
  }
  await saveMod(mod)
  return mod
}

/** A copy of a mod under a new name. */
export async function duplicateMod(id: string, name: string): Promise<ModData | null> {
  const mod = await loadMod(id)
  if (!mod) return null
  const now = Date.now()
  const copy: ModData = { ...mod, id: newModId(), name, createdAt: now, updatedAt: now }
  await saveMod(copy)
  return copy
}

export async function exportMod(mod: ModData): Promise<void> {
  await exportTextFile(exportName(mod), JSON.stringify(mod))
}

/**
 * Read a mod from a file the user picks and store it. An import never replaces a
 * mod already there: it always gets an id of its own. Null when nothing was picked;
 * throws ModError when the file is not a mod.
 */
export async function importMod(): Promise<ModData | null> {
  const text = await pickTextFile()
  if (text === null) return null
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    raw = null
  }
  const mod = normalizeMod(raw, NATION_DEFS)
  mod.id = newModId()
  mod.updatedAt = Date.now()
  await saveMod(mod)
  return mod
}
