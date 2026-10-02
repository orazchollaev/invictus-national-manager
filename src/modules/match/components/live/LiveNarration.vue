<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { MatchEvent } from "@/engine/match/types"
import { commentaryText } from "@/i18n"
import { clock, commentaryLine, isMinor, type CommentaryNames } from "@/engine/match/commentary"

const props = defineProps<{
  events: readonly MatchEvent[]
  names: CommentaryNames
  verbose: boolean
}>()

const { t } = useI18n()

/** The latest line worth saying, keyed by its place in the event list so a new one fades in. */
const current = computed(() => {
  for (let i = props.events.length - 1; i >= 0; i--) {
    const ev = props.events[i]
    if (!props.verbose && isMinor(ev.kind)) continue
    const text = commentaryLine(ev, i, props.names, commentaryText())
    if (text) return { key: i, clock: clock(ev), text }
  }
  return null
})
</script>

<template>
  <div class="narration" aria-live="polite">
    <p v-if="current" :key="current.key" class="text">
      <span class="clock">{{ current.clock }}</span>
      {{ current.text }}
    </p>
    <p v-else class="text text--idle">{{ t("match.waiting") }}</p>
  </div>
</template>

<style scoped>
.narration {
  min-height: calc(var(--fs-md) * 1.4 * 2.2 + var(--sp-1));
  display: flex;
  align-items: center;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  background: var(--surface);
}

.text {
  margin: 0;
  font-size: var(--fs-sm);
  font-weight: 600;
  line-height: 1.4;
  animation: fade-up var(--dur) var(--ease);
}

.text--idle {
  color: var(--text-muted);
}

.clock {
  margin-inline-end: var(--sp-1);
  color: var(--live);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
