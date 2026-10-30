<script setup lang="ts">
/** A row of headline numbers under a person's hero card. */
defineProps<{ items: { label: string; value: string | number; tone?: string }[] }>()
</script>

<template>
  <div class="tiles">
    <div v-for="i in items" :key="i.label" class="tile">
      <span class="tile-label">{{ i.label }}</span>
      <strong class="tile-value" :style="i.tone ? { color: i.tone } : undefined">
        {{ i.value }}
      </strong>
    </div>
  </div>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: var(--sp-2);
}

.tile {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.tile-label {
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-value {
  font-size: var(--fs-xl);
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
</style>
