<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js"
import { AppCard, AppSectionHeader } from "@/components/ui"
import type { ISODate } from "@/engine/types"

/** Month-end FIFA points (oldest first) and the points today. */
const props = defineProps<{ history: [ISODate, number][]; points: number }>()

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler)

const { t } = useI18n()
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

/** "09/26" for a month-end in September 2026. */
const label = (d: ISODate) => `${d.slice(5, 7)}/${d.slice(2, 4)}`

function draw() {
  if (!canvas.value) return
  const points = [
    ...props.history.map(([d, v]) => [label(d), v] as const),
    [t("nation.pointsNow"), props.points] as const,
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
          data: points.map((x) => Math.round(x[1])),
          borderColor: accent,
          backgroundColor: "transparent",
          tension: 0.3,
          pointRadius: points.length > 24 ? 0 : 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: muted } },
        x: { ticks: { color: muted, maxTicksLimit: 8 } },
      },
    },
  })
}

onMounted(draw)
watch(() => [props.history.length, props.points], draw, { flush: "post" })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <AppCard padding="md">
    <AppSectionHeader :title="t('nation.pointsChart')" />
    <p v-if="!history.length" class="muted">{{ t("nation.pointsEmpty") }}</p>
    <div v-else class="chart"><canvas ref="canvas"></canvas></div>
  </AppCard>
</template>

<style scoped>
.chart {
  position: relative;
  height: 180px;
}

.muted {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
