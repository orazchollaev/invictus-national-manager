/**
 * Three save slots in IndexedDB. The world is one JSON string per slot, with a small
 * meta record beside it so the slot list never has to parse a whole world.
 */
import { del, get, set } from "idb-keyval"
import type { WorldState } from "@/engine/world/types"
import type { WorldStatics } from "@/engine/world/world"

export const SLOT_COUNT = 3

export interface SlotMeta {
  slot: number
  managerName: string
  nationId: string | null
  date: string
  savedAt: number
  version: number
  /** The mod the career was started from, if any. */
  modName?: string
}

const dataKey = (n: number) => `ntm:slot:${n}`
const metaKey = (n: number) => `ntm:slot:${n}:meta`
const staticsKey = (n: number) => `ntm:slot:${n}:statics`
const ACTIVE_KEY = "ntm:active"

export async function listSlots(): Promise<(SlotMeta | null)[]> {
  const out: (SlotMeta | null)[] = []
  for (let n = 1; n <= SLOT_COUNT; n++)
    out.push(((await get(metaKey(n))) as SlotMeta | undefined) ?? null)
  return out
}

export async function saveSlot(n: number, state: WorldState, modName?: string): Promise<void> {
  const meta: SlotMeta = {
    ...(modName ? { modName } : {}),
    slot: n,
    managerName: state.career.managerName,
    nationId: state.career.nationId,
    date: state.date,
    savedAt: Date.now(),
    version: state.version,
  }
  await set(dataKey(n), JSON.stringify(state))
  await set(metaKey(n), meta)
  await set(ACTIVE_KEY, n)
}

export async function loadSlot(n: number): Promise<WorldState | null> {
  const raw = (await get(dataKey(n))) as string | undefined
  if (!raw) return null
  await set(ACTIVE_KEY, n)
  return JSON.parse(raw) as WorldState
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
  if (statics) await set(staticsKey(n), JSON.stringify(statics))
  else await del(staticsKey(n))
}

export async function loadSlotStatics(n: number): Promise<SlotStatics | null> {
  const raw = (await get(staticsKey(n))) as string | undefined
  return raw ? (JSON.parse(raw) as SlotStatics) : null
}
