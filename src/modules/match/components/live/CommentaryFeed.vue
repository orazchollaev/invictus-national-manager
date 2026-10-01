<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { ArrowUp, ArrowUpLeft, ArrowUpRight } from "@lucide/vue"
import type { MatchEvent } from "@/engine/match/types"
import { KEY_EVENTS } from "@/engine/match/types"
import { commentaryText } from "@/i18n"
import { clock, commentaryLine, isMinor, type CommentaryNames } from "@/engine/match/commentary"

const props = defineProps<{
  events: MatchEvent[]
  names: CommentaryNames
  verbose: boolean
  /** Side the user manages, to tint his team's lines. */
  mine?: "home" | "away" | null
}>()

const { t } = useI18n()

const lines = computed(() => {
  const out: { key: number; clock: string; text: string; ev: MatchEvent }[] = []
  props.events.forEach((ev, i) => {
    if (!props.verbose && isMinor(ev.kind)) return
    const text = commentaryLine(ev, i, props.names, commentaryText())
    if (text) out.push({ key: i, clock: clock(ev), text, ev })
  })
  return out.reverse()
})

/** The arrow for a lane: up the pitch, leaning left or right of the attacking team. */
const ARROWS = { left: ArrowUpLeft, centre: ArrowUp, right: ArrowUpRight }

function tone(ev: MatchEvent) {
  if (ev.kind === "goal" || ev.kind === "pen-goal" || ev.kind === "own-goal") return "goal"
  if (ev.kind === "red" || ev.kind === "second-yellow") return "red"
  if (ev.kind === "yellow") return "yellow"
  if (KEY_EVENTS.has(ev.kind) || ev.kind === "half-time" || ev.kind === "full-time") return "key"
  return ""
}
</script>

<template>
  <ol class="feed">
    <li
      v-for="l in lines"
      :key="l.key"
      class="line"
      :class="[tone(l.ev), { mine: l.ev.side && l.ev.side === mine }]"
    >
      <span class="line-clock">{{ l.clock }}</span>
      <component
        :is="ARROWS[l.ev.lane]"
        v-if="l.ev.lane"
        class="line-lane"
        :size="18"
        role="img"
        :aria-label="t(`match.lane.${l.ev.lane}`)"
      />
      <span class="line-text">{{ l.text }}</span>
    </li>
  </ol>
</template>

<style scoped>
.feed {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.line {
  display: flex;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--fs-base);
  animation: fade-up var(--dur) var(--ease);
}

.line-clock {
  flex-shrink: 0;
  width: 44px;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.line-lane {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--text-muted);
}

.line.mine .line-lane {
  color: var(--accent);
}

.line.goal {
  background: color-mix(in srgb, var(--success) 14%, transparent);
  font-weight: 700;
}

.line.red {
  background: color-mix(in srgb, var(--danger) 12%, transparent);
}

.line.yellow .line-clock {
  color: var(--warning);
}

.line.key {
  font-weight: 600;
}

.line.mine .line-clock {
  color: var(--accent);
}
</style>
