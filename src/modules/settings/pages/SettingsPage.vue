<script setup lang="ts">
import { AppButtonGroup, AppCard, AppField, AppToggle } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import {
  useSettingsStore,
  type AdvanceStep,
  type AutoSave,
  type DesignLanguage,
  type LiveMatchSpeed,
  type Theme,
} from "@/modules/settings/store"

const settings = useSettingsStore()
</script>

<template>
  <PageShell back title="Settings">
    <AppCard padding="md" class="group">
      <AppField label="Theme" layout="stack">
        <AppButtonGroup
          :model-value="settings.theme"
          block
          :options="[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]"
          @update:model-value="(v) => (settings.theme = v as Theme)"
        />
      </AppField>
      <AppField label="Look" layout="stack">
        <AppButtonGroup
          :model-value="settings.designLanguage"
          block
          :options="[
            { value: 'ios', label: 'Rounded' },
            { value: 'android', label: 'Material' },
          ]"
          @update:model-value="(v) => (settings.designLanguage = v as DesignLanguage)"
        />
      </AppField>
    </AppCard>

    <AppCard padding="md" class="group">
      <AppField label="Continue moves on" layout="stack">
        <AppButtonGroup
          :model-value="String(settings.advanceStep)"
          block
          :options="[
            { value: '1', label: '1 day' },
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: 'match', label: 'Next match' },
          ]"
          @update:model-value="
            (v) => (settings.advanceStep = v === 'match' ? 'match' : (Number(v) as AdvanceStep))
          "
        />
      </AppField>
      <AppField
        label="Assistant picks the team"
        hint="Squads and starting elevens are chosen for you"
      >
        <AppToggle v-model="settings.assistantPicks" aria-label="Assistant picks the team" />
      </AppField>
      <AppField label="Watch my draws" hint="Stop for draws involving your team">
        <AppToggle v-model="settings.watchDraws" aria-label="Watch my draws" />
      </AppField>
      <AppField label="Autosave" layout="stack">
        <AppButtonGroup
          :model-value="settings.autoSave"
          block
          :options="[
            { value: 'always', label: 'Always' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'off', label: 'Off' },
          ]"
          @update:model-value="(v) => (settings.autoSave = v as AutoSave)"
        />
      </AppField>
      <AppField label="Match speed" layout="stack">
        <AppButtonGroup
          :model-value="String(settings.liveMatchSpeed)"
          block
          :options="['1', '2', '4', '10'].map((v) => ({ value: v, label: `${v}×` }))"
          @update:model-value="(v) => (settings.liveMatchSpeed = Number(v) as LiveMatchSpeed)"
        />
      </AppField>
      <AppField label="Pause on goals and red cards">
        <AppToggle v-model="settings.pauseOnKeyEvents" aria-label="Pause on goals and red cards" />
      </AppField>
      <AppField label="Full commentary" hint="Fouls, corners and offsides as well">
        <AppToggle v-model="settings.verboseCommentary" aria-label="Full commentary" />
      </AppField>
    </AppCard>
  </PageShell>
</template>

<style scoped>
.group :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
</style>
