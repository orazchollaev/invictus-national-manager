<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { Plus } from "@lucide/vue"
import { AppButton, AppPagination, AppSearchInput, AppSelect } from "@/components/ui"
import { POSITIONS } from "@/engine/types"
import { useModsStore } from "@/modules/mods/store"
import { ageOn, editFromRow, fold, type PlayerEdit } from "@/modules/mods/utils/format"
import PlayerSheet from "./PlayerSheet.vue"

const PAGE_SIZE = 50
const ALL = "ALL"

const { t } = useI18n()
const store = useModsStore()

const query = ref("")
const nation = ref(ALL)
const pos = ref(ALL)
const page = ref(1)
const editing = ref<PlayerEdit | null>(null)

const nationOptions = computed(() => [
  { value: ALL, label: t("mods.player.allNations") },
  ...store.nationOptions,
])
const posOptions = computed(() => [
  { value: ALL, label: t("mods.player.allPositions") },
  ...POSITIONS.map((p) => ({ value: p, label: p })),
])

// The list is already ordered best first, and each player carries his folded name.
const filtered = computed(() => {
  const q = fold(query.value.trim())
  return store.allPlayers.filter(
    ({ nationId, row, key }) =>
      (nation.value === ALL || nationId === nation.value) &&
      (pos.value === ALL || row[4] === pos.value) &&
      (!q || key.includes(q))
  )
})

const shown = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

watch([query, nation, pos], () => (page.value = 1))

function add() {
  const id = nation.value === ALL ? store.mod?.nations[0]?.id : nation.value
  if (id) editing.value = store.newPlayer(id)
}
</script>

<template>
  <div class="panel">
    <AppSearchInput v-model="query" :placeholder="t('mods.search')" />
    <div class="toolbar">
      <div class="grow"><AppSelect v-model="nation" :options="nationOptions" searchable /></div>
      <div class="pos-filter"><AppSelect v-model="pos" :options="posOptions" /></div>
    </div>
    <div class="toolbar">
      <span class="count grow">
        {{ t("mods.player.count", { n: filtered.length.toLocaleString() }) }}
      </span>
      <AppButton size="sm" variant="filled" @click="add">
        <Plus :size="14" />
        {{ t("mods.player.add") }}
      </AppButton>
    </div>
    <div class="list">
      <button
        v-for="{ nationId, row } in shown"
        :key="row[0]"
        class="row"
        @click="editing = editFromRow(nationId, row)"
      >
        <span class="row-pos">{{ row[4] }}</span>
        <span class="row-main">
          <span class="row-title">{{ row[1] }} {{ row[2] }}</span>
          <span class="row-sub">
            {{ nationId }} · {{ t("mods.player.age", { n: ageOn(row[3], store.today) }) }} ·
            {{ store.clubNames.get(row[10]) ?? row[10] }}
          </span>
        </span>
        <span class="row-sub">{{ row[8] }}</span>
        <span class="row-value">{{ Math.round(row[7]) }}</span>
      </button>
    </div>
    <AppPagination v-model="page" :total-items="filtered.length" :page-size="PAGE_SIZE" />
    <PlayerSheet v-if="editing" :player="editing" @close="editing = null" />
  </div>
</template>

<style scoped>
.pos-filter {
  width: 130px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
</style>
<style scoped src="./editor.css"></style>
