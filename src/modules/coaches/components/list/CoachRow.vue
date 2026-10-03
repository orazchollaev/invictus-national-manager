<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { Coach } from "@/engine/world/types"
import { ageOn } from "@/engine/players/ability"
import { StatPill } from "@/modules/core/components"
import { PersonFace } from "@/modules/core/components/face"
import { NationFlag } from "@/modules/nations/components/badge"
import { abilityTone } from "@/modules/core/utils/format"

const props = defineProps<{ coach: Coach; date: string }>()
const { t } = useI18n()
const age = computed(() => ageOn(props.coach.born, props.date))
</script>

<template>
  <RouterLink :to="`/coach/${coach.id}`" class="row">
    <PersonFace :coach="coach" :size="38" head />
    <span class="who">
      <span class="name">{{ coach.first }} {{ coach.last }}</span>
      <span class="meta">
        <NationFlag :id="coach.nationality" :size="14" name="short" />
        · {{ age }}
        <template v-if="coach.nationId">
          ·
          <NationFlag :id="coach.nationId" :size="14" name />
        </template>
      </span>
    </span>
    <StatPill :value="Math.round(coach.reputation)" :tone="abilityTone(coach.reputation)" />
    <span class="sr-only">{{ t("coaches.rep", { n: Math.round(coach.reputation) }) }}</span>
  </RouterLink>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px solid var(--border-light);
}

.row:last-child {
  border-bottom: none;
}

.who {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-xs);
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
