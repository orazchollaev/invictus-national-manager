<script setup lang="ts">
/** The board's final warning: turn results round in a few matches, or go. */
import { ref } from "vue"
import { TriangleAlert } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { useWorldStore } from "@/modules/world/store"
import { CAREER_TUNING } from "@/engine/career/career"

const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const info = world.derive((w) => {
  const c = w.state.career
  if (!c.nationId) return null
  return {
    name: w.def(c.nationId).name,
    confidence: c.confidence,
    matches: c.ultimatum?.matches ?? CAREER_TUNING.ultimatumMatches,
  }
}, null)
</script>

<template>
  <AppSheet
    ref="sheet"
    title="Final warning"
    :dismiss-on-outside-click="false"
    @close="world.seenUltimatum()"
  >
    <div v-if="info" class="warn">
      <TriangleAlert :size="40" class="icon" />
      <h2 class="title">The {{ info.name }} federation is losing patience</h2>
      <p class="body">
        Confidence has fallen to
        <strong>{{ info.confidence }}%.</strong>
        Lift it to {{ CAREER_TUNING.ultimatumLifted }}% within your next
        {{ info.matches }} competitive matches, or you will be replaced. Drop below
        {{ CAREER_TUNING.ultimatumSackBelow }}% before then and they will not wait that long.
      </p>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="filled" block @click="sheet?.close()">Understood</AppButton>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.warn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  text-align: center;
}

.icon {
  color: var(--danger);
}

.title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 800;
}

.body {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.body strong {
  color: var(--danger);
}

.actions {
  padding: var(--sp-3) var(--sp-4) calc(var(--sp-3) + var(--safe-bottom));
}
</style>
