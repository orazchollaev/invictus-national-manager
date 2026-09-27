<script setup lang="ts">
import { computed } from "vue"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"

const world = useWorldStore()
const label = computed(() =>
  /^\d{4}-\d{2}-\d{2}$/.test(world.busyLabel) ? formatDate(world.busyLabel) : world.busyLabel
)
</script>

<template>
  <Transition name="fade">
    <div v-if="world.busy" class="busy" role="status" aria-live="polite">
      <div class="busy-card">
        <div class="busy-spinner"></div>
        <div class="busy-label">{{ label }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.busy {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--scrim);
}

.busy-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--elev-3);
}

.busy-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.busy-label {
  font-size: var(--fs-base);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur) var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
