<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { ClipboardList, Users } from "@lucide/vue"
import { AppButton, AppEmptyState, AppSearchInput, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { positionGroup, ageOn } from "@/engine/players/ability"
import type { Player } from "@/engine/types"

const router = useRouter()
const world = useWorldStore()

const tab = ref<"squad" | "pool">("squad")
const group = ref("all")
const sort = ref("ability")
const query = ref("")

const me = computed(() => world.me)
const squad = world.derive(
  (w) =>
    w.state.career.nationId
      ? w.state.nations[w.state.career.nationId].squad
          .map((id) => w.state.players[id])
          .filter(Boolean)
      : [],
  [] as Player[]
)
const pool = world.derive(
  (w) => (w.state.career.nationId ? w.pool(w.state.career.nationId) : []),
  [] as Player[]
)
const pending = world.derive((w) => w.state.pendingCallup, null)

const ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

const list = computed(() => {
  const src = tab.value === "squad" ? squad.value : pool.value
  const q = query.value.trim().toLowerCase()
  const out = src.filter(
    (p) =>
      (group.value === "all" || positionGroup(p.pos) === group.value) &&
      (!q || `${p.first} ${p.last}`.toLowerCase().includes(q))
  )
  const date = world.date
  const by: Record<string, (a: Player, b: Player) => number> = {
    ability: (a, b) => b.ca - a.ca,
    age: (a, b) => ageOn(a.born, date) - ageOn(b.born, date),
    form: (a, b) => b.form - a.form,
    caps: (a, b) => b.caps - a.caps,
    position: (a, b) => ORDER[positionGroup(a.pos)] - ORDER[positionGroup(b.pos)] || b.ca - a.ca,
  }
  return out.sort(by[sort.value])
})
</script>

<template>
  <PageShell
    title="Squad"
    :subtitle="me ? `${squad.length} called up · ${pool.length} eligible players` : ''"
  >
    <template #actions>
      <AppButton variant="tonal" @click="router.push('/squad/tactics')">
        <ClipboardList :size="16" />
        Tactics
      </AppButton>
    </template>

    <AppEmptyState
      v-if="!me"
      :icon="Users"
      title="No team"
      description="You are not managing a nation right now."
    />

    <template v-else>
      <AppButton v-if="pending" variant="filled" block @click="router.push('/squad/callup')">
        Name your squad
      </AppButton>
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'squad', label: 'Current squad' },
          { value: 'pool', label: 'All players' },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v as 'squad' | 'pool')"
      />
      <AppSearchInput
        v-if="tab === 'pool'"
        v-model="query"
        placeholder="Search players"
        size="sm"
      />
      <div class="filters">
        <AppSubTabBar
          :model-value="group"
          :options="[
            { value: 'all', label: 'All' },
            { value: 'GK', label: 'GK' },
            { value: 'DEF', label: 'DEF' },
            { value: 'MID', label: 'MID' },
            { value: 'FWD', label: 'FWD' },
          ]"
          @update:model-value="(v) => (group = v)"
        />
        <select v-model="sort" class="sort">
          <option value="position">Position</option>
          <option value="ability">Ability</option>
          <option value="form">Form</option>
          <option value="age">Age</option>
          <option value="caps">Caps</option>
        </select>
      </div>

      <AppEmptyState
        v-if="!list.length"
        :icon="Users"
        :title="tab === 'squad' ? 'No squad named yet' : 'No players'"
        :description="tab === 'squad' ? 'You name a squad before each international window.' : ''"
      />
      <div v-else class="list">
        <PlayerRow v-for="p in list" :key="p.id" :player="p" />
      </div>
    </template>
  </PageShell>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.sort {
  width: auto;
  font-size: var(--fs-sm);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}
</style>
