<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import {
  AppChip,
  AppEmptyState,
  AppListItem,
  AppSearchInput,
  AppSelect,
  AppSubTabBar,
} from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { ClubCrest } from "@/modules/clubs/components/club"
import { moodKey } from "@/modules/clubs/utils/format"
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"

/** Rows drawn for an open search, so the whole world is never in the page at once. */
const LIMIT = 60

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

const tab = ref<"mine" | "all">("mine")
const query = ref("")
/** The select cannot hold an empty value, so "every league" has its own. */
const EVERY = "*"
const league = ref(EVERY)

interface Row {
  id: string
  name: string
  nation: string
  level: number
  colors: [string, string]
  players: number
  rel: number
}

function row(w: NonNullable<typeof world.world>, id: string, players = 0): Row | null {
  const club = w.clubs.get(id)
  if (!club) return null
  return {
    id,
    name: club.name,
    nation: club.nationId,
    level: club.tier,
    colors: w.clubProfile(id).colors,
    players,
    rel: w.clubRel(id),
  }
}

/** The clubs the manager's players belong to, the ones with most of them first. */
const mine = world.derive((w) => {
  const me = w.userNation
  if (!me) return []
  const counts = new Map<string, number>()
  for (const p of w.pool(me)) counts.set(p.clubId, (counts.get(p.clubId) ?? 0) + 1)
  return [...counts]
    .map(([id, n]) => row(w, id, n))
    .filter((r): r is Row => !!r)
    .sort((a, b) => b.players - a.players || a.level - b.level || a.name.localeCompare(b.name))
}, [] as Row[])

const leagues = world.derive(
  (w) => {
    const ids = new Set([...w.clubs.values()].map((c) => c.nationId))
    return [...ids]
      .map((id) => ({ value: id, label: nationName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label))
  },
  [] as { value: string; label: string }[]
)

const all = world.derive((w) => {
  const q = query.value.trim().toLowerCase()
  const out: Row[] = []
  for (const club of w.clubs.values()) {
    if (league.value !== EVERY && club.nationId !== league.value) continue
    if (q && !club.name.toLowerCase().includes(q)) continue
    const r = row(w, club.id)
    if (r) out.push(r)
  }
  return out.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}, [] as Row[])

const shown = computed(() => (tab.value === "mine" ? mine.value : all.value.slice(0, LIMIT)))
const options = computed(() => [{ value: EVERY, label: t("clubs.allLeagues") }, ...leagues.value])
</script>

<template>
  <PageShell :title="t('clubs.title')" :subtitle="t('clubs.subtitle')" back>
    <AppSubTabBar
      :model-value="tab"
      :options="[
        { value: 'mine', label: t('clubs.tabMine') },
        { value: 'all', label: t('clubs.tabAll') },
      ]"
      @update:model-value="(v) => (tab = v as 'mine' | 'all')"
    />

    <template v-if="tab === 'all'">
      <AppSearchInput v-model="query" :placeholder="t('clubs.search')" />
      <AppSelect
        v-model="league"
        :options="options"
        searchable
        :search-placeholder="t('clubs.search')"
      />
    </template>

    <div v-if="shown.length" class="list">
      <AppListItem
        v-for="r in shown"
        :key="r.id"
        :title="r.name"
        :subtitle="`${nationName(r.nation)} · ${t('clubs.level', { n: r.level })}`"
        @open="router.push(`/club/${r.id}`)"
      >
        <template #lead><ClubCrest :colors="r.colors" :size="24" /></template>
        <template #trail>
          <span v-if="r.players" class="count">{{ t("clubs.players", r.players) }}</span>
          <AppChip :variant="r.rel >= 62 ? 'success' : r.rel < 38 ? 'danger' : 'neutral'" size="sm">
            {{ t(`clubs.mood.${moodKey(r.rel)}`) }}
          </AppChip>
        </template>
      </AppListItem>
      <p v-if="tab === 'all' && all.length > LIMIT" class="more">
        {{ t("clubs.refine", { n: LIMIT }) }}
      </p>
    </div>
    <AppEmptyState v-else :title="tab === 'mine' ? t('clubs.noPlayers') : t('clubs.noMatch')" />
  </PageShell>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.count {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

.more {
  margin: var(--sp-1) 0 0;
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
