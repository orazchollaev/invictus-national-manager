<script setup lang="ts">
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { PageShell } from "@/modules/core/components"
import { SlotList } from "@/modules/career/components/slots"
import { useWorldStore } from "@/modules/world/store"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

async function open(n: number) {
  if (await world.load(n)) router.replace("/home")
}
</script>

<template>
  <PageShell back :title="t('career.load.title')" :subtitle="t('career.load.subtitle')">
    <SlotList mode="load" @pick="open" />
  </PageShell>
</template>
