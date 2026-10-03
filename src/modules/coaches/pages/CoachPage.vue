<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { AppCard, AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { PersonFace } from "@/modules/core/components/face"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { ageOn } from "@/engine/players/ability"
import { USER_COACH } from "@/engine/career/coaches"
import { abilityTone } from "@/modules/core/utils/format"

const { t } = useI18n()
const route = useRoute()
const world = useWorldStore()
const id = computed(() => String(route.params.id))

/** The coach, or the user when the id is his. A fresh copy, so every tick redraws it. */
const coach = world.derive((w) => {
  if (id.value === USER_COACH) {
    const c = w.state.career
    return {
      name: c.managerName,
      manager: {
        name: c.managerName,
        nationality: c.nationality,
        nationId: c.nationId,
        seed: w.state.seed,
      },
      coach: null,
      nationality: c.nationality,
      born: undefined as string | undefined,
      reputation: c.reputation,
      nationId: c.nationId,
      confidence: c.nationId ? c.confidence : undefined,
      retired: undefined as string | undefined,
      available: undefined as string | undefined,
      player: undefined,
      history: c.history.map((h) => ({ ...h })),
    }
  }
  const c = w.state.coaches?.[id.value]
  if (!c) return null
  return {
    name: `${c.first} ${c.last}`,
    manager: null,
    coach: { ...c },
    nationality: c.nationality,
    born: c.born as string | undefined,
    reputation: c.reputation,
    nationId: c.nationId,
    confidence: c.nationId ? c.confidence : undefined,
    retired: c.retired,
    available: c.available && c.available > w.state.date ? c.available : undefined,
    player: c.player,
    history: c.history.map((h) => ({ ...h })),
  }
}, null)

const history = computed(() => [...(coach.value?.history ?? [])].reverse())
const subtitle = computed(() => {
  const c = coach.value
  if (!c) return ""
  if (c.manager) return t("coaches.profile.subtitleManager")
  return t("coaches.profile.subtitle", { age: c.born ? ageOn(c.born, world.date) : "?" })
})
</script>

<template>
  <PageShell v-if="coach" :title="coach.name" :subtitle="subtitle" back>
    <AppCard padding="md" class="head">
      <PersonFace :coach="coach.coach" :manager="coach.manager" :size="112" />
      <dl class="facts">
        <dt>{{ t("coaches.profile.nationality") }}</dt>
        <dd><NationFlag :id="coach.nationality" :size="18" name link /></dd>
        <dt>{{ t("coaches.profile.job") }}</dt>
        <dd>
          <NationFlag v-if="coach.nationId" :id="coach.nationId" :size="18" name link />
          <span v-else-if="coach.retired" class="muted">
            {{ t("coaches.profile.retiredOn", { date: formatDate(coach.retired) }) }}
          </span>
          <span v-else class="muted">{{ t("coaches.profile.outOfWork") }}</span>
        </dd>
        <template v-if="coach.born">
          <dt>{{ t("coaches.profile.born") }}</dt>
          <dd>{{ formatDate(coach.born) }}</dd>
        </template>
        <dt>{{ t("coaches.profile.reputation") }}</dt>
        <dd>
          <StatPill
            :value="Math.round(coach.reputation)"
            :tone="abilityTone(coach.reputation)"
            wide
          />
        </dd>
        <template v-if="coach.confidence !== undefined">
          <dt>{{ t("coaches.profile.confidence") }}</dt>
          <dd>{{ Math.round(coach.confidence) }}%</dd>
        </template>
      </dl>
    </AppCard>
    <p v-if="coach.available" class="note">
      {{ t("coaches.profile.availableFrom", { date: formatDate(coach.available) }) }}
    </p>

    <AppCard v-if="coach.player" padding="md">
      <AppSectionHeader :title="t('coaches.profile.asPlayer')" />
      <p class="line">
        {{
          t("coaches.profile.playerLine", {
            pos: coach.player.pos,
            caps: coach.player.caps,
            goals: coach.player.goals,
          })
        }}
      </p>
    </AppCard>

    <AppCard padding="md">
      <AppSectionHeader :title="t('coaches.profile.career')" />
      <ul v-if="history.length" class="stints">
        <li v-for="h in history" :key="`${h.nationId}-${h.from}`" class="stint">
          <NationFlag :id="h.nationId" :size="22" name link />
          <span class="when">
            {{ formatDate(h.from) }} – {{ h.to ? formatDate(h.to) : t("coaches.profile.present") }}
          </span>
          <span class="record">
            {{ t("coaches.profile.record", { p: h.played, w: h.won, d: h.drawn, l: h.lost }) }}
            <span v-if="h.left" class="left" :class="`left--${h.left}`">
              · {{ t(`coaches.profile.left.${h.left}`) }}
            </span>
          </span>
        </li>
      </ul>
      <p v-else class="muted">{{ t("coaches.profile.noCareer") }}</p>
    </AppCard>
  </PageShell>
  <AppEmptyState
    v-else
    :title="t('coaches.profile.notFound')"
    :description="t('coaches.profile.notFoundHint')"
  />
</template>

<style scoped>
.head :deep(.card-body) {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.facts {
  flex: 1;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--sp-1-5) var(--sp-3);
  margin: 0;
  min-width: 0;
}

.facts dt {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.facts dd {
  margin: 0;
  font-weight: 600;
  min-width: 0;
}

.note {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.line {
  margin: 0;
  font-weight: 600;
}

.stints {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.stint {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.when,
.record {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.left--sacked {
  color: var(--danger);
}

.muted {
  color: var(--text-muted);
  font-weight: 400;
}
</style>
