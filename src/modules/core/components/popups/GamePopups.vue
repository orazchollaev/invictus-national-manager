<script setup lang="ts">
/**
 * News that stops the calendar and must be seen wherever the user is: a job offer,
 * or the nation being awarded a tournament. Held back during a live match, a draw
 * and a call-up, which are shown in full screen and finished first.
 */
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useWorldStore } from "@/modules/world/store"
import HostingSheet from "./HostingSheet.vue"
import JobOfferSheet from "./JobOfferSheet.vue"

const route = useRoute()
const world = useWorldStore()

const HELD = [/^\/match\//, /^\/draw\//, /^\/squad\/callup$/, /^\/menu$/, /^\/load$/, /^\/new$/]

const free = computed(() => !HELD.some((p) => p.test(route.path)))
const offer = world.derive((w) => w.state.pendingOffer ?? null, null)
const hosting = world.derive((w) => w.state.pendingHosting ?? null, null)
</script>

<template>
  <template v-if="free && world.world && !world.busy">
    <JobOfferSheet v-if="offer" :key="`offer-${offer}`" :nation-id="offer" />
    <HostingSheet v-else-if="hosting" :key="`host-${hosting}`" :comp-id="hosting" />
  </template>
</template>
