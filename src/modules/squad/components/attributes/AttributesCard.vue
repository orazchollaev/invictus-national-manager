<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppCard, AppSectionHeader } from "@/components/ui"
import { ATTR_GROUPS, KEEPER_ATTRS, type Attr, type AttrGroup } from "@/engine/players/attributes"
import type { Player } from "@/engine/types"
import { abilityTone } from "@/modules/core/utils/format"

const props = defineProps<{ player: Player }>()
const { t } = useI18n()

interface Row {
  key: Attr
  value: number
  change: number
}

/** Last summer's snapshot, for the arrows. */
const before = computed(() => props.player.history.at(-1)?.attrs)

const groups = computed<{ group: AttrGroup; rows: Row[] }[]>(() => {
  const attrs = props.player.attrs
  if (!attrs) return []
  const keys: { group: AttrGroup; keys: readonly Attr[] }[] =
    props.player.pos === "GK" ? [{ group: "keeper", keys: KEEPER_ATTRS }] : ATTR_GROUPS
  return keys.map(({ group, keys }) => ({
    group,
    rows: keys.map((key) => {
      const value = attrs[key] ?? 0
      const prev = before.value?.[key]
      return { key, value, change: prev === undefined ? 0 : Math.round(value) - Math.round(prev) }
    }),
  }))
})
</script>

<template>
  <AppCard v-if="groups.length" padding="md">
    <AppSectionHeader :title="t('squad.player.attributes')" />
    <section v-for="g in groups" :key="g.group" class="group">
      <h4 class="group-title">{{ t(`squad.player.attrGroup.${g.group}`) }}</h4>
      <ul class="rows">
        <li v-for="r in g.rows" :key="r.key" class="row">
          <span class="name">{{ t(`squad.player.attr.${r.key}`) }}</span>
          <span class="bar" aria-hidden="true">
            <span
              class="fill"
              :style="{ width: `${r.value}%`, background: abilityTone(r.value) }"
            ></span>
          </span>
          <span class="value">{{ Math.round(r.value) }}</span>
          <span
            class="change"
            :class="{ up: r.change > 0, down: r.change < 0 }"
            :title="r.change ? t('squad.player.attrChange', { n: r.change }) : ''"
          >
            {{ r.change > 0 ? "▲" : r.change < 0 ? "▼" : "" }}
          </span>
        </li>
      </ul>
    </section>
  </AppCard>
</template>

<style scoped>
.group + .group {
  margin-top: var(--sp-3);
}

.group-title {
  margin: 0 0 var(--sp-1);
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: grid;
  grid-template-columns: minmax(84px, 1fr) 2fr 28px 16px;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.name {
  color: var(--text);
}

.bar {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--surface-2, var(--border));
}

.fill {
  display: block;
  height: 100%;
  border-radius: 3px;
}

.value {
  font-weight: 700;
  text-align: right;
}

.change {
  font-size: var(--fs-xs);
}

.change.up {
  color: var(--success);
}

.change.down {
  color: var(--danger);
}
</style>
