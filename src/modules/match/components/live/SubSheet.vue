<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { AppButton, AppSheet } from "@/components/ui"
import { StatPill } from "@/modules/core/components"
import type { LivePlayer, LiveSide } from "@/engine/match/engine"
import { positionFit } from "@/engine/players/ability"

const props = defineProps<{
  side: LiveSide
  name: (id: string) => string
  maxSubs: number
  /** Pre-select the player who has to come off (injury). */
  forceOut?: string | null
}>()

const emit = defineEmits<{ close: []; sub: [outId: string, inId: string] }>()

const { t } = useI18n()

const outId = ref<string | null>(props.forceOut ?? null)
const left = computed(() => props.maxSubs - props.side.subsUsed)

const leaving = computed(() => props.side.pitch.find((p) => p.id === outId.value))
const bench = computed(() => {
  const slot = leaving.value?.slot
  return [...props.side.bench].sort((a, b) =>
    slot ? value(b, slot) - value(a, slot) : b.base - a.base
  )
})

function value(p: LivePlayer, slot: LivePlayer["slot"]) {
  return p.base * positionFit({ pos: p.natural, alt: p.alt }, slot)
}

function staminaTone(s: number) {
  return s >= 70 ? "var(--success)" : s >= 45 ? "var(--warning)" : "var(--danger)"
}

function pick(inId: string) {
  if (!outId.value) return
  emit("sub", outId.value, inId)
}
</script>

<template>
  <AppSheet
    :title="outId ? t('match.sub.whoOn') : t('match.sub.whoOff')"
    :subtitle="t('match.sub.left', { n: left }, left)"
    max-height="85dvh"
    max-height-mobile="85dvh"
    @close="emit('close')"
  >
    <div class="body">
      <p v-if="!outId" class="hint">{{ t("match.sub.pickOff") }}</p>
      <p v-else class="hint hint--off">
        <span class="off">▼ {{ name(outId) }}</span>
        <span>{{ t("match.sub.onInPlace") }}</span>
      </p>
      <div v-if="!outId" class="list">
        <button v-for="p in side.pitch" :key="p.id" class="row" @click="outId = p.id">
          <span class="role">{{ p.slot }}</span>
          <span class="name">
            {{ name(p.id) }}
            <span v-if="p.injured" class="hurt">{{ t("match.sub.injured") }}</span>
            <span v-if="p.yellow" class="booked">{{ t("match.sub.booked") }}</span>
          </span>
          <StatPill :value="`${Math.round(p.stamina)}%`" :tone="staminaTone(p.stamina)" wide />
        </button>
      </div>
      <div v-else class="list">
        <button
          v-for="p in bench"
          :key="p.id"
          class="row"
          :disabled="left <= 0"
          @click="pick(p.id)"
        >
          <span class="role">{{ p.natural }}</span>
          <span class="name">{{ name(p.id) }}</span>
          <StatPill
            :value="Math.round(value(p, leaving!.slot))"
            :tone="
              positionFit({ pos: p.natural, alt: p.alt }, leaving!.slot) >= 1
                ? 'var(--success)'
                : 'var(--warning)'
            "
          />
        </button>
        <AppButton variant="text" @click="outId = null">{{ t("common.back") }}</AppButton>
      </div>
    </div>
  </AppSheet>
</template>

<style scoped>
.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--sp-2) var(--sp-3) calc(var(--sp-3) + var(--safe-bottom));
}

.hint {
  margin: 0 0 var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.hint--off {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hint--off .off {
  color: var(--danger);
  font-size: var(--fs-md);
  font-weight: 700;
}

.list {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-1);
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: none;
  color: var(--text);
  text-align: start;
  min-height: 48px;
}

.role {
  width: 30px;
  font-size: var(--fs-xs);
  font-weight: 800;
  color: var(--text-muted);
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hurt {
  color: var(--danger);
}

.booked {
  color: var(--warning);
}
</style>
