<script setup lang="ts">
import { computed } from "vue"
import { Trophy } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { AppSectionHeader } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { FixtureRow } from "@/modules/competitions/components/tables"
import { useWorldStore } from "@/modules/world/store"
import { formatDate, monthName } from "@/i18n/dates"
import { windowsForYear } from "@/engine/calendar/windows"
import { openWindows } from "@/engine/world/invitational"
import { compName } from "@/i18n/text"
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

/** Windows the user's nation is free to host a tournament in. */
const open = world.derive((w) => {
  const me = w.state.career.nationId
  return new Set(me ? openWindows(w, me).map((x) => x.id) : [])
}, new Set<string>())

/** The user's invitational tournament in each window, if any. */
const tournaments = world.derive((w) => {
  const me = w.state.career.nationId
  const out = new Map<string, { id: string; name: string }>()
  for (const c of Object.values(w.state.competitions))
    if (c.invitational && me && c.invitational.teams.includes(me))
      out.set(c.invitational.window, { id: c.id, name: compName(c, "short") })
  return out
}, new Map<string, { id: string; name: string }>())
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
        <span class="window-text">
          <strong>{{ formatDate(w.start) }} – {{ formatDate(w.end) }}</strong>
          <span class="muted">
            {{ t("competitions.calendar.matches", { n: w.slots.length }, w.slots.length) }}
          </span>
        </span>
        <RouterLink
          v-if="tournaments.get(w.id)"
          :to="`/competitions/${tournaments.get(w.id)!.id}`"
          class="host on"
        >
          <Trophy :size="14" />
          {{ tournaments.get(w.id)!.name }}
        </RouterLink>
        <RouterLink v-else-if="open.has(w.id)" :to="`/invitational?window=${w.id}`" class="host">
          <Trophy :size="14" />
          {{ t("competitions.calendar.host") }}
        </RouterLink>
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
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--surface);
  font-size: var(--fs-sm);
}

.window-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.host {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 4px var(--sp-2);
  border-radius: var(--radius-pill);
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: var(--fs-xs);
  font-weight: 700;
  text-decoration: none;
}

.host.on {
  border-color: var(--gold);
  background: var(--gold-faint);
  color: var(--text);
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
