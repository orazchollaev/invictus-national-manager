<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { PersonFace } from "@/modules/core/components/face"
import { formatDate } from "@/i18n/dates"
import { USER_COACH } from "@/engine/career/coaches"
import { NationRecords, RivalList } from "@/modules/nations/components/records"
import { PlayerRow } from "@/modules/squad/components/list"
import { FixtureRow } from "@/modules/competitions/components/tables"
import { compName, resolveText } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { COMPETITION_DEFS } from "@/engine/competition/defs"
import { stageText } from "@/engine/text"
import { achievementsOf, type Finish } from "@/modules/nations/utils/achievements"
import type { Fixture } from "@/engine/competition/types"
import type { Player } from "@/engine/types"

const { t } = useI18n()
const route = useRoute()
const world = useWorldStore()
const id = computed(() => String(route.params.id))
const def = world.derive((w) => w.defs.get(id.value) ?? null, null)
const nation = world.derive((w) => w.state.nations[id.value] ?? null, null)
/** The head coach (a copy, so a change of coach redraws), or null while the job is vacant. */
const coach = world.derive((w) => {
  const n = w.state.nations[id.value]
  if (!n?.coachId) return null
  if (n.coachId === USER_COACH) {
    const c = w.state.career
    return {
      link: "/coach/me",
      name: c.managerName,
      coach: null,
      manager: {
        name: c.managerName,
        nationality: c.nationality,
        nationId: c.nationId,
        seed: w.state.seed,
        face: c.face,
      },
    }
  }
  const c = w.state.coaches?.[n.coachId]
  return c ? { link: `/coach/${c.id}`, name: n.coach, coach: { ...c }, manager: null } : null
}, null)
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
    .slice(0, 20)
)

const achievements = world.derive((w) => achievementsOf(w.state.competitions, id.value), {
  finishes: [],
  records: [],
} as ReturnType<typeof achievementsOf>)

function finishLabel(f: Finish): string {
  if (f.place === 1) return t("nation.honours.champions")
  if (f.place === 2) return t("nation.honours.runnersUp")
  if (f.place === 3) return t("nation.honours.third")
  if (f.round) return resolveText(stageText(f.round))
  if (f.position) return t("nation.honours.position", { n: f.position })
  return t("nation.honours.groups")
}

const tone = (f: Finish) =>
  f.place === 1 ? "gold" : f.place ? "podium" : f.round ? "knockout" : "out"

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
        <div class="coach">
          <span class="muted">{{ t("nation.coach") }}</span>
          <RouterLink v-if="coach" :to="coach.link" class="coach-link">
            <PersonFace :coach="coach.coach" :manager="coach.manager" :size="28" head />
            {{ coach.name }}
          </RouterLink>
          <span v-else-if="nation.coachId === null" class="vacant">
            {{ t("nation.vacant") }}
            <template v-if="nation.vacantSince">
              · {{ t("coaches.vacantSince", { date: formatDate(nation.vacantSince) }) }}
            </template>
          </span>
          <template v-else>{{ nation.coach }}</template>
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
        { value: 'honours', label: t('nation.honours.tab') },
        { value: 'squad', label: t('nation.squad') },
        { value: 'pool', label: t('nation.players') },
      ]"
      size="sm"
      @update:model-value="(v) => (tab = v)"
    />

    <template v-if="tab === 'overview'">
      <RivalList :nation-id="def.id" />
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

    <template v-else-if="tab === 'honours'">
      <NationRecords :nation-id="def.id" />
      <template v-if="achievements.records.length">
        <AppSectionHeader :title="t('nation.honours.summary')" />
        <div class="list">
          <div v-for="r in achievements.records" :key="r.defId" class="honour">
            <div class="honour-main">
              <strong>{{ compName({ defId: r.defId, year: 0 }, "plain") }}</strong>
              <span class="muted">
                {{ t("nation.honours.appearances", { n: r.appearances }, r.appearances) }}
                · {{ t("nation.honours.best", { finish: finishLabel(r.best) }) }}
              </span>
            </div>
            <span v-if="r.titles.length" class="titles">★ {{ r.titles.length }}</span>
          </div>
        </div>
        <AppSectionHeader :title="t('nation.honours.editions')" />
        <div class="list">
          <div v-for="f in achievements.finishes" :key="f.compId" class="honour">
            <div class="honour-main">
              <strong>{{ compName(f) }}</strong>
              <span v-if="f.host" class="muted">{{ t("nation.honours.host") }}</span>
            </div>
            <span class="finish" :class="tone(f)">{{ finishLabel(f) }}</span>
          </div>
        </div>
      </template>
      <AppEmptyState v-else-if="!nation.record?.played" :title="t('nation.honours.none')" />
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
.coach {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.coach-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1-5);
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}

.vacant {
  color: var(--warning);
  font-weight: 600;
}

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

.honour {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-sm);
  border-bottom: 1px solid var(--border-light);
}

.honour:last-child {
  border-bottom: none;
}

.honour-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.honour-main .muted {
  font-size: var(--fs-xs);
}

.titles,
.finish.gold {
  color: var(--gold);
  font-weight: 700;
}

.finish {
  flex-shrink: 0;
  text-align: end;
}

.finish.podium {
  font-weight: 600;
}

.finish.out {
  color: var(--text-muted);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}
</style>
