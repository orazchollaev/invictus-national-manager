<script setup lang="ts">
/**
 * 1 January: the year's youngsters have come through the academies. The scouts'
 * view of each, and a tap to follow the ones worth watching.
 */
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { Eye, EyeOff, Sprout } from "@lucide/vue"
import { AppButton, AppSheet, AppStarRating } from "@/components/ui"
import { useWorldStore } from "@/modules/world/store"
import { ageOn } from "@/engine/players/ability"
import { isWonderkid, potentialStars } from "@/modules/squad/utils/stars"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const info = world.derive((w) => {
  const intake = w.state.pendingIntake
  const me = w.state.career.nationId
  if (!intake || !me) return null
  const youth = w.state.nations[me].youthLevel
  const watch = new Set(w.state.career.watchlist ?? [])
  const players = intake.ids
    .map((id) => w.state.players[id])
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      name: `${p.first} ${p.last}`,
      pos: p.pos,
      age: ageOn(p.born, w.state.date),
      club: w.clubs.get(p.clubId)?.name ?? "",
      stars: potentialStars(p.pa, youth),
      wonder: isWonderkid(p.pa, youth),
      watched: watch.has(p.id),
    }))
    .sort((a, b) => b.stars - a.stars)
  return { year: intake.year, players, academy: youth }
}, null)

let toProspects = false

function prospects() {
  toProspects = true
  sheet.value?.close()
}

function onClose() {
  world.seenIntake()
  if (toProspects) router.push("/squad/prospects")
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="t('core.intake.title')"
    max-height="85dvh"
    max-height-mobile="85dvh"
    @close="onClose"
  >
    <div v-if="info" class="intake">
      <div class="badge">
        <Sprout :size="16" />
        {{ t("core.intake.classOf", { year: info.year }) }}
      </div>
      <p class="lead">
        {{ t("core.intake.lead", { n: info.players.length }) }}
      </p>
      <ul class="list">
        <li v-for="p in info.players" :key="p.id" class="row">
          <span class="pos">{{ p.pos }}</span>
          <div class="main">
            <div class="name">
              {{ p.name }}
              <strong v-if="p.wonder" class="wonder">{{ t("core.intake.wonderkid") }}</strong>
            </div>
            <div class="sub">{{ p.age }} · {{ p.club }}</div>
          </div>
          <AppStarRating :value="p.stars" :size="12" />
          <button
            class="watch"
            :class="{ on: p.watched }"
            :aria-label="p.watched ? t('core.intake.stopWatching') : t('core.intake.watch')"
            @click="world.toggleWatch(p.id)"
          >
            <Eye v-if="p.watched" :size="18" />
            <EyeOff v-else :size="18" />
          </button>
        </li>
      </ul>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="tonal" block @click="prospects">
          {{ t("core.intake.allProspects") }}
        </AppButton>
        <AppButton variant="filled" block @click="sheet?.close()">
          {{ t("common.continue") }}
        </AppButton>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.intake {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
  /* The list scrolls; the header and the buttons stay on screen. */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.badge {
  align-self: center;
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

.lead {
  margin: 0;
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--radius);
  background: var(--surface-2);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) 0 var(--sp-1) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.pos {
  width: 28px;
  flex-shrink: 0;
  font-size: var(--fs-xs);
  font-weight: 800;
  color: var(--text-muted);
}

.main {
  flex: 1;
  min-width: 0;
}

.name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600;
}

.wonder {
  margin-inline-start: var(--sp-1);
  font-size: var(--fs-xs);
  color: var(--gold-text);
}

.sub {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.watch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.watch.on {
  color: var(--accent);
}

.actions {
  display: flex;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4) calc(var(--sp-3) + var(--safe-bottom));
}
</style>
