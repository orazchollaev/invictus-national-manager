<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { ClipboardList } from "@lucide/vue"
import { AppButton } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { daysBetween, formatDate } from "@/engine/calendar/dates"
import type { Fixture } from "@/engine/competition/types"

const router = useRouter()
const world = useWorldStore()

const next = world.derive<Fixture | null>((w) => {
  const id = w.state.career.nationId
  if (!id) return null
  return w.fixturesOf(id, w.state.date).find((f) => !f.result) ?? null
}, null)

const meta = world.derive((w) => {
  const f = next.value
  if (!f) return null
  const ranked = w.ctx().ranked()
  const comp =
    f.compId === "friendly"
      ? "International friendly"
      : (w.state.competitions[f.compId]?.name ?? "")
  const me = w.state.career.nationId
  const venue = !f.atHome ? "Neutral venue" : f.home === me ? "Home" : "Away"
  return {
    comp,
    homeRank: ranked.indexOf(f.home) + 1,
    awayRank: ranked.indexOf(f.away) + 1,
    homeName: w.def(f.home).name,
    awayName: w.def(f.away).name,
    venue,
  }
}, null)

const countdown = computed(() => {
  if (!next.value || !world.date) return ""
  const d = daysBetween(world.date, next.value.date)
  return d <= 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`
})
</script>

<template>
  <section v-if="next && meta" class="next">
    <div class="next-head">
      <span class="eyebrow">Next match</span>
      <span class="countdown">{{ countdown }}</span>
    </div>
    <div class="comp">{{ meta.comp }}</div>
    <div class="label">{{ next.label }}</div>

    <RouterLink :to="`/match/${next.id}`" class="teams">
      <div class="team">
        <NationFlag :id="next.home" :size="52" />
        <span class="team-name">{{ meta.homeName }}</span>
        <span class="team-rank">#{{ meta.homeRank }}</span>
      </div>
      <div class="vs">
        <span>VS</span>
        <small>{{ formatDate(next.date) }}</small>
      </div>
      <div class="team">
        <NationFlag :id="next.away" :size="52" />
        <span class="team-name">{{ meta.awayName }}</span>
        <span class="team-rank">#{{ meta.awayRank }}</span>
      </div>
    </RouterLink>

    <div class="foot">
      <span class="venue">{{ meta.venue }}</span>
      <AppButton variant="tonal" @click="router.push('/squad/tactics')">
        <ClipboardList :size="16" />
        Team &amp; tactics
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.next {
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.next-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.eyebrow {
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.countdown {
  font-size: var(--fs-xs);
  font-weight: 700;
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--accent-subtle);
  color: var(--accent);
}

.comp {
  margin-top: var(--sp-2);
  font-weight: 700;
}

.label {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-2);
  margin: var(--sp-4) 0;
  color: var(--text);
  text-decoration: none;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  min-width: 0;
  text-align: center;
}

.team-name {
  max-width: 100%;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.team-rank {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.vs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-weight: 800;
  color: var(--text-muted);
}

.vs small {
  font-size: var(--fs-xs);
  font-weight: 600;
  white-space: nowrap;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.venue {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
