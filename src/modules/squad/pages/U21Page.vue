<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { ChevronDown, Eye, EyeOff, Shirt, UserPlus } from "@lucide/vue"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { u21Eligible } from "@/engine/world/u21"
import { surname } from "@/engine/players/ability"
import type { U21Match } from "@/engine/world/types"
import type { Player } from "@/engine/types"
import { formatDate } from "@/i18n/dates"
import { u21Ratings, u21Record } from "@/modules/squad/utils/u21"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

const tab = ref<"matches" | "players">("matches")
const open = ref<string | null>(null)

interface Row {
  player: Player
  inSquad: boolean
  senior: boolean
  watched: boolean
  rating?: { avg: number; n: number }
}

const data = world.derive(
  (w) => {
    const me = w.state.career.nationId
    const u = w.state.u21
    if (!me || !u || u.nationId !== me) return null
    const date = w.state.date
    const senior = new Set(w.state.nations[me].squad)
    const squad = new Set(u.squad)
    const watch = new Set(w.state.career.watchlist ?? [])
    const ratings = u21Ratings(u.matches)
    const players: Row[] = w
      .pool(me)
      .filter((p) => u21Eligible(p, date))
      .map((p) => ({
        player: p,
        inSquad: squad.has(p.id),
        senior: senior.has(p.id),
        watched: watch.has(p.id),
        rating: ratings.get(p.id),
      }))
      .sort((a, b) => Number(b.inSquad) - Number(a.inSquad) || b.player.ca - a.player.ca)
    const played = u.matches.filter((m) => m.result || m.cancelled)
    return {
      coach: `${u.coach.first} ${u.coach.last}`,
      players,
      upcoming: u.matches.filter((m) => !m.result && !m.cancelled),
      results: [...played].reverse(),
      record: u21Record(played),
    }
  },
  null as null | {
    coach: string
    players: Row[]
    upcoming: U21Match[]
    results: U21Match[]
    record: { w: number; d: number; l: number }
  }
)

/** A senior call-up is waiting: under-21s can be brought straight into it. */
const callupDue = world.derive((w) => w.state.pendingCallup?.kind === "callup", false)

const playerOf = (id: string) => world.world?.state.players[id]
const nameOf = (id: string) => {
  const p = playerOf(id)
  return p ? surname(p) : "—"
}

function tone(m: U21Match) {
  if (!m.result) return "var(--text-muted)"
  return m.result.gf > m.result.ga
    ? "var(--success)"
    : m.result.gf < m.result.ga
      ? "var(--danger)"
      : "var(--text-muted)"
}

function ratingTone(r: number) {
  return r >= 7 ? "var(--success)" : r < 6 ? "var(--danger)" : "var(--text-muted)"
}

/** Their scorers, with a count for anyone who scored more than once. */
function against(m: U21Match) {
  const counts = new Map<string, number>()
  for (const id of m.oppScorers ?? []) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts].map(([id, n]) => (n > 1 ? `${nameOf(id)} (${n})` : nameOf(id))).join(", ")
}

const lines = computed(() => {
  const m = data.value?.results.find((x) => x.id === open.value)
  return [...(m?.lines ?? [])].sort((a, b) => b.minutes - a.minutes || b.rating - a.rating)
})

function callUp(p: Player) {
  router.push({ path: "/squad/callup", query: { add: p.id } })
}
</script>

<template>
  <PageShell
    back
    :title="t('u21.title')"
    :subtitle="data ? t('u21.subtitle', { coach: data.coach }) : ''"
  >
    <AppEmptyState
      v-if="!data"
      :icon="Shirt"
      :title="t('u21.noJob')"
      :description="t('u21.noJobHint')"
    />
    <template v-else>
      <p class="intro">{{ t("u21.intro") }}</p>
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'matches', label: t('u21.matches') },
          { value: 'players', label: t('u21.players', { n: data.players.length }) },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v as typeof tab)"
      />

      <template v-if="tab === 'matches'">
        <AppEmptyState
          v-if="!data.upcoming.length && !data.results.length"
          :icon="Shirt"
          :title="t('u21.noMatches')"
          :description="t('u21.noMatchesHint')"
        />
        <AppCard v-if="data.upcoming.length" padding="md">
          <AppSectionHeader :title="t('u21.upcoming')" />
          <ul class="matches">
            <li v-for="m in data.upcoming" :key="m.id" class="match">
              <span class="date">{{ formatDate(m.date) }}</span>
              <NationFlag :id="m.opp" :size="20" />
              <span class="opp">{{ $nation(m.opp) }}</span>
              <span class="where">{{ m.home ? t("u21.home") : t("u21.away") }}</span>
            </li>
          </ul>
        </AppCard>
        <AppCard v-if="data.results.length" padding="md">
          <AppSectionHeader :title="t('u21.results')" />
          <p class="record">{{ t("u21.record", data.record) }}</p>
          <ul class="matches">
            <li v-for="m in data.results" :key="m.id">
              <button
                class="match match--btn"
                :disabled="!m.lines?.length"
                :aria-expanded="open === m.id"
                @click="open = open === m.id ? null : m.id"
              >
                <span class="date">{{ formatDate(m.date) }}</span>
                <NationFlag :id="m.opp" :size="20" />
                <span class="opp">{{ $nation(m.opp) }}</span>
                <span class="where">{{ m.home ? t("u21.home") : t("u21.away") }}</span>
                <span v-if="m.cancelled" class="cancelled">{{ t("u21.cancelled") }}</span>
                <StatPill v-else :value="`${m.result!.gf}–${m.result!.ga}`" :tone="tone(m)" wide />
                <ChevronDown v-if="m.lines?.length" :size="16" class="chev" />
              </button>
              <div v-if="open === m.id" class="detail">
                <ul class="lines">
                  <li v-for="l in lines" :key="l.playerId" class="line">
                    <RouterLink :to="`/player/${l.playerId}`" class="line-name">
                      {{ nameOf(l.playerId) }}
                    </RouterLink>
                    <span class="line-meta">
                      {{ t("u21.minutes", { n: l.minutes }) }}
                      <template v-if="l.goals">
                        · {{ t("u21.goals", { n: l.goals }, l.goals) }}
                      </template>
                      <template v-if="l.assists">
                        · {{ t("u21.assists", { n: l.assists }, l.assists) }}
                      </template>
                    </span>
                    <StatPill :value="l.rating.toFixed(1)" :tone="ratingTone(l.rating)" />
                  </li>
                </ul>
                <p v-if="m.oppScorers?.length" class="against">
                  {{ t("u21.against", { list: against(m) }) }}
                </p>
              </div>
            </li>
          </ul>
        </AppCard>
      </template>

      <template v-else>
        <AppEmptyState v-if="!data.players.length" :icon="Shirt" :title="t('u21.noPlayers')" />
        <div v-else class="list">
          <div v-for="r in data.players" :key="r.player.id" class="item">
            <PlayerRow :player="r.player">
              <template #extra>
                <span class="tags">
                  <span v-if="r.senior" class="tag tag--senior">{{ t("u21.senior") }}</span>
                  <span v-else-if="r.inSquad" class="tag">{{ t("u21.inSquad") }}</span>
                  <span class="apps">
                    {{
                      t("u21.apps", { caps: r.player.u21Caps ?? 0, goals: r.player.u21Goals ?? 0 })
                    }}
                  </span>
                </span>
              </template>
              <template #trailing>
                <StatPill
                  :value="r.rating ? r.rating.avg.toFixed(1) : '—'"
                  :tone="r.rating ? ratingTone(r.rating.avg) : undefined"
                />
              </template>
            </PlayerRow>
            <AppButton
              v-if="callupDue && !r.senior"
              variant="tonal"
              size="sm"
              class="callup"
              :aria-label="t('u21.callUp')"
              @click="callUp(r.player)"
            >
              <UserPlus :size="16" />
            </AppButton>
            <button
              class="watch"
              :class="{ on: r.watched }"
              :aria-label="
                r.watched ? t('squad.prospectsPage.stopWatching') : t('squad.prospectsPage.watch')
              "
              @click="world.toggleWatch(r.player.id)"
            >
              <Eye v-if="r.watched" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </div>
        <p v-if="callupDue" class="hint">{{ t("u21.callUpHint") }}</p>
      </template>
    </template>
  </PageShell>
</template>

<style scoped>
.intro,
.hint,
.record {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.matches {
  display: flex;
  flex-direction: column;
  margin: var(--sp-2) 0 0;
  padding: 0;
  list-style: none;
}

.match {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  width: 100%;
  min-height: 44px;
  padding: var(--sp-1) 0;
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: none;
  color: var(--text);
  font: inherit;
  text-align: start;
}

.match--btn:disabled {
  cursor: default;
}

.date {
  width: 72px;
  flex-shrink: 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.opp {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.where {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.cancelled {
  font-size: var(--fs-xs);
  color: var(--warning);
}

.chev {
  color: var(--text-muted);
}

.detail {
  padding: var(--sp-2) 0 var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.lines {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.line {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.line-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
  text-decoration: none;
}

.line-meta {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.against {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
}

.item :deep(.prow) {
  flex: 1;
  min-width: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.tag {
  padding: 0 var(--sp-1);
  border-radius: var(--radius);
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 700;
}

.tag--senior {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}

.callup {
  flex-shrink: 0;
}

.watch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 52px;
  flex-shrink: 0;
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.watch.on {
  color: var(--accent);
}
</style>
