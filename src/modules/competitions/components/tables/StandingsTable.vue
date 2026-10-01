<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { Standing } from "@/engine/competition/types"
import { AppChip } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { ZONE_INFO, type Zone } from "@/modules/competitions/utils/zones"
import type { Outlook } from "@/modules/competitions/utils/outlook"

const props = defineProps<{
  rows: Standing[]
  title: string
  /** What each position leads to (qualify, play-off, relegation…). */
  zones?: (Zone | null)[]
  /** Who is already through or out, per position. */
  outlook?: Outlook[]
  /** A line drawn under this many rows: the cut of a best-placed ranking. */
  cut?: number
  /** The finals' hosts, marked in the table (also in their qualifying groups). */
  hosts?: string[]
}>()

const { t } = useI18n()
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
      <span class="team">{{ t("competitions.table.team") }}</span>
      <span>{{ t("competitions.table.p") }}</span>
      <span>{{ t("competitions.table.w") }}</span>
      <span>{{ t("competitions.table.d") }}</span>
      <span>{{ t("competitions.table.l") }}</span>
      <span class="gd">{{ t("competitions.table.gd") }}</span>
      <span class="pts">{{ t("competitions.table.pts") }}</span>
    </div>
    <RouterLink
      v-for="(r, i) in rows"
      :key="r.team"
      :to="r.team.startsWith('?') ? '' : `/nation/${r.team}`"
      class="row"
      :class="{ mine: r.team === world.me, cut: cut === i + 1 }"
      :style="{ '--zone': tone(i) }"
    >
      <span class="pos">{{ i + 1 }}</span>
      <span class="team">
        <NationFlag :id="r.team" :size="18" name />
        <AppChip v-if="hosts?.includes(r.team)" size="xs" variant="accent" class="host">
          {{ t("competitions.table.host") }}
        </AppChip>
        <AppChip v-if="outlook?.[i] === 'qualified'" size="xs" variant="success" class="host">
          {{ t("competitions.table.q") }}
        </AppChip>
        <AppChip v-else-if="outlook?.[i] === 'eliminated'" size="xs" variant="danger" class="host">
          {{ t("competitions.table.e") }}
        </AppChip>
      </span>
      <span>{{ r.p }}</span>
      <span>{{ r.w }}</span>
      <span>{{ r.d }}</span>
      <span>{{ r.l }}</span>
      <span class="gd">{{ r.gd > 0 ? `+${r.gd}` : r.gd }}</span>
      <span class="pts">{{ r.pts }}</span>
    </RouterLink>
    <div v-if="legend.length || outlook?.some(Boolean)" class="legend">
      <span v-if="outlook?.includes('qualified')" class="legend-item">
        {{ t("competitions.table.through") }}
      </span>
      <span v-if="outlook?.includes('eliminated')" class="legend-item">
        {{ t("competitions.table.out") }}
      </span>
      <span v-for="l in legend" :key="l.zone" class="legend-item">
        <span class="legend-dot" :style="{ background: l.tone }"></span>
        {{ t(l.label) }}
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
  align-items: center;
  gap: var(--sp-1);
}

.host {
  flex-shrink: 0;
}

.pos {
  color: var(--text-muted);
}

.mine {
  background: var(--accent-subtle);
}

.cut {
  border-bottom: 2px solid var(--success);
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
