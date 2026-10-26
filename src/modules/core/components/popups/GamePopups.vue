<script setup lang="ts">
/**
 * News that stops the calendar and must be seen wherever the user is: a final
 * warning, a job offer, the nation being awarded a tournament, the press before a tournament, the board's new
 * objective, the year's youngsters, another federation's invitation. Held back during a live match, a draw, a
 * call-up and the full-screen career pages, which are finished first. Choices the
 * user handed to the assistant are not shown.
 */
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useWorldStore } from "@/modules/world/store"
import { useSettingsStore } from "@/modules/settings/store"
import { useNotices } from "@/modules/core/composables/useNotices"
import BoardMeetingSheet from "./BoardMeetingSheet.vue"
import HostingSheet from "./HostingSheet.vue"
import IntakeSheet from "./IntakeSheet.vue"
import InviteSheet from "./InviteSheet.vue"
import JobOfferSheet from "./JobOfferSheet.vue"
import PressConferenceSheet from "./PressConferenceSheet.vue"
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
const press = world.derive((w) => !!w.state.pendingPress, false)
const intake = world.derive((w) => !!w.state.pendingIntake, false)
// Quiet or not, an invitation not yet answered stays in the inbox; only the popup waits on `seen`.
const invite = world.derive(
  (w) => !!w.state.invite && (settings.quietNotices || !w.state.invite.seen),
  false
)
const employed = world.derive((w) => !!w.state.career.nationId, false)

/**
 * With quiet notices on, only what cannot wait comes up by itself: the rest is opened
 * from the home screen, and then it shows here like any other sheet.
 */
const notices = useNotices()
function shown(key: string) {
  return !settings.quietNotices || notices.opened.value === key
}
</script>

<template>
  <template v-if="free && world.world && !world.busy && !blocked">
    <UltimatumSheet v-if="ultimatum" key="ultimatum" />
    <JobOfferSheet
      v-else-if="offer && (!employed || shown(`offer-${offer}`))"
      :key="`offer-${offer}`"
      :nation-id="offer"
      @close="notices.close()"
    />
    <HostingSheet
      v-else-if="hosting && shown(`host-${hosting}`)"
      :key="`host-${hosting}`"
      :comp-id="hosting"
      @close="notices.close()"
    />
    <PressConferenceSheet
      v-else-if="press && !settings.assistantPress && shown('press')"
      key="press"
      @close="notices.close()"
    />
    <BoardMeetingSheet
      v-else-if="board && !settings.assistantBoard && shown(`board-${board}`)"
      :key="`board-${board}`"
      :objective-id="board"
      @close="notices.close()"
    />
    <IntakeSheet
      v-else-if="intake && settings.showIntake && shown('intake')"
      key="intake"
      @close="notices.close()"
    />
    <InviteSheet v-else-if="invite && shown('invite')" key="invite" @close="notices.close()" />
  </template>
</template>
