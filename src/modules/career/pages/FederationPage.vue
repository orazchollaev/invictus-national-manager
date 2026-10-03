<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppSectionHeader } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { ObjectiveList } from "@/modules/career/components/objectives"
import { NationFlag } from "@/modules/nations/components/badge"
import { nationName } from "@/i18n/text"
import { formatDate } from "@/i18n/dates"
import { useWorldStore } from "@/modules/world/store"
import { SUPPORT_TUNING } from "@/engine/career/support"
import { rivalsOf } from "@/engine/world/rivals"

const { t } = useI18n()
const world = useWorldStore()
const career = world.derive((w) => w.state.career, null)
const objectives = computed(() => [...(career.value?.objectives ?? [])].reverse())

const toneOf = (v: number) =>
  v >= 60 ? "var(--success)" : v >= 35 ? "var(--warning)" : "var(--danger)"
const tone = computed(() => toneOf(career.value?.confidence ?? 50))
const support = computed(() => Math.round(career.value?.support ?? SUPPORT_TUNING.start))
const supportTone = computed(() => toneOf(support.value))
const supportMood = computed(() =>
  support.value > SUPPORT_TUNING.high
    ? "adore"
    : support.value >= 55
      ? "happy"
      : support.value >= 40
        ? "patient"
        : support.value >= SUPPORT_TUNING.low
          ? "restless"
          : "angry"
)
const rivals = computed(() => (career.value?.nationId ? rivalsOf(career.value.nationId) : []))
</script>

<template>
  <PageShell
    back
    :title="t('career.federation.title')"
    :subtitle="career?.nationId ? nationName(career.nationId) : undefined"
  >
    <section v-if="career?.nationId" class="panel">
      <div class="head">
        <NationFlag :id="career.nationId" :size="36" />
        <div class="meter">
          <div class="meter-head">
            <span>{{ t("career.confidence") }}</span>
            <strong :style="{ color: tone }">{{ career.confidence }}%</strong>
          </div>
          <div class="bar">
            <span :style="{ width: `${career.confidence}%`, background: tone }"></span>
          </div>
        </div>
      </div>
      <div class="meter">
        <div class="meter-head">
          <span>{{ t("career.support") }}</span>
          <strong :style="{ color: supportTone }">{{ support }}%</strong>
        </div>
        <div class="bar">
          <span :style="{ width: `${support}%`, background: supportTone }"></span>
        </div>
        <p class="mood">{{ t(`career.mood.${supportMood}`) }}</p>
      </div>
      <div v-if="rivals.length" class="rivals">
        <span class="muted">{{ t("career.rivals") }}</span>
        <NationFlag v-for="r in rivals" :id="r.id" :key="r.id" :size="16" name="short" link />
      </div>
      <div class="facts">
        <div class="fact">
          <span class="muted">{{ t("career.reputation") }}</span>
          <strong>{{ Math.round(career.reputation) }}</strong>
        </div>
        <div class="fact">
          <span class="muted">{{ t("career.contractUntil") }}</span>
          <strong>{{ career.contractUntil ? formatDate(career.contractUntil) : "—" }}</strong>
        </div>
      </div>
    </section>

    <div v-if="career?.ultimatum" class="warning">
      <strong>{{ t("career.finalWarning") }}</strong>
      {{ t("career.ultimatum", { n: career.ultimatum.matches }, career.ultimatum.matches) }}
    </div>

    <AppSectionHeader :title="t('career.objectives')" />
    <ObjectiveList :objectives="objectives" />
  </PageShell>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.head {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.meter {
  flex: 1;
  min-width: 0;
}

.meter-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-2);
  margin-bottom: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.bar {
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.mood {
  margin: var(--sp-1) 0 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.rivals {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1) var(--sp-3);
  font-size: var(--fs-sm);
}

.bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--border-light);
}

.fact {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.warning {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--danger);
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  font-size: var(--fs-sm);
}

.warning strong {
  color: var(--danger);
}
</style>
