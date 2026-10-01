<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { CareerSnapshot } from "@/engine/world/types"

const props = defineProps<{ before: CareerSnapshot; after: CareerSnapshot }>()
const { t } = useI18n()
const rows = computed(() => [
  {
    label: t("career.review.federationConfidence"),
    from: props.before.confidence,
    to: props.after.confidence,
    unit: "%",
  },
  {
    label: t("career.review.yourReputation"),
    from: props.before.reputation,
    to: props.after.reputation,
    unit: "",
  },
  {
    label: t("career.review.academyLevel"),
    from: props.before.youth,
    to: props.after.youth,
    unit: "",
  },
])

const round = (v: number) => Math.round(v * 10) / 10
const tone = (d: number) =>
  d > 0 ? "var(--success)" : d < 0 ? "var(--danger)" : "var(--text-muted)"
const signed = (d: number) => `${d > 0 ? "+" : ""}${round(d)}`
</script>

<template>
  <section class="meters">
    <div v-for="r in rows" :key="r.label" class="meter">
      <div class="meter-head">
        <span>{{ r.label }}</span>
        <span>
          {{ round(r.from) }}{{ r.unit }} →
          <strong>{{ round(r.to) }}{{ r.unit }}</strong>
          <em :style="{ color: tone(r.to - r.from) }">{{ signed(r.to - r.from) }}</em>
        </span>
      </div>
      <div class="bar">
        <span class="ghost" :style="{ width: `${r.from}%` }"></span>
        <span class="fill" :style="{ width: `${r.to}%`, background: tone(r.to - r.from) }"></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.meters {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.meter-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-2);
  margin-bottom: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.meter-head strong {
  color: var(--text);
}

.meter-head em {
  margin-inline-start: var(--sp-1);
  font-style: normal;
  font-weight: 700;
}

.bar {
  position: relative;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.bar span {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
}

.ghost {
  background: color-mix(in srgb, var(--text-muted) 40%, transparent);
}

.fill {
  opacity: 0.9;
  transition: width var(--dur) var(--ease);
}
</style>
