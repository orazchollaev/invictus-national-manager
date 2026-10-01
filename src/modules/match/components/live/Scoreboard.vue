<script setup lang="ts">
import { NationFlag } from "@/modules/nations/components/badge"

defineProps<{
  home: string
  away: string
  score: [number, number]
  clock: string
  label?: string
  pens?: [number, number]
  aggregate?: [number, number]
}>()
</script>

<template>
  <div class="board">
    <div v-if="label" class="board-label">{{ label }}</div>
    <div class="board-row">
      <div class="team">
        <NationFlag :id="home" :size="36" />
        <span class="team-code">{{ home }}</span>
      </div>
      <div class="score">
        <span :key="score[0]" class="num">{{ score[0] }}</span>
        <span class="dash">–</span>
        <span :key="score[1]" class="num">{{ score[1] }}</span>
      </div>
      <div class="team">
        <NationFlag :id="away" :size="36" />
        <span class="team-code">{{ away }}</span>
      </div>
    </div>
    <div class="board-clock">
      {{ clock }}
      <template v-if="pens">· Pens {{ pens[0] }}–{{ pens[1] }}</template>
      <template v-if="aggregate">· Agg {{ aggregate[0] }}–{{ aggregate[1] }}</template>
    </div>
  </div>
</template>

<style scoped>
.board {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  padding: calc(var(--safe-top) + var(--sp-2)) var(--sp-4) var(--sp-2);
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.board-label {
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.board-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-1);
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.team-code {
  font-size: var(--fs-sm);
  font-weight: 700;
}

.score {
  display: flex;
  gap: var(--sp-2);
  font-size: var(--fs-2xl);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.num {
  animation: score-bump 0.8s var(--ease);
}

@keyframes score-bump {
  30% {
    transform: scale(1.5);
    color: var(--live);
  }
}

.dash {
  color: var(--text-muted);
}

.board-clock {
  /* One line always, so penalties or an aggregate never push the screen down. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--live);
  font-variant-numeric: tabular-nums;
}
</style>
