<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { ClipboardList, Sprout, Users } from "@lucide/vue"
import { AppButton, AppEmptyState, AppSearchInput, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { positionGroup, ageOn } from "@/engine/players/ability"
import type { Player } from "@/engine/types"

const { t } = useI18n()
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
    :title="t('squad.title')"
    :subtitle="me ? t('squad.subtitle', { squad: squad.length, pool: pool.length }) : ''"
  >
    <template #actions>
      <AppButton
        v-if="me"
        variant="tonal"
        :aria-label="t('squad.prospects')"
        @click="router.push('/squad/prospects')"
      >
        <Sprout :size="16" />
      </AppButton>
      <AppButton variant="tonal" @click="router.push('/squad/tactics')">
        <ClipboardList :size="16" />
        {{ t("squad.tacticsBtn") }}
      </AppButton>
    </template>

    <AppEmptyState
      v-if="!me"
      :icon="Users"
      :title="t('squad.noTeam')"
      :description="t('squad.noTeamHint')"
    />

    <template v-else>
      <AppButton v-if="pending" variant="filled" block @click="router.push('/squad/callup')">
        {{ t("squad.nameSquad") }}
      </AppButton>
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'squad', label: t('squad.currentSquad') },
          { value: 'pool', label: t('squad.allPlayers') },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v as 'squad' | 'pool')"
      />
      <AppSearchInput
        v-if="tab === 'pool'"
        v-model="query"
        :placeholder="t('squad.searchPlayers')"
        size="sm"
      />
      <div class="filters">
        <AppSubTabBar
          :model-value="group"
          :options="[
            { value: 'all', label: t('common.all') },
            { value: 'GK', label: t('squad.pos.GK') },
            { value: 'DEF', label: t('squad.pos.DEF') },
            { value: 'MID', label: t('squad.pos.MID') },
            { value: 'FWD', label: t('squad.pos.FWD') },
          ]"
          @update:model-value="(v) => (group = v)"
        />
        <select v-model="sort" class="sort">
          <option value="position">{{ t("squad.sort.position") }}</option>
          <option value="ability">{{ t("squad.sort.ability") }}</option>
          <option value="form">{{ t("squad.sort.form") }}</option>
          <option value="age">{{ t("squad.sort.age") }}</option>
          <option value="caps">{{ t("squad.sort.caps") }}</option>
        </select>
      </div>

      <AppEmptyState
        v-if="!list.length"
        :icon="Users"
        :title="tab === 'squad' ? t('squad.noSquad') : t('squad.noPlayers')"
        :description="tab === 'squad' ? t('squad.noSquadHint') : ''"
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
