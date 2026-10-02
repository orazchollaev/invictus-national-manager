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
      <NationFlag :id="c.opp" :size="18" name="short" />
      <span v-if="c.score" class="foot score">{{ c.score }}</span>
      <span v-else class="foot">{{ c.venue }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(60px, 1fr);
  gap: var(--sp-1-5);
  overflow-x: auto;
  scrollbar-width: none;
}

.strip::-webkit-scrollbar {
  display: none;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  min-width: 0;
  padding: var(--sp-2) var(--sp-1);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  font-size: var(--fs-xs);
}

.cell--past {
  border-color: color-mix(in srgb, var(--tone) 50%, transparent);
  background: color-mix(in srgb, var(--tone) 8%, var(--surface));
}

.cell :deep(.nation) {
  flex-direction: column;
  gap: 2px;
}

.cell :deep(.nation-name) {
  font-weight: 700;
}

.date,
.foot {
  color: var(--text-muted);
  white-space: nowrap;
}

.score {
  font-weight: 800;
  color: var(--tone);
}
</style>
