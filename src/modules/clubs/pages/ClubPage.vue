<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { AppCard, AppChip, AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell, ProfileHero, StatTiles } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { PlayerRow } from "@/modules/squad/components/list"
import { ClubCrest, ClubRelation } from "@/modules/clubs/components/club"
import { useClub } from "@/modules/clubs/composables/useClub"
import { academyEffect, bandKey, seats } from "@/modules/clubs/utils/format"
import { nationName } from "@/i18n/text"

const { t } = useI18n()
const route = useRoute()
const id = computed(() => String(route.params.id))
const view = useClub(id)

const effect = computed(() => (view.value ? academyEffect(view.value.profile.academy) : 0))
</script>

<template>
  <PageShell
    v-if="view"
    :title="view.club.name"
    :subtitle="`${view.profile.city} · ${nationName(view.club.nationId)}`"
    back
  >
    <ProfileHero>
      <template #face>
        <ClubCrest :colors="view.profile.colors" :size="56" />
      </template>
      <NationFlag :id="view.club.nationId" :size="22" name link />
      <div class="chips">
        <AppChip variant="accent" size="sm">{{ t("clubs.level", { n: view.club.tier }) }}</AppChip>
        <AppChip size="sm">{{ t("clubs.founded", { year: view.profile.founded }) }}</AppChip>
      </div>
      <span v-if="view.profile.ground" class="muted">
        {{
          t("clubs.groundLine", {
            name: view.profile.ground.name,
            seats: seats(view.profile.ground.capacity),
          })
        }}
      </span>
    </ProfileHero>

    <StatTiles
      :items="[
        { label: t('clubs.facts.reputation'), value: view.profile.reputation },
        { label: t('clubs.facts.budget'), value: view.profile.budget },
        { label: t('clubs.facts.academy'), value: `${view.profile.academy}/20` },
      ]"
    />

    <AppCard padding="md">
      <dl class="facts">
        <dt>{{ t("clubs.facts.reputation") }}</dt>
        <dd>{{ t(`clubs.band.${bandKey(view.profile.reputation)}`) }}</dd>
        <dt>{{ t("clubs.facts.budget") }}</dt>
        <dd>{{ t(`clubs.band.${bandKey(view.profile.budget)}`) }}</dd>
        <dt>{{ t("clubs.facts.academy") }}</dt>
        <dd>
          {{
            effect > 0
              ? t("clubs.academy.faster", { n: effect })
              : effect < 0
                ? t("clubs.academy.slower", { n: -effect })
                : t("clubs.academy.even")
          }}
        </dd>
        <template v-if="view.rival">
          <dt>{{ t("clubs.facts.rival") }}</dt>
          <dd>
            <RouterLink :to="`/club/${view.rival.id}`" class="link">
              {{ view.rival.name }}
            </RouterLink>
          </dd>
        </template>
      </dl>
    </AppCard>

    <ClubRelation :club-id="view.club.id" />

    <AppCard v-if="view.mine.length" padding="none">
      <AppSectionHeader class="head" :title="t('clubs.yours')" />
      <PlayerRow v-for="p in view.mine" :key="p.id" :player="p" compact />
    </AppCard>

    <AppCard padding="none">
      <AppSectionHeader class="head" :title="t('clubs.best')" />
      <PlayerRow v-for="p in view.best" :key="p.id" :player="p">
        <template #extra>
          <NationFlag :id="p.nationId" :size="14" name="short" />
        </template>
      </PlayerRow>
    </AppCard>

    <AppCard padding="md">
      <AppSectionHeader :title="t('clubs.league', { nation: nationName(view.club.nationId) })" />
      <div v-for="l in view.league" :key="l.level" class="level">
        <h3 class="level-title">{{ t("clubs.level", { n: l.level }) }}</h3>
        <div class="level-clubs">
          <RouterLink
            v-for="c in l.clubs"
            :key="c.id"
            :to="`/club/${c.id}`"
            class="chip-link"
            :class="{ 'chip-link--here': c.id === view.club.id }"
          >
            {{ c.name }}
          </RouterLink>
        </div>
      </div>
    </AppCard>
  </PageShell>
  <AppEmptyState v-else :title="t('clubs.notFound')" :description="t('clubs.notFoundHint')" />
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.muted {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--sp-2) var(--sp-4);
  margin: 0;
}

.facts dt {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.facts dd {
  margin: 0;
  font-weight: 600;
}

.link {
  color: var(--accent);
  text-decoration: none;
}

.head {
  padding: var(--sp-3) var(--sp-3) var(--sp-1);
}

.level + .level {
  margin-top: var(--sp-3);
}

.level-title {
  margin: var(--sp-2) 0 var(--sp-1);
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.level-clubs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.chip-link {
  padding: 2px var(--sp-2);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-pill);
  font-size: var(--fs-sm);
  color: var(--text);
  text-decoration: none;
}

.chip-link:hover {
  background: var(--bg-hover);
}

.chip-link--here {
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 700;
}
</style>
