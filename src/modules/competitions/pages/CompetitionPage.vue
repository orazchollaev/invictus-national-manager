<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { FixtureRow, StandingsTable } from "@/modules/competitions/components/tables"
import { useWorldStore } from "@/modules/world/store"
import { competitionDef } from "@/engine/competition/defs"
import { groupStandings } from "@/engine/competition/tables"
import { formatDate } from "@/engine/calendar/dates"
import type { Fixture, StageState } from "@/engine/competition/types"
import { zonesFor } from "@/modules/competitions/utils/zones"
import { AWARDED_HOSTS } from "@/data/start"

const route = useRoute()
const router = useRouter()
const world = useWorldStore()
const inst = world.derive((w) => w.state.competitions[String(route.params.id)] ?? null, null)

/** "FIFA World Cup 2030" for "wc-2030", whether or not the edition exists yet. */
function editionName(id: string) {
  const dash = id.lastIndexOf("-")
  return competitionDef(id.slice(0, dash)).name(Number(id.slice(dash + 1)))
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
      .map((c) => ({ id: c.id, short: c.short })),
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
  if (!w || !s?.groups) return []
  const rule = plan.value?.groups?.tiebreak ?? "gd"
  const ctx = w.ctx()
  const list = s.groups.map((g) => ({
    group: g,
    rows: groupStandings(g, ctx.fixture, rule, ctx.points),
  }))
  // Your group first.
  return list.sort(
    (a, b) =>
      Number(b.group.teams.includes(world.me ?? "")) -
      Number(a.group.teams.includes(world.me ?? ""))
  )
})

/** What each position in a group leads to, for the coloured markers. */
function zones(groupName: string, size: number) {
  const w = world.world
  return w && inst.value ? zonesFor(inst.value, groupName, size, w.ctx(), stageKey.value) : []
}

const fx = (id: string) => world.world?.state.fixtures[id]
const groupFixtures = (ids: string[]) =>
  ids
    .map(fx)
    .filter((f): f is Fixture => !!f)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
const openGroup = ref<string | null>(null)
</script>

<template>
  <PageShell
    v-if="inst"
    back
    :title="inst.name"
    :subtitle="`${formatDate(inst.start)} – ${formatDate(inst.end)}`"
  >
    <AppCard
      v-if="hosts.length || finals || qualifying.length || inst.outcome.winner"
      padding="md"
      class="meta"
    >
      <div v-if="hosts.length" class="meta-row wrap">
        <span class="muted">{{ inst.hosts.length ? "Hosts" : "Finals hosts" }}</span>
        <span class="hosts">
          <NationFlag v-for="h in hosts" :id="h" :key="h" :size="20" name="short" link />
        </span>
      </div>
      <div v-if="finals" class="meta-row">
        <span class="muted">Qualifying for</span>
        <RouterLink v-if="finals.exists" :to="`/competitions/${finals.id}`" class="link">
          {{ finals.name }}
        </RouterLink>
        <span v-else>{{ finals.name }}</span>
      </div>
      <div v-if="qualifying.length" class="meta-row wrap">
        <span class="muted">Qualifying</span>
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
        <span class="muted">Champions</span>
        <NationFlag :id="inst.outcome.winner" :size="22" name link />
      </div>
      <div v-if="inst.outcome.qualified?.length" class="meta-row wrap">
        <span class="muted">Qualified</span>
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
      :options="inst.stages.map((s) => ({ value: s.key, label: s.name }))"
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
      Watch the draw
    </AppButton>

    <AppEmptyState
      v-if="!stage || stage.status === 'waiting'"
      title="Not drawn yet"
      :description="plan ? `The draw is on ${formatDate(plan.drawDate)}.` : ''"
    />

    <template v-else-if="stage.groups">
      <div v-for="t in tables" :key="t.group.name" class="group">
        <StandingsTable
          :rows="t.rows"
          :title="t.group.name.length <= 2 ? `Group ${t.group.name}` : t.group.name"
          :zones="zones(t.group.name, t.rows.length)"
          :hosts="hosts"
        />
        <button
          class="toggle"
          @click="openGroup = openGroup === t.group.name ? null : t.group.name"
        >
          {{ openGroup === t.group.name ? "Hide matches" : "Show matches" }}
        </button>
        <div v-if="openGroup === t.group.name" class="fixtures">
          <FixtureRow
            v-for="f in groupFixtures(t.group.fixtures)"
            :key="f.id"
            :fixture="f"
            show-date
          />
        </div>
      </div>
    </template>

    <template v-else-if="stage.rounds">
      <template v-for="r in stage.rounds" :key="r.name">
        <AppSectionHeader v-if="r.ties.length" :title="r.name" />
        <div v-if="r.ties.length" class="fixtures">
          <template v-for="t in r.ties" :key="t.id">
            <FixtureRow v-for="id in t.fixtures" :key="id" :fixture="fx(id)!" show-date />
            <div v-if="!t.fixtures.length && t.winner" class="bye">
              <NationFlag :id="t.winner" :size="16" name />
              · bye
            </div>
          </template>
        </div>
      </template>
      <template v-if="stage.thirdPlace">
        <AppSectionHeader title="Third place" />
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
  <PageShell v-else back title="Competition">
    <AppEmptyState title="Not found" />
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

.bye {
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-light);
}
</style>
