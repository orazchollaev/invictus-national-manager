<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
} from "chart.js"
import { AppCard, AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"
import {
  abilityTone,
  age,
  describeTrait,
  formLabel,
  potentialRange,
} from "@/modules/core/utils/format"

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler)

const route = useRoute()
const world = useWorldStore()
const id = computed(() => String(route.params.id))
const p = world.derive((w) => w.state.players[id.value] ?? null, null)
const club = computed(() => (p.value ? world.world?.clubs.get(p.value.clubId) : undefined))
const potential = computed(() => (p.value ? potentialRange(p.value, world.date) : [0, 0]))
const injured = computed(() => !!p.value?.injury && p.value.injury.until > world.date)

const traits = computed(() => {
  if (!p.value) return []
  const t = p.value.pers
  return [
    ["Professionalism", t.professionalism],
    ["Ambition", t.ambition],
    ["Temperament", t.temperament],
    ["Consistency", t.consistency],
    ["Big matches", t.bigMatch],
    ["Injury resistance", 21 - t.injuryProne],
  ] as [string, number][]
})

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function draw() {
  if (!canvas.value || !p.value) return
  const points = [
    ...p.value.history.map((h) => [String(h.season).slice(2), h.ca] as const),
    ["Now", p.value.ca] as const,
  ]
  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue("--accent").trim() || "teal"
  const muted = styles.getPropertyValue("--text-muted").trim() || "gray"
  chart?.destroy()
  chart = new Chart(canvas.value, {
    type: "line",
    data: {
      labels: points.map((x) => x[0]),
      datasets: [
        {
          data: points.map((x) => x[1]),
          borderColor: accent,
          backgroundColor: "transparent",
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { suggestedMin: 30, suggestedMax: 95, ticks: { color: muted } },
        x: { ticks: { color: muted } },
      },
    },
  })
}

onMounted(draw)
watch(p, draw)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <PageShell
    v-if="p"
    :title="`${p.first} ${p.last}`"
    :subtitle="`${p.pos}${p.alt.length ? ` (${p.alt.join(', ')})` : ''} · ${age(p, world.date)} years`"
    back
  >
    <AppCard padding="md" class="head">
      <NationFlag :id="p.nationId" :size="40" name link />
      <div class="head-stats">
        <div class="stat">
          <span class="stat-label">Ability</span>
          <StatPill :value="Math.round(p.ca)" :tone="abilityTone(p.ca)" wide />
        </div>
        <div class="stat">
          <span class="stat-label">Potential</span>
          <span class="stat-value">{{ potential[0] }}–{{ potential[1] }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Caps / goals</span>
          <span class="stat-value">{{ p.caps }} / {{ p.goals }}</span>
        </div>
      </div>
    </AppCard>

    <AppCard padding="md">
      <AppSectionHeader title="Club and condition" />
      <dl class="facts">
        <dt>Club</dt>
        <dd>
          {{ club?.name ?? "—" }}
          <span class="muted">(level {{ club?.tier ?? "?" }})</span>
        </dd>
        <dt>Role</dt>
        <dd class="cap">{{ p.role }}</dd>
        <dt>Form</dt>
        <dd>{{ formLabel(p.form) }}</dd>
        <dt>Sharpness</dt>
        <dd>{{ p.sharp }}%</dd>
        <dt>Morale</dt>
        <dd>{{ p.morale }}%</dd>
        <dt>Fitness</dt>
        <dd :class="{ bad: injured }">
          {{ injured ? `${p.injury!.label} — back ${formatDate(p.injury!.until)}` : "Fit" }}
        </dd>
        <template v-if="p.banned">
          <dt>Suspended</dt>
          <dd class="bad">{{ p.banned }} match</dd>
        </template>
        <template v-if="p.intlRetired">
          <dt>International</dt>
          <dd class="bad">Retired</dd>
        </template>
        <dt>Foot</dt>
        <dd>{{ p.foot === "L" ? "Left" : p.foot === "B" ? "Both" : "Right" }}</dd>
      </dl>
    </AppCard>

    <AppCard padding="md">
      <AppSectionHeader title="Character" />
      <dl class="facts">
        <template v-for="[label, v] in traits" :key="label">
          <dt>{{ label }}</dt>
          <dd>{{ describeTrait(v) }}</dd>
        </template>
      </dl>
    </AppCard>

    <AppCard padding="md">
      <AppSectionHeader title="Development" />
      <div class="chart"><canvas ref="canvas"></canvas></div>
    </AppCard>
  </PageShell>
  <AppEmptyState v-else title="Player not found" description="He may have retired." />
</template>

<style scoped>
.head :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.head-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-2);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.stat-value {
  font-weight: 700;
}

.facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--sp-1-5) var(--sp-3);
  margin: 0;
}

.facts dt {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.facts dd {
  margin: 0;
  font-weight: 600;
}

.cap {
  text-transform: capitalize;
}

.bad {
  color: var(--danger);
}

.muted {
  color: var(--text-muted);
  font-weight: 400;
}

.chart {
  position: relative;
  height: 180px;
}
</style>
