<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { Check, Sparkles } from "@lucide/vue"
import { AppButton, AppChip, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill, StickyCta } from "@/modules/core/components"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { pickSquad, available } from "@/engine/ai/squad"
import { positionGroup } from "@/engine/players/ability"
import { formatDate } from "@/engine/calendar/dates"
import { abilityTone } from "@/modules/core/utils/format"
import { showAlert } from "@/composables/useDialog"
import { unavailableIn } from "@/modules/squad/utils/availability"
import type { Player } from "@/engine/types"

const router = useRouter()
const world = useWorldStore()

const pending = world.derive((w) => w.state.pendingCallup, null)
const pool = world.derive(
  (w) => (w.state.career.nationId ? w.pool(w.state.career.nationId) : []),
  [] as Player[]
)
const compId = computed(() =>
  pending.value?.kind === "callup" && world.world?.state.competitions[pending.value.squadFor]
    ? pending.value.squadFor
    : undefined
)

const selected = ref<Set<string>>(new Set())
const group = ref("GK")

// Start from the previous squad, keeping whoever is still available.
watch(
  pool,
  (list) => {
    if (selected.value.size || !world.world || !world.me) return
    const prev = world.world.state.nations[world.me].squad
    selected.value = new Set(prev.filter((id) => list.some((p) => p.id === id && canPick(p))))
  },
  { immediate: true }
)

function released(p: Player) {
  return world.world?.released(p, compId.value) ?? true
}

function canPick(p: Player) {
  return !p.intlRetired && released(p)
}

function unavailableReason(p: Player): string | null {
  if (p.intlRetired) return "Retired from internationals"
  if (!released(p)) return "Club won't release"
  if (!available(p, world.date)) return `Injured until ${formatDate(p.injury!.until)}`
  return null
}

const counts = computed(() => {
  const c: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  for (const id of selected.value) {
    const p = world.world?.state.players[id]
    if (p) c[positionGroup(p.pos)]++
  }
  return c
})

const list = computed(() =>
  pool.value.filter((p) => positionGroup(p.pos) === group.value).sort((a, b) => b.ca - a.ca)
)

function toggle(p: Player) {
  if (!canPick(p)) return
  const s = new Set(selected.value)
  if (s.has(p.id)) s.delete(p.id)
  else if (s.size < 26) s.add(p.id)
  selected.value = s
}

function suggest() {
  if (!world.world) return
  selected.value = new Set(pickSquad(pool.value, world.date, 26, [...selected.value], released))
}

async function confirm() {
  if (selected.value.size < 23) return showAlert("Name at least 23 players.")
  if (counts.value.GK < 3) return showAlert("You need three goalkeepers.")
  // Suspended players may be named: they sit out the match, not the squad.
  const blocked = unavailableIn(
    [...selected.value].map((id) => world.world?.state.players[id]),
    world.date,
    false
  )
  if (blocked.length) return showAlert(`Remove unavailable players first: ${blocked.join("; ")}.`)
  world.confirmCallup([...selected.value])
  router.replace("/home")
}
</script>

<template>
  <PageShell
    title="Squad announcement"
    :subtitle="
      pending?.kind === 'callup'
        ? `${pending.label} · ${formatDate(pending.deadline)}`
        : 'No call-up due'
    "
    back
  >
    <template #actions>
      <AppButton variant="tonal" @click="suggest">
        <Sparkles :size="16" />
        Suggest
      </AppButton>
    </template>

    <div class="summary">
      <AppChip :variant="selected.size >= 23 ? 'success' : 'warning'" size="sm">
        {{ selected.size }}/26
      </AppChip>
      <span v-for="(n, g) in counts" :key="g" class="summary-count">{{ g }} {{ n }}</span>
    </div>

    <AppSubTabBar
      :model-value="group"
      :options="
        ['GK', 'DEF', 'MID', 'FWD'].map((g) => ({ value: g, label: `${g} (${counts[g]})` }))
      "
      size="sm"
      @update:model-value="(v) => (group = v)"
    />

    <div class="list">
      <button
        v-for="p in list"
        :key="p.id"
        class="pick"
        :class="{ 'pick--on': selected.has(p.id), 'pick--off': !!unavailableReason(p) }"
        @click="toggle(p)"
      >
        <PlayerRow :player="p" static>
          <template #trailing>
            <StatPill :value="Math.round(p.ca)" :tone="abilityTone(p.ca)" />
            <span class="check"><Check v-if="selected.has(p.id)" :size="16" /></span>
          </template>
        </PlayerRow>
        <div v-if="unavailableReason(p)" class="reason">{{ unavailableReason(p) }}</div>
        <div v-else-if="p.banned" class="reason">Suspended for the next match</div>
      </button>
    </div>

    <StickyCta>
      <AppButton variant="filled" block :disabled="selected.size < 23" @click="confirm">
        Announce squad
      </AppButton>
    </StickyCta>
  </PageShell>
</template>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.pick {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  text-align: start;
}

.pick--on {
  background: var(--accent-subtle);
}

.pick--off {
  opacity: 0.6;
}

.reason {
  margin-top: -6px;
  padding: 0 var(--sp-3) var(--sp-2) 48px;
  font-size: var(--fs-xs);
  color: var(--danger);
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  color: var(--accent);
}

.pick--on .check {
  border-color: var(--accent);
}
</style>
