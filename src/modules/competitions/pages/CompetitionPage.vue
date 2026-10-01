<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { FixtureRow, StandingsTable } from "@/modules/competitions/components/tables"
import { compName, stageLabel } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { competitionDef } from "@/engine/competition/defs"
import { formatDate } from "@/i18n/dates"
import type { Fixture, StageState, Tie } from "@/engine/competition/types"
import { bestPlaced, groupView } from "@/modules/competitions/utils/groupView"
import { AWARDED_HOSTS } from "@/data/start"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const world = useWorldStore()
const inst = world.derive((w) => w.state.competitions[String(route.params.id)] ?? null, null)

/** "FIFA World Cup 2030" for "wc-2030", whether or not the edition exists yet. */
function editionName(id: string) {
  const dash = id.lastIndexOf("-")
  return compName({ defId: id.slice(0, dash), year: Number(id.slice(dash + 1)) })
}

/** The finals a qualifying competition leads to, with its hosts. */
const finals = world.derive((w) => {
  const c = w.state.competitions[String(route.params.id)]
  const id = c && competitionDef(c.defId).finals?.(c.year)
  if (!id) return null
  const f = w.state.competitions[id]
  return { id, name: editionName(id), hosts: f?.hosts ?? AWARDED_HOSTS[id] ?? [], exists: !!f }
}, null)

/** The qualifying competitions that lead to these finals. */
const qualifying = world.derive(
  (w) =>
    Object.values(w.state.competitions)
      .filter((c) => competitionDef(c.defId).finals?.(c.year) === String(route.params.id))
      .map((c) => ({ id: c.id, short: compName(c, "short") })),
  [] as { id: string; short: string }[]
)

/** Hosts to mark in the tables: this tournament's, or its finals' for a qualifier. */
const hosts = computed(() =>
  inst.value?.hosts.length ? inst.value.hosts : (finals.value?.hosts ?? [])
)

const stageKey = ref("")
watch(
  inst,
  (c) => {
    if (!c || c.stages.some((s) => s.key === stageKey.value)) return
    const live =
      c.stages.find((s) => s.status === "active") ??
      [...c.stages].reverse().find((s) => s.status === "done") ??
      c.stages[0]
    stageKey.value = live?.key ?? ""
  },
  { immediate: true }
)

const stage = computed<StageState | undefined>(() =>
  inst.value?.stages.find((s) => s.key === stageKey.value)
)

const plan = computed(() => {
  const w = world.world
  const c = inst.value
  if (!w || !c) return undefined
  return competitionDef(c.defId)
    .plan(c, w.ctx())
    .find((p) => p.key === stageKey.value)
})

const tables = computed(() => {
  const w = world.world
  const s = stage.value
  const c = inst.value
  if (!w || !s?.groups || !c) return []
  const ctx = w.ctx()
  const list = s.groups.map((g) => ({ group: g, ...groupView(c, s, g, ctx) }))
  // Your group first.
  return list.sort(
    (a, b) =>
      Number(b.group.teams.includes(world.me ?? "")) -
      Number(a.group.teams.includes(world.me ?? ""))
  )
})

/** The ranking across groups that decides the last places, with the cut. */
const best = computed(() => {
  const w = world.world
  const s = stage.value
  const c = inst.value
  return w && s?.groups && c && s.status !== "waiting" ? bestPlaced(c, s, w.ctx()) : null
})

const fx = (id: string) => world.world?.state.fixtures[id]
const groupFixtures = (ids: string[]) =>
  ids
    .map(fx)
    .filter((f): f is Fixture => !!f)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
const openGroup = ref<string | null>(null)

/** Who goes through a decided tie, and on what: "BRA advance · 3–2 on aggregate". */
function advance(tie: Tie) {
  if (!tie.winner || !tie.home || !tie.away) return null
  const played = tie.fixtures.map(fx).filter((f): f is Fixture => !!f?.result)
  if (!played.length) return null
  const goals = (team: string) =>
    played.reduce((n, f) => n + (f.home === team ? f.result!.h : f.result!.a), 0)
  const loser = tie.winner === tie.home ? tie.away : tie.home
  const last = played[played.length - 1]
  const level = goals(tie.winner) === goals(loser)
  const how = level
    ? last.result!.pens
      ? t("competitions.detail.onPenalties")
      : ""
    : tie.fixtures.length > 1
      ? t("competitions.detail.onAggregate")
      : last.result!.ft
        ? t("competitions.detail.afterExtraTime")
        : ""
  const score = tie.fixtures.length > 1 ? `${goals(tie.winner)}–${goals(loser)} ` : ""
  return { team: tie.winner, text: `${score}${how}`.trim() }
}
</script>

<template>
  <PageShell
    v-if="inst"
    back
    :title="$comp(inst)"
    :subtitle="`${formatDate(inst.start)} – ${formatDate(inst.end)}`"
  >
    <AppCard
      v-if="hosts.length || finals || qualifying.length || inst.outcome.winner"
      padding="md"
      class="meta"
    >
      <div v-if="hosts.length" class="meta-row wrap">
        <span class="muted">
          {{
            inst.hosts.length
              ? t("competitions.detail.hosts")
              : t("competitions.detail.finalsHosts")
          }}
        </span>
        <span class="hosts">
          <NationFlag v-for="h in hosts" :id="h" :key="h" :size="20" name="short" link />
        </span>
      </div>
      <div v-if="finals" class="meta-row">
        <span class="muted">{{ t("competitions.detail.qualifyingFor") }}</span>
        <RouterLink v-if="finals.exists" :to="`/competitions/${finals.id}`" class="link">
          {{ finals.name }}
        </RouterLink>
        <span v-else>{{ finals.name }}</span>
      </div>
      <div v-if="qualifying.length" class="meta-row wrap">
        <span class="muted">{{ t("competitions.detail.qualifying") }}</span>
        <span class="hosts">
          <RouterLink
            v-for="q in qualifying"
            :key="q.id"
            :to="`/competitions/${q.id}`"
            class="link"
          >
            {{ q.short }}
          </RouterLink>
        </span>
      </div>
      <div v-if="inst.outcome.winner" class="meta-row">
        <span class="muted">{{ t("competitions.detail.champions") }}</span>
        <NationFlag :id="inst.outcome.winner" :size="22" name link />
      </div>
      <div v-if="inst.outcome.qualified?.length" class="meta-row wrap">
        <span class="muted">{{ t("competitions.detail.qualified") }}</span>
        <span class="hosts">
          <NationFlag
            v-for="q in inst.outcome.qualified"
            :id="q"
            :key="q"
            :size="18"
            name="short"
            link
          />
        </span>
      </div>
    </AppCard>

    <AppSubTabBar
      v-if="inst.stages.length > 1"
      :model-value="stageKey"
      :options="inst.stages.map((s) => ({ value: s.key, label: stageLabel(s.name) }))"
      size="sm"
      @update:model-value="(v) => (stageKey = v)"
    />

    <AppButton
      v-if="
        stage &&
        stage.status !== 'waiting' &&
        (stage.groups?.length ?? 0) + (stage.rounds?.[0]?.ties.length ?? 0) > 1
      "
      variant="tonal"
      @click="router.push(`/draw/${inst.id}/${stage.key}`)"
    >
      {{ t("competitions.detail.watchDraw") }}
    </AppButton>

    <AppEmptyState
      v-if="!stage || stage.status === 'waiting'"
      :title="t('competitions.detail.notDrawn')"
      :description="
        plan ? t('competitions.detail.drawOn', { date: formatDate(plan.drawDate) }) : ''
      "
    />

    <template v-else-if="stage.groups">
      <StandingsTable
        v-if="best"
        :rows="best.rows"
        :title="t(best.title)"
        :cut="best.places"
        :hosts="hosts"
        class="best"
      />
      <div v-for="tb in tables" :key="tb.group.name" class="group">
        <StandingsTable
          :rows="tb.rows"
          :title="
            tb.group.name.length <= 2 ? t('common.group', { name: tb.group.name }) : tb.group.name
          "
          :zones="tb.zones"
          :outlook="tb.outlook"
          :hosts="hosts"
        />
        <button
          class="toggle"
          @click="openGroup = openGroup === tb.group.name ? null : tb.group.name"
        >
          {{
            openGroup === tb.group.name
              ? t("competitions.detail.hide")
              : t("competitions.detail.show")
          }}
        </button>
        <div v-if="openGroup === tb.group.name" class="fixtures">
          <FixtureRow
            v-for="f in groupFixtures(tb.group.fixtures)"
            :key="f.id"
            :fixture="f"
            show-date
          />
        </div>
      </div>
    </template>

    <template v-else-if="stage.rounds">
      <template v-for="r in stage.rounds" :key="r.name">
        <AppSectionHeader v-if="r.ties.length" :title="$stage(r.name)" />
        <div v-if="r.ties.length" class="fixtures">
          <template v-for="tie in r.ties" :key="tie.id">
            <FixtureRow v-for="id in tie.fixtures" :key="id" :fixture="fx(id)!" show-date />
            <div v-if="advance(tie)" class="advance">
              <NationFlag :id="advance(tie)!.team" :size="16" name="short" />
              {{ t("competitions.detail.advance") }}
              <span v-if="advance(tie)!.text">· {{ advance(tie)!.text }}</span>
            </div>
            <div v-if="!tie.fixtures.length && tie.winner" class="bye">
              <NationFlag :id="tie.winner" :size="16" name />
              · {{ t("competitions.detail.bye") }}
            </div>
          </template>
        </div>
      </template>
      <template v-if="stage.thirdPlace">
        <AppSectionHeader :title="t('competitions.detail.thirdPlace')" />
        <div class="fixtures">
          <FixtureRow
            v-for="id in stage.thirdPlace.fixtures"
            :key="id"
            :fixture="fx(id)!"
            show-date
          />
        </div>
      </template>
    </template>
  </PageShell>
  <PageShell v-else back :title="t('competitions.detail.title')">
    <AppEmptyState :title="t('competitions.detail.notFound')" />
  </PageShell>
</template>

<style scoped>
.meta :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.meta-row.wrap {
  align-items: flex-start;
}

.hosts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--sp-2);
}

.link {
  color: var(--accent);
  font-size: var(--fs-sm);
  font-weight: 600;
  text-align: end;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.group {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.toggle {
  align-self: flex-start;
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--fs-sm);
  font-weight: 600;
  padding: var(--sp-1) 0;
}

.fixtures {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.advance {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--success);
  border-bottom: 1px solid var(--border-light);
}

.bye {
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-light);
}
</style>
