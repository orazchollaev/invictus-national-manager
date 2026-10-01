<script setup lang="ts">
import { computed } from "vue"
import { ArrowLeftRight, Goal, X } from "@lucide/vue"
import type { MatchEvent, MatchEventKind } from "@/engine/match/types"
import { clock, type CommentaryNames } from "@/engine/match/commentary"

const props = defineProps<{
  events: readonly MatchEvent[]
  names: CommentaryNames
}>()

type Icon = "goal" | "miss" | "yellow" | "red" | "sub"

const ICON: Partial<Record<MatchEventKind, Icon>> = {
  goal: "goal",
  "pen-goal": "goal",
  "own-goal": "goal",
  "pen-miss": "miss",
  "pen-saved": "miss",
  yellow: "yellow",
  "second-yellow": "red",
  red: "red",
  sub: "sub",
}

function label(ev: MatchEvent): string {
  const who = props.names.player(ev.playerId)
  switch (ev.kind) {
    case "goal":
    case "pen-goal":
      return ev.otherId ? `${who} (${props.names.player(ev.otherId)})` : who
    case "own-goal":
      return `${who} (og)`
    case "pen-miss":
    case "pen-saved":
      return `${who} (pen missed)`
    case "second-yellow":
      return `${who} (2nd yellow)`
    default:
      return who
  }
}

/** Newest first. A goal belongs to the side it counts for, and an own goal counts for the other. */
const rows = computed(() => {
  const out: {
    key: number
    clock: string
    icon: Icon
    side: "home" | "away"
    text: string
    /** On a substitution `text` is the player coming on and this the one going off. */
    off?: string
  }[] = []
  props.events.forEach((ev, i) => {
    const icon = ICON[ev.kind]
    if (!icon || !ev.side) return
    out.push({
      key: i,
      clock: clock(ev),
      icon,
      side: ev.side,
      text: label(ev),
      off: ev.kind === "sub" ? props.names.player(ev.otherId) : undefined,
    })
  })
  return out.reverse()
})
</script>

<template>
  <ol v-if="rows.length" class="events">
    <li v-for="r in rows" :key="r.key" class="row" :class="`row--${r.side}`">
      <span class="who who--home">
        <template v-if="r.side === 'home'">
          <span v-if="r.off" class="swap">
            <span class="on">▲ {{ r.text }}</span>
            <span class="off">▼ {{ r.off }}</span>
          </span>
          <template v-else>{{ r.text }}</template>
        </template>
      </span>
      <span class="mid">
        <span class="min">{{ r.clock }}</span>
        <Goal v-if="r.icon === 'goal'" :size="16" class="ico ico--goal" />
        <X v-else-if="r.icon === 'miss'" :size="16" class="ico ico--miss" />
        <ArrowLeftRight v-else-if="r.icon === 'sub'" :size="16" class="ico ico--sub" />
        <span v-else class="card" :class="`card--${r.icon}`"></span>
      </span>
      <span class="who who--away">
        <template v-if="r.side === 'away'">
          <span v-if="r.off" class="swap">
            <span class="on">▲ {{ r.text }}</span>
            <span class="off">▼ {{ r.off }}</span>
          </span>
          <template v-else>{{ r.text }}</template>
        </template>
      </span>
    </li>
  </ol>
  <p v-else class="none">No goals or cards yet.</p>
</template>

<style scoped>
.events {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1-5) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--fs-base);
  animation: fade-up var(--dur) var(--ease);
}

.row:last-child {
  border-bottom: none;
}

.who {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* A substitution stays on one line, like every other row. */
.swap {
  display: flex;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.who--home .swap {
  justify-content: flex-end;
}

.on,
.off {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.on {
  color: var(--success);
}

.off {
  color: var(--danger);
}

.who--home {
  text-align: end;
}

.mid {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  min-width: 64px;
  justify-content: center;
}

.min {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.ico--goal {
  color: var(--success);
}

.ico--miss {
  color: var(--danger);
}

.ico--sub {
  color: var(--text-muted);
}

.card {
  width: 10px;
  height: 14px;
  border-radius: 2px;
}

.card--yellow {
  background: var(--warning);
}

.card--red {
  background: var(--danger);
}

.none {
  margin: 0;
  padding: var(--sp-3);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-muted);
  font-size: var(--fs-sm);
  text-align: center;
}
</style>
