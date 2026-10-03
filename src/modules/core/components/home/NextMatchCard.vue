<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { ClipboardList } from "@lucide/vue"
import { AppButton, AppChip } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { daysBetween } from "@/engine/calendar/dates"
import { formatDate } from "@/i18n/dates"
import type { Fixture } from "@/engine/competition/types"
import { venueOf } from "@/engine/world/stadiums"
import { rivalry } from "@/engine/world/rivals"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

const next = world.derive<Fixture | null>((w) => {
  const id = w.state.career.nationId
  if (!id) return null
  // A competition whose draw has not been watched yet stays hidden.
  const hidden = w.state.pendingDraw?.compId
  return w.fixturesOf(id, w.state.date).find((f) => !f.result && f.compId !== hidden) ?? null
}, null)

const meta = world.derive((w) => {
  const f = next.value
  if (!f) return null
  const inst0 = w.state.competitions[f.compId]
  const compInst =
    f.compId !== "friendly" && inst0 ? { defId: inst0.defId, year: inst0.year } : null
  const me = w.state.career.nationId
  const venue = !f.atHome
    ? t("core.nextMatch.neutral")
    : f.home === me
      ? t("core.nextMatch.home")
      : t("core.nextMatch.away")
  // Hosted tournaments are played in the hosts' grounds; everything else at the home side's.
  const inst = w.state.competitions[f.compId]
  const hosted = inst && inst.kind !== "qualifier" && inst.hosts.length ? inst.hosts : null
  const grounds = (hosted ?? (f.atHome ? [f.home] : [])).flatMap(
    (h) => w.state.nations[h]?.stadiums ?? []
  )
  const ground = venueOf(grounds, f.id, f.importance !== "friendly")
  return {
    compInst,
    homeRank: w.fifaRank(f.home),
    awayRank: w.fifaRank(f.away),
    venue,
    ground: ground ? `${ground.name}, ${ground.city}` : "",
    derby: rivalry(f.home, f.away),
  }
}, null)

const countdown = computed(() => {
  if (!next.value || !world.date) return ""
  const d = daysBetween(world.date, next.value.date)
  return d <= 0
    ? t("core.nextMatch.today")
    : d === 1
      ? t("core.nextMatch.tomorrow")
      : t("core.nextMatch.inDays", { n: d })
})
</script>

<template>
  <section v-if="!next || !meta" class="next">
    <div class="next-head">
      <span class="eyebrow">{{ t("core.nextMatch.eyebrow") }}</span>
    </div>
    <p class="none">{{ t("core.nextMatch.none") }}</p>
    <div class="foot foot--end">
      <AppButton variant="tonal" @click="router.push('/squad/tactics')">
        <ClipboardList :size="16" />
        {{ t("core.nextMatch.teamTactics") }}
      </AppButton>
    </div>
  </section>
  <section v-else class="next">
    <div class="next-head">
      <span class="eyebrow">{{ t("core.nextMatch.eyebrow") }}</span>
      <span class="head-right">
        <AppChip v-if="meta.derby" variant="danger">{{ t("core.nextMatch.derby") }}</AppChip>
        <span class="countdown">{{ countdown }}</span>
      </span>
    </div>
    <div class="comp">
      {{ meta.compInst ? $comp(meta.compInst) : t("core.nextMatch.friendly") }}
    </div>
    <div class="label">{{ $tx(next.label) }}</div>

    <RouterLink :to="`/match/${next.id}`" class="teams">
      <div class="team">
        <NationFlag :id="next.home" :size="52" />
        <span class="team-name">{{ $nation(next.home) }}</span>
        <span v-if="meta.homeRank" class="team-rank">#{{ meta.homeRank }}</span>
      </div>
      <div class="vs">
        <span>{{ t("core.nextMatch.vs") }}</span>
        <small>{{ formatDate(next.date) }}</small>
      </div>
      <div class="team">
        <NationFlag :id="next.away" :size="52" />
        <span class="team-name">{{ $nation(next.away) }}</span>
        <span v-if="meta.awayRank" class="team-rank">#{{ meta.awayRank }}</span>
      </div>
    </RouterLink>

    <div class="foot">
      <span class="venue">
        {{ meta.venue }}
        <small v-if="meta.ground" class="ground">{{ meta.ground }}</small>
      </span>
      <AppButton variant="tonal" @click="router.push('/squad/tactics')">
        <ClipboardList :size="16" />
        {{ t("core.nextMatch.teamTactics") }}
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

.head-right {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
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

.foot--end {
  justify-content: flex-end;
}

.none {
  margin: var(--sp-4) 0;
  text-align: center;
  color: var(--text-muted);
}

.venue {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.ground {
  font-size: var(--fs-xs);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
