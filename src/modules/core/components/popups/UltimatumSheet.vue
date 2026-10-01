<script setup lang="ts">
/** The board's final warning: turn results round in a few matches, or go. */
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { TriangleAlert } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { CAREER_TUNING } from "@/engine/career/career"

const { t } = useI18n()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const info = world.derive((w) => {
  const c = w.state.career
  if (!c.nationId) return null
  return {
    name: nationName(c.nationId),
    confidence: c.confidence,
    matches: c.ultimatum?.matches ?? CAREER_TUNING.ultimatumMatches,
  }
}, null)
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="t('core.ultimatum.title')"
    :dismiss-on-outside-click="false"
    @close="world.seenUltimatum()"
  >
    <div v-if="info" class="warn">
      <TriangleAlert :size="40" class="icon" />
      <h2 class="title">{{ t("core.ultimatum.heading", { name: info.name }) }}</h2>
      <i18n-t keypath="core.ultimatum.body" tag="p" class="body">
        <template #confidence>
          <strong>{{ info.confidence }}%</strong>
        </template>
        <template #lifted>{{ CAREER_TUNING.ultimatumLifted }}</template>
        <template #matches>{{ info.matches }}</template>
        <template #sack>{{ CAREER_TUNING.ultimatumSackBelow }}</template>
      </i18n-t>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="filled" block @click="sheet?.close()">
          {{ t("core.ultimatum.understood") }}
        </AppButton>
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
