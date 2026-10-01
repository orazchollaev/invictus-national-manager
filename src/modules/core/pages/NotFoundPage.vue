<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { AppButton, AppEmptyState } from "@/components/ui"
import { PageShell } from "@/modules/core/components"

const { t } = useI18n()
</script>

<template>
  <PageShell>
    <AppEmptyState :title="t('core.notFound')">
      <template #action>
        <AppButton variant="filled" @click="$router.replace('/home')">
          {{ t("nav.home") }}
        </AppButton>
      </template>
    </AppEmptyState>
  </PageShell>
</template>
