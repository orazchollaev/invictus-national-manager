<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Flag, Trophy } from "@lucide/vue"
import { AppButton, AppCard, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { showConfirm } from "@/composables/useDialog"
import { ObjectiveList } from "@/modules/career/components/objectives"
import { verdictKey, verdictTone } from "@/modules/career/utils/verdict"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
const career = world.derive((w) => w.state.career, null)
const objectives = computed(() => [...(career.value?.objectives ?? [])].reverse())
const history = computed(() => [...(career.value?.history ?? [])].reverse())
const trophies = computed(() =>
  (career.value?.history ?? []).flatMap((h) =>
    h.trophies.map((name) => ({ name, nationId: h.nationId }))
  )
)
const milestones = computed(() => [...(career.value?.milestones ?? [])].reverse())
const reviews = computed(() => [...(career.value?.reviews ?? [])].reverse())

async function accept(nationId: string) {
  const name = nationName(nationId)
  const leaving = career.value?.nationId
    ? t("career.acceptLeaving", { name: nationName(career.value.nationId) })
    : ""
  if (
    !(await showConfirm(t("career.acceptConfirm", { name, leaving }), {
      confirmLabel: t("career.accept"),
    }))
  )
    return
  world.takeJob(nationId)
  router.push("/home")
}

async function resign() {
  const id = career.value?.nationId
  if (!id) return
  const ok = await showConfirm(t("career.resignConfirm", { name: nationName(id) }), {
    confirmLabel: t("career.resign"),
    dangerous: true,
  })
  if (!ok) return
  world.resignJob()
  router.push("/career/farewell")
}

const LEFT = {
  sacked: "career.left.sacked",
  moved: "career.left.moved",
  expired: "career.left.expired",
  resigned: "career.left.resigned",
} as const
const leftTone = (l: string) => (l === "moved" ? "var(--text-muted)" : "var(--danger)")
</script>

<template>
  <PageShell back :title="t('career.title')" :subtitle="career?.managerName">
    <AppCard v-if="career" padding="md" class="stats">
      <div class="stat">
        <span class="muted">{{ t("career.confidence") }}</span>
        <strong>{{ career.nationId ? `${career.confidence}%` : "—" }}</strong>
      </div>
      <div class="stat">
        <span class="muted">{{ t("career.reputation") }}</span>
        <strong>{{ Math.round(career.reputation) }}</strong>
      </div>
      <div class="stat">
        <span class="muted">{{ t("career.contractUntil") }}</span>
        <strong>
          {{ career.nationId && career.contractUntil ? formatDate(career.contractUntil) : "—" }}
        </strong>
      </div>
    </AppCard>

    <div v-if="career?.ultimatum" class="warning">
      <strong>{{ t("career.finalWarning") }}</strong>
      {{ t("career.ultimatum", { n: career.ultimatum.matches }, career.ultimatum.matches) }}
    </div>

    <template v-if="career?.offers.length">
      <AppSectionHeader :title="t('career.jobOffers')" />
      <AppCard v-for="o in career.offers" :key="o.nationId" padding="md" class="offer">
        <NationFlag :id="o.nationId" :size="32" name link />
        <span class="muted">{{ t("career.until", { date: formatDate(o.expires) }) }}</span>
        <div class="offer-actions">
          <AppButton variant="text" @click="world.turnDown(o.nationId)">
            {{ t("career.decline") }}
          </AppButton>
          <AppButton variant="filled" @click="accept(o.nationId)">
            {{ t("career.accept") }}
          </AppButton>
        </div>
      </AppCard>
    </template>

    <AppSectionHeader id="objectives" :title="t('career.objectives')" />
    <ObjectiveList :objectives="objectives" />

    <template v-if="trophies.length">
      <AppSectionHeader :title="t('career.trophyCabinet')" />
      <div class="cabinet">
        <div v-for="(tr, i) in trophies" :key="i" class="trophy">
          <Trophy :size="28" class="trophy-icon" />
          <span class="trophy-name">{{ $tx(tr.name) }}</span>
          <NationFlag :id="tr.nationId" :size="16" />
        </div>
      </div>
    </template>

    <template v-if="reviews.length">
      <AppSectionHeader :title="t('career.competitionReviews')" />
      <div class="list">
        <RouterLink
          v-for="r in reviews"
          :key="r.id"
          :to="`/career/review/${r.id}`"
          class="row link"
        >
          <NationFlag :id="r.nationId" :size="20" />
          <span class="row-text">
            {{ $tx(r.name) }}
            <small class="muted">{{ $tx(r.reached) }}</small>
          </span>
          <StatPill :value="t(verdictKey(r.verdict))" :tone="verdictTone(r.verdict)" />
        </RouterLink>
      </div>
    </template>

    <template v-if="milestones.length">
      <AppSectionHeader :title="t('career.milestones')" />
      <div class="list">
        <div v-for="m in milestones" :key="m.id" class="row">
          <Flag :size="16" class="milestone-icon" />
          <span class="row-text">{{ $tx(m.text) }}</span>
          <span class="muted">{{ m.date.slice(0, 4) }}</span>
        </div>
      </div>
    </template>

    <AppSectionHeader :title="t('career.record')" />
    <div class="list">
      <div v-for="(h, i) in history" :key="i" class="row">
        <NationFlag :id="h.nationId" :size="22" name />
        <StatPill v-if="h.left" :value="t(LEFT[h.left])" :tone="leftTone(h.left)" />
        <span class="muted">
          {{ t("career.record_line", { p: h.played, w: h.won, d: h.drawn, l: h.lost }) }}
        </span>
        <span class="muted">{{ h.from.slice(0, 4) }}–{{ h.to ? h.to.slice(0, 4) : "" }}</span>
      </div>
    </div>

    <AppButton v-if="career?.nationId" variant="danger" block class="resign" @click="resign">
      {{ t("career.resign") }}
    </AppButton>
  </PageShell>
</template>

<style scoped>
.stats :deep(.card-body) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-2);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.warning {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--danger);
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  font-size: var(--fs-sm);
}

.warning strong {
  color: var(--danger);
}

.offer :deep(.card-body) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
}

.offer :deep(.nation) {
  flex: 1;
  font-weight: 700;
}

.offer-actions {
  display: flex;
  gap: var(--sp-2);
  width: 100%;
  justify-content: flex-end;
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.row.link {
  color: var(--text);
  text-decoration: none;
}

.row :deep(.nation) {
  flex: 1;
}

.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.milestone-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.resign {
  margin-top: var(--sp-4);
}

.cabinet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--sp-2);
}

.trophy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-2);
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--gold-faint), var(--surface));
  border: 1px solid var(--gold-soft);
  text-align: center;
}

.trophy-icon {
  color: var(--gold);
}

.trophy-name {
  font-size: var(--fs-xs);
  font-weight: 700;
}
</style>
