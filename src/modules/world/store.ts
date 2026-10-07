import { defineStore } from "pinia"
import { markRaw, ref, shallowRef, computed } from "vue"
import { World } from "@/engine/world/world"
import { applyEdits, type EditData } from "@/engine/world/edit"
import { createWorld } from "@/engine/world/create"
import type { Interrupt, UserTeam, WorldState } from "@/engine/world/types"
import type { HostLevel } from "@/engine/world/stadiums"
import type { Fixture, InvitationalFormat } from "@/engine/competition/types"
import type { MatchReport } from "@/engine/match/types"
import { acceptOffer, declineOffer, resign, setAmbition } from "@/engine/career/career"
import { pickSquad } from "@/engine/ai/squad"
import {
  acceptInvite,
  createInvitational,
  declineInvite,
  seenInvite,
  type SetupProblem,
} from "@/engine/world/invitational"
import { randomSeed } from "@/engine/rng"
import { START_DATE } from "@/data/start"
import {
  loadSlot,
  saveSlot,
  activeSlot,
  loadSlotStatics,
  setSlotStatics,
  type SlotStatics,
} from "./services/saves"
import { setActiveNations, startingPlayers, statics } from "./services/statics"
import { loadMod } from "@/modules/mods/services/mods"
import { clubsFromRows } from "@/engine/world/create"
import { useSettingsStore } from "@/modules/settings/store"
import { daysBetween } from "@/engine/calendar/dates"
import { i18n } from "@/i18n"

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
    /** The mod the loaded career runs on, or null for the bundled dataset. */
    const mod = shallowRef<SlotStatics | null>(null)

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

    function adopt(w: World, n: number, from: SlotStatics | null) {
      mod.value = from
      setActiveNations(from?.nations ?? null)
      markRaw(w)
      markRaw(w.state)
      world.value = w
      slot.value = n
      interrupt.value = w.state.pendingCallup ?? { kind: "none" }
      touch()
    }

    async function newGame(
      n: number,
      opts: {
        managerName: string
        nationality: string
        /** null: start out of work, with `reputation` deciding who calls. */
        nationId: string | null
        reputation?: number
        /** Key the manager's face is drawn from. */
        face?: string
        /** No sacking, no contract end. */
        jobSecurity?: boolean
        /** Start from a mod instead of the bundled dataset. */
        modId?: string | null
      }
    ) {
      busy.value = true
      busyLabel.value = i18n.global.t("world.building")
      await nextFrame()
      try {
        const { modId, ...rest } = opts
        const data = modId ? await loadMod(modId) : null
        if (modId && !data) throw new Error(`mod ${modId} not found`)
        const from: SlotStatics | null = data
          ? { modName: data.name, nations: data.nations, clubs: clubsFromRows(data.clubs) }
          : null
        const rows = data ? data.players : await startingPlayers()
        const w = createWorld(
          { seed: randomSeed(), start: START_DATE, ...rest },
          from ?? statics(),
          rows
        )
        await setSlotStatics(n, from)
        adopt(w, n, from)
        await save()
      } finally {
        busy.value = false
      }
    }

    async function load(n: number): Promise<boolean> {
      busy.value = true
      busyLabel.value = i18n.global.t("world.loading")
      await nextFrame()
      try {
        const s = await loadSlot(n)
        if (!s) return false
        const from = await loadSlotStatics(n)
        adopt(new World(s, from ?? statics()), n, from)
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
      await saveSlot(slot.value, world.value.state, mod.value?.modName)
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
          } else if (
            (result.kind === "draw" && !settings.watchDraws) ||
            (result.kind === "board" && settings.assistantBoard) ||
            (result.kind === "intake" && !settings.showIntake)
          ) {
            w.settle(result)
            result = { kind: "none" }
          }
          busyLabel.value = w.state.date
          touch()
          if (result.kind !== "none") break
          if (days > 1) await new Promise<void>((r) => setTimeout(r, DAY_DELAY_MS))
        }
        interrupt.value = result
        touch()
        // Not awaited: the save serialises the world at once, and the screen the
        // interrupt asks for (a draw, a match) should not wait for the disk.
        void autoSave()
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

    /**
     * Write the save editor's changes into the running game and save. Nations and clubs
     * live in the bundled data, so the first edit to them gives the slot a copy of its own.
     */
    async function applyEditorChanges(data: EditData) {
      const w = world.value
      if (!w || slot.value === null) return
      const { statics: changed } = applyEdits(w, data)
      if (changed) {
        const from: SlotStatics = {
          modName: mod.value?.modName ?? i18n.global.t("editor.modName"),
          nations: [...w.defs.values()],
          clubs: [...w.clubs.values()],
        }
        await setSlotStatics(slot.value, from)
        mod.value = from
        setActiveNations(from.nations)
      }
      touch()
      await save()
    }

    /** Leave to the menu without writing anything. */
    function discard() {
      world.value = null
      slot.value = null
      mod.value = null
      setActiveNations(null)
      touch()
    }

    function setUserTeam(team: UserTeam) {
      if (!world.value) return
      world.value.state.userTeam = team
      touch()
      void autoSave()
    }

    /** Take the staff's recommended instructions for a match as the user's own. */
    function applyAdvice(f: Fixture) {
      const team = world.value?.adviceFor(f)
      if (team) setUserTeam(team)
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
      interrupt.value = { kind: "none" }
      touch()
      void autoSave()
    }

    /** The manager walks away from his job; offers follow as after a sacking. */
    function resignJob() {
      if (!world.value?.state.career.nationId) return
      resign(world.value)
      interrupt.value = { kind: "none" }
      touch()
      void autoSave()
    }

    function turnDown(nationId: string) {
      if (!world.value) return
      declineOffer(world.value, nationId)
      if (interrupt.value.kind === "offer") interrupt.value = { kind: "none" }
      touch()
    }

    /** The job-offer popup was closed without a decision: the offer still stands. */
    function seenOffer() {
      world.value?.clearOffer()
      if (interrupt.value.kind === "offer") interrupt.value = { kind: "none" }
      touch()
    }

    /** The "we will host" popup was closed. */
    function seenHosting() {
      world.value?.clearHosting()
      if (interrupt.value.kind === "hosting") interrupt.value = { kind: "none" }
      touch()
    }

    /** Clear an interrupt the user has dealt with, and save. */
    function settled(kind: Interrupt["kind"]) {
      if (interrupt.value.kind === kind) interrupt.value = { kind: "none" }
      touch()
      void autoSave()
    }

    /** The manager's word on a new objective. Returns false if the board refuses. */
    function agreeObjective(objectiveId: string, level: -1 | 0 | 1): boolean {
      const w = world.value
      if (!w || !setAmbition(w, objectiveId, level)) return false
      settled("board")
      return true
    }

    function seenReview() {
      world.value?.clearReview()
      settled("review")
    }

    function seenSacked() {
      world.value?.clearSacked()
      settled("sacked")
    }

    function seenUltimatum() {
      world.value?.clearUltimatum()
      settled("ultimatum")
    }

    function seenIntake() {
      world.value?.clearIntake()
      settled("intake")
    }

    /**
     * Set up the user's own invitational tournament, his nation hosting. Returns the
     * new competition's id, or what stopped it.
     */
    function hostInvitational(
      windowId: string,
      guests: string[],
      format: InvitationalFormat
    ): { id: string } | { problem: SetupProblem } {
      const w = world.value
      const me = w?.state.career.nationId
      if (!w || !me) return { problem: "window" }
      const out = createInvitational(w, windowId, [me, ...guests], format)
      touch()
      void autoSave()
      return out
    }

    /** Answer another federation's invitation. */
    function answerInvite(yes: boolean): { id: string } | { problem: SetupProblem } | null {
      const w = world.value
      if (!w?.state.invite) return null
      const out = yes ? acceptInvite(w) : (declineInvite(w), null)
      settled("invite")
      return out
    }

    /** The invitation popup was closed without an answer: it waits on its page. */
    function seenInvitation() {
      if (world.value) seenInvite(world.value)
      settled("invite")
    }

    function toggleWatch(playerId: string) {
      world.value?.toggleWatch(playerId)
      touch()
      void autoSave()
    }

    /** Put in (or withdraw) the federation's bid to host tournaments of a level. */
    function setBid(level: HostLevel, on: boolean) {
      const c = world.value?.state.career
      if (!c) return
      const bids = new Set(c.bids ?? [])
      if (on) bids.add(level)
      else bids.delete(level)
      c.bids = [...bids]
      touch()
      void autoSave()
    }

    function markRead(ids: number[]) {
      if (!world.value) return
      for (const n of world.value.state.news) if (ids.includes(n.id)) n.read = true
      touch()
    }

    function close() {
      world.value = null
      slot.value = null
      mod.value = null
      setActiveNations(null)
      touch()
    }

    return {
      world,
      tick,
      slot,
      busy,
      busyLabel,
      interrupt,
      mod,
      state,
      date,
      me,
      derive,
      touch,
      newGame,
      resignJob,
      load,
      resume,
      save,
      autoSave,
      assistantCallup,
      finishDraw,
      discard,
      applyEditorChanges,
      proceed,
      confirmCallup,
      setUserTeam,
      applyAdvice,
      finishUserMatch,
      takeJob,
      turnDown,
      seenOffer,
      seenHosting,
      agreeObjective,
      seenReview,
      seenSacked,
      seenUltimatum,
      seenIntake,
      hostInvitational,
      answerInvite,
      seenInvitation,
      toggleWatch,
      setBid,
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
