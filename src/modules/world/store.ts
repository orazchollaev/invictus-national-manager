import { defineStore } from "pinia"
import { markRaw, ref, shallowRef, computed } from "vue"
import { World } from "@/engine/world/world"
import { createWorld } from "@/engine/world/create"
import type { Interrupt, UserTeam, WorldState } from "@/engine/world/types"
import type { Fixture } from "@/engine/competition/types"
import type { MatchReport } from "@/engine/match/types"
import { acceptOffer, declineOffer } from "@/engine/career/career"
import { pickSquad } from "@/engine/ai/squad"
import { randomSeed } from "@/engine/rng"
import { START_DATE } from "@/data/start"
import { loadSlot, saveSlot, activeSlot } from "./services/saves"
import { startingPlayers, statics } from "./services/statics"
import { useSettingsStore } from "@/modules/settings/store"
import { daysBetween } from "@/engine/calendar/dates"

/** Pause between simulated days, so a multi-day advance is seen to tick over. */
const DAY_DELAY_MS = 25

const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

export const useWorldStore = defineStore(
  "world",
  () => {
    const world = shallowRef<World | null>(null)
    /** Bumped after every change; anything reading the world depends on it. */
    const tick = ref(0)
    const slot = ref<number | null>(null)
    const busy = ref(false)
    const busyLabel = ref("")
    const interrupt = ref<Interrupt>({ kind: "none" })

    function touch() {
      tick.value++
    }

    /** A computed over the world that refreshes whenever it changes. */
    function derive<T>(fn: (w: World) => T, fallback: T) {
      return computed(() => {
        void tick.value
        return world.value ? fn(world.value) : fallback
      })
    }

    const state = computed<WorldState | null>(() => {
      void tick.value
      return world.value?.state ?? null
    })
    const date = derive((w) => w.state.date, "")
    const me = derive((w) => w.state.career.nationId, null as string | null)

    function adopt(w: World, n: number) {
      markRaw(w)
      markRaw(w.state)
      world.value = w
      slot.value = n
      interrupt.value = w.state.pendingCallup ?? { kind: "none" }
      touch()
    }

    async function newGame(
      n: number,
      opts: { managerName: string; nationality: string; nationId: string }
    ) {
      busy.value = true
      busyLabel.value = "Building the world…"
      await nextFrame()
      try {
        const rows = await startingPlayers()
        const w = createWorld({ seed: randomSeed(), start: START_DATE, ...opts }, statics(), rows)
        adopt(w, n)
        await save()
      } finally {
        busy.value = false
      }
    }

    async function load(n: number): Promise<boolean> {
      busy.value = true
      busyLabel.value = "Loading…"
      await nextFrame()
      try {
        const s = await loadSlot(n)
        if (!s) return false
        adopt(new World(s, statics()), n)
        savedOn = s.date
        return true
      } finally {
        busy.value = false
      }
    }

    async function resume(): Promise<boolean> {
      if (world.value) return true
      const n = await activeSlot()
      return n ? load(n) : false
    }

    /** Game date of the last save, for weekly/monthly autosave. */
    let savedOn = ""

    async function save() {
      if (!world.value || slot.value === null) return
      await saveSlot(slot.value, world.value.state)
      savedOn = world.value.state.date
    }

    /** Save if the autosave setting says it is time. */
    async function autoSave() {
      const w = world.value
      if (!w) return
      const mode = useSettingsStore().autoSave
      if (mode === "off") return
      if (mode !== "always" && savedOn) {
        const gap = daysBetween(savedOn, w.state.date)
        if (gap < (mode === "weekly" ? 7 : 30)) return
      }
      await save()
    }

    /**
     * Move the world on day by day: `step` days, or until the user's next match
     * ("match"). Anything that needs the user (a call-up, his match, a job offer)
     * stops it early. Each day paints, so the calendar is seen to turn.
     */
    async function proceed(step: number | "match" = 1): Promise<Interrupt> {
      const w = world.value
      if (!w || busy.value) return interrupt.value
      const days = step === "match" ? 400 : step
      busy.value = days > 1
      let result: Interrupt = { kind: "none" }
      try {
        const settings = useSettingsStore()
        for (let i = 0; i < days; i++) {
          result = w.advance(1)
          // The assistant names the squad; unwatched draws just pass.
          if (result.kind === "callup" && settings.assistantPicks) {
            assistantCallup()
            result = { kind: "none" }
          } else if (result.kind === "draw" && !settings.watchDraws) {
            w.clearDraw()
            result = { kind: "none" }
          }
          busyLabel.value = w.state.date
          touch()
          if (result.kind !== "none") break
          if (days > 1) await new Promise<void>((r) => setTimeout(r, DAY_DELAY_MS))
        }
        interrupt.value = result
        touch()
        await autoSave()
      } finally {
        busy.value = false
      }
      return result
    }

    function confirmCallup(ids: string[]) {
      const w = world.value
      const pending = w?.state.pendingCallup
      if (!w || !pending || pending.kind !== "callup") return
      w.setSquad(pending.nationId, pending.squadFor, ids)
      interrupt.value = { kind: "none" }
      touch()
      void autoSave()
    }

    /** Let the assistant name the pending squad. */
    function assistantCallup() {
      const w = world.value
      const pending = w?.state.pendingCallup
      if (!w || !pending || pending.kind !== "callup") return
      const compId = w.state.competitions[pending.squadFor]?.id
      const ids = pickSquad(
        w.pool(pending.nationId),
        w.state.date,
        26,
        w.state.nations[pending.nationId].squad,
        (p) => w.released(p, compId)
      )
      w.setSquad(pending.nationId, pending.squadFor, ids)
      interrupt.value = { kind: "none" }
      touch()
    }

    /** The user has watched the draw. */
    function finishDraw() {
      world.value?.clearDraw()
      interrupt.value = { kind: "none" }
      touch()
    }

    /** Leave to the menu without writing anything. */
    function discard() {
      world.value = null
      slot.value = null
      touch()
    }

    function setUserTeam(team: UserTeam) {
      if (!world.value) return
      world.value.state.userTeam = team
      touch()
      void autoSave()
    }

    /** Record the user's finished match and move on. */
    function finishUserMatch(f: Fixture, report: MatchReport) {
      const w = world.value
      if (!w) return
      w.applyReport(f, report, true)
      interrupt.value = { kind: "none" }
      touch()
      void autoSave()
    }

    function takeJob(nationId: string) {
      if (!world.value) return
      acceptOffer(world.value, nationId)
      touch()
      void autoSave()
    }

    function turnDown(nationId: string) {
      if (!world.value) return
      declineOffer(world.value, nationId)
      touch()
    }

    function markRead(ids: number[]) {
      if (!world.value) return
      for (const n of world.value.state.news) if (ids.includes(n.id)) n.read = true
      touch()
    }

    function close() {
      world.value = null
      slot.value = null
      touch()
    }

    return {
      world,
      tick,
      slot,
      busy,
      busyLabel,
      interrupt,
      state,
      date,
      me,
      derive,
      touch,
      newGame,
      load,
      resume,
      save,
      autoSave,
      assistantCallup,
      finishDraw,
      discard,
      proceed,
      confirmCallup,
      setUserTeam,
      finishUserMatch,
      takeJob,
      turnDown,
      markRead,
      close,
    }
  },
  {
    // The world is saved by hand to its slot; the plugin must never touch it.
    persistedState: {
      persist: false,
    },
  }
)
