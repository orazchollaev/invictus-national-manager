<script setup lang="ts">
import { useI18n } from "vue-i18n"

defineProps<{
  home: string
  away: string
  /** Share of the ball so far, in percent. */
  share: [number, number]
  homeColor: string
  awayColor: string
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="pressure"
    role="img"
    :aria-label="t('match.possession', { home, homePct: share[0], away, awayPct: share[1] })"
  >
    <span class="label">{{ home }} {{ share[0] }}%</span>
    <div class="bar">
      <span class="seg" :style="{ width: `${share[0]}%`, background: homeColor }"></span>
      <span class="seg" :style="{ width: `${share[1]}%`, background: awayColor }"></span>
    </div>
    <span class="label">{{ share[1] }}% {{ away }}</span>
  </div>
</template>

<style scoped>
.pressure {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-xs);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.bar {
  display: flex;
  height: 10px;
  gap: 2px;
  border-radius: var(--radius-pill);
  overflow: hidden;
  background: var(--border-light);
}

.seg {
  height: 100%;
  transition: width 0.6s var(--ease);
}
</style>
