<script setup lang="ts">
import { computed, reactive } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Briefcase, ChevronRight, Trophy, UserRound } from "@lucide/vue"
import { AppButton, AppCard, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { PersonFace } from "@/modules/core/components/face"
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { showConfirm } from "@/composables/useDialog"
import { ObjectiveList } from "@/modules/career/components/objectives"
import { verdictKey, verdictTone } from "@/modules/career/utils/verdict"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
// A fresh copy each tick: the raw career object keeps its identity, so without it the
// page would not notice a declined offer.
const career = world.derive((w) => ({ ...w.state.career }), null)
const objectives = computed(() => [...(career.value?.objectives ?? [])].reverse())
const history = computed(() => [...(career.value?.history ?? [])].reverse())
const trophies = computed(() =>
  [...(career.value?.history ?? [])]
    .reverse()
    .flatMap((h) => [...h.trophies].reverse().map((name) => ({ name, nationId: h.nationId })))
)
const milestones = computed(() => career.value?.milestones ?? [])
const reviews = computed(() => [...(career.value?.reviews ?? [])].reverse())

// Years of play pile these lists up, so each shows the latest few until asked for all.
const LIMITS = { objectives: 4, trophies: 6, reviews: 3, record: 3 } as const
const expanded = reactive({ objectives: false, trophies: false, reviews: false, record: false })
function latest<T>(key: keyof typeof LIMITS, list: T[]): T[] {
  return expanded[key] ? list : list.slice(0, LIMITS[key])
}
const more = (key: keyof typeof LIMITS, total: number) => !expanded[key] && total > LIMITS[key]

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
    <section v-if="career" class="hero">
      <PersonFace
        :manager="{
          name: career.managerName,
          nationality: career.nationality,
          nationId: career.nationId,
          seed: world.state?.seed ?? 0,
          face: career.face,
        }"
        :size="56"
        head
      />
      <div class="hero-text">
        <div class="hero-name">{{ career.managerName }}</div>
        <NationFlag v-if="career.nationId" :id="career.nationId" :size="18" name />
      </div>
    </section>

    <div v-if="career" class="stats">
      <div class="stat">
        <span class="stat-label">{{ t("career.confidence") }}</span>
        <strong class="stat-value">{{ career.nationId ? `${career.confidence}%` : "—" }}</strong>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("career.support") }}</span>
        <strong class="stat-value">
          {{ career.nationId ? `${Math.round(career.support ?? 55)}%` : "—" }}
        </strong>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("career.reputation") }}</span>
        <strong class="stat-value">{{ Math.round(career.reputation) }}</strong>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("career.contractUntil") }}</span>
        <strong class="stat-value stat-value--date">
          {{ career.nationId && career.contractUntil ? formatDate(career.contractUntil) : "—" }}
        </strong>
      </div>
    </div>

    <AppCard v-if="career" padding="none" class="menu">
      <RouterLink to="/coach/me" class="item">
        <UserRound :size="20" class="item-icon" />
        <span class="item-label">{{ t("career.profile") }}</span>
        <ChevronRight :size="18" class="item-chevron" />
      </RouterLink>
      <RouterLink to="/career/offers" class="item">
        <Briefcase :size="20" class="item-icon" />
        <span class="item-label">{{ t("career.jobOffers") }}</span>
        <span class="item-count">{{ career.offers.length }}</span>
        <ChevronRight :size="18" class="item-chevron" />
      </RouterLink>
      <RouterLink to="/career/achievements" class="item">
        <Trophy :size="20" class="item-icon" />
        <span class="item-label">{{ t("career.achievements") }}</span>
        <span class="item-count">{{ milestones.length }}</span>
        <ChevronRight :size="18" class="item-chevron" />
      </RouterLink>
    </AppCard>

    <div v-if="career?.ultimatum" class="warning">
      <strong>{{ t("career.finalWarning") }}</strong>
      {{ t("career.ultimatum", { n: career.ultimatum.matches }, career.ultimatum.matches) }}
    </div>

    <AppSectionHeader id="objectives" :title="t('career.objectives')" />
    <ObjectiveList :objectives="latest('objectives', objectives)" />
    <AppButton
      v-if="more('objectives', objectives.length)"
      variant="text"
      block
      @click="expanded.objectives = true"
    >
      {{ t("core.home.all") }} ({{ objectives.length }})
    </AppButton>

    <template v-if="trophies.length">
      <AppSectionHeader :title="t('career.trophyCabinet')" />
      <div class="cabinet">
        <div v-for="(tr, i) in latest('trophies', trophies)" :key="i" class="trophy">
          <Trophy :size="28" class="trophy-icon" />
          <span class="trophy-name">{{ $tx(tr.name) }}</span>
          <NationFlag :id="tr.nationId" :size="16" />
        </div>
      </div>
      <AppButton
        v-if="more('trophies', trophies.length)"
        variant="text"
        block
        @click="expanded.trophies = true"
      >
        {{ t("core.home.all") }} ({{ trophies.length }})
      </AppButton>
    </template>

    <template v-if="reviews.length">
      <AppSectionHeader :title="t('career.competitionReviews')" />
      <div class="list">
        <RouterLink
          v-for="r in latest('reviews', reviews)"
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
      <AppButton
        v-if="more('reviews', reviews.length)"
        variant="text"
        block
        @click="expanded.reviews = true"
      >
        {{ t("core.home.all") }} ({{ reviews.length }})
      </AppButton>
    </template>

    <AppSectionHeader :title="t('career.record')" />
    <div class="list">
      <div v-for="(h, i) in latest('record', history)" :key="i" class="row">
        <NationFlag :id="h.nationId" :size="22" name />
        <span class="row-text row-text--end">
          <StatPill v-if="h.left" :value="t(LEFT[h.left])" :tone="leftTone(h.left)" />
          <small class="muted">
            {{ h.from.slice(0, 4) }}–{{ h.to ? h.to.slice(0, 4) : "" }}
          </small>
        </span>
        <span class="record-line muted">
          {{ t("career.record_line", { p: h.played, w: h.won, d: h.drawn, l: h.lost }) }}
        </span>
      </div>
    </div>
    <AppButton
      v-if="more('record', history.length)"
      variant="text"
      block
      @click="expanded.record = true"
    >
      {{ t("core.home.all") }} ({{ history.length }})
    </AppButton>

    <AppButton v-if="career?.nationId" variant="danger" block class="resign" @click="resign">
      {{ t("career.resign") }}
    </AppButton>
  </PageShell>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.hero-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.hero-name {
  font-size: var(--fs-lg);
  font-weight: 700;
  line-height: 1.2;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-2);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.stat-label {
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stat-value {
  font-size: var(--fs-xl);
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat-value--date {
  font-size: var(--fs-md);
  line-height: 1.8;
}

.menu {
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.item:last-child {
  border-bottom: none;
}

.item:active {
  background: var(--bg-hover);
}

.item-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.item-label {
  flex: 1;
  font-weight: 600;
}

.item-count {
  padding: 1px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--fill-1);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-muted);
}

.item-chevron {
  color: var(--text-muted);
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.warning {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--danger);
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  font-size: var(--fs-sm);
}

.warning strong {
  display: block;
  color: var(--danger);
}

.list {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--border-light);
}

.row:last-child {
  border-bottom: none;
}

.row.link {
  color: var(--text);
  text-decoration: none;
}

.row.link:active {
  background: var(--bg-hover);
}

.row :deep(.nation) {
  flex: 1;
  font-weight: 600;
}

.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-weight: 600;
}

.row-text--end {
  flex: 0 0 auto;
  align-items: flex-end;
  gap: 2px;
}

.record-line {
  min-width: 72px;
  text-align: end;
  font-variant-numeric: tabular-nums;
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
  border-radius: var(--radius-lg);
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
