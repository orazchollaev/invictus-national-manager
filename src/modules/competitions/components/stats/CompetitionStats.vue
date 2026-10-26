<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppEmptyState, AppSectionHeader } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { msg } from "@/engine/text"
import { positionGroup } from "@/engine/players/ability"
import { hasLeaders } from "@/engine/competition/stats"
import type { CompetitionLeaders, LeaderRow } from "@/engine/competition/types"

const props = defineProps<{
  leaders: CompetitionLeaders
  /** The user's nation, whose players are marked. */
  mine: string | null
  /** The competition is over: the charts are the final ones. */
  final: boolean
}>()

const { t } = useI18n()

type Stat = "goals" | "assists" | "rating" | "clean" | "apps"
const STAT_LABEL: Record<Stat, string> = {
  goals: "competitions.stats.goals",
  assists: "competitions.stats.assists",
  rating: "competitions.stats.rating",
  clean: "competitions.stats.clean",
  apps: "competitions.stats.apps",
}

const charts = computed(() => {
  const l = props.leaders
  return [
    { kind: "scorer", rows: l.scorers, main: "goals", sub: "assists" },
    { kind: "assister", rows: l.assisters, main: "assists", sub: "goals" },
    { kind: "rating", rows: l.ratings, main: "rating", sub: "apps" },
    { kind: "keeper", rows: l.keepers, main: "clean", sub: "apps" },
    { kind: "young", rows: l.young, main: "rating", sub: "goals" },
  ].filter((c) => c.rows.length) as {
    kind: string
    rows: LeaderRow[]
    main: Stat
    sub: Stat
  }[]
})

const lines = computed(() =>
  (["GK", "DEF", "MID", "FWD"] as const)
    .map((g) => ({ group: g, rows: props.leaders.xi.filter((r) => positionGroup(r.pos) === g) }))
    .filter((l) => l.rows.length)
)

const show = (r: LeaderRow, stat: Stat) => (stat === "rating" ? r[stat].toFixed(1) : r[stat])
const title = (kind: string) => msg(`award.${kind}`)

/** The top of each chart: the full lists are ten deep, too long to scroll on a phone. */
const SHOWN = 5
/** The charts opened to their full length. */
const opened = ref(new Set<string>())
const rowsOf = (chart: { kind: string; rows: LeaderRow[] }) =>
  opened.value.has(chart.kind) ? chart.rows : chart.rows.slice(0, SHOWN)
function toggle(kind: string) {
  const next = new Set(opened.value)
  if (!next.delete(kind)) next.add(kind)
  opened.value = next
}
</script>

<template>
  <AppEmptyState
    v-if="!hasLeaders(leaders)"
    :title="t('competitions.stats.title')"
    :description="t('competitions.stats.none')"
  />
  <template v-else>
    <RouterLink
      v-if="leaders.player"
      :to="`/player/${leaders.player.id}`"
      class="hero"
      :class="{ mine: leaders.player.nation === mine }"
    >
      <NationFlag :id="leaders.player.nation" :size="36" />
      <div class="hero-text">
        <span class="eyebrow">
          {{ $tx(title("player")) }}
          <template v-if="!final">· {{ t("competitions.stats.sofar") }}</template>
        </span>
        <strong class="hero-name">{{ leaders.player.name }}</strong>
        <span class="muted">
          {{ leaders.player.goals }} {{ t(STAT_LABEL.goals) }} · {{ leaders.player.assists }}
          {{ t(STAT_LABEL.assists) }} · {{ leaders.player.rating.toFixed(1) }}
          {{ t(STAT_LABEL.rating) }}
        </span>
      </div>
    </RouterLink>

    <section v-for="chart in charts" :key="chart.kind" class="chart">
      <AppSectionHeader>{{ $tx(title(chart.kind)) }}</AppSectionHeader>
      <div class="list">
        <RouterLink
          v-for="(r, i) in rowsOf(chart)"
          :key="r.id"
          :to="`/player/${r.id}`"
          class="row"
          :class="{ mine: r.nation === mine }"
        >
          <span class="rank">{{ i + 1 }}</span>
          <NationFlag :id="r.nation" :size="20" />
          <span class="name">{{ r.name }}</span>
          <span class="sub">{{ show(r, chart.sub) }} {{ t(STAT_LABEL[chart.sub]) }}</span>
          <strong class="main">{{ show(r, chart.main) }}</strong>
        </RouterLink>
      </div>
      <button
        v-if="chart.rows.length > SHOWN"
        type="button"
        class="more"
        @click="toggle(chart.kind)"
      >
        {{
          t(opened.has(chart.kind) ? "competitions.stats.showLess" : "competitions.stats.showAll")
        }}
      </button>
    </section>

    <section v-if="lines.length" class="chart">
      <AppSectionHeader>{{ $tx(title("xi")) }}</AppSectionHeader>
      <div class="list">
        <template v-for="l in lines" :key="l.group">
          <div class="group">{{ t(`squad.pos.${l.group}`) }}</div>
          <RouterLink
            v-for="r in l.rows"
            :key="r.id"
            :to="`/player/${r.id}`"
            class="row"
            :class="{ mine: r.nation === mine }"
          >
            <NationFlag :id="r.nation" :size="20" />
            <span class="name">{{ r.name }}</span>
            <span class="sub">
              {{ r.goals }} {{ t(STAT_LABEL.goals) }} · {{ r.assists }}
              {{ t(STAT_LABEL.assists) }}
            </span>
            <strong class="main">{{ r.rating.toFixed(1) }}</strong>
          </RouterLink>
        </template>
      </div>
    </section>

    <p class="muted note">{{ t("competitions.stats.minApps", { n: leaders.minApps }) }}</p>
  </template>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--gold-text) 40%, transparent);
  background: color-mix(in srgb, var(--gold-soft) 60%, var(--surface));
  color: var(--text);
  text-decoration: none;
}

.hero-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.eyebrow {
  color: var(--gold-text);
  font-size: var(--fs-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero-name {
  font-size: var(--fs-lg);
}

.chart {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
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

.row.mine,
.hero.mine {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
}

.rank {
  width: 1.4em;
  color: var(--text-muted);
  font-size: var(--fs-sm);
  text-align: center;
}

.name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub,
.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.main {
  min-width: 2ch;
  text-align: end;
}

.group {
  padding: var(--sp-1) var(--sp-3);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: var(--fs-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.more {
  align-self: flex-start;
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--fs-sm);
  font-weight: 600;
  padding: var(--sp-1) 0;
}

.note {
  margin: 0;
}
</style>
