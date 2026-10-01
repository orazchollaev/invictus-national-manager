<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppSheet, AppSubTabBar } from "@/components/ui"
import { PitchView } from "@/modules/squad/components/pitch"
import type { Player } from "@/engine/types"
import type { LiveSide } from "@/engine/match/engine"
import type { LaneShares } from "@/engine/match/lanes"
import type { TeamStats } from "@/engine/match/types"
import StatsPanel from "./StatsPanel.vue"

defineProps<{
  home: TeamStats
  away: TeamStats
  lanes: LaneShares
  /** The user's side: its eleven and their stamina. */
  side: LiveSide
  slots: (string | null)[]
  player: (id: string) => Player | undefined
  name: (id: string) => string
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()

const tab = ref("stats")
</script>

<template>
  <AppSheet
    :title="t('match.centre.title')"
    max-height-mobile="85dvh"
    max-height="85dvh"
    @close="emit('close')"
  >
    <div class="body">
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'stats', label: t('match.centre.stats') },
          { value: 'team', label: t('match.centre.myTeam') },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v)"
      />
      <StatsPanel v-if="tab === 'stats'" :home="home" :away="away" :lanes="lanes" />
      <div v-else class="team-panel">
        <PitchView :formation="side.tactics.formation" :slots="slots" :player="player" />
        <ul class="stamina">
          <li v-for="p in side.pitch" :key="p.id">
            <span class="role">{{ p.slot }}</span>
            <span class="name">{{ name(p.id) }}</span>
            <span class="bar"><span :style="{ width: `${p.stamina}%` }"></span></span>
          </li>
        </ul>
      </div>
    </div>
  </AppSheet>
</template>

<style scoped>
/* The sheet is a flex column: the body takes what is left and scrolls inside it. */
.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--sp-3) var(--sp-3) calc(var(--sp-3) + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.team-panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.stamina {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1-5);
}

.stamina li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.role {
  width: 28px;
  font-weight: 800;
  color: var(--text-muted);
  font-size: var(--fs-xs);
}

.name {
  flex: 1;
}

.bar {
  width: 90px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: var(--success);
}
</style>
