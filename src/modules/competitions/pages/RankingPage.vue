<script setup lang="ts">
import { computed, ref } from "vue"
import { AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"

const world = useWorldStore()
const confed = ref("all")

const rows = world.derive((w) => {
  const list = Object.values(w.state.nations)
    .filter((n) => !w.def(n.id).banned && !w.def(n.id).nonFifa)
    .sort((a, b) => b.points - a.points)
  // Movement since the last monthly snapshot.
  const before = [...list].sort(
    (a, b) => (b.pointsHistory.at(-1)?.[1] ?? b.points) - (a.pointsHistory.at(-1)?.[1] ?? a.points)
  )
  const prevRank = new Map(before.map((n, i) => [n.id, i]))
  return list.map((n, i) => ({
    id: n.id,
    rank: i + 1,
    points: n.points,
    move: (prevRank.get(n.id) ?? i) - i,
    confed: w.def(n.id).confed,
  }))
}, [])

const shown = computed(() =>
  rows.value.filter((r) => confed.value === "all" || r.confed === confed.value)
)
</script>

<template>
  <PageShell back title="FIFA World Ranking" subtitle="Updated after every match">
    <AppSubTabBar
      :model-value="confed"
      :options="
        ['all', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'].map((v) => ({
          value: v,
          label: v === 'all' ? 'World' : v,
        }))
      "
      @update:model-value="(v) => (confed = v)"
    />
    <div class="list">
      <RouterLink
        v-for="r in shown"
        :key="r.id"
        :to="`/nation/${r.id}`"
        class="row"
        :class="{ mine: r.id === world.me }"
      >
        <span class="rank">{{ r.rank }}</span>
        <span class="move" :class="{ up: r.move > 0, down: r.move < 0 }">
          {{ r.move > 0 ? `▲${r.move}` : r.move < 0 ? `▼${-r.move}` : "" }}
        </span>
        <span class="team"><NationFlag :id="r.id" :size="22" name /></span>
        <span class="pts">{{ r.points.toFixed(2) }}</span>
      </RouterLink>
    </div>
  </PageShell>
</template>

<style scoped>
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
  color: var(--text);
  text-decoration: none;
  font-variant-numeric: tabular-nums;
}

.row.mine {
  background: var(--accent-subtle);
}

.rank {
  width: 32px;
  font-weight: 700;
}

.move {
  width: 34px;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.move.up {
  color: var(--success);
}

.move.down {
  color: var(--danger);
}

.team {
  flex: 1;
  min-width: 0;
  display: flex;
}

.pts {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
