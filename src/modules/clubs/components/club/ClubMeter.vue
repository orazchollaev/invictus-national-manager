<script setup lang="ts">
/** A labelled bar from 0 to 100, with an optional tick (the neutral point of a relationship). */
import { computed } from "vue"

const props = defineProps<{
  label: string
  value: number
  /** The word beside the label. */
  word: string
  /** A CSS colour for the fill. */
  tone?: string
  /** Where to draw a tick, 0–100. */
  mark?: number
}>()

const width = computed(() => `${Math.max(0, Math.min(100, props.value))}%`)
</script>

<template>
  <div class="meter">
    <div class="meter-head">
      <span class="meter-label">{{ label }}</span>
      <span class="meter-word" :style="tone ? { color: tone } : undefined">{{ word }}</span>
    </div>
    <div
      class="meter-track"
      role="meter"
      :aria-valuenow="Math.round(value)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label"
    >
      <div class="meter-fill" :style="{ width, background: tone ?? 'var(--accent)' }" />
      <span
        v-if="mark !== undefined"
        class="meter-mark"
        :style="{ insetInlineStart: `${mark}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.meter {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.meter-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.meter-label {
  color: var(--text-muted);
}

.meter-word {
  font-weight: 700;
}

.meter-track {
  position: relative;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--bg-hover);
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
  transition: width var(--dur-fast) var(--ease);
}

.meter-mark {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--text);
  opacity: 0.35;
}

@media (prefers-reduced-motion: reduce) {
  .meter-fill {
    transition: none;
  }
}
</style>
