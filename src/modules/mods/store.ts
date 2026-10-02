import { defineStore } from "pinia"
import { computed, markRaw, ref, shallowRef } from "vue"
import type { NationDef } from "@/engine/types"
import type { PlayerRow } from "@/engine/world/create"
import { START_DATE } from "@/data/start"
import { loadMod, saveMod } from "./services/mods"
import {
  editFromRow,
  rowFromEdit,
  type ClubEdit,
  type ModData,
  type PlayerEdit,
} from "./utils/format"

const uid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`

/**
 * The mod open in the editor. The dataset is plain data kept raw (16,000 rows do not
 * need to be reactive); every change bumps `rev`, which the lists depend on, and
 * marks the mod dirty until it is saved.
 */
export const useModsStore = defineStore(
  "mods",
  () => {
    const mod = shallowRef<ModData | null>(null)
    const rev = ref(0)
    const dirty = ref(false)

    function changed() {
      rev.value++
      dirty.value = true
    }

    /** Read a value of the open mod that refreshes on every change. */
    function derive<T>(fn: (m: ModData) => T, fallback: T) {
      return computed(() => {
        void rev.value
        return mod.value ? fn(mod.value) : fallback
      })
    }

    async function open(id: string): Promise<boolean> {
      if (mod.value?.id === id) return true
      const m = await loadMod(id)
      if (!m) return false
      mod.value = markRaw(m)
      dirty.value = false
      rev.value++
      return true
    }

    function close() {
      mod.value = null
      dirty.value = false
    }

    async function save() {
      const m = mod.value
      if (!m) return
      m.updatedAt = Date.now()
      await saveMod(m)
      dirty.value = false
    }

    function setInfo(name: string, author: string) {
      const m = mod.value
      if (!m) return
      m.name = name.trim().slice(0, 40) || m.name
      m.author = author.trim().slice(0, 40)
      changed()
    }

    // ── Nations ───────────────────────────────────────────────────────────

    function saveNation(def: NationDef) {
      const m = mod.value
      if (!m) return
      const i = m.nations.findIndex((n) => n.id === def.id)
      if (i >= 0) m.nations[i] = def
      changed()
    }

    /** Raise or lower every player of a nation, current ability and potential alike. */
    function shiftSquad(nationId: string, delta: number) {
      const rows = mod.value?.players[nationId]
      if (!rows || !delta) return
      for (let i = 0; i < rows.length; i++) {
        const p = editFromRow(nationId, rows[i])
        p.ca += delta
        p.pa += delta
        rows[i] = rowFromEdit(p)
      }
      changed()
    }

    // ── Players ───────────────────────────────────────────────────────────

    function newPlayer(nationId: string): PlayerEdit {
      const m = mod.value!
      const clubId =
        m.clubs.filter((c) => c[2] === nationId).sort((a, b) => b[3] - a[3])[0]?.[0] ??
        m.clubs[0][0]
      return {
        id: uid("mod-p"),
        nationId,
        first: "",
        last: "",
        born: `${Number(START_DATE.slice(0, 4)) - 22}-01-01`,
        pos: "CM",
        alt: [],
        foot: "R",
        ca: 60,
        pa: 70,
        pers: [10, 10, 10, 10, 10, 10, 10],
        clubId,
      }
    }

    /** Write a player back, moving him between nations if his changed. */
    function savePlayer(p: PlayerEdit) {
      const m = mod.value
      if (!m) return
      const row = rowFromEdit(p)
      let placed = false
      for (const [nationId, rows] of Object.entries(m.players)) {
        const i = rows.findIndex((r) => r[0] === p.id)
        if (i < 0) continue
        if (nationId === p.nationId) {
          rows[i] = row
          placed = true
        } else rows.splice(i, 1)
        break
      }
      if (!placed) (m.players[p.nationId] ??= []).push(row)
      changed()
    }

    function deletePlayer(id: string) {
      const m = mod.value
      if (!m) return
      for (const rows of Object.values(m.players)) {
        const i = rows.findIndex((r) => r[0] === id)
        if (i >= 0) {
          rows.splice(i, 1)
          break
        }
      }
      changed()
    }

    // ── Clubs ─────────────────────────────────────────────────────────────

    function newClub(nationId: string): ClubEdit {
      return { id: uid(`${nationId.toLowerCase()}-mod-`), name: "", nationId, tier: 3 }
    }

    function saveClub(c: ClubEdit) {
      const m = mod.value
      if (!m) return
      const row: ModData["clubs"][number] = [c.id, c.name.trim(), c.nationId, c.tier]
      const i = m.clubs.findIndex((x) => x[0] === c.id)
      if (i >= 0) m.clubs[i] = row
      else m.clubs.push(row)
      changed()
    }

    /** Players at a club, by id. */
    const clubCounts = derive((m) => {
      const out = new Map<string, number>()
      for (const rows of Object.values(m.players))
        for (const r of rows) out.set(r[10], (out.get(r[10]) ?? 0) + 1)
      return out
    }, new Map<string, number>())

    /** A club with players cannot go: they would have nowhere to play. */
    function deleteClub(id: string): boolean {
      const m = mod.value
      if (!m || (clubCounts.value.get(id) ?? 0) > 0 || m.clubs.length <= 1) return false
      m.clubs = m.clubs.filter((c) => c[0] !== id)
      changed()
      return true
    }

    /** Every player with his nation, for the player list. */
    const allPlayers = derive((m) => {
      const out: { nationId: string; row: PlayerRow }[] = []
      for (const [nationId, rows] of Object.entries(m.players))
        for (const row of rows) out.push({ nationId, row })
      return out
    }, [])

    return {
      mod,
      rev,
      dirty,
      derive,
      open,
      close,
      save,
      setInfo,
      saveNation,
      shiftSquad,
      newPlayer,
      savePlayer,
      deletePlayer,
      newClub,
      saveClub,
      deleteClub,
      clubCounts,
      allPlayers,
    }
  },
  {
    // Mods are written by hand to their own records; the plugin must never touch this.
    persistedState: {
      persist: false,
    },
  }
)
