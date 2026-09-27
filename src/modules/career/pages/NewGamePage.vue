<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  AppButton,
  AppCard,
  AppField,
  AppSearchInput,
  AppSelect,
  AppSubTabBar,
} from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { SlotList } from "@/modules/career/components/slots"
import { NATION_DEFS } from "@/modules/world/services/statics"
import { useWorldStore } from "@/modules/world/store"
import { CONFEDS, type Confed } from "@/engine/types"

const route = useRoute()
const router = useRouter()
const world = useWorldStore()
const slot = ref<number | null>(route.query.slot ? Number(route.query.slot) : null)

/** 0: save slot, 1: the manager, 2: the nation. */
const step = ref<0 | 1 | 2>(slot.value ? 1 : 0)
const name = ref("")
const nationality = ref("TUR")
const confed = ref<Confed>("UEFA")
const query = ref("")
const chosen = ref<string | null>(null)

const byPoints = [...NATION_DEFS].filter((n) => !n.banned).sort((a, b) => b.points - a.points)
const rankOf = new Map(byPoints.map((n, i) => [n.id, i + 1]))

const nationalityOptions = [...NATION_DEFS]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((n) => ({ value: n.id, label: n.name }))

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  return byPoints.filter((n) => (q ? n.name.toLowerCase().includes(q) : n.confed === confed.value))
})

/** Stars for how big a job it is, from the ranking. */
function stars(id: string) {
  const r = rankOf.get(id) ?? 211
  return r <= 10 ? 5 : r <= 30 ? 4 : r <= 70 ? 3 : r <= 130 ? 2 : 1
}

const TITLES = [
  ["New game", "Choose a save slot"],
  ["New career", "Tell us about yourself"],
  ["Choose your nation", "Every FIFA member is open to you"],
]

function pickSlot(n: number) {
  slot.value = n
  step.value = 1
}

function back() {
  if (step.value > 0 && !(step.value === 1 && route.query.slot))
    step.value = (step.value - 1) as 0 | 1
  else router.back()
}

const canStart = computed(() => name.value.trim().length >= 2 && !!chosen.value)

async function start() {
  if (!chosen.value || !slot.value) return
  await world.newGame(slot.value, {
    managerName: name.value.trim(),
    nationality: nationality.value,
    nationId: chosen.value,
  })
  router.replace("/home")
}
</script>

<template>
  <PageShell :title="TITLES[step][0]" :subtitle="TITLES[step][1]" :on-back="back" back>
    <SlotList v-if="step === 0" mode="new" @pick="pickSlot" />

    <template v-else-if="step === 1">
      <AppCard padding="md" class="form">
        <AppField label="Your name" layout="stack">
          <input
            v-model="name"
            class="input"
            maxlength="32"
            placeholder="Manager name"
            autocomplete="off"
          />
        </AppField>
        <AppField label="Nationality" layout="stack">
          <AppSelect
            v-model="nationality"
            :options="nationalityOptions"
            searchable
            search-placeholder="Search nations"
          />
        </AppField>
      </AppCard>
      <AppButton variant="filled" block :disabled="name.trim().length < 2" @click="step = 2">
        Next
      </AppButton>
    </template>

    <template v-else>
      <AppSearchInput v-model="query" placeholder="Search all nations" />
      <AppSubTabBar
        v-if="!query"
        :model-value="confed"
        :options="CONFEDS.map((c) => ({ value: c, label: c }))"
        size="sm"
        @update:model-value="(v) => (confed = v as Confed)"
      />
      <div class="nations">
        <button
          v-for="n in list"
          :key="n.id"
          class="nation-row"
          :class="{ 'nation-row--on': chosen === n.id }"
          @click="chosen = n.id"
        >
          <span class="nation-rank">{{ rankOf.get(n.id) }}</span>
          <NationFlag :id="n.id" :size="28" name />
          <span class="nation-stars">{{ "★".repeat(stars(n.id)) }}</span>
        </button>
      </div>
      <StickyCta>
        <AppButton variant="filled" block :disabled="!canStart" @click="start">
          {{
            chosen
              ? `Take charge of ${NATION_DEFS.find((n) => n.id === chosen)?.name}`
              : "Pick a nation"
          }}
        </AppButton>
      </StickyCta>
    </template>
  </PageShell>
</template>

<style scoped>
.form :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.input {
  width: 100%;
}

.nations {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.nation-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: none;
  color: var(--text);
  text-align: start;
  font-size: var(--fs-base);
}

.nation-row :deep(.nation) {
  flex: 1;
}

.nation-row--on {
  background: var(--accent-subtle);
}

.nation-rank {
  width: 28px;
  font-size: var(--fs-sm);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.nation-stars {
  color: var(--gold);
  font-size: var(--fs-sm);
  letter-spacing: 1px;
}

.dim {
  color: var(--border-light);
}
</style>
