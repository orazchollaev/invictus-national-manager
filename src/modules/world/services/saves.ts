/**
 * Three save slots in IndexedDB. The world is one gzipped JSON document per slot, with
 * a small meta record beside it so the slot list never has to parse a whole world.
 */
import { del, get, set } from "idb-keyval"
import type { WorldState } from "@/engine/world/types"
import type { WorldStatics } from "@/engine/world/world"

export const SLOT_COUNT = 3

/**
 * A world is tens of MB of JSON (every player's attributes and history) but compresses
 * about 6:1, so it is stored gzipped: less disk, and a much smaller IndexedDB write on
 * every autosave. A slot written before compression is a plain string and still reads.
 */
type Stored = string | Uint8Array | ArrayBuffer

const canCompress = typeof CompressionStream === "function"

export async function pack(json: string): Promise<Stored> {
  if (!canCompress) return json
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function unpack(raw: Stored): Promise<string> {
  if (typeof raw === "string") return raw
  const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw)
  const stream = new Blob([bytes as Uint8Array<ArrayBuffer>])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
  return new Response(stream).text()
}

export interface SlotMeta {
  slot: number
  managerName: string
  nationId: string | null
  date: string
  savedAt: number
  version: number
  /** The mod the career was started from, if any. */
  modName?: string
  /**
   * The managed nation's name and flag, kept for a career on a mod: the menus run on
   * the bundled dataset, which does not know a nation the mod added.
   */
  nation?: { name: string; flag: string }
}

const dataKey = (n: number) => `ntm:slot:${n}`
const metaKey = (n: number) => `ntm:slot:${n}:meta`
const staticsKey = (n: number) => `ntm:slot:${n}:statics`
const ACTIVE_KEY = "ntm:active"

export async function listSlots(): Promise<(SlotMeta | null)[]> {
  const out: (SlotMeta | null)[] = []
  for (let n = 1; n <= SLOT_COUNT; n++) {
    const meta = ((await get(metaKey(n))) as SlotMeta | undefined) ?? null
    // A save from before the nation was kept in the meta: read it from the mod once.
    if (meta?.modName && meta.nationId && !meta.nation) {
      const def = (await loadSlotStatics(n))?.nations.find((d) => d.id === meta.nationId)
      if (def) {
        meta.nation = { name: def.name, flag: def.flag }
        await set(metaKey(n), meta)
      }
    }
    out.push(meta)
  }
  return out
}

export async function saveSlot(
  n: number,
  state: WorldState,
  modName?: string,
  nation?: { name: string; flag: string }
): Promise<void> {
  const meta: SlotMeta = {
    ...(modName ? { modName } : {}),
    ...(modName && nation ? { nation } : {}),
    slot: n,
    managerName: state.career.managerName,
    nationId: state.career.nationId,
    date: state.date,
    savedAt: Date.now(),
    version: state.version,
  }
  await set(dataKey(n), await pack(JSON.stringify(state)))
  await set(metaKey(n), meta)
  await set(ACTIVE_KEY, n)
}

export async function loadSlot(n: number): Promise<WorldState | null> {
  const raw = (await get(dataKey(n))) as Stored | undefined
  if (!raw) return null
  await set(ACTIVE_KEY, n)
  return JSON.parse(await unpack(raw)) as WorldState
}

export async function deleteSlot(n: number): Promise<void> {
  await del(dataKey(n))
  await del(metaKey(n))
  await del(staticsKey(n))
  if ((await get(ACTIVE_KEY)) === n) await del(ACTIVE_KEY)
}

export async function activeSlot(): Promise<number | null> {
  return ((await get(ACTIVE_KEY)) as number | undefined) ?? null
}

/** A career started from a mod keeps the mod's nations and clubs beside its world. */
export interface SlotStatics extends WorldStatics {
  modName: string
}

/**
 * Write (or, with null, clear) the dataset a slot's career runs on. Called once when
 * a career begins, before its first save.
 */
export async function setSlotStatics(n: number, statics: SlotStatics | null): Promise<void> {
  if (statics) await set(staticsKey(n), await pack(JSON.stringify(statics)))
  else await del(staticsKey(n))
}

export async function loadSlotStatics(n: number): Promise<SlotStatics | null> {
  const raw = (await get(staticsKey(n))) as Stored | undefined
  return raw ? (JSON.parse(await unpack(raw)) as SlotStatics) : null
}
