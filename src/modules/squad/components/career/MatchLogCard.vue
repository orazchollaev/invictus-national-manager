<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppButton, AppCard, AppSectionHeader } from "@/components/ui"
import { StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { compName, nationName } from "@/i18n/text"
import { formatDate } from "@/i18n/dates"
import { matchRatingTone } from "@/modules/core/utils/format"
import { useWorldStore } from "@/modules/world/store"
import { matchLog } from "@/modules/squad/utils/international"

const props = defineProps<{ playerId: string }>()

const { t } = useI18n()
const world = useWorldStore()

const SHOWN = 8
const all = ref(false)
const log = world.derive((w) => matchLog(props.playerId, w.state.fixtures, w.state.reports), [])
const shown = computed(() => (all.value ? log.value : log.value.slice(0, SHOWN)))

function comp(compId: string): string {
  if (compId === "friendly") return t("match.friendly")
  const inst = world.world?.state.competitions[compId]
  return inst ? compName(inst, "short") : ""
}
</script>

<template>
  <AppCard padding="md">
    <AppSectionHeader :title="t('squad.player.intl.log')" />
    <p v-if="!log.length" class="muted">{{ t("squad.player.intl.logEmpty") }}</p>
    <ul v-else class="log">
      <li v-for="e in shown" :key="e.fixtureId">
        <RouterLink :to="`/report/${e.fixtureId}`" class="row">
          <NationFlag :id="e.opp" :size="20" />
          <span class="what">
            <strong>{{ nationName(e.opp) }}</strong>
            <span class="muted">{{ formatDate(e.date) }} · {{ comp(e.compId) }}</span>
          </span>
          <span class="line">
            <span class="muted">{{ t("squad.player.intl.mins", { n: e.minutes }) }}</span>
            <span v-if="e.goals" class="goals">⚽{{ e.goals > 1 ? `×${e.goals}` : "" }}</span>
          </span>
          <StatPill :value="e.rating.toFixed(1)" :tone="matchRatingTone(e.rating)" />
        </RouterLink>
      </li>
    </ul>
    <AppButton v-if="!all && log.length > SHOWN" variant="text" size="sm" block @click="all = true">
      {{ t("squad.player.intl.showAll", { n: log.length }) }}
    </AppButton>
  </AppCard>
</template>

<style scoped>
.log {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) 0;
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.what {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.what strong,
.what .muted {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: var(--fs-xs);
}

.goals {
  font-weight: 700;
}

.muted {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}
</style>
