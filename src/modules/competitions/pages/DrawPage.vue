<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { FastForward, Pause, Play, SkipForward } from "@lucide/vue"
import { AppButton, AppChip, AppEmptyState } from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { makeRng, deriveSeed, shuffle } from "@/engine/rng"

const route = useRoute()
const router = useRouter()
const world = useWorldStore()

const compId = String(route.params.comp)
const stageKey = String(route.params.stage)
const inst = world.derive((w) => w.state.competitions[compId] ?? null, null)
const stage = computed(() => inst.value?.stages.find((s) => s.key === stageKey))

interface Step {
  team: string
  /** Group index, or tie index for knockout draws. */
  slot: number
  /** Position within the group, or 0 home / 1 away for ties. */
  pos: number
  pot: number
}

/**
 * The reveal order. Groups: pot by pot (one team from each group's k-th place is
 * pot k), in a shuffled order within the pot. Knockout: tie by tie.
 */
const steps = computed<Step[]>(() => {
  const s = stage.value
  if (!s) return []
  const rng = makeRng(deriveSeed(world.world?.state.seed ?? 1, "draw-show", compId, stageKey))
  const out: Step[] = []
  if (s.groups) {
    const depth = Math.max(...s.groups.map((g) => g.teams.length))
    for (let k = 0; k < depth; k++) {
      const pot = s.groups.map((g, gi) => ({ team: g.teams[k], slot: gi })).filter((x) => x.team)
      for (const x of shuffle(rng, pot)) out.push({ team: x.team, slot: x.slot, pos: k, pot: k })
    }
  } else {
    const ties = s.rounds?.[0]?.ties ?? []
    ties.forEach((t, i) => {
      if (t.home) out.push({ team: t.home, slot: i, pos: 0, pot: 0 })
      if (t.away) out.push({ team: t.away, slot: i, pos: 1, pot: 0 })
    })
  }
  return out
})

const shown = ref(0)
const running = ref(true)
const fast = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function tick() {
  if (timer) clearTimeout(timer)
  if (!running.value || shown.value >= steps.value.length) return
  timer = setTimeout(
    () => {
      shown.value++
      tick()
    },
    fast.value ? 250 : 900
  )
}

onMounted(tick)
onBeforeUnmount(() => timer && clearTimeout(timer))

function toggle() {
  running.value = !running.value
  tick()
}

function skip() {
  shown.value = steps.value.length
}

const done = computed(() => shown.value >= steps.value.length)
const current = computed(() => (shown.value > 0 ? steps.value[shown.value - 1] : null))
const currentPot = computed(
  () => steps.value[Math.min(shown.value, steps.value.length - 1)]?.pot ?? 0
)
const potLeft = computed(() =>
  steps.value.slice(shown.value).filter((s) => s.pot === currentPot.value && stage.value?.groups)
)

/** What has been revealed, placed where it belongs. */
const placed = computed(() => {
  const map = new Map<string, string>()
  for (const s of steps.value.slice(0, shown.value)) map.set(`${s.slot}|${s.pos}`, s.team)
  return map
})

const groupNames = computed(
  () => stage.value?.groups?.map((g) => (g.name.length <= 2 ? `Group ${g.name}` : g.name)) ?? []
)
const groupSize = computed(() =>
  Math.max(0, ...(stage.value?.groups?.map((g) => g.teams.length) ?? [0]))
)
const tieCount = computed(() => stage.value?.rounds?.[0]?.ties.length ?? 0)

function finish() {
  world.finishDraw()
  router.replace(`/competitions/${compId}`)
}
</script>

<template>
  <PageShell v-if="inst && stage" :title="inst.name" :subtitle="`${stage.name} draw`">
    <template #actions>
      <AppChip :variant="done ? 'neutral' : 'live'" size="sm">
        {{ done ? "Complete" : "Live" }}
      </AppChip>
    </template>

    <section class="stage">
      <div class="ball" :class="{ empty: !current }">
        <template v-if="current">
          <NationFlag :id="current.team" :size="56" />
          <div class="ball-name">{{ world.world?.def(current.team).name }}</div>
          <div class="ball-to">
            {{
              stage.groups
                ? `→ ${groupNames[current.slot]}`
                : `→ Tie ${current.slot + 1}, ${current.pos === 0 ? "home" : "away"}`
            }}
          </div>
        </template>
        <div v-else class="ball-wait">The draw is about to begin…</div>
      </div>
      <div v-if="stage.groups && !done" class="pot">
        <div class="pot-title">Pot {{ currentPot + 1 }}</div>
        <div class="pot-teams">
          <NationFlag v-for="s in potLeft" :id="s.team" :key="s.team" :size="22" />
        </div>
      </div>
    </section>

    <div v-if="stage.groups" class="groups">
      <div v-for="(name, gi) in groupNames" :key="name" class="group">
        <div class="group-name">{{ name }}</div>
        <div
          v-for="k in groupSize"
          :key="k"
          class="group-slot"
          :class="{
            me: placed.get(`${gi}|${k - 1}`) === world.me,
            fresh: current && current.slot === gi && current.pos === k - 1,
          }"
        >
          <NationFlag
            v-if="placed.get(`${gi}|${k - 1}`)"
            :id="placed.get(`${gi}|${k - 1}`)"
            :size="18"
            name
          />
          <span v-else class="slot-empty">—</span>
        </div>
      </div>
    </div>

    <div v-else class="ties">
      <div v-for="i in tieCount" :key="i" class="tie">
        <span class="tie-num">{{ i }}</span>
        <span class="tie-team" :class="{ me: placed.get(`${i - 1}|0`) === world.me }">
          <NationFlag
            v-if="placed.get(`${i - 1}|0`)"
            :id="placed.get(`${i - 1}|0`)"
            :size="18"
            name
          />
          <span v-else class="slot-empty">—</span>
        </span>
        <span class="vs">v</span>
        <span class="tie-team" :class="{ me: placed.get(`${i - 1}|1`) === world.me }">
          <NationFlag
            v-if="placed.get(`${i - 1}|1`)"
            :id="placed.get(`${i - 1}|1`)"
            :size="18"
            name
          />
          <span v-else class="slot-empty">—</span>
        </span>
      </div>
    </div>

    <StickyCta>
      <template v-if="!done">
        <AppButton variant="tonal" @click="toggle">
          <Pause v-if="running" :size="16" />
          <Play v-else :size="16" />
          {{ running ? "Pause" : "Resume" }}
        </AppButton>
        <AppButton variant="tonal" @click="fast = !fast">
          <FastForward :size="16" />
          {{ fast ? "Normal" : "Faster" }}
        </AppButton>
        <AppButton variant="tonal" @click="skip">
          <SkipForward :size="16" />
          Result
        </AppButton>
      </template>
      <AppButton v-else variant="filled" block @click="finish">Continue</AppButton>
    </StickyCta>
  </PageShell>
  <PageShell v-else back title="Draw">
    <AppEmptyState title="This draw has not been made" />
  </PageShell>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.ball {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  min-height: 120px;
  justify-content: center;
  animation: fade-up var(--dur) var(--ease);
}

.ball-name {
  font-size: var(--fs-lg);
  font-weight: 800;
}

.ball-to {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--accent);
}

.ball-wait {
  color: var(--text-muted);
}

.pot-title {
  font-size: var(--fs-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: var(--sp-1);
}

.pot-teams {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-2);
}

.group {
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface);
  overflow: hidden;
}

.group-name {
  padding: var(--sp-1-5) var(--sp-2);
  font-size: var(--fs-xs);
  font-weight: 700;
  background: var(--surface-2);
}

.group-slot {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 var(--sp-2);
  border-top: 1px solid var(--border-light);
  font-size: var(--fs-sm);
  transition: background var(--dur) var(--ease);
}

.group-slot.fresh {
  background: var(--accent-subtle);
}

.me {
  font-weight: 800;
  color: var(--accent);
}

.slot-empty {
  color: var(--text-muted);
}

.ties {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
  overflow: hidden;
}

.tie {
  display: grid;
  grid-template-columns: 24px 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-top: 1px solid var(--border-light);
  font-size: var(--fs-sm);
}

.tie:first-child {
  border-top: none;
}

.tie-num,
.vs {
  color: var(--text-muted);
}

.tie-team {
  display: flex;
  min-width: 0;
}
</style>
