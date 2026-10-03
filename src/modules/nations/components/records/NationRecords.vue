<script setup lang="ts">
/** A nation's records since the game began: the team's totals and landmarks, and its leading players. */
import { PersonFace } from "@/modules/core/components/face"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppSectionHeader } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { formatDate } from "@/i18n/dates"
import { useWorldStore } from "@/modules/world/store"
import { emptyRecord, recordHolders, type RecordStat } from "@/engine/world/records"

const props = defineProps<{ nationId: string }>()

const { t } = useI18n()
const world = useWorldStore()

const record = world.derive(
  (w) => w.state.nations[props.nationId]?.record ?? emptyRecord(),
  emptyRecord()
)
const holders = world.derive(
  (w) =>
    recordHolders(
      w.pool(props.nationId),
      w.state.retired.filter((r) => r.nationId === props.nationId)
    ),
  null
)

const STATS: RecordStat[] = ["goals", "caps", "assists", "cleanSheets"]
const lists = computed(() =>
  STATS.map((stat) => ({ stat, rows: holders.value?.[stat] ?? [] })).filter((l) => l.rows.length)
)

const tiles = computed(() => {
  const r = record.value
  return [
    { label: t("nation.records.played"), value: String(r.played) },
    { label: t("nation.records.wdl"), value: `${r.won}-${r.drawn}-${r.lost}` },
    { label: t("nation.records.scored"), value: String(r.gf) },
    { label: t("nation.records.conceded"), value: String(r.ga) },
    { label: t("nation.records.cleanSheets"), value: String(r.cleanSheets) },
    {
      label: t("nation.records.winRate"),
      value: r.played ? `${Math.round((r.won / r.played) * 100)}%` : "—",
    },
  ]
})
</script>

<template>
  <template v-if="record.played">
    <AppSectionHeader :title="t('nation.records.team')" />
    <div class="tiles">
      <div v-for="tile in tiles" :key="tile.label" class="tile">
        <strong>{{ tile.value }}</strong>
        <span>{{ tile.label }}</span>
      </div>
    </div>
    <div class="list">
      <div v-if="record.bestRank" class="row">
        <span class="label">{{ t("nation.records.bestRank") }}</span>
        <strong>#{{ record.bestRank[0] }}</strong>
        <span class="muted">{{ formatDate(record.bestRank[1]) }}</span>
      </div>
      <div v-if="record.worstRank" class="row">
        <span class="label">{{ t("nation.records.worstRank") }}</span>
        <strong>#{{ record.worstRank[0] }}</strong>
        <span class="muted">{{ formatDate(record.worstRank[1]) }}</span>
      </div>
      <RouterLink
        v-if="record.biggestWin"
        :to="`/report/${record.biggestWin.fixture}`"
        class="row link"
      >
        <span class="label">{{ t("nation.records.biggestWin") }}</span>
        <strong>{{ record.biggestWin.gf }}–{{ record.biggestWin.ga }}</strong>
        <NationFlag :id="record.biggestWin.opp" :size="16" name="short" />
      </RouterLink>
      <RouterLink
        v-if="record.heaviestDefeat"
        :to="`/report/${record.heaviestDefeat.fixture}`"
        class="row link"
      >
        <span class="label">{{ t("nation.records.heaviestDefeat") }}</span>
        <strong>{{ record.heaviestDefeat.gf }}–{{ record.heaviestDefeat.ga }}</strong>
        <NationFlag :id="record.heaviestDefeat.opp" :size="16" name="short" />
      </RouterLink>
    </div>
  </template>

  <template v-for="l in lists" :key="l.stat">
    <AppSectionHeader :title="t(`nation.records.top.${l.stat}`)" />
    <div class="list">
      <component
        :is="h.active ? 'RouterLink' : 'div'"
        v-for="(h, i) in l.rows"
        :key="h.id"
        :to="h.active ? `/player/${h.id}` : undefined"
        class="row"
        :class="{ link: h.active }"
      >
        <span class="pos">{{ i + 1 }}</span>
        <PersonFace
          :player="{ id: h.id, last: h.name.split(' ').slice(1).join(' '), nationId }"
          :size="32"
          head
        />
        <span class="name">
          {{ h.name }}
          <small class="muted">
            {{ h.pos }} · {{ t("nation.records.caps", { n: h.caps }) }}
            <template v-if="!h.active">· {{ t("nation.records.retired") }}</template>
          </small>
        </span>
        <strong class="value">{{ h[l.stat] }}</strong>
      </component>
    </div>
  </template>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-2);
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--sp-2) var(--sp-1);
  border-radius: var(--radius);
  background: var(--surface);
  text-align: center;
}

.tile strong {
  font-size: var(--fs-md);
  font-variant-numeric: tabular-nums;
}

.tile span {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

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
  font-size: var(--fs-sm);
  color: var(--text);
  text-decoration: none;
}

.row:last-child {
  border-bottom: none;
}

.label {
  flex: 1;
  min-width: 0;
}

.pos {
  width: 18px;
  flex-shrink: 0;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.name {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.value {
  font-variant-numeric: tabular-nums;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-xs);
}
</style>
