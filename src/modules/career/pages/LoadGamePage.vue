<script setup lang="ts">
import { useRouter } from "vue-router"
import { PageShell } from "@/modules/core/components"
import { SlotList } from "@/modules/career/components/slots"
import { useWorldStore } from "@/modules/world/store"

const router = useRouter()
const world = useWorldStore()

async function open(n: number) {
  if (await world.load(n)) router.replace("/home")
}
</script>

<template>
  <PageShell back title="Load game" subtitle="Pick up a career where you left it">
    <SlotList mode="load" @pick="open" />
  </PageShell>
</template>
