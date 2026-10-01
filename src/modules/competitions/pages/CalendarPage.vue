<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppSectionHeader } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { FixtureRow } from "@/modules/competitions/components/tables"
import { useWorldStore } from "@/modules/world/store"
import { formatDate, monthName } from "@/i18n/dates"
import { windowsForYear } from "@/engine/calendar/windows"
import type { Fixture } from "@/engine/competition/types"

const { t } = useI18n()
const world = useWorldStore()

/** The user's fixtures, past and future, month by month — newest first. */
const fixtures = world.derive(
  (w) => (w.state.career.nationId ? w.fixturesOf(w.state.career.nationId).reverse() : []),
  [] as Fixture[]
)

const months = computed(() => {
  const map = new Map<string, Fixture[]>()
  for (const f of fixtures.value) {
    const key = f.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(f)
  }
  return [...map.entries()].map(([key, list]) => ({
    key,
    label: `${monthName(Number(key.slice(5)))} ${key.slice(0, 4)}`,
    list,
  }))
})

const windows = computed(() => {
  const y = Number(world.date.slice(0, 4))
  return [...windowsForYear(y), ...windowsForYear(y + 1)]
    .filter((w) => w.end >= world.date)
    .slice(0, 6)
})
</script>

<template>
  <PageShell
    back
    :title="t('competitions.calendar.title')"
    :subtitle="t('competitions.calendar.subtitle')"
  >
    <AppSectionHeader :title="t('competitions.calendar.windows')" />
    <div class="windows">
      <div v-for="w in windows" :key="w.id" class="window">
        <strong>{{ formatDate(w.start) }} – {{ formatDate(w.end) }}</strong>
        <span class="muted">
          {{ t("competitions.calendar.matches", { n: w.slots.length }, w.slots.length) }}
        </span>
      </div>
    </div>
    <template v-for="m in months" :key="m.key">
      <AppSectionHeader :title="m.label" />
      <div class="list">
        <FixtureRow v-for="f in m.list" :key="f.id" :fixture="f" show-date show-comp />
      </div>
    </template>
  </PageShell>
</template>

<style scoped>
.windows {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: var(--radius);
  background: var(--border-light);
  overflow: hidden;
}

.window {
  display: flex;
  justify-content: space-between;
  padding: var(--sp-2) var(--sp-3);
  background: var(--surface);
  font-size: var(--fs-sm);
}

.muted {
  color: var(--text-muted);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}
</style>
