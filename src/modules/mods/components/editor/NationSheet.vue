<script setup lang="ts">
import { computed, reactive, ref, toRaw } from "vue"
import { useI18n } from "vue-i18n"
import { Minus, Plus, Trash2, X } from "@lucide/vue"
import {
  AppButton,
  AppColorPicker,
  AppField,
  AppNumberInput,
  AppSelect,
  AppSheet,
  AppToggle,
} from "@/components/ui"
import { CONFEDS, type NationDef } from "@/engine/types"
import { flagCodes, flagUrl } from "@/lib/flags"
import { useModsStore } from "@/modules/mods/store"
import { rankings } from "@/modules/mods/utils/format"

const props = defineProps<{ nation: NationDef }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useModsStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const draft = reactive<NationDef>(structuredClone(toRaw(props.nation)))
draft.grounds ??= []
draft.cities ??= []
/** Ability points to add to every player when saved. */
const shift = ref(0)
const newCity = ref("")

const FLAGS = flagCodes().map((c) => ({ value: c, label: c }))
const CONFED_OPTIONS = CONFEDS.map((c) => ({ value: c, label: c }))

const status = computed<string>({
  get: () => draft.nonFifa ?? "fifa",
  set: (v: string) => (draft.nonFifa = v === "fifa" ? undefined : (v as NationDef["nonFifa"])),
})
const STATUS = computed(() => [
  { value: "fifa", label: t("mods.nation.fifa") },
  { value: "confederation", label: t("mods.nation.nonFifaConfed") },
  { value: "regional", label: t("mods.nation.nonFifaRegional") },
])

const banned = computed({
  get: () => !!draft.banned,
  set: (v: boolean) => (draft.banned = v || undefined),
})

const rank = computed(() => {
  const all = store.mod?.nations.map((n) => (n.id === draft.id ? { ...draft } : n)) ?? []
  return rankings(all).get(draft.id)
})

/** Average ability of the best 23, with the pending shift. */
const average = computed(() => {
  const rows = store.mod?.players[draft.id] ?? []
  const best = rows
    .map((r) => r[7])
    .sort((a, b) => b - a)
    .slice(0, 23)
  if (!best.length) return 0
  const avg = best.reduce((a, b) => a + b, 0) / best.length
  return Math.round(Math.max(1, Math.min(99, avg + shift.value)) * 10) / 10
})

function addGround() {
  draft.grounds!.push({ city: draft.cities?.[0] ?? "", name: "", capacity: 10000 })
}

function addCity() {
  const c = newCity.value.trim()
  if (c && !draft.cities!.includes(c)) draft.cities!.push(c)
  newCity.value = ""
}

function save() {
  const def: NationDef = structuredClone(toRaw(draft))
  def.name = def.name.trim() || props.nation.name
  def.points = Math.round(Math.max(0, Math.min(3000, Number(def.points) || 0)) * 100) / 100
  def.grounds = def
    .grounds!.map((g) => ({
      city: g.city.trim(),
      name: g.name.trim(),
      capacity: Math.round(Math.max(500, Math.min(200000, Number(g.capacity) || 0))),
    }))
    .filter((g) => g.city && g.name)
    .sort((a, b) => b.capacity - a.capacity)
  store.saveNation(def)
  store.shiftSquad(def.id, shift.value)
  sheet.value?.close()
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="nation.name"
    :subtitle="nation.id"
    max-height="90dvh"
    max-height-mobile="92dvh"
    :dismiss-on-outside-click="false"
    @close="emit('close')"
  >
    <div class="form">
      <div class="grid2">
        <AppField :label="t('mods.nation.name')" layout="stack">
          <input v-model="draft.name" class="input" maxlength="40" autocomplete="off" />
        </AppField>
        <AppField :label="t('mods.nation.flag')" layout="stack">
          <AppSelect v-model="draft.flag" :options="FLAGS" searchable>
            <template #value="{ option }">
              <span v-if="option" class="flag-option">
                <img :src="flagUrl(option.value)" width="18" height="18" alt="" class="flag" />
                {{ option.value }}
              </span>
            </template>
            <template #option="{ option }">
              <span class="flag-option">
                <img
                  :src="flagUrl(option.value)"
                  width="18"
                  height="18"
                  alt=""
                  class="flag"
                  loading="lazy"
                />
                {{ option.value }}
              </span>
            </template>
          </AppSelect>
        </AppField>
      </div>

      <AppField :label="t('mods.nation.color')" layout="stack">
        <AppColorPicker v-model="draft.color" />
      </AppField>

      <div class="grid2">
        <AppField :label="t('mods.nation.points')" layout="stack">
          <input
            v-model.number="draft.points"
            class="input"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            max="3000"
          />
        </AppField>
        <AppField :label="t('mods.nation.confed')" layout="stack">
          <AppSelect v-model="draft.confed" :options="CONFED_OPTIONS" />
        </AppField>
      </div>
      <p class="hint">
        {{ rank ? t("mods.nation.rank", { rank }) : t("mods.nation.noRank") }}
        <template v-if="draft.confed !== nation.confed">{{ t("mods.nation.confedHint") }}</template>
      </p>

      <AppField :label="t('mods.nation.youth')" :hint="t('mods.nation.youthHint')">
        <AppNumberInput v-model="draft.youthLevel" :min="1" :max="100" editable />
      </AppField>

      <AppField :label="t('mods.nation.status')" layout="stack">
        <AppSelect v-model="status" :options="STATUS" />
      </AppField>
      <AppField :label="t('mods.nation.banned')">
        <AppToggle v-model="banned" :aria-label="t('mods.nation.banned')" />
      </AppField>

      <h3 class="section">{{ t("mods.nation.squad") }}</h3>
      <p class="hint">{{ t("mods.nation.squadHint", { avg: average }) }}</p>
      <div class="shift">
        <AppButton size="sm" variant="tonal" @click="shift -= 5">−5</AppButton>
        <AppButton size="sm" variant="tonal" icon-only aria-label="-1" @click="shift -= 1">
          <Minus :size="14" />
        </AppButton>
        <span class="shift-value">{{ shift > 0 ? `+${shift}` : shift }}</span>
        <AppButton size="sm" variant="tonal" icon-only aria-label="+1" @click="shift += 1">
          <Plus :size="14" />
        </AppButton>
        <AppButton size="sm" variant="tonal" @click="shift += 5">+5</AppButton>
      </div>

      <h3 class="section">{{ t("mods.nation.grounds") }}</h3>
      <div v-for="(g, i) in draft.grounds" :key="i" class="ground">
        <input
          v-model="g.name"
          class="input ground-name"
          :placeholder="t('mods.nation.stadium')"
          :aria-label="t('mods.nation.stadium')"
          maxlength="60"
        />
        <input
          v-model="g.city"
          class="input"
          :placeholder="t('mods.nation.city')"
          :aria-label="t('mods.nation.city')"
          maxlength="40"
        />
        <input
          v-model.number="g.capacity"
          class="input"
          type="number"
          inputmode="numeric"
          min="500"
          max="200000"
          step="500"
          :aria-label="t('mods.nation.capacity')"
        />
        <AppButton
          size="sm"
          variant="text"
          icon-only
          :aria-label="t('common.delete')"
          @click="draft.grounds!.splice(i, 1)"
        >
          <Trash2 :size="14" />
        </AppButton>
      </div>
      <AppButton size="sm" variant="outlined" @click="addGround">
        <Plus :size="14" />
        {{ t("mods.nation.addGround") }}
      </AppButton>

      <h3 class="section">{{ t("mods.nation.cities") }}</h3>
      <p class="hint">{{ t("mods.nation.citiesHint") }}</p>
      <div class="chips">
        <span v-for="(c, i) in draft.cities" :key="c" class="chip">
          {{ c }}
          <button
            class="chip-x"
            :aria-label="t('common.delete')"
            @click="draft.cities!.splice(i, 1)"
          >
            <X :size="12" />
          </button>
        </span>
      </div>
      <div class="add-city">
        <input
          v-model="newCity"
          class="input"
          maxlength="40"
          :placeholder="t('mods.nation.cityPlaceholder')"
          @keydown.enter="addCity"
        />
        <AppButton size="sm" variant="outlined" @click="addCity">
          {{ t("mods.nation.addCity") }}
        </AppButton>
      </div>
    </div>
    <template #footer>
      <div class="sheet-actions">
        <AppButton variant="tonal" block @click="sheet?.close()">
          {{ t("common.cancel") }}
        </AppButton>
        <AppButton variant="filled" block @click="save">{{ t("common.save") }}</AppButton>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.flag-option {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1-5);
}

.shift {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.shift-value {
  min-width: 36px;
  text-align: center;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.ground {
  display: grid;
  grid-template-columns: 1fr 104px auto;
  gap: var(--sp-1);
  align-items: center;
}

.ground-name {
  grid-column: 1 / -1;
}

.ground:not(:last-of-type) {
  padding-bottom: var(--sp-2);
  border-bottom: 1px dashed var(--border-light);
}

.chip-x {
  display: inline-flex;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-muted);
}

.add-city {
  display: flex;
  gap: var(--sp-2);
}
</style>
<style scoped src="./editor.css"></style>
