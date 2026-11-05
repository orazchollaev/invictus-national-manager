<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppCard, AppSectionHeader } from "@/components/ui"
import type { Player } from "@/engine/types"
import { compName } from "@/i18n/text"
import { formatDate } from "@/i18n/dates"
import { useWorldStore } from "@/modules/world/store"
import { honoursOf } from "@/modules/squad/utils/international"

const props = defineProps<{ player: Player }>()

const { t } = useI18n()
const world = useWorldStore()

const average = computed(() => {
  const r = props.player.intlRating
  return r && r[1] ? (r[0] / r[1]).toFixed(1) : "—"
})

const honours = world.derive((w) => honoursOf(props.player.id, w.state.competitions), [])
</script>

<template>
  <AppCard padding="md">
    <AppSectionHeader :title="t('squad.player.intl.title')" />
    <dl class="facts">
      <dt>{{ t("squad.player.intl.caps") }}</dt>
      <dd>{{ player.caps }}</dd>
      <dt>{{ t("squad.player.intl.goals") }}</dt>
      <dd>{{ player.goals }}</dd>
      <dt>{{ t("squad.player.intl.assists") }}</dt>
      <dd>{{ player.assists }}</dd>
      <template v-if="player.pos === 'GK'">
        <dt>{{ t("squad.player.intl.cleanSheets") }}</dt>
        <dd>{{ player.cleanSheets ?? 0 }}</dd>
      </template>
      <dt>{{ t("squad.player.intl.rating") }}</dt>
      <dd>{{ average }}</dd>
      <dt>{{ t("squad.player.intl.minutes") }}</dt>
      <dd>{{ player.intlMin ?? 0 }}</dd>
      <template v-if="player.u21Caps">
        <dt>{{ t("u21.short") }}</dt>
        <dd>{{ t("u21.apps", { caps: player.u21Caps, goals: player.u21Goals ?? 0 }) }}</dd>
      </template>
      <dt>{{ t("squad.player.intl.lastCall") }}</dt>
      <dd>{{ player.lastCall ? formatDate(player.lastCall) : t("squad.player.intl.never") }}</dd>
    </dl>
    <template v-if="honours.length">
      <h3 class="sub">{{ t("squad.player.intl.honours") }}</h3>
      <ul class="honours">
        <li v-for="(h, i) in honours" :key="i">
          <RouterLink :to="`/competitions/${h.inst.id}`" class="honour">
            <strong>{{ t(`squad.player.intl.honour.${h.kind}`) }}</strong>
            <span class="muted">{{ compName(h.inst) }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </AppCard>
</template>

<style scoped>
.facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--sp-2) var(--sp-4);
  margin: 0;
}

.facts dt {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.facts dd {
  margin: 0;
  font-weight: 600;
}

.sub {
  margin: var(--sp-4) 0 var(--sp-2);
  font-size: var(--fs-sm);
  font-weight: 700;
}

.honours {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.honour {
  display: flex;
  flex-direction: column;
  color: var(--text);
  text-decoration: none;
}

.muted {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
