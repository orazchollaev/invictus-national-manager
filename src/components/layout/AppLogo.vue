<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()
</script>

<template>
  <img src="/logo.png" :alt="t('app.name')" />
</template>
