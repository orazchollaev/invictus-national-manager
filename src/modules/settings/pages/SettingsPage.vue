<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { AppButtonGroup, AppCard, AppField, AppToggle } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { LOCALES, type Locale } from "@/i18n"
import {
  useSettingsStore,
  type AdvanceStep,
  type AutoSave,
  type DesignLanguage,
  type LiveMatchSpeed,
  type Theme,
} from "@/modules/settings/store"

const { t } = useI18n()
const settings = useSettingsStore()
</script>

<template>
  <PageShell back :title="t('nav.settings')">
    <AppCard padding="md" class="group">
      <AppField :label="t('settings.language')" layout="stack">
        <AppButtonGroup
          :model-value="settings.locale"
          block
          :options="LOCALES"
          @update:model-value="(v) => (settings.locale = v as Locale)"
        />
      </AppField>
      <AppField :label="t('settings.theme')" layout="stack">
        <AppButtonGroup
          :model-value="settings.theme"
          block
          :options="[
            { value: 'dark', label: t('settings.dark') },
            { value: 'light', label: t('settings.light') },
          ]"
          @update:model-value="(v) => (settings.theme = v as Theme)"
        />
      </AppField>
      <AppField :label="t('settings.look')" layout="stack">
        <AppButtonGroup
          :model-value="settings.designLanguage"
          block
          :options="[
            { value: 'ios', label: t('settings.rounded') },
            { value: 'android', label: t('settings.material') },
          ]"
          @update:model-value="(v) => (settings.designLanguage = v as DesignLanguage)"
        />
      </AppField>
    </AppCard>

    <AppCard padding="md" class="group">
      <AppField :label="t('settings.advance')" layout="stack">
        <AppButtonGroup
          :model-value="String(settings.advanceStep)"
          block
          :options="[
            { value: '1', label: t('settings.oneDay') },
            { value: '7', label: t('settings.sevenDays') },
            { value: '30', label: t('settings.thirtyDays') },
            { value: 'match', label: t('settings.nextMatch') },
          ]"
          @update:model-value="
            (v) => (settings.advanceStep = v === 'match' ? 'match' : (Number(v) as AdvanceStep))
          "
        />
      </AppField>
      <AppField :label="t('settings.assistantPicks')" :hint="t('settings.assistantPicksHint')">
        <AppToggle v-model="settings.assistantPicks" :aria-label="t('settings.assistantPicks')" />
      </AppField>
      <AppField :label="t('settings.watchDraws')" :hint="t('settings.watchDrawsHint')">
        <AppToggle v-model="settings.watchDraws" :aria-label="t('settings.watchDraws')" />
      </AppField>
      <AppField :label="t('settings.assistantBoard')" :hint="t('settings.assistantBoardHint')">
        <AppToggle v-model="settings.assistantBoard" :aria-label="t('settings.assistantBoard')" />
      </AppField>
      <AppField :label="t('settings.showIntake')" :hint="t('settings.showIntakeHint')">
        <AppToggle v-model="settings.showIntake" :aria-label="t('settings.showIntake')" />
      </AppField>
      <AppField :label="t('settings.autosave')" layout="stack">
        <AppButtonGroup
          :model-value="settings.autoSave"
          block
          :options="[
            { value: 'always', label: t('settings.always') },
            { value: 'weekly', label: t('settings.weekly') },
            { value: 'monthly', label: t('settings.monthly') },
            { value: 'off', label: t('settings.off') },
          ]"
          @update:model-value="(v) => (settings.autoSave = v as AutoSave)"
        />
      </AppField>
      <AppField :label="t('settings.matchSpeed')" layout="stack">
        <AppButtonGroup
          :model-value="String(settings.liveMatchSpeed)"
          block
          :options="
            ['1', '2', '4'].map((v) => ({ value: v, label: t('settings.speed', { n: v }) }))
          "
          @update:model-value="(v) => (settings.liveMatchSpeed = Number(v) as LiveMatchSpeed)"
        />
      </AppField>
      <AppField :label="t('settings.pauseOnKey')">
        <AppToggle v-model="settings.pauseOnKeyEvents" :aria-label="t('settings.pauseOnKey')" />
      </AppField>
      <AppField :label="t('settings.fullCommentary')" :hint="t('settings.fullCommentaryHint')">
        <AppToggle
          v-model="settings.verboseCommentary"
          :aria-label="t('settings.fullCommentary')"
        />
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
