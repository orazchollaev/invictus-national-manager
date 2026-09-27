<script setup lang="ts">
defineProps<{
  value: string | number
  /** CSS colour (a token). */
  tone?: string
  wide?: boolean
}>()
</script>

<template>
  <span
    class="pill"
    :class="{ 'pill--wide': wide }"
    :style="{ '--pill': tone ?? 'var(--text-muted)' }"
  >
    {{ value }}
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 22px;
  padding: 0 6px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--pill) 16%, transparent);
  color: var(--pill);
  font-size: var(--fs-sm);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pill--wide {
  min-width: 42px;
}
</style>
