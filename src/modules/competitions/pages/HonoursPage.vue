<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { compName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { COMPETITION_DEFS } from "@/engine/competition/defs"

const { t } = useI18n()
const world = useWorldStore()
const honours = world.derive((w) => w.state.honours, {})

const sections = computed(() =>
  COMPETITION_DEFS.filter((d) => honours.value[d.id]?.length).map((d) => ({
    id: d.id,
    name: compName({ defId: d.id, year: 0 }, "plain"),
    rows: [...honours.value[d.id]].reverse(),
  }))
)
</script>

<template>
  <PageShell
    back
    :title="t('competitions.honours.title')"
    :subtitle="t('competitions.honours.subtitle')"
  >
    <AppEmptyState v-if="!sections.length" :title="t('competitions.honours.empty')" />
    <template v-for="s in sections" :key="s.id">
      <AppSectionHeader :title="s.name" />
      <div class="list">
        <RouterLink v-for="h in s.rows" :key="h.comp" :to="`/competitions/${h.comp}`" class="row">
          <span class="year">{{ h.year }}</span>
          <span class="winner"><NationFlag :id="h.winner" :size="20" name /></span>
          <span v-if="h.runnerUp" class="runner">
            <NationFlag :id="h.runnerUp" :size="16" name="short" />
          </span>
        </RouterLink>
      </div>
    </template>
  </PageShell>
</template>

<style scoped>
.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.year {
  width: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.winner {
  flex: 1;
  min-width: 0;
  display: flex;
  font-weight: 600;
}

.runner {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}
</style>
