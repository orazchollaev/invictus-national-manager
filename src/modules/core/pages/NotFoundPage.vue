<script setup lang="ts">
import { AppButton, AppEmptyState } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
</script>

<template>
  <PageShell>
    <AppEmptyState title="Page not found">
      <template #action>
        <AppButton variant="filled" @click="$router.replace('/home')">Home</AppButton>
      </template>
    </AppEmptyState>
  </PageShell>
</template>
