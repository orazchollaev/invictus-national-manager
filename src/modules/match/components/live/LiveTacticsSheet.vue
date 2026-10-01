<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import {
  AppButton,
  AppButtonGroup,
  AppField,
  AppSelect,
  AppSheet,
  AppToggle,
} from "@/components/ui"
import { FORMATION_LIST } from "@/engine/match/formations"
import type { Formation, Level, Mentality, Tactics } from "@/engine/match/types"
import {
  lineOptions,
  mentalityOptions,
  pressingOptions,
  tempoOptions,
  widthOptions,
} from "@/modules/squad/constants"

const props = defineProps<{ tactics: Tactics }>()
const emit = defineEmits<{ close: []; apply: [tactics: Tactics] }>()
const { t } = useI18n()
const draft = ref<Tactics>({ ...props.tactics })
const str = (v: number) => String(v)
const counter = computed({
  get: () => draft.value.counter ?? false,
  set: (v: boolean) => (draft.value.counter = v),
})
</script>

<template>
  <AppSheet :title="t('match.tactics.title')" @close="emit('close')">
    <div class="form">
      <AppField :label="t('match.tactics.formation')" layout="stack">
        <AppSelect
          :model-value="draft.formation"
          :options="FORMATION_LIST.map((f) => ({ value: f, label: f }))"
          @update:model-value="(v) => (draft.formation = v as Formation)"
        />
      </AppField>
      <AppField :label="t('match.tactics.mentality')" layout="stack">
        <AppSelect
          :model-value="str(draft.mentality)"
          :options="mentalityOptions()"
          @update:model-value="(v) => (draft.mentality = Number(v) as Mentality)"
        />
      </AppField>
      <AppField :label="t('match.tactics.pressing')" layout="stack">
        <AppButtonGroup
          :model-value="str(draft.pressing)"
          block
          :options="pressingOptions()"
          @update:model-value="(v) => (draft.pressing = Number(v) as Level)"
        />
      </AppField>
      <AppField :label="t('match.tactics.tempo')" layout="stack">
        <AppButtonGroup
          :model-value="str(draft.tempo)"
          block
          :options="tempoOptions()"
          @update:model-value="(v) => (draft.tempo = Number(v) as Level)"
        />
      </AppField>
      <AppField :label="t('match.tactics.line')" layout="stack">
        <AppButtonGroup
          :model-value="str(draft.line ?? 1)"
          block
          :options="lineOptions()"
          @update:model-value="(v) => (draft.line = Number(v) as Level)"
        />
      </AppField>
      <AppField :label="t('match.tactics.width')" layout="stack">
        <AppButtonGroup
          :model-value="str(draft.width ?? 1)"
          block
          :options="widthOptions()"
          @update:model-value="(v) => (draft.width = Number(v) as Level)"
        />
      </AppField>
      <AppField :label="t('match.tactics.counter')" layout="row">
        <AppToggle v-model="counter" :aria-label="t('match.tactics.counter')" />
      </AppField>
      <AppButton variant="filled" block @click="emit('apply', draft)">
        {{ t("match.tactics.apply") }}
      </AppButton>
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
