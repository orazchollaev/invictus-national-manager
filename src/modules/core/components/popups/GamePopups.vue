<script setup lang="ts">
/**
 * News that stops the calendar and must be seen wherever the user is: a final
 * warning, a job offer, the nation being awarded a tournament, the board's new
 * objective, the year's youngsters. Held back during a live match, a draw, a
 * call-up and the full-screen career pages, which are finished first. Choices the
 * user handed to the assistant are not shown.
 */
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useWorldStore } from "@/modules/world/store"
import { useSettingsStore } from "@/modules/settings/store"
import BoardMeetingSheet from "./BoardMeetingSheet.vue"
import HostingSheet from "./HostingSheet.vue"
import IntakeSheet from "./IntakeSheet.vue"
import JobOfferSheet from "./JobOfferSheet.vue"
import UltimatumSheet from "./UltimatumSheet.vue"

const route = useRoute()
const world = useWorldStore()
const settings = useSettingsStore()

const HELD = [
  /^\/match\//,
  /^\/draw\//,
  /^\/squad\/callup$/,
  /^\/career\/(review|farewell)/,
  /^\/menu$/,
  /^\/load$/,
  /^\/new$/,
]

const free = computed(() => !HELD.some((p) => p.test(route.path)))
/** A review or a lost job comes first, on its own page. */
const blocked = world.derive((w) => !!(w.state.pendingReview || w.state.pendingSacked), false)
const ultimatum = world.derive((w) => !!w.state.pendingUltimatum, false)
const offer = world.derive((w) => w.state.pendingOffer ?? null, null)
const hosting = world.derive((w) => w.state.pendingHosting ?? null, null)
const board = world.derive(
  (w) => w.state.career.objectives.find((o) => o.agreed === false)?.id ?? null,
  null
)
const intake = world.derive((w) => !!w.state.pendingIntake, false)
</script>

<template>
  <template v-if="free && world.world && !world.busy && !blocked">
    <UltimatumSheet v-if="ultimatum" key="ultimatum" />
    <JobOfferSheet v-else-if="offer" :key="`offer-${offer}`" :nation-id="offer" />
    <HostingSheet v-else-if="hosting" :key="`host-${hosting}`" :comp-id="hosting" />
    <BoardMeetingSheet
      v-else-if="board && !settings.assistantBoard"
      :key="`board-${board}`"
      :objective-id="board"
    />
    <IntakeSheet v-else-if="intake && settings.showIntake" key="intake" />
  </template>
</template>
