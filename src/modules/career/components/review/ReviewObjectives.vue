<script setup lang="ts">
import { Circle, CircleCheck, CircleX } from "@lucide/vue"
import type { CareerReview } from "@/engine/world/types"
import { StatPill } from "@/modules/core/components"

defineProps<{ objectives: CareerReview["objectives"] }>()
</script>

<template>
  <ul class="objectives">
    <li v-for="(o, i) in objectives" :key="i" :class="`obj--${o.status}`">
      <CircleCheck v-if="o.status === 'met'" :size="18" class="icon" />
      <CircleX v-else-if="o.status === 'failed'" :size="18" class="icon" />
      <Circle v-else :size="18" class="icon" />
      <span class="text">{{ o.text }}</span>
      <StatPill v-if="o.critical" value="Key" tone="var(--danger)" />
    </li>
  </ul>
</template>

<style scoped>
.objectives {
  margin: 0;
  padding: var(--sp-3) var(--sp-4);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.text {
  flex: 1;
  min-width: 0;
}

.icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.obj--met .icon {
  color: var(--success);
}

.obj--failed .icon {
  color: var(--danger);
}
</style>
