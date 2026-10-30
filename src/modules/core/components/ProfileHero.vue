<script setup lang="ts">
/** The top card of a person's page: face on the left, who they are beside it. */
</script>

<template>
  <section class="hero">
    <div class="hero-face"><slot name="face" /></div>
    <div class="hero-text"><slot /></div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.hero-face {
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-2);
}
</style>
