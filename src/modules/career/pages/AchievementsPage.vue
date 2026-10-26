<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { Lock, Trophy } from "@lucide/vue"
import { AppCard } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { achievementList } from "@/engine/career/milestones"

const { t } = useI18n()
const world = useWorldStore()

const list = world.derive((w) => achievementList(w), [])
const done = computed(() => list.value.filter((a) => a.done).length)
/** Earned ones last, the nearest to done first among the rest. */
const rows = computed(() =>
  [...list.value].sort(
    (a, b) => Number(a.done) - Number(b.done) || b.progress / b.target - a.progress / a.target
  )
)
</script>

<template>
  <PageShell back :title="t('career.achievements')">
    <AppCard padding="md" class="summary">
      <strong>{{ t("career.achievementsCount", { done, total: list.length }) }}</strong>
      <div class="bar" role="progressbar" :aria-valuenow="done" :aria-valuemax="list.length">
        <div class="fill" :style="{ width: `${list.length ? (done / list.length) * 100 : 0}%` }" />
      </div>
    </AppCard>

    <div class="list">
      <div v-for="a in rows" :key="a.id" class="row" :class="{ done: a.done }">
        <Trophy v-if="a.done" :size="20" class="icon" />
        <Lock v-else :size="20" class="icon" />
        <div class="text">
          <span class="title">{{ $tx(a.text) }}</span>
          <div v-if="!a.done && a.counting" class="progress">
            <div class="bar small">
              <div class="fill" :style="{ width: `${(a.progress / a.target) * 100}%` }" />
            </div>
            <span class="muted">{{ a.progress }}/{{ a.target }}</span>
          </div>
        </div>
        <span v-if="a.date" class="muted">{{ formatDate(a.date) }}</span>
      </div>
    </div>
  </PageShell>
</template>

<style scoped>
.summary :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.bar {
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  overflow: hidden;
}

.bar.small {
  flex: 1;
  height: 6px;
}

.fill {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text-muted);
}

.row.done {
  color: var(--text);
}

.icon {
  flex-shrink: 0;
}

.row.done .icon {
  color: var(--gold-text);
}

.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.title {
  font-weight: 600;
}

.progress {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.muted {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: var(--fs-xs);
}
</style>
