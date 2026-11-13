<script setup lang="ts">
/** A club's colours as a small shield: home colour over away colour, split on the diagonal. */
import { computed } from "vue"

const props = withDefaults(defineProps<{ colors: [string, string]; size?: number }>(), {
  size: 28,
})

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${Math.round(props.size * 1.15)}px`,
  background: `linear-gradient(135deg, ${props.colors[0]} 0 50%, ${props.colors[1]} 50% 100%)`,
}))
</script>

<template>
  <span class="crest" :style="style" aria-hidden="true" />
</template>

<style scoped>
.crest {
  display: inline-block;
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 6px 6px 50% 50% / 6px 6px 40% 40%;
}
</style>
