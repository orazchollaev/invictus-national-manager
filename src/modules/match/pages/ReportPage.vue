<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { CommentaryFeed, StatsPanel } from "@/modules/match/components/live"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"
import { matchRatingTone } from "@/modules/core/utils/format"
import type { Side } from "@/engine/match/types"

const route = useRoute()
const world = useWorldStore()
const id = computed(() => String(route.params.id))
const fixture = world.derive((w) => w.state.fixtures[id.value] ?? null, null)
const report = world.derive((w) => w.state.reports[id.value] ?? null, null)
const compName = computed(() =>
  fixture.value?.compId === "friendly"
    ? "Friendly"
    : (world.world?.state.competitions[fixture.value?.compId ?? ""]?.name ?? "")
)
const tab = ref("summary")

const playerName = (pid?: string) => {
  const p = pid ? world.world?.state.players[pid] : undefined
  return p ? `${p.first[0]}. ${p.last}` : "—"
}

const names = {
  player: (pid: string | undefined) => playerName(pid),
  team: (s: Side) =>
    fixture.value
      ? (world.world?.def(s === "home" ? fixture.value.home : fixture.value.away).name ?? "")
      : "",
}

/** Goals and cards per side, from the compact record every match keeps. */
const moments = computed(() => {
  const f = fixture.value
  if (!f?.events) return { home: [], away: [] }
  const out: Record<"home" | "away", { m: number; text: string; kind: string }[]> = {
    home: [],
    away: [],
  }
  for (const e of f.events) {
    if (e.k === "y") continue
    const side = e.s === 0 ? "home" : "away"
    const label =
      e.k === "g"
        ? "⚽"
        : e.k === "pg"
          ? "⚽ (p)"
          : e.k === "og"
            ? "⚽ (og)"
            : e.k === "r"
              ? "🟥"
              : "✚"
    out[side].push({ m: e.m, text: `${playerName(e.p)} ${label}`, kind: e.k })
  }
  return out
})

function lines(side: Side) {
  return (report.value?.lines ?? [])
    .filter((l) => l.side === side)
    .sort((a, b) => Number(b.started) - Number(a.started) || b.rating - a.rating)
}

const motm = computed(() => [...(report.value?.lines ?? [])].sort((a, b) => b.rating - a.rating)[0])
</script>

<template>
  <PageShell
    v-if="fixture"
    back
    :title="compName"
    :subtitle="`${fixture.label} · ${formatDate(fixture.date)}`"
  >
    <AppCard padding="md">
      <div class="score">
        <NationFlag :id="fixture.home" :size="44" name link />
        <div class="score-num">
          <template v-if="fixture.result">{{ fixture.result.h }}–{{ fixture.result.a }}</template>
          <template v-else>v</template>
        </div>
        <NationFlag :id="fixture.away" :size="44" name link />
      </div>
      <div v-if="fixture.result" class="muted center">
        HT {{ fixture.result.ht?.[0] }}–{{ fixture.result.ht?.[1] }}
        <template v-if="fixture.result.ft">· after extra time</template>
        <template v-if="fixture.result.pens">
          · {{ fixture.result.pens[0] }}–{{ fixture.result.pens[1] }} on penalties
        </template>
      </div>
      <div class="moments">
        <ul>
          <li v-for="(m, i) in moments.home" :key="i">{{ m.m }}' {{ m.text }}</li>
        </ul>
        <ul class="right">
          <li v-for="(m, i) in moments.away" :key="i">{{ m.text }} {{ m.m }}'</li>
        </ul>
      </div>
    </AppCard>

    <AppEmptyState v-if="!fixture.result" title="Not played yet" />

    <template v-else-if="report">
      <AppCard v-if="motm" padding="md" class="motm">
        <span class="muted">Player of the match</span>
        <strong>{{ playerName(motm.playerId) }}</strong>
        <StatPill :value="motm.rating.toFixed(1)" :tone="matchRatingTone(motm.rating)" />
      </AppCard>
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'summary', label: 'Stats' },
          { value: 'home', label: fixture.home },
          { value: 'away', label: fixture.away },
          { value: 'feed', label: 'Commentary' },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v)"
      />
      <div class="panel">
        <StatsPanel v-if="tab === 'summary'" :home="report.stats[0]" :away="report.stats[1]" />
        <CommentaryFeed
          v-else-if="tab === 'feed'"
          :events="report.events"
          :names="names"
          :verbose="false"
        />
        <div v-else>
          <RouterLink
            v-for="l in lines(tab as Side)"
            :key="l.playerId"
            :to="`/player/${l.playerId}`"
            class="line"
          >
            <span class="role">{{ l.pos }}</span>
            <span class="name">
              {{ playerName(l.playerId) }}
              <span class="muted">
                {{ l.started ? "" : "sub · " }}{{ l.minutes }}'{{
                  l.goals ? ` · ${l.goals} goal${l.goals > 1 ? "s" : ""}` : ""
                }}{{ l.assists ? ` · ${l.assists} assist` : "" }}{{ l.yellow ? " · 🟨" : ""
                }}{{ l.red ? " · 🟥" : "" }}
              </span>
            </span>
            <StatPill :value="l.rating.toFixed(1)" :tone="matchRatingTone(l.rating)" />
          </RouterLink>
        </div>
      </div>
    </template>

    <AppCard v-else padding="md">
      <AppSectionHeader title="Summary" />
      <p class="muted">Only goals and cards are kept for matches you did not play.</p>
    </AppCard>
  </PageShell>
  <PageShell v-else back title="Match">
    <AppEmptyState title="Match not found" />
  </PageShell>
</template>

<style scoped>
.score {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-2);
}

.score :deep(.nation) {
  flex-direction: column;
  text-align: center;
  font-weight: 700;
}

.score-num {
  font-size: var(--fs-2xl);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.center {
  text-align: center;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.moments {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
  font-size: var(--fs-sm);
}

.moments ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.moments .right {
  text-align: end;
}

.motm :deep(.card-body) {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.motm strong {
  flex: 1;
}

.panel {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.line {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.role {
  width: 28px;
  font-size: var(--fs-xs);
  font-weight: 800;
  color: var(--text-muted);
}

.name {
  flex: 1;
  min-width: 0;
}
</style>
