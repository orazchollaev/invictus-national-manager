<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { Flag, Trophy } from "@lucide/vue"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"
import { showConfirm } from "@/composables/useDialog"
import { verdictLabel, verdictTone } from "@/modules/career/utils/verdict"

const router = useRouter()
const world = useWorldStore()
const career = world.derive((w) => w.state.career, null)
const objectives = computed(() => [...(career.value?.objectives ?? [])].reverse())
const history = computed(() => [...(career.value?.history ?? [])].reverse())
const trophies = computed(() =>
  (career.value?.history ?? []).flatMap((h) =>
    h.trophies.map((t) => ({ name: t, nationId: h.nationId }))
  )
)
const milestones = computed(() => [...(career.value?.milestones ?? [])].reverse())
const reviews = computed(() => [...(career.value?.reviews ?? [])].reverse())

async function accept(nationId: string) {
  const name = world.world?.def(nationId).name
  const leaving = career.value?.nationId
    ? ` You will leave ${world.world?.def(career.value.nationId).name}.`
    : ""
  if (!(await showConfirm(`Become head coach of ${name}?${leaving}`, { confirmLabel: "Accept" })))
    return
  world.takeJob(nationId)
  router.push("/home")
}

const statusTone = (s: string) =>
  s === "met" ? "var(--success)" : s === "failed" ? "var(--danger)" : "var(--text-muted)"

const LEFT = { sacked: "Sacked", moved: "Moved on", expired: "Not renewed", resigned: "Resigned" }
const leftTone = (l: string) => (l === "moved" ? "var(--text-muted)" : "var(--danger)")
</script>

<template>
  <PageShell back title="Career" :subtitle="career?.managerName">
    <AppCard v-if="career" padding="md" class="stats">
      <div class="stat">
        <span class="muted">Confidence</span>
        <strong>{{ career.nationId ? `${career.confidence}%` : "—" }}</strong>
      </div>
      <div class="stat">
        <span class="muted">Reputation</span>
        <strong>{{ Math.round(career.reputation) }}</strong>
      </div>
      <div class="stat">
        <span class="muted">Contract until</span>
        <strong>
          {{ career.nationId && career.contractUntil ? formatDate(career.contractUntil) : "—" }}
        </strong>
      </div>
    </AppCard>

    <div v-if="career?.ultimatum" class="warning">
      <strong>Final warning.</strong>
      Lift confidence to 40% within {{ career.ultimatum.matches }} competitive
      {{ career.ultimatum.matches === 1 ? "match" : "matches" }}, or you will be replaced.
    </div>

    <template v-if="career?.offers.length">
      <AppSectionHeader title="Job offers" />
      <AppCard v-for="o in career.offers" :key="o.nationId" padding="md" class="offer">
        <NationFlag :id="o.nationId" :size="32" name link />
        <span class="muted">until {{ formatDate(o.expires) }}</span>
        <div class="offer-actions">
          <AppButton variant="text" @click="world.turnDown(o.nationId)">Decline</AppButton>
          <AppButton variant="filled" @click="accept(o.nationId)">Accept</AppButton>
        </div>
      </AppCard>
    </template>

    <AppSectionHeader title="Objectives" />
    <AppEmptyState v-if="!objectives.length" title="No objectives right now" />
    <div v-else class="list">
      <div v-for="o in objectives" :key="o.id" class="row">
        <span class="row-text">
          {{ o.text }}
          <small v-if="o.ambition === 1" class="ambition up">You promised more</small>
          <small v-else-if="o.ambition === -1" class="ambition down">Target lowered</small>
          <small v-else-if="o.broken" class="ambition down">Promise broken</small>
        </span>
        <StatPill
          v-if="o.kind === 'debuts' && o.status === 'open'"
          :value="`${o.progress ?? 0}/${o.count}`"
        />
        <StatPill v-if="o.critical" value="Key" tone="var(--danger)" />
        <StatPill :value="o.status" :tone="statusTone(o.status)" wide />
      </div>
    </div>

    <template v-if="trophies.length">
      <AppSectionHeader title="Trophy cabinet" />
      <div class="cabinet">
        <div v-for="(t, i) in trophies" :key="i" class="trophy">
          <Trophy :size="28" class="trophy-icon" />
          <span class="trophy-name">{{ t.name }}</span>
          <NationFlag :id="t.nationId" :size="16" />
        </div>
      </div>
    </template>

    <template v-if="reviews.length">
      <AppSectionHeader title="Competition reviews" />
      <div class="list">
        <RouterLink
          v-for="r in reviews"
          :key="r.id"
          :to="`/career/review/${r.id}`"
          class="row link"
        >
          <NationFlag :id="r.nationId" :size="20" />
          <span class="row-text">
            {{ r.name }}
            <small class="muted">{{ r.reached }}</small>
          </span>
          <StatPill :value="verdictLabel(r.verdict)" :tone="verdictTone(r.verdict)" />
        </RouterLink>
      </div>
    </template>

    <template v-if="milestones.length">
      <AppSectionHeader title="Milestones" />
      <div class="list">
        <div v-for="m in milestones" :key="m.id" class="row">
          <Flag :size="16" class="milestone-icon" />
          <span class="row-text">{{ m.text }}</span>
          <span class="muted">{{ m.date.slice(0, 4) }}</span>
        </div>
      </div>
    </template>

    <AppSectionHeader title="Record" />
    <div class="list">
      <div v-for="(h, i) in history" :key="i" class="row">
        <NationFlag :id="h.nationId" :size="22" name />
        <StatPill v-if="h.left" :value="LEFT[h.left]" :tone="leftTone(h.left)" />
        <span class="muted">{{ h.played }}P {{ h.won }}W {{ h.drawn }}D {{ h.lost }}L</span>
        <span class="muted">{{ h.from.slice(0, 4) }}–{{ h.to ? h.to.slice(0, 4) : "" }}</span>
      </div>
    </div>
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

.ambition {
  font-size: var(--fs-xs);
  font-weight: 700;
}

.ambition.up {
  color: var(--accent);
}

.ambition.down {
  color: var(--warning);
}

.milestone-icon {
  flex-shrink: 0;
  color: var(--accent);
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
