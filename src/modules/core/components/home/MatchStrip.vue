<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatShort } from "@/i18n/dates"
import { resultLetter } from "@/modules/core/utils/format"
import type { Fixture } from "@/engine/competition/types"

const { t } = useI18n()
const world = useWorldStore()

interface Cell {
  id: string
  to: string
  date: string
  opp: string
  venue: string
  score?: string
  tone?: string
}

const TONE = { W: "var(--success)", D: "var(--text-muted)", L: "var(--danger)" }

function cell(f: Fixture, me: string): Cell {
  const home = f.home === me
  const venue = !f.atHome ? "neutral" : home ? "home" : "away"
  const base = {
    id: f.id,
    date: formatShort(f.date),
    opp: home ? f.away : f.home,
    venue: t(`core.strip.${venue}`),
  }
  if (!f.result) return { ...base, to: `/match/${f.id}` }
  const r = f.result
  const [gf, ga] = home ? [r.h, r.a] : [r.a, r.h]
  const pens = r.w ? ((r.w === "home") === home ? "W" : "L") : undefined
  return {
    ...base,
    to: `/report/${f.id}`,
    score: `${gf}–${ga}`,
    tone: TONE[resultLetter(gf, ga, pens)],
  }
}

const SIZE = 5

/** Always five matches: up to four to come, the rest filled with the latest results. */
const strip = world.derive<Cell[]>((w) => {
  const me = w.state.career.nationId
  if (!me) return []
  const played = w.fixturesOf(me, undefined, w.state.date).filter((f) => f.result)
  const hidden = w.state.pendingDraw?.compId
  const coming = w.fixturesOf(me, w.state.date).filter((f) => !f.result && f.compId !== hidden)
  const past = played.slice(-(SIZE - Math.min(coming.length, SIZE - 1)))
  const next = coming.slice(0, SIZE - past.length)
  return [...past, ...next].map((f) => cell(f, me))
}, [])
</script>

<template>
  <nav v-if="strip.length" class="strip">
    <RouterLink
      v-for="c in strip"
      :key="c.id"
      :to="c.to"
      class="cell"
      :class="{ 'cell--past': c.score }"
      :style="c.tone ? { '--tone': c.tone } : undefined"
    >
      <span class="date">{{ c.date }}</span>
      <NationFlag :id="c.opp" :size="28" name="short" />
      <span v-if="c.score" class="pill score">{{ c.score }}</span>
      <span v-else class="pill">{{ c.venue }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(64px, 1fr);
  overflow-x: auto;
  scrollbar-width: none;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.strip::-webkit-scrollbar {
  display: none;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  min-width: 0;
  padding: var(--sp-3) var(--sp-1);
  color: var(--text);
  text-decoration: none;
  font-size: var(--fs-xs);
}

.cell + .cell {
  border-inline-start: 1px solid var(--border-light);
}

.cell:hover {
  text-decoration: none;
  color: var(--text);
}

.cell:active {
  background: var(--bg-hover);
}

.cell :deep(.nation) {
  flex-direction: column;
  gap: var(--sp-1);
}

.cell :deep(.nation-name) {
  font-weight: 700;
  font-size: var(--fs-sm);
}

.date {
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.pill {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--fill-1);
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.pill.score {
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  color: var(--tone);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
