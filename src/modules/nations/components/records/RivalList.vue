<script setup lang="ts">
/** A nation's rivals and how it has fared against each since the game began. */
import { useI18n } from "vue-i18n"
import { AppSectionHeader } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { rivalsOf } from "@/engine/world/rivals"
import { headToHead } from "@/modules/nations/utils/headToHead"

const props = defineProps<{ nationId: string }>()

const { t } = useI18n()
const world = useWorldStore()

const rivals = world.derive((w) => {
  const list = rivalsOf(props.nationId).filter((r) => w.state.nations[r.id])
  if (!list.length) return []
  const fixtures = w.fixturesOf(props.nationId)
  return list.map((r) => ({ ...r, h2h: headToHead(fixtures, props.nationId, r.id) }))
}, [])
</script>

<template>
  <template v-if="rivals.length">
    <AppSectionHeader :title="t('nation.rivals.title')" />
    <div class="list">
      <div v-for="r in rivals" :key="r.id" class="row">
        <NationFlag :id="r.id" :size="20" name link />
        <span v-if="r.intensity === 2" class="fierce">{{ t("nation.rivals.fierce") }}</span>
        <span class="h2h">
          {{
            r.h2h.played
              ? t("nation.rivals.record", {
                  w: r.h2h.won,
                  d: r.h2h.drawn,
                  l: r.h2h.lost,
                  gf: r.h2h.gf,
                  ga: r.h2h.ga,
                })
              : t("nation.rivals.none")
          }}
        </span>
      </div>
    </div>
  </template>
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
  font-size: var(--fs-sm);
}

.row:last-child {
  border-bottom: none;
}

.fierce {
  padding: 0 var(--sp-1);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--danger) 14%, var(--surface));
  color: var(--danger);
  font-size: var(--fs-xs);
  font-weight: 700;
}

.h2h {
  margin-inline-start: auto;
  flex-shrink: 0;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
