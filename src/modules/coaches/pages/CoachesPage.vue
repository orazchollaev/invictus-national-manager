<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { AppCard, AppPagination, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { CoachRow } from "@/modules/coaches/components/list"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"

const PAGE_SIZE = 30

const { t } = useI18n()
const world = useWorldStore()
const tab = ref<"employed" | "free" | "retired">("employed")
const page = ref(1)
watch(tab, () => (page.value = 1))

const coaches = world.derive((w) => Object.values(w.state.coaches ?? {}).map((c) => ({ ...c })), [])

const vacancies = world.derive(
  (w) =>
    w
      .ctx()
      .ranked((id) => w.state.nations[id]?.coachId === null)
      .map((id) => ({ id, since: w.state.nations[id].vacantSince })),
  []
)

const list = computed(() => {
  const all = coaches.value
  const pick =
    tab.value === "employed"
      ? all.filter((c) => c.nationId)
      : tab.value === "free"
        ? all.filter((c) => !c.nationId && !c.retired)
        : all.filter((c) => c.retired)
  return tab.value === "retired"
    ? pick.sort((a, b) => (a.retired! < b.retired! ? 1 : -1))
    : pick.sort((a, b) => b.reputation - a.reputation)
})

const shown = computed(() => list.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
</script>

<template>
  <PageShell :title="t('coaches.title')" :subtitle="t('coaches.hint')" back>
    <AppSubTabBar
      :model-value="tab"
      :options="[
        { value: 'employed', label: t('coaches.employed') },
        { value: 'free', label: t('coaches.free') },
        { value: 'retired', label: t('coaches.retired') },
      ]"
      size="sm"
      @update:model-value="(v) => (tab = v as typeof tab)"
    />

    <AppCard v-if="tab === 'employed'" padding="md">
      <AppSectionHeader :title="t('coaches.vacancies')" />
      <ul v-if="vacancies.length" class="vacancies">
        <li v-for="v in vacancies" :key="v.id">
          <NationFlag :id="v.id" :size="18" name link />
          <span v-if="v.since" class="muted">
            {{ t("coaches.vacantSince", { date: formatDate(v.since) }) }}
          </span>
        </li>
      </ul>
      <p v-else class="muted">{{ t("coaches.noVacancies") }}</p>
    </AppCard>

    <AppCard padding="none" class="list">
      <CoachRow v-for="c in shown" :key="c.id" :coach="c" :date="world.date" />
      <p v-if="!shown.length" class="muted empty">{{ t("coaches.empty") }}</p>
    </AppCard>
    <AppPagination
      v-if="list.length > PAGE_SIZE"
      v-model="page"
      :total-items="list.length"
      :page-size="PAGE_SIZE"
    />
  </PageShell>
</template>

<style scoped>
.list {
  overflow: hidden;
}

.vacancies {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.vacancies li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.muted {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.empty {
  padding: var(--sp-3);
}
</style>
