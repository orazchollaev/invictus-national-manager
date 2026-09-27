<script setup lang="ts">
import { ref } from "vue"
import { AppButton, AppButtonGroup, AppField, AppSelect, AppSheet } from "@/components/ui"
import { FORMATION_LIST } from "@/engine/match/formations"
import type { Formation, Level, Mentality, Tactics } from "@/engine/match/types"
import { MENTALITY_OPTIONS, PRESSING_OPTIONS, TEMPO_OPTIONS } from "@/modules/squad/constants"

const props = defineProps<{ tactics: Tactics }>()
const emit = defineEmits<{ close: []; apply: [tactics: Tactics] }>()

const draft = ref<Tactics>({ ...props.tactics })
const str = (v: number) => String(v)
</script>

<template>
  <AppSheet title="Change tactics" @close="emit('close')">
    <div class="form">
      <AppField label="Formation" layout="stack">
        <AppSelect
          :model-value="draft.formation"
          :options="FORMATION_LIST.map((f) => ({ value: f, label: f }))"
          @update:model-value="(v) => (draft.formation = v as Formation)"
        />
      </AppField>
      <AppField label="Mentality" layout="stack">
        <AppSelect
          :model-value="str(draft.mentality)"
          :options="MENTALITY_OPTIONS"
          @update:model-value="(v) => (draft.mentality = Number(v) as Mentality)"
        />
      </AppField>
      <AppField label="Pressing" layout="stack">
        <AppButtonGroup
          :model-value="str(draft.pressing)"
          block
          :options="PRESSING_OPTIONS"
          @update:model-value="(v) => (draft.pressing = Number(v) as Level)"
        />
      </AppField>
      <AppField label="Tempo" layout="stack">
        <AppButtonGroup
          :model-value="str(draft.tempo)"
          block
          :options="TEMPO_OPTIONS"
          @update:model-value="(v) => (draft.tempo = Number(v) as Level)"
        />
      </AppField>
      <AppButton variant="filled" block @click="emit('apply', draft)">Apply</AppButton>
    </div>
  </AppSheet>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
</style>
