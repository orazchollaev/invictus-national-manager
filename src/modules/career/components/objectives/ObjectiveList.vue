<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { AppEmptyState } from "@/components/ui"
import { StatPill } from "@/modules/core/components"
import type { BoardObjective } from "@/engine/world/types"

defineProps<{ objectives: BoardObjective[] }>()
const { t } = useI18n()

const statusTone = (s: string) =>
  s === "met" ? "var(--success)" : s === "failed" ? "var(--danger)" : "var(--text-muted)"
</script>

<template>
  <AppEmptyState v-if="!objectives.length" :title="t('career.noObjectives')" />
  <div v-else class="list">
    <div v-for="o in objectives" :key="o.id" class="row">
      <span class="row-text">
        {{ $tx(o.text) }}
        <small v-if="o.ambition === 1" class="ambition up">{{ t("career.ambition.up") }}</small>
        <small v-else-if="o.ambition === -1" class="ambition down">
          {{ t("career.ambition.down") }}
        </small>
        <small v-else-if="o.broken" class="ambition down">
          {{ t("career.ambition.broken") }}
        </small>
      </span>
      <StatPill
        v-if="o.kind === 'debuts' && o.status === 'open'"
        :value="`${o.progress ?? 0}/${o.count}`"
      />
      <StatPill v-if="o.critical" :value="t('career.key')" tone="var(--danger)" />
      <StatPill :value="t(`career.status.${o.status}`)" :tone="statusTone(o.status)" wide />
    </div>
  </div>
</template>

<style scoped>
.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ambition {
  font-size: var(--fs-xs);
  font-weight: 700;
}

.ambition.up {
  color: var(--accent);
}

.ambition.down {
  color: var(--warning);
}
</style>
