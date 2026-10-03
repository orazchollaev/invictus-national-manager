<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue"
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
  AppToggle,
} from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import { PersonFace } from "@/modules/core/components/face"
import { NationFlag } from "@/modules/nations/components/badge"
import { SlotList } from "@/modules/career/components/slots"
import { NATION_DEFS, setActiveNations } from "@/modules/world/services/statics"
import { listMods, loadMod } from "@/modules/mods/services/mods"
import type { ModMeta } from "@/modules/mods/utils/format"
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { CONFEDS, type Confed, type NationDef } from "@/engine/types"

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
/** The board never sacks the manager and his contract never runs out. */
const jobSecurity = ref(false)

/** Eight random faces to choose from, drawn when the screen opens. */
const FACE_CHOICES = 8
const batch = Math.floor(Math.random() * 1e9)
const faceKeys = Array.from({ length: FACE_CHOICES }, (_, i) => `manager:${batch}:${i}`)
const face = ref(faceKeys[0])

/** The manager as the faces are drawn: what he has typed and where he is from. */
const preview = (key: string) => ({
  name: name.value.trim(),
  nationality: nationality.value,
  nationId: null,
  seed: 0,
  face: key,
})

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

/** The dataset the career starts from: the original, or a mod. */
const ORIGINAL = "original"
const mods = ref<ModMeta[]>([])
const dataset = ref<string>(typeof route.query.mod === "string" ? route.query.mod : ORIGINAL)
const nations = shallowRef<NationDef[]>(NATION_DEFS)

const datasetOptions = computed(() => [
  { value: ORIGINAL, label: t("career.newGame.original") },
  ...mods.value.map((m) => ({ value: m.id, label: m.name })),
])

async function pickDataset(id: string) {
  dataset.value = id
  const mod = id === ORIGINAL ? null : await loadMod(id)
  if (dataset.value !== id) return
  if (id !== ORIGINAL && !mod) dataset.value = ORIGINAL
  nations.value = mod?.nations ?? NATION_DEFS
  // Flags and names on this screen follow the chosen data.
  setActiveNations(mod?.nations ?? null)
  if (chosen.value && !nations.value.some((n) => n.id === chosen.value && !n.banned))
    chosen.value = null
}

onMounted(async () => {
  mods.value = await listMods()
  if (dataset.value !== ORIGINAL) await pickDataset(dataset.value)
})

// Leaving without starting: back to the data of whatever career is loaded.
onUnmounted(() => setActiveNations(world.mod?.nations ?? null))

const byPoints = computed(() =>
  [...nations.value].filter((n) => !n.banned).sort((a, b) => b.points - a.points)
)
const strengthOf = computed(() => new Map(byPoints.value.map((n, i) => [n.id, i + 1])))
/** FIFA ranking position; teams outside FIFA have none. */
const rankOf = computed(
  () => new Map(byPoints.value.filter((n) => !n.nonFifa).map((n, i) => [n.id, i + 1]))
)

const nationalityOptions = computed(() =>
  [...nations.value]
    .map((n) => ({ value: n.id, label: nationName(n.id) }))
    .sort((a, b) => a.label.localeCompare(b.label))
)

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  return byPoints.value.filter((n) =>
    q
      ? n.name.toLowerCase().includes(q) || nationName(n.id).toLowerCase().includes(q)
      : n.confed === confed.value
  )
})

/** Stars for how big a job it is, from the team's strength. */
function stars(id: string) {
  const r = strengthOf.value.get(id) ?? byPoints.value.length
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
    face: face.value,
    jobSecurity: jobSecurity.value,
    modId: dataset.value === ORIGINAL ? null : dataset.value,
  })
  router.replace("/home")
}
</script>

<template>
  <PageShell :title="t(TITLES[step][0])" :subtitle="t(TITLES[step][1])" :on-back="back" back>
    <SlotList v-if="step === 0" mode="new" @pick="pickSlot" />

    <template v-else-if="step === 1">
      <AppCard padding="md" class="form">
        <AppField :label="t('career.newGame.dataset')" layout="stack">
          <div class="dataset">
            <div class="dataset-select">
              <AppSelect
                style="width: 100%"
                :model-value="dataset"
                :options="datasetOptions"
                @update:model-value="pickDataset"
              />
            </div>
            <AppButton variant="text" size="sm" @click="router.push('/mods')">
              {{ t("career.newGame.editMods") }}
            </AppButton>
          </div>
        </AppField>
        <!-- <p class="hint">{{ t("career.newGame.datasetHint") }}</p> -->
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
        <AppField :label="t('career.newGame.avatar')" layout="stack">
          <div class="faces">
            <button
              v-for="key in faceKeys"
              :key="key"
              type="button"
              class="face-pick"
              :class="{ 'face-pick--on': face === key }"
              :aria-pressed="face === key"
              :aria-label="t('career.newGame.avatar')"
              @click="face = key"
            >
              <PersonFace :manager="preview(key)" :size="56" head />
            </button>
          </div>
        </AppField>
        <AppField
          :label="t('career.newGame.jobSecurity')"
          :description="t('career.newGame.jobSecurityHint')"
          layout="split"
        >
          <AppToggle v-model="jobSecurity" :aria-label="t('career.newGame.jobSecurity')" />
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

.dataset {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--sp-2);

  :deep(.asel-trigger) {
    width: 100%;
  }
}

.dataset-select {
  flex: 1;
  min-width: 0;
}

.faces {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-2);
  justify-items: center;
}

.face-pick {
  padding: 2px;
  border: 2px solid transparent;
  border-radius: var(--radius);
  background: none;
  line-height: 0;
}

.face-pick--on {
  border-color: var(--accent);
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
