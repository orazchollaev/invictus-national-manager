<script setup lang="ts">
/**
 * The federation's review of a finished competition: how far we went, what was
 * asked and delivered, who stood out, and what the board makes of it. Shown in
 * full when a competition ends, and from the career page afterwards.
 */
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
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
import { formatDate } from "@/i18n/dates"

const { t } = useI18n()
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
    detail: `${t("career.review.match", s.apps)} · ${t("career.review.goal", s.goals)}`,
    value: s.rating.toFixed(2),
  }))
)
const youngsters = computed(() =>
  (review.value?.youngsters ?? []).map((y) => ({
    id: y.id,
    name: y.name,
    detail: t("career.review.youngsterDetail", {
      age: y.age,
      apps: t("career.review.match", y.apps),
    }),
  }))
)

const CONTRACT = {
  renewed: "career.review.contractRenewed",
  extended: "career.review.contractExtended",
  expired: "career.review.contractExpired",
} as const

const contract = computed(() => {
  const r = review.value
  if (!r?.contract) return ""
  const until =
    r.contract !== "expired" && r.contractUntil
      ? t("career.review.contractNowUntil", { date: formatDate(r.contractUntil) })
      : ""
  return t("career.review.contractLine", { text: t(CONTRACT[r.contract]), until })
})

function done() {
  if (!pending.value) return router.back()
  world.seenReview()
  const sacked = world.world?.state.pendingSacked
  router.replace(sacked ? "/career/farewell" : "/home")
}
</script>

<template>
  <PageShell :back="!pending" :title="t('career.review.title')" :subtitle="$tx(review?.name)">
    <AppEmptyState v-if="!review" :icon="FileText" :title="t('career.review.notFound')" />
    <template v-else>
      <ReviewHeader :review="review" />
      <p class="message">{{ $tx(review.message) }}</p>
      <p v-if="contract" class="contract" :class="`contract--${review.contract}`">
        {{ contract }}
      </p>

      <template v-if="review.objectives.length">
        <AppSectionHeader :title="t('career.review.objectives')" />
        <ReviewObjectives :objectives="review.objectives" />
      </template>

      <AppSectionHeader :title="t('career.review.standing')" />
      <ReviewMeters :before="review.before" :after="review.after" />

      <template v-if="stars.length">
        <AppSectionHeader :title="t('career.review.standOut')" />
        <ReviewPlayers :players="stars" />
      </template>

      <template v-if="youngsters.length">
        <AppSectionHeader :title="t('career.review.youngsters')" />
        <ReviewPlayers :players="youngsters" />
      </template>

      <StickyCta v-if="pending" above-nav>
        <AppButton variant="filled" block @click="done">{{ t("common.continue") }}</AppButton>
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
