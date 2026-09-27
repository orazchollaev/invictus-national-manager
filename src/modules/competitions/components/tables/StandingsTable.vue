<script setup lang="ts">
import { computed } from "vue"
import type { Standing } from "@/engine/competition/types"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { ZONE_INFO, type Zone } from "@/modules/competitions/utils/zones"

const props = defineProps<{
  rows: Standing[]
  title: string
  /** What each position leads to (qualify, play-off, relegation…). */
  zones?: (Zone | null)[]
}>()

const world = useWorldStore()

const legend = computed(() => {
  const seen = new Set<Zone>()
  for (const z of props.zones ?? []) if (z) seen.add(z)
  return [...seen].map((z) => ({ zone: z, ...ZONE_INFO[z] }))
})

const tone = (i: number) => {
  const z = props.zones?.[i]
  return z ? ZONE_INFO[z].tone : "transparent"
}
</script>

<template>
  <div class="table">
    <div class="table-title">{{ title }}</div>
    <div class="row head">
      <span class="pos">#</span>
      <span class="team">Team</span>
      <span>P</span>
      <span>W</span>
      <span>D</span>
      <span>L</span>
      <span class="gd">GD</span>
      <span class="pts">Pts</span>
    </div>
    <RouterLink
      v-for="(r, i) in rows"
      :key="r.team"
      :to="`/nation/${r.team}`"
      class="row"
      :class="{ mine: r.team === world.me }"
      :style="{ '--zone': tone(i) }"
    >
      <span class="pos">{{ i + 1 }}</span>
      <span class="team"><NationFlag :id="r.team" :size="18" name /></span>
      <span>{{ r.p }}</span>
      <span>{{ r.w }}</span>
      <span>{{ r.d }}</span>
      <span>{{ r.l }}</span>
      <span class="gd">{{ r.gd > 0 ? `+${r.gd}` : r.gd }}</span>
      <span class="pts">{{ r.pts }}</span>
    </RouterLink>
    <div v-if="legend.length" class="legend">
      <span v-for="l in legend" :key="l.zone" class="legend-item">
        <span class="legend-dot" :style="{ background: l.tone }"></span>
        {{ l.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.table {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.table-title {
  padding: var(--sp-2) var(--sp-3);
  font-weight: 700;
  font-size: var(--fs-sm);
  background: var(--surface-2);
}

.row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) repeat(4, 22px) 32px 30px;
  align-items: center;
  gap: 4px;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  border-inline-start: 4px solid var(--zone, transparent);
  font-size: var(--fs-sm);
  font-variant-numeric: tabular-nums;
  color: var(--text);
  text-decoration: none;
  text-align: center;
}

.row.head {
  color: var(--text-muted);
  font-size: var(--fs-xs);
  font-weight: 600;
  border-inline-start-color: transparent;
}

.team {
  text-align: start;
  min-width: 0;
  display: flex;
}

.pos {
  color: var(--text-muted);
}

.mine {
  background: var(--accent-subtle);
}

.pts {
  font-weight: 800;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
