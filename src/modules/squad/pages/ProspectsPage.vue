<script setup lang="ts">
import { computed, ref } from "vue"
import { Eye, EyeOff, Sprout } from "@lucide/vue"
import { AppEmptyState, AppStarRating, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { ageOn } from "@/engine/players/ability"
import { INTL_MINUTES_FULL } from "@/engine/players/lifecycle"
import { isWonderkid, potentialStars, seasonGain } from "@/modules/squad/utils/stars"
import type { Player } from "@/engine/types"

const world = useWorldStore()
const filter = ref<"all" | "watched" | "uncapped">("all")

const data = world.derive(
  (w) => {
    const me = w.state.career.nationId
    if (!me) return null
    const youth = w.state.nations[me].youthLevel
    const watch = new Set(w.state.career.watchlist ?? [])
    const players = w
      .pool(me)
      .filter((p) => ageOn(p.born, w.state.date) <= 21)
      .map((p) => ({
        player: p,
        stars: potentialStars(p.pa, youth),
        wonder: isWonderkid(p.pa, youth),
        gain: seasonGain(p),
        watched: watch.has(p.id),
      }))
      .sort((a, b) => b.stars - a.stars || b.player.ca - a.player.ca)
    return { players, name: w.def(me).name }
  },
  null as null | {
    players: { player: Player; stars: number; wonder: boolean; gain: number; watched: boolean }[]
    name: string
  }
)

const list = computed(() =>
  (data.value?.players ?? []).filter((r) =>
    filter.value === "watched" ? r.watched : filter.value === "uncapped" ? !r.player.caps : true
  )
)

/** How much of this season's international-minutes boost a player has banked. */
const boost = (p: Player) => Math.min(1, (p.intlMin ?? 0) / INTL_MINUTES_FULL)
</script>

<template>
  <PageShell
    back
    title="Prospects"
    :subtitle="data ? `${data.players.length} players aged 21 or under` : ''"
  >
    <p class="intro">
      International minutes speed a youngster's development — up to a quarter faster with about six
      full matches a season — and a good season in your shirt draws bigger clubs.
    </p>
    <AppSubTabBar
      :model-value="filter"
      :options="[
        { value: 'all', label: 'All' },
        { value: 'watched', label: 'Watchlist' },
        { value: 'uncapped', label: 'Uncapped' },
      ]"
      size="sm"
      @update:model-value="(v) => (filter = v as typeof filter)"
    />
    <AppEmptyState
      v-if="!list.length"
      :icon="Sprout"
      :title="filter === 'watched' ? 'Nobody on your watchlist' : 'No prospects'"
      :description="filter === 'watched' ? 'Tap the eye next to a player to follow him.' : ''"
    />
    <div v-else class="list">
      <div v-for="r in list" :key="r.player.id" class="item">
        <PlayerRow :player="r.player">
          <template #trailing>
            <div class="scout">
              <AppStarRating :value="r.stars" :size="12" />
              <span class="meta">
                <strong v-if="r.wonder" class="wonder">Wonderkid</strong>
                <span v-if="r.gain" :class="r.gain > 0 ? 'up' : 'down'">
                  {{ r.gain > 0 ? "▲" : "▼" }}{{ Math.abs(r.gain) }}
                </span>
                {{ Math.round(r.player.ca) }}
              </span>
            </div>
          </template>
        </PlayerRow>
        <div class="boost" :title="`${r.player.intlMin ?? 0} international minutes this season`">
          <span :style="{ width: `${boost(r.player) * 100}%` }"></span>
        </div>
        <button
          class="watch"
          :class="{ on: r.watched }"
          :aria-label="r.watched ? 'Stop watching' : 'Watch'"
          @click="world.toggleWatch(r.player.id)"
        >
          <Eye v-if="r.watched" :size="18" />
          <EyeOff v-else :size="18" />
        </button>
      </div>
    </div>
  </PageShell>
</template>

<style scoped>
.intro {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
}

.item :deep(.prow) {
  flex: 1;
  min-width: 0;
}

.scout {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.meta {
  display: inline-flex;
  gap: var(--sp-1);
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.wonder {
  color: var(--gold-text);
}

.up {
  color: var(--success);
}

.down {
  color: var(--danger);
}

.boost {
  position: absolute;
  left: var(--sp-3);
  right: 56px;
  bottom: 0;
  height: 2px;
  background: transparent;
}

.boost span {
  display: block;
  height: 100%;
  background: var(--accent);
}

.watch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 52px;
  flex-shrink: 0;
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.watch.on {
  color: var(--accent);
}
</style>
