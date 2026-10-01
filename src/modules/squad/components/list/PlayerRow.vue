<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { Ban, Cross, TrendingDown, TrendingUp } from "@lucide/vue"
import type { Player } from "@/engine/types"
import { archetypeOf } from "@/engine/players/archetypes"
import { StatPill } from "@/modules/core/components"
import { abilityTone, age, positionTone } from "@/modules/core/utils/format"
import { useWorldStore } from "@/modules/world/store"

const props = defineProps<{
  player: Player
  /** Hide the club line in tight lists. */
  compact?: boolean
  /** Not clickable (selection lists handle their own taps). */
  static?: boolean
}>()

const { t } = useI18n()
const world = useWorldStore()
const date = computed(() => world.date)
const club = computed(() => world.world?.clubs.get(props.player.clubId))
const injured = computed(() => !!props.player.injury && props.player.injury.until > date.value)
const archId = computed(() => archetypeOf(props.player))
</script>

<template>
  <component
    :is="static ? 'div' : 'RouterLink'"
    :to="static ? undefined : `/player/${player.id}`"
    class="prow"
  >
    <span class="prow-pos" :style="{ color: positionTone(player.pos) }">{{ player.pos }}</span>
    <div class="prow-main">
      <div class="prow-name">
        {{ player.first }}
        <strong>{{ player.last }}</strong>
        <Cross v-if="injured" :size="14" class="prow-icon prow-icon--injury" />
        <Ban v-if="player.banned" :size="14" class="prow-icon prow-icon--ban" />
      </div>
      <div class="prow-style">{{ t(`arch.${archId}.label`) }}</div>
      <div v-if="!compact" class="prow-sub">
        {{ age(player, date) }} · {{ club?.name ?? t("squad.freeAgent") }}
        <template v-if="player.caps">· {{ t("squad.capsLine", { n: player.caps }) }}</template>
      </div>
    </div>
    <TrendingUp v-if="player.form >= 2" :size="16" class="prow-form up" />
    <TrendingDown v-else-if="player.form <= -2" :size="16" class="prow-form down" />
    <slot name="trailing">
      <StatPill :value="Math.round(player.ca)" :tone="abilityTone(player.ca)" />
    </slot>
  </component>
</template>

<style scoped>
.prow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
  min-height: 52px;
}

.prow-pos {
  width: 28px;
  flex-shrink: 0;
  font-size: var(--fs-xs);
  font-weight: 800;
}

.prow-main {
  flex: 1;
  min-width: 0;
}

.prow-name {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.prow-style {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--accent);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.prow-sub {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.prow-icon--injury {
  color: var(--danger);
}

.prow-icon--ban {
  color: var(--warning);
}

.prow-form.up {
  color: var(--success);
}

.prow-form.down {
  color: var(--danger);
}
</style>
