<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppButton, AppButtonGroup, AppCard, AppField, AppSelect, AppToggle } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { SettingsAboutModal } from "@/modules/settings/components"
import { LOCALES, type Locale } from "@/i18n"
import { flagUrl } from "@/lib/flags"
import {
  useSettingsStore,
  type AdvanceStep,
  type AutoSave,
  type LiveMatchSpeed,
  type Theme,
} from "@/modules/settings/store"

const { t } = useI18n()
const settings = useSettingsStore()
const aboutOpen = ref(false)
</script>

<template>
  <PageShell back :title="t('nav.settings')">
    <AppCard padding="md" class="group">
      <AppField :label="t('settings.language')" layout="stack">
        <AppSelect
          :model-value="settings.locale"
          :options="LOCALES"
          @update:model-value="(v) => (settings.locale = v as Locale)"
        >
          <template #value="{ option }">
            <span v-if="option" class="lang-row">
              <img :src="flagUrl(option.flag)" alt="" class="lang-flag" />
              {{ option.label }}
            </span>
          </template>
          <template #option="{ option }">
            <span class="lang-row">
              <img :src="flagUrl(option.flag)" alt="" class="lang-flag" />
              {{ option.label }}
            </span>
          </template>
        </AppSelect>
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
    </AppCard>

    <!-- Assistants and notices: sensible defaults, so they stay folded away. -->
    <AppCard padding="md" class="group">
      <details class="more">
        <summary class="more-title">{{ t("settings.moreOptions") }}</summary>
        <div class="more-body">
          <AppField :label="t('settings.quietNotices')" :hint="t('settings.quietNoticesHint')">
            <AppToggle v-model="settings.quietNotices" :aria-label="t('settings.quietNotices')" />
          </AppField>
          <AppField :label="t('settings.assistantPicks')" :hint="t('settings.assistantPicksHint')">
            <AppToggle
              v-model="settings.assistantPicks"
              :aria-label="t('settings.assistantPicks')"
            />
          </AppField>
          <AppField :label="t('settings.watchDraws')" :hint="t('settings.watchDrawsHint')">
            <AppToggle v-model="settings.watchDraws" :aria-label="t('settings.watchDraws')" />
          </AppField>
          <AppField :label="t('settings.assistantBoard')" :hint="t('settings.assistantBoardHint')">
            <AppToggle
              v-model="settings.assistantBoard"
              :aria-label="t('settings.assistantBoard')"
            />
          </AppField>
          <AppField :label="t('settings.assistantPress')" :hint="t('settings.assistantPressHint')">
            <AppToggle
              v-model="settings.assistantPress"
              :aria-label="t('settings.assistantPress')"
            />
          </AppField>
          <AppField :label="t('settings.showIntake')" :hint="t('settings.showIntakeHint')">
            <AppToggle v-model="settings.showIntake" :aria-label="t('settings.showIntake')" />
          </AppField>
          <AppField :label="t('settings.fullCommentary')" :hint="t('settings.fullCommentaryHint')">
            <AppToggle
              v-model="settings.verboseCommentary"
              :aria-label="t('settings.fullCommentary')"
            />
          </AppField>
        </div>
      </details>
    </AppCard>

    <AppButton variant="text" size="sm" @click="aboutOpen = true">
      {{ t("settings.about") }}
    </AppButton>

    <SettingsAboutModal v-if="aboutOpen" @close="aboutOpen = false" />
  </PageShell>
</template>

<style scoped>
.lang-row {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
}
.lang-flag {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
}
.group :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.more-title {
  cursor: pointer;
  font-weight: 700;
}
.more-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-top: var(--sp-3);
}
</style>
