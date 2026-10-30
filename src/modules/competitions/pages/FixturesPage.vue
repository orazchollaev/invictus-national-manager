<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppEmptyState, AppTab, AppTabs } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatShort, monthName } from "@/i18n/dates"
import { compName } from "@/i18n/text"
import type { Fixture } from "@/engine/competition/types"

const { t } = useI18n()
const world = useWorldStore()

const tab = ref<"upcoming" | "results">("upcoming")

const fixtures = world.derive(
  (w) => (w.state.career.nationId ? w.fixturesOf(w.state.career.nationId) : []),
  [] as Fixture[]
)
const upcoming = computed(() => fixtures.value.filter((f) => !f.result))
const played = computed(() => fixtures.value.filter((f) => f.result).reverse())
const shown = computed(() => (tab.value === "upcoming" ? upcoming.value : played.value))

/** Fixtures grouped month by month, in the order the tab shows them. */
const months = computed(() => {
  const map = new Map<string, Fixture[]>()
  for (const f of shown.value) {
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

function comp(f: Fixture): string {
  if (f.compId === "friendly") return t("competitions.fixture.friendly")
  const inst = world.world?.state.competitions[f.compId]
  return inst ? compName(inst, "short") : ""
}

/** How the user's side fared, for the colour bar on a played match. */
function outcome(f: Fixture): "win" | "draw" | "loss" | null {
  const r = f.result
  if (!r || !world.me) return null
  const home = f.home === world.me
  let mine = home ? r.h : r.a
  let theirs = home ? r.a : r.h
  if (mine === theirs && r.pens) {
    mine = r.pens[home ? 0 : 1]
    theirs = r.pens[home ? 1 : 0]
  }
  return mine > theirs ? "win" : mine < theirs ? "loss" : "draw"
}

const link = (f: Fixture) => (f.result ? `/report/${f.id}` : `/match/${f.id}`)
</script>

<template>
  <PageShell :title="t('nav.fixtures')">
    <AppTabs v-model="tab">
      <AppTab value="upcoming">{{ t("nation.upcoming") }} · {{ upcoming.length }}</AppTab>
      <AppTab value="results">{{ t("nation.results") }} · {{ played.length }}</AppTab>
    </AppTabs>

    <template v-for="m in months" :key="m.key">
      <h2 class="month">{{ m.label }}</h2>
      <div class="list">
        <RouterLink
          v-for="f in m.list"
          :key="f.id"
          :to="link(f)"
          class="card"
          :class="outcome(f) && `card--${outcome(f)}`"
        >
          <span class="date">{{ formatShort(f.date) }}</span>
          <span class="teams">
            <span class="team" :class="{ 'team--me': f.home === world.me }">
              <NationFlag :id="f.home" :size="22" name="short" />
              <b v-if="f.result" class="goals">{{ f.result.h }}</b>
            </span>
            <span class="team" :class="{ 'team--me': f.away === world.me }">
              <NationFlag :id="f.away" :size="22" name="short" />
              <b v-if="f.result" class="goals">{{ f.result.a }}</b>
            </span>
          </span>
          <span class="meta">
            <span class="comp">{{ comp(f) }}</span>
            <small v-if="f.result?.pens" class="pens">{{ t("competitions.fixture.pens") }}</small>
            <small v-else-if="!f.result" class="pens">{{ t("competitions.fixture.vs") }}</small>
          </span>
        </RouterLink>
      </div>
    </template>

    <AppEmptyState v-if="!months.length" :title="t('nation.noFixtures')" />
  </PageShell>
</template>

<style scoped>
.month {
  margin: var(--sp-3) 0 var(--sp-2);
  padding-inline: var(--sp-1);
  font-size: var(--fs-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.card {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--border-light);
  border-inline-start: 4px solid var(--border-light);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.card:hover {
  text-decoration: none;
  color: var(--text);
}

.card:active {
  background: var(--bg-hover);
}

.card--win {
  border-inline-start-color: var(--success);
}

.card--draw {
  border-inline-start-color: var(--warning);
}

.card--loss {
  border-inline-start-color: var(--danger);
}

.date {
  flex-shrink: 0;
  width: 52px;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-muted);
}

.teams {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  font-size: var(--fs-base);
}

.team--me {
  font-weight: 700;
}

.goals {
  font-size: var(--fs-md);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.meta {
  flex-shrink: 0;
  max-width: 96px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  text-align: end;
}

.comp {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: var(--fs-xs);
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pens {
  color: var(--text-muted);
  font-size: var(--fs-xs);
}
</style>
