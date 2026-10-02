<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppSearchInput, AppSubTabBar } from "@/components/ui"
import { CONFEDS, type Confed, type NationDef } from "@/engine/types"
import { useModsStore } from "@/modules/mods/store"
import { rankings } from "@/modules/mods/utils/format"
import ModNation from "./ModNation.vue"
import NationSheet from "./NationSheet.vue"

const { t } = useI18n()
const store = useModsStore()

const query = ref("")
const confed = ref<Confed>("UEFA")
const editing = ref<NationDef | null>(null)

const byPoints = store.derive((m) => [...m.nations].sort((a, b) => b.points - a.points), [])
const ranks = store.derive((m) => rankings(m.nations), new Map<string, number>())

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  return byPoints.value.filter((n) =>
    q ? n.name.toLowerCase().includes(q) || n.id.toLowerCase() === q : n.confed === confed.value
  )
})
</script>

<template>
  <div class="panel">
    <AppSearchInput v-model="query" :placeholder="t('mods.search')" />
    <AppSubTabBar
      v-if="!query"
      :model-value="confed"
      :options="CONFEDS.map((c) => ({ value: c, label: c }))"
      size="sm"
      @update:model-value="(v) => (confed = v as Confed)"
    />
    <div class="list">
      <button v-for="n in list" :key="n.id" class="row" @click="editing = n">
        <span class="row-num">{{ ranks.get(n.id) ?? "—" }}</span>
        <span class="row-main">
          <ModNation :nation="n" class="row-title" />
        </span>
        <span class="row-sub">{{ n.youthLevel }}</span>
        <span class="row-value">{{ Math.round(n.points) }}</span>
      </button>
    </div>
    <NationSheet v-if="editing" :nation="editing" @close="editing = null" />
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
