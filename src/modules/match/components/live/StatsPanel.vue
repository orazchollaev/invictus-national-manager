<script setup lang="ts">
import { AppStatBar } from "@/components/ui"
import type { TeamStats } from "@/engine/match/types"
import type { LaneShares } from "@/engine/match/lanes"

defineProps<{
  home: TeamStats
  away: TeamStats
  /** Attacks by lane for each side, when the events are at hand. */
  lanes?: LaneShares
}>()
</script>

<template>
  <div class="stats">
    <AppStatBar label="Possession" :home="home.possession" :away="away.possession" unit="%" />
    <AppStatBar label="Shots" :home="home.shots" :away="away.shots" />
    <AppStatBar label="On target" :home="home.onTarget" :away="away.onTarget" />
    <AppStatBar
      label="Expected goals"
      :home="Math.round(home.xg * 100) / 100"
      :away="Math.round(away.xg * 100) / 100"
    />
    <AppStatBar label="Corners" :home="home.corners" :away="away.corners" />
    <AppStatBar label="Fouls" :home="home.fouls" :away="away.fouls" />
    <AppStatBar label="Offsides" :home="home.offsides" :away="away.offsides" />
    <AppStatBar label="Saves" :home="home.saves" :away="away.saves" />
    <AppStatBar label="Yellow cards" :home="home.yellows" :away="away.yellows" />
    <AppStatBar label="Red cards" :home="home.reds" :away="away.reds" />
    <template v-if="lanes">
      <h3 class="zones">Attacks by side · each team's own left and right</h3>
      <AppStatBar label="Down the left" :home="lanes.home.left" :away="lanes.away.left" />
      <AppStatBar label="Through the middle" :home="lanes.home.centre" :away="lanes.away.centre" />
      <AppStatBar label="Down the right" :home="lanes.home.right" :away="lanes.away.right" />
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
