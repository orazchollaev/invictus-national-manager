<script setup lang="ts">
import { StandingsTable } from "@/modules/competitions/components/tables"
import { useWorldStore } from "@/modules/world/store"
import { groupView } from "@/modules/competitions/utils/groupView"

const world = useWorldStore()

/** The user's group in the competition he is currently playing a group stage of. */
const snapshot = world.derive((w) => {
  const me = w.state.career.nationId
  if (!me) return null
  const ctx = w.ctx()
  const live = Object.values(w.state.competitions)
    .filter((c) => c.status === "active")
    .sort((a, b) => (a.end < b.end ? -1 : 1))
  for (const inst of live) {
    const stage = inst.stages.find(
      (s) => s.status === "active" && s.groups?.some((g) => g.teams.includes(me))
    )
    const group = stage?.groups?.find((g) => g.teams.includes(me))
    if (!stage || !group) continue
    const view = groupView(inst, stage, group, ctx)
    return {
      id: inst.id,
      title: `${inst.short} · ${group.name.length <= 2 ? `Group ${group.name}` : group.name}`,
      ...view,
    }
  }
  return null
}, null)
</script>

<template>
  <RouterLink v-if="snapshot" :to="`/competitions/${snapshot.id}`" class="snap">
    <StandingsTable
      :rows="snapshot.rows"
      :title="snapshot.title"
      :zones="snapshot.zones"
      :outlook="snapshot.outlook"
    />
  </RouterLink>
</template>

<style scoped>
.snap {
  display: block;
  color: inherit;
  text-decoration: none;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
</style>
