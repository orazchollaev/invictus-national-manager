<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { CalendarDays, ListOrdered, Medal } from "@lucide/vue"
import { AppButton, AppCard, AppChip, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatShort } from "@/i18n/dates"
import type { CompetitionInstance } from "@/engine/competition/types"
import { competitionDef } from "@/engine/competition/defs"
import { AWARDED_HOSTS } from "@/data/start"

const { t } = useI18n()
const world = useWorldStore()
const filter = ref("all")

function involves(c: CompetitionInstance, id: string | null) {
  if (!id) return false
  return c.stages.some(
    (s) =>
      s.groups?.some((g) => g.teams.includes(id)) ||
      s.rounds?.some((r) => r.ties.some((t) => t.home === id || t.away === id))
  )
}

const all = world.derive((w) => Object.values(w.state.competitions), [] as CompetitionInstance[])
const mine = computed(() =>
  all.value
    .filter((c) => c.status !== "done" && involves(c, world.me))
    .sort((a, b) => (a.start < b.start ? -1 : 1))
)
const byFilter = (c: CompetitionInstance) => filter.value === "all" || c.confed === filter.value
const active = computed(() =>
  all.value
    .filter((c) => c.status === "active" && byFilter(c) && !mine.value.includes(c))
    .sort((a, b) => (a.end < b.end ? -1 : 1))
)
const upcoming = computed(() =>
  all.value
    .filter((c) => c.status === "upcoming" && byFilter(c))
    .sort((a, b) => (a.start < b.start ? -1 : 1))
    .slice(0, 20)
)
const finished = computed(() =>
  all.value
    .filter((c) => c.status === "done" && byFilter(c))
    .sort((a, b) => (a.end > b.end ? -1 : 1))
    .slice(0, 20)
)

/** The host's flag, or for a qualifier the finals' host. */
function hostOf(c: CompetitionInstance): string | undefined {
  if (c.hosts[0]) return c.hosts[0]
  const id = competitionDef(c.defId).finals?.(c.year)
  if (!id) return undefined
  return world.world?.state.competitions[id]?.hosts[0] ?? AWARDED_HOSTS[id]?.[0]
}
</script>

<template>
  <PageShell :title="t('competitions.title')">
    <div class="links">
      <AppButton variant="tonal" @click="$router.push('/rankings')">
        <ListOrdered :size="16" />
        {{ t("competitions.list.ranking") }}
      </AppButton>
      <AppButton variant="tonal" @click="$router.push('/calendar')">
        <CalendarDays :size="16" />
        {{ t("competitions.list.calendar") }}
      </AppButton>
      <AppButton variant="tonal" @click="$router.push('/honours')">
        <Medal :size="16" />
        {{ t("competitions.list.honours") }}
      </AppButton>
    </div>

    <template v-if="mine.length">
      <AppSectionHeader :title="t('competitions.list.yours')" />
      <RouterLink v-for="c in mine" :key="c.id" :to="`/competitions/${c.id}`" class="comp">
        <AppCard padding="md" interactive>
          <div class="comp-row">
            <div class="comp-text">
              <div class="comp-name">{{ $comp(c) }}</div>
              <div class="muted">
                {{ formatShort(c.start) }} – {{ formatShort(c.end) }} {{ c.end.slice(0, 4) }}
              </div>
            </div>
            <AppChip :variant="c.status === 'active' ? 'live' : 'neutral'">
              {{ c.status === "active" ? t("common.live") : t("competitions.list.soon") }}
            </AppChip>
          </div>
        </AppCard>
      </RouterLink>
    </template>

    <AppSubTabBar
      :model-value="filter"
      :options="
        ['all', 'FIFA', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'].map((v) => ({
          value: v,
          label: v === 'all' ? t('common.all') : v === 'FIFA' ? t('competitions.ranking.world') : v,
        }))
      "
      @update:model-value="(v) => (filter = v)"
    />

    <template
      v-for="[title, list] in [
        [t('competitions.list.inProgress'), active],
        [t('competitions.list.comingUp'), upcoming],
        [t('competitions.list.finished'), finished],
      ] as const"
      :key="title"
    >
      <template v-if="list.length">
        <AppSectionHeader :title="title" />
        <div class="list">
          <RouterLink v-for="c in list" :key="c.id" :to="`/competitions/${c.id}`" class="row">
            <div class="row-text">
              <div class="row-name">{{ $comp(c) }}</div>
              <div class="muted">
                {{ t(`competitions.list.kind.${c.kind}`) }} · {{ formatShort(c.start) }}
                {{ c.start.slice(0, 4) }}
              </div>
            </div>
            <NationFlag v-if="c.outcome.winner" :id="c.outcome.winner" :size="22" />
            <NationFlag v-else-if="hostOf(c)" :id="hostOf(c)!" :size="18" />
          </RouterLink>
        </div>
      </template>
    </template>
  </PageShell>
</template>

<style scoped>
.links {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.comp {
  color: inherit;
  text-decoration: none;
}

.comp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.comp-name {
  font-weight: 700;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.row-text {
  flex: 1;
  min-width: 0;
}

.row-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
