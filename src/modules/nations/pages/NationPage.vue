<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { PlayerRow } from "@/modules/squad/components/list"
import { FixtureRow } from "@/modules/competitions/components/tables"
import { compName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { COMPETITION_DEFS } from "@/engine/competition/defs"
import type { Fixture } from "@/engine/competition/types"
import type { Player } from "@/engine/types"

const { t } = useI18n()
const route = useRoute()
const world = useWorldStore()
const id = computed(() => String(route.params.id))
const def = world.derive((w) => w.defs.get(id.value) ?? null, null)
const nation = world.derive((w) => w.state.nations[id.value] ?? null, null)
const rank = world.derive((w) => w.fifaRank(id.value), 0)
const tab = ref("overview")

const squad = world.derive((w) => {
  const n = w.state.nations[id.value]
  const list = n?.squad.length ? n.squad.map((pid) => w.state.players[pid]).filter(Boolean) : []
  return list.sort((a, b) => b.ca - a.ca)
}, [] as Player[])
const pool = world.derive((w) => w.pool(id.value).sort((a, b) => b.ca - a.ca), [] as Player[])

const fixtures = world.derive((w) => w.fixturesOf(id.value), [] as Fixture[])
const upcoming = computed(() => fixtures.value.filter((f) => !f.result).slice(0, 6))
const played = computed(() =>
  fixtures.value
    .filter((f) => f.result)
    .reverse()
    .slice(0, 10)
)

const trophies = world.derive((w) => {
  const out: { name: string; years: number[] }[] = []
  for (const d of COMPETITION_DEFS) {
    const years = (w.state.honours[d.id] ?? [])
      .filter((h) => h.winner === id.value)
      .map((h) => h.year)
    if (years.length) out.push({ name: compName({ defId: d.id, year: 0 }, "short"), years })
  }
  return out
}, [])

const record = computed(() => {
  const r = nation.value?.results ?? []
  return {
    w: r.filter((x) => x.gf > x.ga || x.pens === "W").length,
    d: r.filter((x) => x.gf === x.ga && !x.pens).length,
    l: r.filter((x) => x.gf < x.ga || x.pens === "L").length,
  }
})
</script>

<template>
  <PageShell
    v-if="def && nation"
    back
    :title="$nation(def.id)"
    :subtitle="
      t('nation.subtitle', {
        confed: def.confed,
        detail: rank
          ? t('nation.ranked', { rank, points: nation.points.toFixed(0) })
          : t('nation.notFifa'),
      })
    "
  >
    <AppCard padding="md" class="head">
      <NationFlag :id="def.id" :size="56" />
      <div class="facts">
        <div>
          <span class="muted">{{ t("nation.federation") }}</span>
          {{ t("nation.federationLine", { rep: nation.reputation.toFixed(1) }) }}
          <RouterLink :to="`/stadiums/${def.id}`" class="stadiums-link">
            {{
              t("nation.stadiums", {
                stars: "★".repeat(nation.stadium) + "☆".repeat(5 - nation.stadium),
              })
            }}
          </RouterLink>
        </div>
        <div>
          <span class="muted">{{ t("nation.coach") }}</span>
          {{ nation.coach }}
        </div>
        <div>
          <span class="muted">{{ t("nation.last", { n: nation.results.length }) }}</span>
          {{ t("nation.record", record) }}
        </div>
        <div v-if="trophies.length" class="trophies">
          <StatPill
            v-for="tr in trophies"
            :key="tr.name"
            :value="`${tr.name} ×${tr.years.length}`"
            tone="var(--gold)"
            wide
          />
        </div>
      </div>
    </AppCard>

    <AppSubTabBar
      :model-value="tab"
      :options="[
        { value: 'overview', label: t('nation.fixtures') },
        { value: 'squad', label: t('nation.squad') },
        { value: 'pool', label: t('nation.players') },
      ]"
      size="sm"
      @update:model-value="(v) => (tab = v)"
    />

    <template v-if="tab === 'overview'">
      <template v-if="upcoming.length">
        <AppSectionHeader :title="t('nation.upcoming')" />
        <div class="list">
          <FixtureRow v-for="f in upcoming" :key="f.id" :fixture="f" show-date show-comp />
        </div>
      </template>
      <template v-if="played.length">
        <AppSectionHeader :title="t('nation.results')" />
        <div class="list">
          <FixtureRow v-for="f in played" :key="f.id" :fixture="f" show-date show-comp />
        </div>
      </template>
      <AppEmptyState v-if="!upcoming.length && !played.length" :title="t('nation.noFixtures')" />
    </template>

    <div v-else class="list">
      <PlayerRow v-for="p in tab === 'squad' ? squad : pool" :key="p.id" :player="p" />
      <AppEmptyState v-if="tab === 'squad' && !squad.length" :title="t('nation.noSquad')" />
    </div>
  </PageShell>
  <PageShell v-else back :title="t('nation.title')">
    <AppEmptyState :title="t('nation.notFound')" />
  </PageShell>
</template>

<style scoped>
.stadiums-link {
  color: var(--accent);
  text-decoration: none;
}

.head :deep(.card-body) {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
}

.facts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--fs-sm);
}

.muted {
  color: var(--text-muted);
  margin-inline-end: 6px;
}

.trophies {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}
</style>
