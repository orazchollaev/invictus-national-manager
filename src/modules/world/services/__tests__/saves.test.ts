import { beforeEach, describe, expect, it, vi } from "vitest"
import type { WorldState } from "@/engine/world/types"

const db = new Map<string, unknown>()
vi.mock("idb-keyval", () => ({
  get: vi.fn(async (key: string) => db.get(key)),
  set: vi.fn(async (key: string, value: unknown) => {
    db.set(key, value)
  }),
  del: vi.fn(async (key: string) => {
    db.delete(key)
  }),
}))

const { loadSlot, pack, saveSlot, unpack } = await import("../saves")

const state = {
  version: 1,
  date: "2027-03-01",
  career: { managerName: "Ana Lima", nationId: "BRA" },
  players: { p1: { id: "p1", first: "Jôão", last: "Müller-Çelik" } },
} as unknown as WorldState

beforeEach(() => db.clear())

describe("save slots", () => {
  it("stores the world gzipped and reads it back unchanged", async () => {
    await saveSlot(1, state)
    const raw = db.get("ntm:slot:1")
    expect(raw).toBeInstanceOf(Uint8Array)
    expect([(raw as Uint8Array)[0], (raw as Uint8Array)[1]]).toEqual([0x1f, 0x8b])
    expect(await loadSlot(1)).toEqual(state)
  })

  it("still reads a slot saved as plain JSON before compression", async () => {
    db.set("ntm:slot:2", JSON.stringify(state))
    expect(await loadSlot(2)).toEqual(state)
  })

  it("round-trips text through pack and unpack", async () => {
    const text = JSON.stringify({ s: "ü".repeat(10000) })
    expect(await unpack(await pack(text))).toBe(text)
  })
})
