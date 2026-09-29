<script setup lang="ts">
/**
 * The federation's review of a finished competition: how far we went, what was
 * asked and delivered, who stood out, and what the board makes of it. Shown in
 * full when a competition ends, and from the career page afterwards.
 */
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { FileText } from "@lucide/vue"
import { AppButton, AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import {
  ReviewHeader,
  ReviewMeters,
  ReviewObjectives,
  ReviewPlayers,
} from "@/modules/career/components/review"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"

const route = useRoute()
const router = useRouter()
const world = useWorldStore()

const id = computed(() => String(route.params.id))
const review = world.derive(
  (w) => [...(w.state.career.reviews ?? [])].reverse().find((r) => r.id === id.value) ?? null,
  null
)
/** Opened by the calendar: the user must read it before moving on. */
const pending = world.derive((w) => w.state.pendingReview === id.value, false)

const stars = computed(() =>
  (review.value?.stars ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    detail: `${s.apps} ${s.apps === 1 ? "match" : "matches"} · ${s.goals} ${s.goals === 1 ? "goal" : "goals"}`,
    value: s.rating.toFixed(2),
  }))
)
const youngsters = computed(() =>
  (review.value?.youngsters ?? []).map((y) => ({
    id: y.id,
    name: y.name,
    detail: `Aged ${y.age} · ${y.apps} ${y.apps === 1 ? "match" : "matches"}`,
  }))
)

const CONTRACT = {
  renewed: "Your contract has been renewed",
  extended: "Your contract has been extended by a year",
  expired: "Your contract will not be renewed",
} as const

const contract = computed(() => {
  const r = review.value
  if (!r?.contract) return ""
  const until =
    r.contract !== "expired" && r.contractUntil ? `, now until ${formatDate(r.contractUntil)}` : ""
  return `${CONTRACT[r.contract]}${until}.`
})

function done() {
  if (!pending.value) return router.back()
  world.seenReview()
  const sacked = world.world?.state.pendingSacked
  router.replace(sacked ? "/career/farewell" : "/home")
}
</script>

<template>
  <PageShell :back="!pending" title="Federation review" :subtitle="review?.name">
    <AppEmptyState v-if="!review" :icon="FileText" title="Review not found" />
    <template v-else>
      <ReviewHeader :review="review" />
      <p class="message">{{ review.message }}</p>
      <p v-if="contract" class="contract" :class="`contract--${review.contract}`">
        {{ contract }}
      </p>

      <template v-if="review.objectives.length">
        <AppSectionHeader title="Objectives" />
        <ReviewObjectives :objectives="review.objectives" />
      </template>

      <AppSectionHeader title="Standing" />
      <ReviewMeters :before="review.before" :after="review.after" />

      <template v-if="stars.length">
        <AppSectionHeader title="Stand-out players" />
        <ReviewPlayers :players="stars" />
      </template>

      <template v-if="youngsters.length">
        <AppSectionHeader title="Youngsters who played" />
        <ReviewPlayers :players="youngsters" />
      </template>

      <StickyCta v-if="pending" above-nav>
        <AppButton variant="filled" block @click="done">Continue</AppButton>
      </StickyCta>
    </template>
  </PageShell>
</template>

<style scoped>
.message {
  margin: 0;
  font-size: var(--fs-md);
  line-height: 1.5;
}

.contract {
  margin: 0;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  font-weight: 600;
  background: color-mix(in srgb, var(--success) 12%, var(--surface));
}

.contract--extended {
  background: color-mix(in srgb, var(--warning) 12%, var(--surface));
}

.contract--expired {
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
}
</style>
