<script setup lang="ts">
import { ref, onErrorCaptured, watch } from "vue"
import { useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { AlertTriangle } from "@lucide/vue"
import { useHaptic } from "@/composables/useHaptic"

const { t } = useI18n()
const haptic = useHaptic()
const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  console.error(err)
  haptic.error()
  return false
})

// An error belongs to the screen it happened on: moving to another screen clears it.
const route = useRoute()
watch(
  () => route.fullPath,
  () => (error.value = null)
)

function retry() {
  error.value = null
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <AlertTriangle :size="36" class="error-icon" />
    <p class="error-msg">{{ t("common.errorBoundaryMsg") }}</p>
    <code class="error-detail">{{ error.message }}</code>
    <button class="primary sm" @click="retry">{{ t("common.retry") }}</button>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 14px;
  text-align: center;
  min-height: 200px;
  animation:
    fade-up var(--dur) var(--ease),
    shake 0.5s var(--ease);
}
.error-icon {
  color: var(--text-muted);
  opacity: 0.4;
}
.error-detail {
  max-width: 320px;
  font-size: var(--fs-xs);
  color: var(--text-muted);
  word-break: break-word;
}

.error-msg {
  color: var(--text-muted);
  font-size: var(--fs-base);
  max-width: 260px;
}
</style>
