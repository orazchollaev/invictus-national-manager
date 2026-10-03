<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { Dices, FastForward, Hand, Pause, Play, SkipForward } from "@lucide/vue"
import { AppButton, AppChip, AppEmptyState } from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { stageLabel } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { makeRng, deriveSeed, shuffle } from "@/engine/rng"

const { t } = useI18n()
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

const SPIN_MS = 1800
const REST_MS = 1600

const shown = ref(0)
/** The pots are on show until the draw starts, then they go away. */
const started = ref(false)
/** Auto draws on its own; manual draws one team per tap. */
const auto = ref(false)
const paused = ref(false)
const fast = ref(false)
/** True while the ball is tumbling, before the team is revealed. */
const spinning = ref(false)
const spinIndex = ref(0)
let spinTimer: ReturnType<typeof setTimeout> | null = null
let restTimer: ReturnType<typeof setTimeout> | null = null
let spinner: ReturnType<typeof setInterval> | null = null

function clearRest() {
  if (restTimer) clearTimeout(restTimer)
  restTimer = null
}

function clearAll() {
  clearRest()
  if (spinTimer) clearTimeout(spinTimer)
  if (spinner) clearInterval(spinner)
  spinTimer = spinner = null
}

/** One draw: tumble the ball, then reveal the team. Auto goes on to the next after a rest. */
function drawOne() {
  clearRest()
  if (spinning.value || shown.value >= steps.value.length) return
  spinning.value = true
  const quick = auto.value && fast.value
  spinner = setInterval(() => spinIndex.value++, quick ? 50 : 110)
  spinTimer = setTimeout(
    () => {
      clearAll()
      spinning.value = false
      shown.value++
      if (auto.value && !paused.value) restTimer = setTimeout(drawOne, quick ? 250 : REST_MS)
    },
    quick ? 450 : SPIN_MS
  )
}

function start(isAuto: boolean) {
  started.value = true
  auto.value = isAuto
  paused.value = false
  restTimer = setTimeout(drawOne, 400)
}

function setAuto(on: boolean) {
  auto.value = on
  paused.value = false
  clearRest()
  if (on && !spinning.value) restTimer = setTimeout(drawOne, 400)
}

function togglePause() {
  paused.value = !paused.value
  clearRest()
  if (!paused.value && !spinning.value) restTimer = setTimeout(drawOne, 400)
}

onBeforeUnmount(clearAll)

function skip() {
  clearAll()
  started.value = true
  spinning.value = false
  shown.value = steps.value.length
}

const done = computed(() => shown.value >= steps.value.length)
const current = computed(() => (shown.value > 0 ? steps.value[shown.value - 1] : null))
const currentPot = computed(
  () => steps.value[Math.min(shown.value, steps.value.length - 1)]?.pot ?? 0
)

/** Every pot (one bag for a knockout draw), full from the start. */
const pots = computed(() => {
  const out: { n: number; teams: string[] }[] = []
  for (const st of steps.value) (out[st.pot] ??= { n: st.pot, teams: [] }).teams.push(st.team)
  return out
})
/** The team on the ball: a cycling one while it tumbles, else the one just drawn. */
const spinTeam = computed(() => {
  const left = steps.value.slice(shown.value).filter((x) => x.pot === currentPot.value)
  return left.length ? left[spinIndex.value % left.length].team : null
})
const ballTeam = computed(() => (spinning.value ? spinTeam.value : (current.value?.team ?? null)))

/** What has been revealed, placed where it belongs. */
const placed = computed(() => {
  const map = new Map<string, string>()
  for (const s of steps.value.slice(0, shown.value)) map.set(`${s.slot}|${s.pos}`, s.team)
  return map
})

const groupNames = computed(
  () =>
    stage.value?.groups?.map((g) =>
      g.name.length <= 2 ? t("common.group", { name: g.name }) : g.name
    ) ?? []
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
  <PageShell
    v-if="inst && stage"
    :title="$comp(inst)"
    :subtitle="t('competitions.draw.subtitle', { stage: stageLabel(stage.name) })"
  >
    <template #actions>
      <AppChip :variant="done ? 'neutral' : 'live'" size="sm">
        {{ done ? t("competitions.draw.complete") : t("common.live") }}
      </AppChip>
    </template>

    <section v-if="!started" class="intro">
      <p class="intro-text">{{ t("competitions.draw.about") }}</p>
      <div class="pots">
        <div v-for="pot in pots" :key="pot.n" class="pot">
          <div class="pot-title">
            {{
              stage.groups
                ? t("competitions.draw.pot", { n: pot.n + 1 })
                : t("competitions.draw.bag")
            }}
            <span class="pot-count">{{ pot.teams.length }}</span>
          </div>
          <div class="pot-teams">
            <NationFlag v-for="team in pot.teams" :id="team" :key="team" :size="28" />
          </div>
        </div>
      </div>
    </section>

    <template v-else>
      <section class="stage">
        <div :key="spinning ? 'spin' : shown" class="ball" :class="spinning ? 'spin' : 'reveal'">
          <template v-if="ballTeam">
            <NationFlag :id="ballTeam" :size="56" class="ball-flag" />
            <div class="ball-name">{{ spinning ? "…" : $nation(ballTeam) }}</div>
            <div class="ball-to">
              <template v-if="spinning">{{ t("competitions.draw.drawing") }}</template>
              <template v-else-if="current">
                {{
                  stage.groups
                    ? t("competitions.draw.toGroup", { name: groupNames[current.slot] })
                    : current.pos === 0
                      ? t("competitions.draw.toTie", { n: current.slot + 1 })
                      : t("competitions.draw.toTieAway", { n: current.slot + 1 })
                }}
              </template>
            </div>
          </template>
          <div v-else class="ball-wait">
            {{ done ? t("competitions.draw.complete") : t("competitions.draw.about") }}
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
            <span v-if="placed.get(`${gi}|${k - 1}`)" class="slot-fill">
              <NationFlag :id="placed.get(`${gi}|${k - 1}`)" :size="18" name />
            </span>
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
          <span class="vs">{{ t("competitions.draw.vs") }}</span>
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
    </template>

    <StickyCta>
      <template v-if="!done">
        <template v-if="!started">
          <AppButton variant="filled" @click="start(false)">
            <Hand :size="16" />
            {{ t("competitions.draw.oneByOne") }}
          </AppButton>
          <AppButton variant="tonal" @click="start(true)">
            <Play :size="16" />
            {{ t("competitions.draw.auto") }}
          </AppButton>
        </template>
        <template v-else-if="auto">
          <AppButton variant="tonal" @click="togglePause">
            <Play v-if="paused" :size="16" />
            <Pause v-else :size="16" />
            {{ paused ? t("competitions.draw.resume") : t("competitions.draw.pause") }}
          </AppButton>
          <AppButton :variant="fast ? 'filled' : 'tonal'" @click="fast = !fast">
            <FastForward :size="16" />
            {{ t("competitions.draw.faster") }}
          </AppButton>
          <AppButton variant="tonal" @click="setAuto(false)">
            <Hand :size="16" />
            {{ t("competitions.draw.oneByOne") }}
          </AppButton>
        </template>
        <template v-else>
          <AppButton variant="filled" :disabled="spinning" @click="drawOne">
            <Dices :size="16" />
            {{ t("competitions.draw.next") }}
          </AppButton>
          <AppButton variant="tonal" @click="setAuto(true)">
            <Play :size="16" />
            {{ t("competitions.draw.auto") }}
          </AppButton>
        </template>
        <AppButton variant="tonal" @click="skip">
          <SkipForward :size="16" />
          {{ t("competitions.draw.result") }}
        </AppButton>
      </template>
      <AppButton v-else variant="filled" block @click="finish">
        {{ t("common.continue") }}
      </AppButton>
    </StickyCta>
  </PageShell>
  <PageShell v-else back :title="t('competitions.draw.title')">
    <AppEmptyState :title="t('competitions.draw.notMade')" />
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
  min-height: 128px;
  justify-content: center;
}

.ball.reveal {
  animation: ball-pop 0.5s var(--ease-spring);
}

.ball.spin .ball-flag {
  animation: ball-tumble 0.35s linear infinite;
  filter: blur(0.6px);
}

.ball.spin .ball-name,
.ball.spin .ball-to {
  color: var(--text-muted);
}

.pots {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.pot {
  padding: var(--sp-2);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  transition:
    border-color var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}

.intro {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.intro-text {
  margin: 0;
  text-align: center;
  color: var(--text-muted);
}

.pot-count {
  float: right;
  font-variant-numeric: tabular-nums;
}

.slot-fill {
  display: inline-flex;
  animation: slot-in 0.45s var(--ease-spring);
}

@keyframes ball-pop {
  0% {
    opacity: 0;
    transform: scale(0.4) translateY(-12px);
  }
  60% {
    opacity: 1;
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes ball-tumble {
  0% {
    transform: rotate(-12deg) scale(0.95);
  }
  50% {
    transform: rotate(12deg) scale(1.08);
  }
  100% {
    transform: rotate(-12deg) scale(0.95);
  }
}

@keyframes slot-in {
  0% {
    opacity: 0;
    transform: translateY(-28px) scale(1.5);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ball.reveal,
  .ball.spin .ball-flag,
  .slot-fill {
    animation: none;
  }
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
