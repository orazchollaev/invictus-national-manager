<script setup lang="ts">
import { computed } from "vue"
import type { Player } from "@/engine/types"
import type { Formation } from "@/engine/match/types"
import { positionFit } from "@/engine/players/ability"
import { FORMATIONS } from "@/engine/match/formations"
import { slotPositions } from "@/modules/squad/utils/pitch"

const props = defineProps<{
  formation: Formation
  /** Player id per slot, in formation order. */
  slots: (string | null)[]
  player: (id: string) => Player | undefined
  selected?: number | null
  /** Rating per player (live match), shown instead of ability. */
  ratings?: Record<string, number>
}>()

const emit = defineEmits<{ select: [index: number] }>()

const coords = computed(() => slotPositions(props.formation))
const roles = computed(() => FORMATIONS[props.formation])

function fitClass(i: number) {
  const id = props.slots[i]
  const p = id ? props.player(id) : undefined
  if (!p) return "empty"
  const fit = positionFit(p, roles.value[i])
  return fit >= 1 ? "fit" : fit >= 0.88 ? "near" : "off"
}
</script>

<template>
  <div class="pitch">
    <div class="pitch-lines">
      <span class="line-half"></span>
      <span class="circle"></span>
      <span class="box box--top"></span>
      <span class="box box--bottom"></span>
    </div>
    <button
      v-for="(c, i) in coords"
      :key="i"
      class="slot"
      :class="[fitClass(i), { 'slot--on': selected === i }]"
      :style="{ left: `${c[0]}%`, top: `${c[1]}%` }"
      @click="emit('select', i)"
    >
      <span class="slot-dot">
        <template v-if="slots[i] && ratings?.[slots[i]!] !== undefined">
          {{ ratings[slots[i]!].toFixed(1) }}
        </template>
        <template v-else-if="slots[i]">{{ Math.round(player(slots[i]!)?.ca ?? 0) }}</template>
        <template v-else>+</template>
      </span>
      <span class="slot-name">{{ slots[i] ? player(slots[i]!)?.last : roles[i] }}</span>
      <span class="slot-role">{{ roles[i] }}</span>
    </button>
  </div>
</template>

<style scoped>
.pitch {
  position: relative;
  width: 100%;
  aspect-ratio: 68 / 88;
  max-height: 62vh;
  margin: 0 auto;
  border-radius: var(--radius);
  background: repeating-linear-gradient(0deg, var(--pitch-a) 0 10%, var(--pitch-b) 10% 20%);
  overflow: hidden;
}

.pitch-lines span {
  position: absolute;
  border: 2px solid var(--pitch-line);
}

.line-half {
  left: 0;
  right: 0;
  top: 50%;
  border-width: 2px 0 0 !important;
}

.circle {
  left: 50%;
  top: 50%;
  width: 26%;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.box {
  left: 22%;
  right: 22%;
  height: 14%;
}

.box--top {
  top: -2px;
}

.box--bottom {
  bottom: -2px;
}

.slot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 64px;
  border: none;
  background: none;
  padding: 0;
  color: var(--pitch-ink);
}

.slot-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--pitch-token);
  color: var(--pitch-token-text);
  font-weight: 800;
  font-size: var(--fs-sm);
  box-shadow: 0 2px 6px var(--pitch-shadow);
  border: 3px solid transparent;
}

.fit .slot-dot {
  border-color: var(--fit-good);
}

.near .slot-dot {
  border-color: var(--fit-near);
}

.off .slot-dot {
  border-color: var(--fit-off);
}

.empty .slot-dot {
  background: color-mix(in srgb, var(--pitch-token) 25%, transparent);
  color: var(--pitch-ink);
}

.slot--on .slot-dot {
  outline: 3px solid var(--pitch-ink);
  outline-offset: 2px;
}

.slot-name {
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--fs-xs);
  font-weight: 700;
  text-shadow: 0 1px 2px var(--pitch-shadow);
}

.slot-role {
  font-size: var(--fs-xs);
  opacity: 0.8;
  text-shadow: 0 1px 2px var(--pitch-shadow);
}
</style>
