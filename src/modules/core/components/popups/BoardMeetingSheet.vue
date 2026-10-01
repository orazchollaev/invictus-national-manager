<script setup lang="ts">
/**
 * The board sets an objective and wants the manager's word on it: accept it,
 * promise more (bigger rewards, harsher failure) or talk it down (only with the
 * board's trust, and at a price). Closing the sheet accepts the target as set.
 */
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { Landmark } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { StatPill } from "@/modules/core/components"
import { useWorldStore } from "@/modules/world/store"
import { ambitionChoices } from "@/engine/career/career"

const props = defineProps<{ objectiveId: string }>()

const { t } = useI18n()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)
const level = ref<-1 | 0 | 1>(0)

const info = world.derive((w) => {
  const c = w.state.career
  const obj = c.objectives.find((o) => o.id === props.objectiveId)
  if (!obj || !c.nationId) return null
  return {
    nationId: c.nationId,
    compInst: ((c) => (c ? { defId: c.defId, year: c.year } : null))(
      w.state.competitions[obj.compInstance]
    ),
    confidence: c.confidence,
    choices: ambitionChoices(w, props.objectiveId),
  }
}, null)

const LABELS = {
  1: "core.board.promise",
  0: "core.board.accept",
  [-1]: "core.board.lower",
} as const
const chosen = computed(() => info.value?.choices.find((c) => c.level === level.value))

let decided = false

function confirm() {
  if (!chosen.value?.allowed || !world.agreeObjective(props.objectiveId, level.value)) return
  decided = true
  sheet.value?.close()
}

function onClose() {
  if (!decided) world.agreeObjective(props.objectiveId, 0)
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="t('core.board.title')"
    max-height="90dvh"
    max-height-mobile="90dvh"
    :dismiss-on-outside-click="false"
    @close="onClose"
  >
    <div v-if="info" class="board">
      <div class="badge">
        <Landmark :size="16" />
        {{ t("core.board.badge") }}
      </div>
      <NationFlag :id="info.nationId" :size="48" />
      <i18n-t keypath="core.board.lead" tag="p" class="lead">
        <template #comp>
          <strong>{{ info.compInst ? $comp(info.compInst) : "" }}</strong>
        </template>
        <template #confidence>{{ info.confidence }}</template>
      </i18n-t>
      <div class="choices" role="radiogroup">
        <button
          v-for="c in info.choices"
          :key="c.level"
          class="choice"
          :class="{ on: c.level === level, off: !c.allowed }"
          role="radio"
          :aria-checked="c.level === level"
          :disabled="!c.allowed"
          @click="level = c.level"
        >
          <span class="choice-head">
            <strong>{{ t(LABELS[c.level]) }}</strong>
            <StatPill v-if="c.critical" :value="t('common.key')" tone="var(--danger)" />
          </span>
          <span class="choice-text">{{ $tx(c.text) }}</span>
          <span v-if="c.note" class="choice-note">{{ $tx(c.note) }}</span>
        </button>
      </div>
      <p class="note">{{ t("core.board.note") }}</p>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="filled" block :disabled="!chosen?.allowed" @click="confirm">
          {{ level === 0 ? t("core.board.acceptTarget") : t(LABELS[level]) }}
        </AppButton>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
  text-align: center;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: var(--fs-xs);
  font-weight: 700;
}

.lead,
.note {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.lead strong {
  color: var(--text);
}

.choices {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  width: 100%;
  margin: var(--sp-1) 0;
}

.choice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  min-height: var(--tap-min);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  color: var(--text);
  text-align: start;
  cursor: pointer;
}

.choice.on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
}

.choice.off {
  opacity: 0.55;
  cursor: not-allowed;
}

.choice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--sp-2);
}

.choice-text {
  font-size: var(--fs-sm);
}

.choice-note {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.actions {
  padding: var(--sp-3) var(--sp-4) calc(var(--sp-3) + var(--safe-bottom));
}
</style>
