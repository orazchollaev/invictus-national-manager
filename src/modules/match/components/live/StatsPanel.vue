<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { AppStatBar } from "@/components/ui"
import type { TeamStats } from "@/engine/match/types"
import type { LaneShares } from "@/engine/match/lanes"

defineProps<{
  home: TeamStats
  away: TeamStats
  /** Attacks by lane for each side, when the events are at hand. */
  lanes?: LaneShares
}>()

const { t } = useI18n()
</script>

<template>
  <div class="stats">
    <AppStatBar
      :label="t('match.stats.possession')"
      :home="home.possession"
      :away="away.possession"
      unit="%"
    />
    <AppStatBar :label="t('match.stats.shots')" :home="home.shots" :away="away.shots" />
    <AppStatBar :label="t('match.stats.onTarget')" :home="home.onTarget" :away="away.onTarget" />
    <AppStatBar
      :label="t('match.stats.xg')"
      :home="Math.round(home.xg * 100) / 100"
      :away="Math.round(away.xg * 100) / 100"
    />
    <AppStatBar :label="t('match.stats.corners')" :home="home.corners" :away="away.corners" />
    <AppStatBar :label="t('match.stats.fouls')" :home="home.fouls" :away="away.fouls" />
    <AppStatBar :label="t('match.stats.offsides')" :home="home.offsides" :away="away.offsides" />
    <AppStatBar :label="t('match.stats.saves')" :home="home.saves" :away="away.saves" />
    <AppStatBar :label="t('match.stats.yellows')" :home="home.yellows" :away="away.yellows" />
    <AppStatBar :label="t('match.stats.reds')" :home="home.reds" :away="away.reds" />
    <template v-if="lanes">
      <h3 class="zones">{{ t("match.stats.lanes") }}</h3>
      <AppStatBar :label="t('match.stats.left')" :home="lanes.home.left" :away="lanes.away.left" />
      <AppStatBar
        :label="t('match.stats.centre')"
        :home="lanes.home.centre"
        :away="lanes.away.centre"
      />
      <AppStatBar
        :label="t('match.stats.right')"
        :home="lanes.home.right"
        :away="lanes.away.right"
      />
    </template>
  </div>
</template>

<style scoped>
.zones {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-3);
}
</style>
