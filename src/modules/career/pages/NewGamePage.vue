<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import {
  AppButton,
  AppButtonGroup,
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
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { CONFEDS, type Confed } from "@/engine/types"

const { t } = useI18n()
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
/** Take a job now, or start out of work and wait for offers. */
const mode = ref<"job" | "free">("job")

/** Starting reputations out of work: it decides which federations call first. */
const REPUTATIONS = computed(() => [
  {
    value: "25",
    label: t("career.newGame.reputation.unknown"),
    hint: t("career.newGame.reputation.unknownHint"),
  },
  {
    value: "50",
    label: t("career.newGame.reputation.promising"),
    hint: t("career.newGame.reputation.promisingHint"),
  },
  {
    value: "75",
    label: t("career.newGame.reputation.respected"),
    hint: t("career.newGame.reputation.respectedHint"),
  },
  {
    value: "95",
    label: t("career.newGame.reputation.elite"),
    hint: t("career.newGame.reputation.eliteHint"),
  },
])
const reputation = ref("50")
const reputationHint = computed(
  () => REPUTATIONS.value.find((r) => r.value === reputation.value)?.hint
)

const byPoints = [...NATION_DEFS].filter((n) => !n.banned).sort((a, b) => b.points - a.points)
const strengthOf = new Map(byPoints.map((n, i) => [n.id, i + 1]))
/** FIFA ranking position; teams outside FIFA have none. */
const rankOf = new Map(byPoints.filter((n) => !n.nonFifa).map((n, i) => [n.id, i + 1]))

const nationalityOptions = computed(() =>
  [...NATION_DEFS]
    .map((n) => ({ value: n.id, label: nationName(n.id) }))
    .sort((a, b) => a.label.localeCompare(b.label))
)

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  return byPoints.filter((n) =>
    q
      ? n.name.toLowerCase().includes(q) || nationName(n.id).toLowerCase().includes(q)
      : n.confed === confed.value
  )
})

/** Stars for how big a job it is, from the team's strength. */
function stars(id: string) {
  const r = strengthOf.get(id) ?? byPoints.length
  return r <= 10 ? 5 : r <= 30 ? 4 : r <= 70 ? 3 : r <= 130 ? 2 : 1
}

const TITLES = [
  ["career.newGame.slotTitle", "career.newGame.slotSubtitle"],
  ["career.newGame.managerTitle", "career.newGame.managerSubtitle"],
  ["career.newGame.nationTitle", "career.newGame.nationSubtitle"],
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

const canStart = computed(
  () => name.value.trim().length >= 2 && (mode.value === "free" || !!chosen.value)
)

const startLabel = computed(() => {
  if (mode.value === "free") return t("career.newGame.startFree")
  return chosen.value
    ? t("career.newGame.takeCharge", { name: nationName(chosen.value) })
    : t("career.newGame.pickNation")
})

async function start() {
  if (!canStart.value || !slot.value) return
  const free = mode.value === "free"
  await world.newGame(slot.value, {
    managerName: name.value.trim(),
    nationality: nationality.value,
    nationId: free ? null : chosen.value,
    reputation: free ? Number(reputation.value) : undefined,
  })
  router.replace("/home")
}
</script>

<template>
  <PageShell :title="t(TITLES[step][0])" :subtitle="t(TITLES[step][1])" :on-back="back" back>
    <SlotList v-if="step === 0" mode="new" @pick="pickSlot" />

    <template v-else-if="step === 1">
      <AppCard padding="md" class="form">
        <AppField :label="t('career.newGame.yourName')" layout="stack">
          <input
            v-model="name"
            class="input"
            maxlength="32"
            :placeholder="t('career.newGame.managerName')"
            autocomplete="off"
          />
        </AppField>
        <AppField :label="t('career.newGame.nationality')" layout="stack">
          <AppSelect
            v-model="nationality"
            :options="nationalityOptions"
            searchable
            :search-placeholder="t('career.newGame.searchNations')"
          >
            <template #value="{ option }">
              <NationFlag v-if="option" :id="option.value" :size="20" name class="select-nation" />
            </template>
            <template #option="{ option }">
              <NationFlag :id="option.value" :size="20" name class="select-nation" />
            </template>
          </AppSelect>
        </AppField>
      </AppCard>
      <AppButton variant="filled" block :disabled="name.trim().length < 2" @click="step = 2">
        {{ t("common.next") }}
      </AppButton>
    </template>

    <template v-else>
      <AppButtonGroup
        :model-value="mode"
        block
        :options="[
          { value: 'job', label: t('career.newGame.takeJob') },
          { value: 'free', label: t('career.newGame.startFree') },
        ]"
        @update:model-value="(v) => (mode = v as 'job' | 'free')"
      />

      <AppCard v-if="mode === 'free'" padding="md" class="form">
        <AppField :label="t('career.newGame.yourReputation')" layout="stack">
          <AppButtonGroup
            :model-value="reputation"
            block
            :options="REPUTATIONS.map((r) => ({ value: r.value, label: r.label }))"
            @update:model-value="(v) => (reputation = v as string)"
          />
        </AppField>
        <p class="hint">
          {{ t("career.newGame.offersHint", { hint: reputationHint }) }}
        </p>
      </AppCard>

      <template v-else>
        <AppSearchInput v-model="query" :placeholder="t('career.newGame.searchAll')" />
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
            <span class="nation-rank">{{ rankOf.get(n.id) ?? "—" }}</span>
            <NationFlag :id="n.id" :size="28" name />
            <span class="nation-stars">{{ "★".repeat(stars(n.id)) }}</span>
          </button>
        </div>
      </template>
      <StickyCta>
        <AppButton variant="filled" block :disabled="!canStart" @click="start">
          {{ startLabel }}
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

.hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.select-nation {
  min-width: 0;
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
