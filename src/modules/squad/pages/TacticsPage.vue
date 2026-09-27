<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { Sparkles } from "@lucide/vue"
import { AppButton, AppButtonGroup, AppCard, AppField, AppSelect, AppSheet } from "@/components/ui"
import { PageShell, StatPill, StickyCta } from "@/modules/core/components"
import { PitchView } from "@/modules/squad/components/pitch"
import { MENTALITY_OPTIONS } from "@/modules/squad/constants"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { FORMATIONS, FORMATION_LIST } from "@/engine/match/formations"
import { aiTeamSheet, pickBench } from "@/engine/ai/squad"
import { matchAbility, positionFit } from "@/engine/players/ability"
import type { Formation, Level, Mentality, SheetSlot, Tactics } from "@/engine/match/types"
import type { Player } from "@/engine/types"
import { showAlert } from "@/composables/useDialog"
import { unavailableIn } from "@/modules/squad/utils/availability"
import { useSettingsStore } from "@/modules/settings/store"

const settings = useSettingsStore()

const router = useRouter()
const world = useWorldStore()

/** The squad if one is named, otherwise the whole pool. */
const squad = world.derive((w) => {
  const id = w.state.career.nationId
  if (!id) return [] as Player[]
  const n = w.state.nations[id]
  return n.squad.length ? n.squad.map((pid) => w.state.players[pid]).filter(Boolean) : w.pool(id)
}, [] as Player[])

const byId = computed(() => new Map(squad.value.map((p) => [p.id, p])))
const player = (id: string) => byId.value.get(id) ?? world.world?.state.players[id]

function initial() {
  const w = world.world!
  const ut = w.state.userTeam
  if (ut) return JSON.parse(JSON.stringify(ut)) as NonNullable<typeof ut>
  const sheet = aiTeamSheet(w.state.career.nationId!, squad.value, world.date)
  return {
    tactics: sheet.tactics,
    xi: sheet.xi,
    bench: sheet.bench,
    captainId: sheet.captainId,
    penaltyTakerId: sheet.penaltyTakerId,
    setPieceTakerId: sheet.setPieceTakerId,
  }
}

const team = ref(initial())
const selectedSlot = ref<number | null>(null)

const slots = computed(() =>
  FORMATIONS[team.value.tactics.formation].map((_, i) => team.value.xi[i]?.playerId ?? null)
)
const inXI = computed(() => new Set(slots.value.filter(Boolean) as string[]))

function setFormation(f: Formation) {
  const roles = FORMATIONS[f]
  team.value.tactics.formation = f
  team.value.xi = roles
    .map((pos, i) => ({ playerId: team.value.xi[i]?.playerId ?? "", pos }))
    .filter((s) => s.playerId) as SheetSlot[]
  while (team.value.xi.length < roles.length)
    team.value.xi.push({ playerId: "", pos: roles[team.value.xi.length] })
}

const candidates = computed(() => {
  if (selectedSlot.value === null) return []
  const pos = FORMATIONS[team.value.tactics.formation][selectedSlot.value]
  return [...squad.value].sort(
    (a, b) => matchAbility(b) * positionFit(b, pos) - matchAbility(a) * positionFit(a, pos)
  )
})

function choose(p: Player) {
  const i = selectedSlot.value
  if (i === null) return
  const roles = FORMATIONS[team.value.tactics.formation]
  const xi = roles.map((pos, k) => ({ playerId: slots.value[k] ?? "", pos }))
  const current = xi.findIndex((s) => s.playerId === p.id)
  if (current >= 0) xi[current].playerId = xi[i].playerId // swap places
  xi[i].playerId = p.id
  team.value.xi = xi
  selectedSlot.value = null
}

function auto() {
  const w = world.world!
  const sheet = aiTeamSheet(
    w.state.career.nationId!,
    squad.value,
    world.date,
    team.value.tactics,
    team.value.tactics.formation
  )
  team.value.xi = sheet.xi
  team.value.captainId = sheet.captainId
  team.value.penaltyTakerId = sheet.penaltyTakerId
  team.value.setPieceTakerId = sheet.setPieceTakerId
}

const xiOptions = computed(() =>
  [...inXI.value].map((id) => ({
    value: id,
    label: `${player(id)?.first ?? ""} ${player(id)?.last ?? ""}`,
  }))
)

const mentality = computed({
  get: () => String(team.value.tactics.mentality),
  set: (v: string) => (team.value.tactics.mentality = Number(v) as Mentality),
})
const pressing = computed({
  get: () => String(team.value.tactics.pressing),
  set: (v: string) => (team.value.tactics.pressing = Number(v) as Level),
})
const tempo = computed({
  get: () => String(team.value.tactics.tempo),
  set: (v: string) => (team.value.tactics.tempo = Number(v) as Level),
})

async function save() {
  const xi = FORMATIONS[team.value.tactics.formation]
    .map((pos, i) => ({ playerId: slots.value[i] ?? "", pos }))
    .filter((s) => s.playerId)
  if (xi.length < 11) return showAlert("Fill all eleven positions.")
  const blocked = unavailableIn(
    xi.map((s) => player(s.playerId)),
    world.date
  )
  if (blocked.length) return showAlert(`Replace unavailable players first: ${blocked.join("; ")}.`)
  const bench = pickBench(squad.value, xi, world.date)
  world.setUserTeam({ ...team.value, xi, bench, tactics: { ...(team.value.tactics as Tactics) } })
  router.back()
}
</script>

<template>
  <PageShell title="Tactics" subtitle="Your eleven and how they play" back>
    <p v-if="settings.assistantPicks" class="assistant-note">
      Your assistant picks the eleven for each match. Turn this off in Settings to choose it
      yourself.
    </p>
    <template #actions>
      <AppButton variant="tonal" @click="auto">
        <Sparkles :size="16" />
        Best XI
      </AppButton>
    </template>

    <AppSelect
      :model-value="team.tactics.formation"
      :options="FORMATION_LIST.map((f) => ({ value: f, label: f }))"
      @update:model-value="(v) => setFormation(v as Formation)"
    />

    <PitchView
      :formation="team.tactics.formation"
      :slots="slots"
      :player="player"
      :selected="selectedSlot"
      @select="(i) => (selectedSlot = i)"
    />

    <AppCard padding="md" class="instructions">
      <AppField label="Mentality" layout="stack">
        <AppSelect v-model="mentality" :options="MENTALITY_OPTIONS" />
      </AppField>
      <AppField label="Pressing" layout="stack">
        <AppButtonGroup
          v-model="pressing"
          block
          :options="[
            { value: '0', label: 'Low' },
            { value: '1', label: 'Standard' },
            { value: '2', label: 'High' },
          ]"
        />
      </AppField>
      <AppField label="Tempo" layout="stack">
        <AppButtonGroup
          v-model="tempo"
          block
          :options="[
            { value: '0', label: 'Patient' },
            { value: '1', label: 'Standard' },
            { value: '2', label: 'Direct' },
          ]"
        />
      </AppField>
      <AppField label="Captain" layout="stack">
        <AppSelect
          :model-value="team.captainId ?? ''"
          :options="xiOptions"
          placeholder="Choose"
          @update:model-value="(v) => (team.captainId = v)"
        />
      </AppField>
      <AppField label="Penalties" layout="stack">
        <AppSelect
          :model-value="team.penaltyTakerId ?? ''"
          :options="xiOptions"
          placeholder="Choose"
          @update:model-value="(v) => (team.penaltyTakerId = v)"
        />
      </AppField>
      <AppField label="Set pieces" layout="stack">
        <AppSelect
          :model-value="team.setPieceTakerId ?? ''"
          :options="xiOptions"
          placeholder="Choose"
          @update:model-value="(v) => (team.setPieceTakerId = v)"
        />
      </AppField>
    </AppCard>

    <StickyCta above-nav>
      <AppButton variant="filled" block @click="save">Save tactics</AppButton>
    </StickyCta>

    <AppSheet
      v-if="selectedSlot !== null"
      :title="`Pick a ${FORMATIONS[team.tactics.formation][selectedSlot]}`"
      @close="selectedSlot = null"
    >
      <div class="pick-list">
        <button v-for="p in candidates" :key="p.id" class="pick" @click="choose(p)">
          <PlayerRow :player="p" static compact>
            <template #trailing>
              <span v-if="inXI.has(p.id)" class="in-xi">XI</span>
              <StatPill
                :value="
                  Math.round(
                    matchAbility(p) *
                      positionFit(p, FORMATIONS[team.tactics.formation][selectedSlot!])
                  )
                "
                :tone="
                  positionFit(p, FORMATIONS[team.tactics.formation][selectedSlot!]) >= 1
                    ? 'var(--success)'
                    : 'var(--warning)'
                "
              />
            </template>
          </PlayerRow>
        </button>
      </div>
    </AppSheet>
  </PageShell>
</template>

<style scoped>
.instructions :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.pick-list {
  display: flex;
  flex-direction: column;
}

.pick {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  text-align: start;
}

.in-xi {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--accent);
}

.assistant-note {
  margin: 0;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: var(--fs-sm);
}
</style>
