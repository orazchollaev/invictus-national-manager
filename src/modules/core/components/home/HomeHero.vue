<script setup lang="ts">
import { computed } from "vue"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"

const world = useWorldStore()

const info = world.derive((w) => {
  const c = w.state.career
  const id = c.nationId
  if (!id) return null
  const def = w.def(id)
  const n = w.state.nations[id]
  const ranked = w.ctx().ranked()
  const confedRank = ranked.filter((t) => w.def(t).confed === def.confed).indexOf(id) + 1
  const prev = n.pointsHistory.at(-1)?.[1]
  return {
    id,
    name: def.name,
    confed: def.confed,
    color: def.color,
    rank: w.fifaRank(id),
    confedRank,
    points: Math.round(n.points),
    trend: prev !== undefined ? Math.round(n.points - prev) : 0,
    manager: c.managerName,
    federation: n.reputation,
    stadium: n.stadium,
    confidence: c.confidence,
    reputation: Math.round(c.reputation),
    warning: c.ultimatum?.matches ?? 0,
    contract: c.contractUntil,
  }
}, null)

const tone = computed(() => {
  const c = info.value?.confidence ?? 50
  return c >= 60 ? "var(--success)" : c >= 35 ? "var(--warning)" : "var(--danger)"
})
</script>

<template>
  <section v-if="info" class="hero" :style="{ '--nation': info.color }">
    <div class="hero-top">
      <NationFlag :id="info.id" :size="56" />
      <div class="hero-id">
        <div class="hero-eyebrow">
          {{ info.confed }} #{{ info.confedRank }} · Head coach {{ info.manager }}
        </div>
        <h1 class="hero-name">{{ info.name }}</h1>
      </div>
    </div>

    <div class="hero-stats">
      <RouterLink to="/rankings" class="stat">
        <span class="stat-value">{{ info.rank ? `#${info.rank}` : "—" }}</span>
        <span class="stat-label">{{ info.rank ? "FIFA ranking" : "Not a FIFA member" }}</span>
      </RouterLink>
      <RouterLink to="/stadiums" class="stat">
        <span class="stat-value">{{ info.federation.toFixed(1) }}</span>
        <span class="stat-label">Federation /10 · {{ "★".repeat(info.stadium) }}</span>
      </RouterLink>
      <div class="stat">
        <span class="stat-value">
          {{ info.points }}
          <small v-if="info.trend" :class="info.trend > 0 ? 'up' : 'down'">
            {{ info.trend > 0 ? "▲" : "▼" }}{{ Math.abs(info.trend) }}
          </small>
        </span>
        <span class="stat-label">Points</span>
      </div>
    </div>

    <RouterLink v-if="info.warning" to="/career" class="warning">
      <strong>Final warning</strong>
      <span>
        {{ info.warning }} competitive {{ info.warning === 1 ? "match" : "matches" }} to lift
        confidence to 40%
      </span>
    </RouterLink>

    <RouterLink to="/career" class="meters">
      <div class="meter">
        <div class="meter-head">
          <span>Federation confidence</span>
          <strong :style="{ color: tone }">{{ info.confidence }}%</strong>
        </div>
        <div class="meter-bar">
          <span :style="{ width: `${info.confidence}%`, background: tone }"></span>
        </div>
      </div>
      <div class="meter">
        <div class="meter-head">
          <span>Reputation</span>
          <strong>{{ info.reputation }}</strong>
        </div>
        <div class="meter-bar"><span :style="{ width: `${info.reputation}%` }"></span></div>
      </div>
    </RouterLink>
    <div v-if="info.contract" class="contract">Contract until {{ formatDate(info.contract) }}</div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--nation) 30%, transparent), transparent 70%),
    var(--surface);
  border: 1px solid var(--border-light);
}

.hero-top {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.hero-id {
  min-width: 0;
}

.hero-eyebrow {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hero-name {
  margin: 2px 0 0;
  font-size: var(--fs-xl);
  font-weight: 800;
  line-height: 1.15;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-2);
  margin-top: var(--sp-4);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  color: var(--text);
  text-decoration: none;
}

.stat-value {
  font-size: var(--fs-lg);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.stat-value small {
  font-size: var(--fs-xs);
  font-weight: 700;
}

.up {
  color: var(--success);
}

.down {
  color: var(--danger);
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.warning {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--danger);
  background: color-mix(in srgb, var(--danger) 14%, transparent);
  color: var(--text);
  font-size: var(--fs-sm);
  text-decoration: none;
  animation: warn 1.6s var(--ease) infinite alternate;
}

.warning strong {
  color: var(--danger);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: var(--fs-xs);
}

@keyframes warn {
  from {
    box-shadow: 0 0 0 0 transparent;
  }
  to {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 35%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .warning {
    animation: none;
  }
}

.meters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
  color: var(--text);
  text-decoration: none;
}

.contract {
  margin-top: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.meter-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-1);
  font-size: var(--fs-xs);
  color: var(--text-muted);
  margin-bottom: var(--sp-1);
}

.meter-head strong {
  color: var(--text);
}

.meter-bar {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.meter-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width var(--dur) var(--ease);
}
</style>
