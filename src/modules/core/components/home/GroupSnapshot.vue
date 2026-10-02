<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { compName } from "@/i18n/text"
import { StandingsTable } from "@/modules/competitions/components/tables"
import { useWorldStore } from "@/modules/world/store"
import { groupView } from "@/modules/competitions/utils/groupView"
import type { GroupTable } from "@/engine/competition/types"

const { t } = useI18n()
const world = useWorldStore()

/**
 * The user's group in the group stage he is playing now; once it is over, the last one he
 * played stays until the next begins. A draw not watched yet stays hidden.
 */
const snapshot = world.derive((w) => {
  const me = w.state.career.nationId
  if (!me) return null
  const hidden = w.state.pendingDraw?.compId
  const lastPlayed = (g: GroupTable) =>
    g.fixtures.reduce((d, id) => {
      const f = w.state.fixtures[id]
      return f?.result && f.date > d ? f.date : d
    }, "")
  const groups = Object.values(w.state.competitions)
    .filter((inst) => inst.status !== "upcoming" && inst.id !== hidden)
    .flatMap((inst) =>
      inst.stages.flatMap((stage) => {
        const group =
          stage.status === "waiting" ? undefined : stage.groups?.find((g) => g.teams.includes(me))
        return group ? [{ inst, stage, group, live: stage.status === "active" }] : []
      })
    )
  // A live group first, the one ending soonest; otherwise the last one played.
  const best =
    groups.filter((g) => g.live).sort((a, b) => (a.inst.end < b.inst.end ? -1 : 1))[0] ??
    groups.sort((a, b) => (lastPlayed(a.group) > lastPlayed(b.group) ? -1 : 1))[0]
  if (!best) return null
  const { inst, stage, group } = best
  const view = groupView(inst, stage, group, w.ctx())
  return {
    id: inst.id,
    title: `${compName(inst, "short")} · ${group.name.length <= 2 ? t("common.group", { name: group.name }) : group.name}`,
    ...view,
  }
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
