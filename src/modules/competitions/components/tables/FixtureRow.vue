<script setup lang="ts">
import { computed } from "vue"
import type { Fixture } from "@/engine/competition/types"
import { NationFlag } from "@/modules/nations/components/badge"
import { formatShort } from "@/engine/calendar/dates"
import { useWorldStore } from "@/modules/world/store"

const props = defineProps<{ fixture: Fixture; showDate?: boolean; showComp?: boolean }>()
const world = useWorldStore()
const mine = computed(
  () => world.me && (props.fixture.home === world.me || props.fixture.away === world.me)
)
const comp = computed(() =>
  props.fixture.compId === "friendly"
    ? "Friendly"
    : (world.world?.state.competitions[props.fixture.compId]?.short ?? "")
)
</script>

<template>
  <RouterLink
    :to="fixture.result || !mine ? `/report/${fixture.id}` : `/match/${fixture.id}`"
    class="fx"
    :class="{ 'fx--mine': mine }"
  >
    <span v-if="showDate" class="fx-date">{{ formatShort(fixture.date) }}</span>
    <span class="fx-team fx-team--home">
      <NationFlag :id="fixture.home" :size="18" name="short" />
    </span>
    <span class="fx-score">
      <template v-if="fixture.result">
        {{ fixture.result.h }}–{{ fixture.result.a }}
        <small v-if="fixture.result.pens">p</small>
      </template>
      <template v-else>v</template>
    </span>
    <span class="fx-team"><NationFlag :id="fixture.away" :size="18" name="short" /></span>
    <span v-if="showComp" class="fx-comp">{{ comp }}</span>
  </RouterLink>
</template>

<style scoped>
.fx {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
  font-size: var(--fs-sm);
}

.fx--mine {
  background: var(--accent-subtle);
}

.fx-date {
  width: 48px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.fx-team {
  flex: 1;
  min-width: 0;
  display: flex;
}

.fx-team--home {
  justify-content: flex-end;
}

.fx-team--home :deep(.nation) {
  flex-direction: row-reverse;
}

.fx-score {
  min-width: 44px;
  text-align: center;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.fx-comp {
  width: 72px;
  text-align: end;
  color: var(--text-muted);
  font-size: var(--fs-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
