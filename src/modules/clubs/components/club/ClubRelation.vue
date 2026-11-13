<script setup lang="ts">
/** The manager's goodwill with one club, and the dealings behind it. */
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppCard, AppChip, AppSectionHeader } from "@/components/ui"
import { NEUTRAL, type ClubEvent } from "@/engine/clubs/ties"
import { formatDate } from "@/i18n/dates"
import { useWorldStore } from "@/modules/world/store"
import { moodKey, relTone } from "@/modules/clubs/utils/format"
import ClubMeter from "./ClubMeter.vue"

const props = defineProps<{ clubId: string }>()

const { t } = useI18n()
const world = useWorldStore()

const rel = world.derive((w) => w.clubRel(props.clubId), NEUTRAL)
const log = world.derive(
  (w) => [...(w.state.clubTies?.log[props.clubId] ?? [])].reverse(),
  [] as ClubEvent[]
)
const tone = computed(() => relTone(rel.value))
const signed = (n: number) => (n > 0 ? `+${n}` : String(n))
</script>

<template>
  <AppCard padding="md" class="relation">
    <AppSectionHeader :title="t('clubs.relation.title')">
      <template #actions>
        <AppChip :variant="rel >= 62 ? 'success' : rel < 38 ? 'danger' : 'neutral'" size="sm">
          {{ t(`clubs.mood.${moodKey(rel)}`) }}
        </AppChip>
      </template>
    </AppSectionHeader>

    <ClubMeter
      :label="t('clubs.relation.title')"
      :value="rel"
      :word="String(Math.round(rel))"
      :tone="tone"
      :mark="NEUTRAL"
    />
    <p class="hint">{{ t("clubs.relation.hint") }}</p>

    <h3 class="log-title">{{ t("clubs.relation.log") }}</h3>
    <ul v-if="log.length" class="log">
      <li v-for="(e, i) in log" :key="i" class="log-item">
        <span class="log-delta" :class="e.delta < 0 ? 'bad' : 'good'">{{ signed(e.delta) }}</span>
        <span class="log-text">{{ $tx(e.text) }}</span>
        <span class="log-date">{{ formatDate(e.date) }}</span>
      </li>
    </ul>
    <p v-else class="hint">{{ t("clubs.relation.none") }}</p>
  </AppCard>
</template>

<style scoped>
.relation {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.log-title {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.log {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.log-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: baseline;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.log-delta {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.good {
  color: var(--success);
}

.bad {
  color: var(--danger);
}

.log-date {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
