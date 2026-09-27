<script setup lang="ts">
import { AppStatBar } from "@/components/ui"
import type { TeamStats } from "@/engine/match/types"

defineProps<{ home: TeamStats; away: TeamStats }>()
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
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-3);
}
</style>
