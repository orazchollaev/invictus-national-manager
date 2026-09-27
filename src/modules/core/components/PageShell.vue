<script setup lang="ts">
import { ChevronLeft } from "@lucide/vue"
import { useRouter } from "vue-router"

defineProps<{
  title?: string
  subtitle?: string
  /** Show a back button in the title row. */
  back?: boolean
  /** Replaces going back in history (multi-step pages step back first). */
  onBack?: () => void
}>()

const router = useRouter()
</script>

<template>
  <div class="page">
    <div v-if="title || $slots.actions" class="page-head">
      <button
        v-if="back"
        class="page-back"
        aria-label="Back"
        @click="onBack ? onBack() : router.back()"
      >
        <ChevronLeft :size="30" />
      </button>
      <div class="page-titles">
        <h1 v-if="title" class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions"><slot name="actions" /></div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--sp-3) var(--sp-4) var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.page-head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 40px;
}

.page-back {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius);
  background: none;
  color: var(--text);
  padding: 0;
}

.page-titles {
  flex: 1;
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-subtitle {
  margin: 2px 0 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.page-actions {
  display: flex;
  gap: var(--sp-1);
  flex-shrink: 0;
}
</style>
