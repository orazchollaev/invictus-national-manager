<script setup lang="ts">
defineProps<{
  /** Sit above the bottom navigation (screens that show it). */
  aboveNav?: boolean
}>()
</script>

<template>
  <!-- The spacer keeps the last card clear of the bar instead of hiding under it. -->
  <div class="cta-spacer" aria-hidden="true"></div>
  <div class="cta-bar" :class="{ 'cta-bar--nav': aboveNav }">
    <div class="cta-inner"><slot /></div>
  </div>
</template>

<style scoped>
.cta-spacer {
  height: 64px;
  flex-shrink: 0;
}

.cta-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-bottom-bar);
  padding: var(--sp-2) var(--sp-4) calc(var(--safe-bottom) + var(--sp-2));
  background: linear-gradient(to top, var(--bg) 70%, transparent);
}

.cta-bar--nav {
  bottom: var(--mobile-nav-offset);
  padding-bottom: var(--sp-2);
}

.cta-inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  gap: var(--sp-2);
}

.cta-inner > :deep(*) {
  flex: 1;
}
</style>
