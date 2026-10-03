<script setup lang="ts">
import { PersonFace } from "@/modules/core/components/face"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill, StickyCta } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { CommentaryFeed, StatsPanel } from "@/modules/match/components/live"
import { laneCounts } from "@/engine/match/lanes"
import { compName as compNameOf, nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { matchRatingTone } from "@/modules/core/utils/format"
import type { Side } from "@/engine/match/types"
import { shortName } from "@/engine/players/ability"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const world = useWorldStore()
const id = computed(() => String(route.params.id))
const fixture = world.derive((w) => w.state.fixtures[id.value] ?? null, null)
const report = world.derive((w) => w.state.reports[id.value] ?? null, null)
const compName = computed(() =>
  fixture.value?.compId === "friendly"
    ? t("match.friendly")
    : ((i) => (i ? compNameOf(i) : ""))(
        world.world?.state.competitions[fixture.value?.compId ?? ""]
      )
)
const tab = ref("summary")

const playerName = (pid?: string) => {
  const p = pid ? world.world?.state.players[pid] : undefined
  return p ? shortName(p) : "—"
}

const names = {
  player: (pid: string | undefined) => playerName(pid),
  team: (s: Side) =>
    fixture.value ? nationName(s === "home" ? fixture.value.home : fixture.value.away) : "",
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
    :subtitle="t('match.subtitle', { label: $tx(fixture.label), date: formatDate(fixture.date) })"
  >
    <AppCard padding="md">
      <div class="score">
        <NationFlag :id="fixture.home" :size="44" name link />
        <div class="score-num">
          <template v-if="fixture.result">{{ fixture.result.h }}–{{ fixture.result.a }}</template>
          <template v-else>{{ t("competitions.fixture.vs") }}</template>
        </div>
        <NationFlag :id="fixture.away" :size="44" name link />
      </div>
      <div v-if="fixture.result" class="muted center">
        {{ t("match.report.ht", { a: fixture.result.ht?.[0], b: fixture.result.ht?.[1] }) }}
        <template v-if="fixture.result.ft">{{ t("match.report.afterET") }}</template>
        <template v-if="fixture.result.pens">
          {{ t("match.report.onPens", { a: fixture.result.pens[0], b: fixture.result.pens[1] }) }}
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

    <AppEmptyState v-if="!fixture.result" :title="t('match.report.notPlayed')" />

    <template v-else-if="report">
      <AppCard v-if="motm" padding="md" class="motm">
        <span class="muted">{{ t("match.report.motm") }}</span>
        <strong>{{ playerName(motm.playerId) }}</strong>
        <StatPill :value="motm.rating.toFixed(1)" :tone="matchRatingTone(motm.rating)" />
      </AppCard>
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'summary', label: t('match.report.stats') },
          { value: 'home', label: fixture.home },
          { value: 'away', label: fixture.away },
          { value: 'feed', label: t('match.report.commentary') },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v)"
      />
      <div class="panel">
        <StatsPanel
          v-if="tab === 'summary'"
          :home="report.stats[0]"
          :away="report.stats[1]"
          :lanes="laneCounts(report.events)"
        />
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
            <PersonFace
              v-if="world.world?.state.players[l.playerId]"
              :player="world.world.state.players[l.playerId]"
              :size="32"
              head
            />
            <span class="name">
              {{ playerName(l.playerId) }}
              <span class="muted">
                {{ l.started ? "" : t("match.report.sub") }}{{ l.minutes }}'{{
                  l.goals ? " · " + t("match.report.goals", { n: l.goals }, l.goals) : ""
                }}{{ l.assists ? " · " + t("match.report.assist", { n: l.assists }) : ""
                }}{{ l.yellow ? " · 🟨" : "" }}{{ l.red ? " · 🟥" : "" }}
              </span>
            </span>
            <StatPill :value="l.rating.toFixed(1)" :tone="matchRatingTone(l.rating)" />
          </RouterLink>
        </div>
      </div>
    </template>

    <AppCard v-else padding="md">
      <AppSectionHeader :title="t('match.report.summary')" />
      <p class="muted">{{ t("match.report.onlyGoals") }}</p>
    </AppCard>
    <StickyCta above-nav>
      <AppButton variant="filled" block @click="router.push('/home')">
        {{ t("common.continue") }}
      </AppButton>
    </StickyCta>
  </PageShell>
  <PageShell v-else back :title="t('match.title')">
    <AppEmptyState :title="t('match.notFound')" />
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
