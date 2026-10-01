<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { Hammer, MapPin, Star } from "@lucide/vue"
import { AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { HostingCard } from "@/modules/stadiums/components/hosting"
import { compName, nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { daysBetween } from "@/engine/calendar/dates"
import { formatDate } from "@/i18n/dates"
import { homeBoost } from "@/engine/world/federation"
import {
  HOST_LEVELS,
  daysLeft,
  hostCheck,
  hostRequirement,
  totalCapacity,
  withProjects,
  type HostLevel,
} from "@/engine/world/stadiums"
import { hostedAt, levelName, seats, seatsShort } from "@/modules/stadiums/utils/hosting"

const { t } = useI18n()
const route = useRoute()
const world = useWorldStore()

const nationId = computed(() => (route.params.id ? String(route.params.id) : world.me))

const view = world.derive((w) => {
  const id = nationId.value
  const n = id ? w.state.nations[id] : undefined
  if (!id || !n) return null
  const def = w.def(id)
  const grounds = n.stadiums ?? []
  const planned = withProjects(n)
  const own = id === w.state.career.nationId
  const competitions = Object.values(w.state.competitions)
  const levels = HOST_LEVELS.map((level) => {
    const req = hostRequirement(level, def.confed)
    return {
      level,
      title: levelName(level, def.confed),
      req,
      now: hostCheck(grounds, req),
      planned: hostCheck(planned, req),
      hosting: hostedAt(competitions, id, level, w.state.date).map((c) => ({
        id: c.id,
        name: compName(c),
      })),
      bid: !!w.state.career.bids?.includes(level),
    }
  })
  const biggest = Math.max(1, ...grounds.map((s) => s.capacity))
  const byCity = new Map<string, typeof grounds>()
  for (const s of [...grounds].sort((a, b) => b.capacity - a.capacity)) {
    const list = byCity.get(s.city)
    if (list) list.push(s)
    else byCity.set(s.city, [s])
  }
  const projects = [...(n.projects ?? [])]
    .sort((a, b) => (a.done < b.done ? -1 : 1))
    .map((p) => {
      const total = Math.max(1, daysBetween(p.started, p.done))
      const left = daysLeft(p, w.state.date)
      return {
        ...p,
        left,
        progress: Math.min(100, Math.max(4, Math.round(((total - left) / total) * 100))),
        comp: ((i) => (i ? compName(i) : undefined))(
          p.forComp ? w.state.competitions[p.forComp] : undefined
        ),
      }
    })
  return {
    id,
    name: nationName(id),
    own,
    level: n.stadium,
    count: grounds.length,
    capacity: totalCapacity(grounds),
    boost: homeBoost(n.stadium),
    levels,
    biggest,
    showpieceId: [...grounds].sort((a, b) => b.capacity - a.capacity)[0]?.id,
    cities: [...byCity.entries()].map(([city, list]) => ({ city, list })),
    projects,
  }
}, null)

function setBid(level: HostLevel, on: boolean) {
  world.setBid(level, on)
}
</script>

<template>
  <PageShell v-if="view" :back="!view.own" :title="t('stadiums.title')" :subtitle="view.name">
    <template #actions>
      <NationFlag :id="view.id" :size="32" />
    </template>

    <section class="tiles">
      <div class="tile">
        <span class="tile-value stars" :aria-label="t('stadiums.level', { n: view.level })">
          <Star v-for="i in 5" :key="i" :size="14" :class="{ on: i <= view.level }" />
        </span>
        <span class="tile-label">{{ t("stadiums.stadiumLevel") }}</span>
      </div>
      <div class="tile">
        <span class="tile-value">{{ view.count }}</span>
        <span class="tile-label">{{ t("stadiums.grounds") }}</span>
      </div>
      <div class="tile">
        <span class="tile-value">{{ seatsShort(view.capacity) }}</span>
        <span class="tile-label">{{ t("stadiums.seats") }}</span>
      </div>
      <div class="tile">
        <span class="tile-value">+{{ view.boost.toFixed(1) }}</span>
        <span class="tile-label">{{ t("stadiums.homeEdge") }}</span>
      </div>
    </section>

    <AppSectionHeader :title="t('stadiums.hosting')" />
    <div class="hosting">
      <HostingCard
        v-for="l in view.levels"
        :key="l.level"
        :title="l.title"
        :req="l.req"
        :now="l.now"
        :planned="l.planned"
        :hosting="l.hosting"
        :can-bid="view.own"
        :bid="l.bid"
        @bid="setBid(l.level, $event)"
      />
    </div>

    <template v-if="view.projects.length">
      <AppSectionHeader :title="t('stadiums.underConstruction')" />
      <ul class="works">
        <li v-for="p in view.projects" :key="p.id" class="work">
          <Hammer :size="18" class="work-icon" />
          <div class="work-body">
            <div class="work-head">
              <span class="work-name">{{ p.name }}</span>
              <span class="work-cap">{{ seats(p.capacity) }}</span>
            </div>
            <div class="work-meta">
              {{ p.kind === "build" ? t("stadiums.newGround") : t("stadiums.expansion") }} ·
              {{ p.city }}
              <template v-if="p.comp">· {{ t("stadiums.forComp", { name: p.comp }) }}</template>
            </div>
            <div class="work-bar"><span :style="{ width: `${p.progress}%` }"></span></div>
            <div class="work-meta">
              {{ t("stadiums.opens", { date: formatDate(p.done), n: p.left }) }}
            </div>
          </div>
        </li>
      </ul>
    </template>

    <AppSectionHeader :title="t('stadiums.groundsByCity')" />
    <div class="cities">
      <section v-for="c in view.cities" :key="c.city" class="city">
        <div class="city-name">
          <MapPin :size="14" />
          {{ c.city }}
        </div>
        <div v-for="s in c.list" :key="s.id" class="ground">
          <div class="ground-head">
            <span class="ground-name">
              <Star v-if="s.id === view.showpieceId" :size="13" class="showpiece" />
              {{ s.name }}
              <small v-if="s.opened" class="new">
                {{ t("stadiums.opened", { year: s.opened }) }}
              </small>
            </span>
            <span class="ground-cap">{{ seats(s.capacity) }}</span>
          </div>
          <div class="ground-bar">
            <span :style="{ width: `${(s.capacity / view.biggest) * 100}%` }"></span>
          </div>
        </div>
      </section>
    </div>
  </PageShell>
  <PageShell v-else back :title="t('stadiums.title')">
    <AppEmptyState :title="t('stadiums.noNation')" />
  </PageShell>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--sp-2);
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--sp-3) var(--sp-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
  text-align: center;
}

.tile-value {
  font-size: var(--fs-md);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.tile-label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.stars {
  display: flex;
  gap: 1px;
  color: var(--border);
  min-height: 20px;
  align-items: center;
}

.stars .on {
  color: var(--gold);
  fill: var(--gold);
}

.hosting,
.cities,
.works {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.works {
  margin: 0;
  padding: 0;
  list-style: none;
}

.work {
  display: flex;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px dashed color-mix(in srgb, var(--warning) 60%, transparent);
  background: color-mix(in srgb, var(--warning) 6%, var(--surface));
}

.work-icon {
  color: var(--warning);
  flex-shrink: 0;
  margin-top: 2px;
}

.work-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.work-head,
.ground-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-2);
}

.work-name,
.ground-name {
  font-weight: 600;
  min-width: 0;
}

.work-cap,
.ground-cap {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.work-meta {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.work-bar,
.ground-bar {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.work-bar span,
.ground-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.work-bar span {
  background: var(--warning);
}

.ground-bar span {
  background: var(--accent);
}

.city {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.city-name {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--fs-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.ground {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.showpiece {
  color: var(--gold);
  fill: var(--gold);
  vertical-align: -1px;
}

.new {
  margin-left: var(--sp-1);
  color: var(--success);
  font-weight: 700;
}
</style>
