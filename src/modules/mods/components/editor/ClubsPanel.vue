<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { Plus } from "@lucide/vue"
import { AppButton, AppSearchInput, AppSelect } from "@/components/ui"
import { useModsStore } from "@/modules/mods/store"
import type { ClubEdit } from "@/modules/mods/utils/format"
import ClubSheet from "./ClubSheet.vue"

const { t } = useI18n()
const store = useModsStore()

const query = ref("")
const nation = ref(store.mod?.nations[0]?.id ?? "ESP")
const editing = ref<ClubEdit | null>(null)

const nationOptions = store.derive(
  (m) =>
    [...m.nations]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((n) => ({ value: n.id, label: n.name })),
  []
)

// A fresh array each time: the clubs are edited in place, and a computed that
// returns the same array would not tell the list anything changed.
const list = store.derive((m) => [...m.clubs], [])
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return list.value
    .filter((c) => (q ? c[1].toLowerCase().includes(q) : c[2] === nation.value))
    .sort((a, b) => a[3] - b[3] || a[1].localeCompare(b[1]))
})

function open(c: (typeof list.value)[number]) {
  editing.value = { id: c[0], name: c[1], nationId: c[2], tier: c[3] }
}
</script>

<template>
  <div class="panel">
    <AppSearchInput v-model="query" :placeholder="t('mods.search')" />
    <div class="toolbar">
      <div v-if="!query" class="grow">
        <AppSelect v-model="nation" :options="nationOptions" searchable />
      </div>
      <span v-else class="count grow">{{ shown.length }}</span>
      <AppButton size="sm" variant="filled" @click="editing = store.newClub(nation)">
        <Plus :size="14" />
        {{ t("mods.club.add") }}
      </AppButton>
    </div>
    <div class="list">
      <button v-for="c in shown" :key="c[0]" class="row" @click="open(c)">
        <span class="row-num">{{ c[3] }}</span>
        <span class="row-main">
          <span class="row-title">{{ c[1] }}</span>
          <span class="row-sub">
            {{ c[2] }} · {{ t("mods.club.players", { n: store.clubCounts.get(c[0]) ?? 0 }) }}
          </span>
        </span>
      </button>
    </div>
    <ClubSheet v-if="editing" :club="editing" @close="editing = null" />
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
</style>
<style scoped src="./editor.css"></style>
