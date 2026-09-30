<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, triggerRef, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  ArrowLeftRight,
  CalendarClock,
  ClipboardList,
  FastForward,
  Pause,
  Play,
  SkipForward,
  TriangleAlert,
} from "@lucide/vue"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader, AppSubTabBar } from "@/components/ui"
import { PageShell, StatPill } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { PitchView } from "@/modules/squad/components/pitch"
import { ScoutReportCard } from "@/modules/match/components/scout"
import {
  CommentaryFeed,
  LiveTacticsSheet,
  Scoreboard,
  StatsPanel,
  SubSheet,
} from "@/modules/match/components/live"
import { useWorldStore } from "@/modules/world/store"
import { useSettingsStore, type LiveMatchSpeed } from "@/modules/settings/store"
import {
  buildReport,
  changeFormation,
  createMatch,
  dismissInjury,
  playToEnd,
  setTactics,
  step,
  substitute,
  teamTalk,
  type MatchState,
  type TeamTalk,
} from "@/engine/match/engine"
import { KEY_EVENTS, type Side, type Tactics } from "@/engine/match/types"
import { clock } from "@/engine/match/commentary"
import { FORMATIONS } from "@/engine/match/formations"
import { formatDate } from "@/engine/calendar/dates"
import { resultLetter } from "@/modules/core/utils/format"
import { useHaptic } from "@/composables/useHaptic"
import { showConfirm } from "@/composables/useDialog"

const route = useRoute()
const router = useRouter()
const world = useWorldStore()
const settings = useSettingsStore()
const haptic = useHaptic()

const fixture = world.derive((w) => w.state.fixtures[String(route.params.id)] ?? null, null)
const mine = computed<Side | null>(() =>
  fixture.value
    ? fixture.value.home === world.me
      ? "home"
      : fixture.value.away === world.me
        ? "away"
        : null
    : null
)
const opp = computed(() =>
  fixture.value && mine.value
    ? mine.value === "home"
      ? fixture.value.away
      : fixture.value.home
    : null
)
const compName = computed(() =>
  fixture.value?.compId === "friendly"
    ? "Friendly"
    : (world.world?.state.competitions[fixture.value?.compId ?? ""]?.name ?? "")
)

const oppForm = world.derive(
  (w) => (opp.value ? [...w.state.nations[opp.value].results].reverse().slice(0, 5) : []),
  []
)
const rankOf = (id: string) => world.world?.fifaRank(id) ?? 0

/** The staff's report on the opponent, against the tactics the user would play. */
const scout = world.derive((w) => {
  const f = fixture.value
  if (!f || !w.userNation) return null
  // An assistant who picks the team plays the AI coach's tactics, not the saved ones.
  return w.scout(f, settings.assistantPicks ? w.expectedSheet(w.userNation, f).tactics : undefined)
}, null)

/** Only today's match can be played; any other is a preview. */
const due = world.derive((w) => w.userMatchDue()?.id === String(route.params.id), false)
/** What stops the saved eleven taking the field (the assistant needs none). */
const problems = world.derive(
  (w) => (fixture.value && !settings.assistantPicks ? w.lineupProblems(fixture.value) : []),
  [] as string[]
)

// ── Live state ──────────────────────────────────────────────────────────────

const match = shallowRef<MatchState | null>(null)
const running = ref(false)
const tab = ref("feed")
const showSubs = ref(false)
const forceOut = ref<string | null>(null)
const showTactics = ref(false)
const talkGiven = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const MS_PER_MINUTE: Record<LiveMatchSpeed, number> = { 1: 1100, 2: 550, 4: 260, 10: 90 }

const names = {
  player: (id: string | undefined) => {
    const p = id ? world.world?.state.players[id] : undefined
    return p ? p.last : "—"
  },
  team: (s: Side) =>
    fixture.value
      ? (world.world?.def(s === "home" ? fixture.value.home : fixture.value.away).name ?? "")
      : "",
}

/** Start the match, if it is today and the eleven is ready. Returns whether it started. */
async function kickOff(): Promise<boolean> {
  const w = world.world
  const f = fixture.value
  if (!w || !f || !mine.value || !due.value) return false
  if (problems.value.length) {
    const fix = await showConfirm(
      `Your starting eleven is not ready: ${problems.value.join("; ")}.`,
      { confirmLabel: "Fix the eleven" }
    )
    if (fix) router.push("/squad/tactics")
    return false
  }
  // With the assistant in charge of selection, he names the eleven too.
  const own = settings.assistantPicks ? w.assistantSheet(f) : w.userSheet(f)
  const home = mine.value === "home" ? own : w.aiSheet(f.home, f)
  const away = mine.value === "away" ? own : w.aiSheet(f.away, f)
  match.value = createMatch({ ...w.matchSetup(f, home, away), managed: mine.value })
  running.value = true
  loop()
  return true
}

// A match already played has a report, not a kick-off.
watch(
  fixture,
  (f) => {
    if (f?.result && !match.value) router.replace(`/report/${f.id}`)
  },
  { immediate: true }
)

function refresh() {
  triggerRef(match)
}

function loop() {
  if (timer) clearTimeout(timer)
  if (!running.value || !match.value) return
  const m = match.value
  const evs = step(m)
  refresh()
  if (m.phase === "done") {
    running.value = false
    haptic.success()
    return
  }
  const key = evs.some(
    (e) => KEY_EVENTS.has(e.kind) && (e.kind !== "injury" || e.side === mine.value)
  )
  if (m.pendingInjuries.length) {
    running.value = false
    forceOut.value = m.pendingInjuries[0]
    showSubs.value = true
    return
  }
  if (m.phase === "half-time" || m.phase === "et-break" || m.phase === "shootout") {
    running.value = false
    return
  }
  if (key) haptic.tap()
  if (key && settings.pauseOnKeyEvents) {
    timer = setTimeout(loop, MS_PER_MINUTE[settings.liveMatchSpeed] * 3)
    return
  }
  timer = setTimeout(loop, MS_PER_MINUTE[settings.liveMatchSpeed])
}

function toggle() {
  running.value = !running.value
  if (running.value) loop()
}

function cycleSpeed() {
  const order: LiveMatchSpeed[] = [1, 2, 4, 10]
  settings.liveMatchSpeed = order[(order.indexOf(settings.liveMatchSpeed) + 1) % order.length]
}

function skipToEnd() {
  if (!match.value) return
  running.value = false
  playToEnd(match.value)
  refresh()
}

async function quickResult() {
  if (await kickOff()) skipToEnd()
}

function doSub(outId: string, inId: string) {
  if (!match.value || !mine.value) return
  substitute(match.value, mine.value, outId, inId)
  showSubs.value = false
  forceOut.value = null
  refresh()
}

function closeSubs() {
  showSubs.value = false
  if (forceOut.value && match.value) dismissInjury(match.value, forceOut.value)
  forceOut.value = null
}

function applyTactics(t: Tactics) {
  if (!match.value || !mine.value) return
  const side = match.value[mine.value]
  if (t.formation !== side.tactics.formation) changeFormation(match.value, mine.value, t.formation)
  setTactics(match.value, mine.value, {
    mentality: t.mentality,
    pressing: t.pressing,
    tempo: t.tempo,
    line: t.line,
    width: t.width,
    counter: t.counter,
  })
  showTactics.value = false
  refresh()
}

function talk(t: TeamTalk) {
  if (!match.value || !mine.value) return
  teamTalk(match.value, mine.value, t)
  talkGiven.value = true
}

function resume() {
  talkGiven.value = false
  running.value = true
  loop()
}

function finish() {
  const f = fixture.value
  if (!match.value || !f) return
  const id = f.id
  try {
    world.finishUserMatch(f, buildReport(match.value))
  } catch (e) {
    console.error(e)
  }
  router.replace(`/report/${id}`)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

const score = computed<[number, number]>(() =>
  match.value ? [match.value.home.goals, match.value.away.goals] : [0, 0]
)
/** Possession so far, from the minutes each side has had the ball. */
const livePossession = computed<[number, number]>(() => {
  const m = match.value
  if (!m) return [50, 50]
  const total = m.home.possessionMinutes + m.away.possessionMinutes || 1
  const h = Math.round((m.home.possessionMinutes / total) * 100)
  return [h, 100 - h]
})
const clockLabel = computed(() => {
  const m = match.value
  if (!m) return ""
  if (m.phase === "done") return m.pens ? "Penalties" : m.ft ? "After extra time" : "Full-time"
  if (m.phase === "half-time") return "Half-time"
  if (m.phase === "et-break") return "End of 90 minutes"
  if (m.phase === "et-half-time") return "Extra time: half-time"
  if (m.phase === "shootout") return "Penalty shootout"
  return clock({ minute: m.minute, added: m.added || undefined })
})
const aggregate = computed<[number, number] | undefined>(() => {
  const agg = match.value?.setup.knockout?.aggregate
  return agg ? [agg[0] + score.value[0], agg[1] + score.value[1]] : undefined
})

const mySide = computed(() => (match.value && mine.value ? match.value[mine.value] : null))
/** On-pitch players placed in their formation roles (gaps where a man is missing). */
const pitchSlots = computed(() => {
  const side = mySide.value
  if (!side) return []
  const used = new Set<string>()
  return FORMATIONS[side.tactics.formation].map((role) => {
    const p = side.pitch.find((x) => x.slot === role && !used.has(x.id))
    if (!p) return null
    used.add(p.id)
    return p.id
  })
})
</script>

<template>
  <div v-if="!fixture || !mine">
    <PageShell back title="Match">
      <AppEmptyState
        title="Match not found"
        description="This fixture does not involve your team."
      />
    </PageShell>
  </div>

  <PageShell
    v-else-if="!match"
    back
    :title="compName"
    :subtitle="`${fixture.label} · ${formatDate(fixture.date)}`"
  >
    <AppCard padding="md">
      <div class="teams">
        <div class="team">
          <NationFlag :id="fixture.home" :size="52" />
          <strong>{{ world.world?.def(fixture.home).name }}</strong>
          <span v-if="rankOf(fixture.home)" class="muted">#{{ rankOf(fixture.home) }}</span>
        </div>
        <span class="vs">vs</span>
        <div class="team">
          <NationFlag :id="fixture.away" :size="52" />
          <strong>{{ world.world?.def(fixture.away).name }}</strong>
          <span v-if="rankOf(fixture.away)" class="muted">#{{ rankOf(fixture.away) }}</span>
        </div>
      </div>
      <p class="muted venue">
        {{ fixture.atHome ? `At home: ${world.world?.def(fixture.home).name}` : "Neutral venue" }}
        <template v-if="fixture.knockout?.decisive">· Extra time and penalties if needed</template>
      </p>
    </AppCard>

    <AppCard v-if="opp" padding="md">
      <AppSectionHeader :title="`${world.world?.def(opp).name} — recent form`" />
      <div class="form">
        <StatPill
          v-for="r in oppForm"
          :key="r.fixture"
          :value="resultLetter(r.gf, r.ga, r.pens)"
          :tone="
            resultLetter(r.gf, r.ga, r.pens) === 'W'
              ? 'var(--success)'
              : resultLetter(r.gf, r.ga, r.pens) === 'L'
                ? 'var(--danger)'
                : 'var(--text-muted)'
          "
        />
        <span v-if="!oppForm.length" class="muted">No recent matches</span>
      </div>
      <div class="muted">Coach: {{ world.world?.nation(opp).coach }}</div>
    </AppCard>

    <ScoutReportCard
      v-if="scout && opp"
      :report="scout"
      :name="world.world?.def(opp).name ?? ''"
      :player="(id) => world.world?.state.players[id]"
      :assisted="settings.assistantPicks"
      @apply="world.applyAdvice(fixture)"
    />

    <div v-if="!due" class="notice">
      <CalendarClock :size="20" class="notice-icon" />
      <span>
        Match day is {{ formatDate(fixture.date) }}. Keep the calendar moving until then — you can
        set up your team and tactics now.
      </span>
    </div>
    <div v-else-if="problems.length" class="notice notice--bad">
      <TriangleAlert :size="20" class="notice-icon" />
      <div>
        <strong>Your starting eleven is not ready</strong>
        <ul class="problems">
          <li v-for="p in problems" :key="p">{{ p }}</li>
        </ul>
      </div>
    </div>

    <AppButton variant="tonal" block @click="router.push('/squad/tactics')">
      <ClipboardList :size="16" />
      Team and tactics
    </AppButton>
    <div v-if="due" class="actions">
      <AppButton variant="outlined" :disabled="problems.length > 0" @click="quickResult">
        <SkipForward :size="16" />
        Instant result
      </AppButton>
      <AppButton variant="filled" :disabled="problems.length > 0" @click="kickOff">
        <Play :size="16" />
        Kick off
      </AppButton>
    </div>
  </PageShell>

  <div v-else class="live">
    <Scoreboard
      :home="fixture.home"
      :away="fixture.away"
      :score="score"
      :clock="clockLabel"
      :label="`${compName} · ${fixture.label}`"
      :pens="match.pens"
      :aggregate="aggregate"
    />

    <div class="live-body">
      <AppCard
        v-if="match.phase === 'half-time' || match.phase === 'et-break'"
        padding="md"
        class="break"
      >
        <AppSectionHeader
          :title="match.phase === 'half-time' ? 'Half-time team talk' : 'Before extra time'"
        />
        <div v-if="!talkGiven" class="talks">
          <AppButton variant="tonal" @click="talk('calm')">Stay calm</AppButton>
          <AppButton variant="tonal" @click="talk('praise')">Praise them</AppButton>
          <AppButton variant="tonal" @click="talk('demand')">Demand more</AppButton>
        </div>
        <p v-else class="muted">The players head back out.</p>
        <AppButton variant="filled" block @click="resume">Continue</AppButton>
      </AppCard>

      <AppCard v-if="match.phase === 'shootout'" padding="md" class="break">
        <AppSectionHeader title="Penalty shootout" />
        <AppButton variant="filled" block @click="resume">Take the penalties</AppButton>
      </AppCard>

      <AppCard v-if="match.phase === 'done'" padding="md" class="break">
        <AppSectionHeader title="Full-time" />
        <AppButton variant="filled" block @click="finish">Match report</AppButton>
      </AppCard>

      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'feed', label: 'Commentary' },
          { value: 'stats', label: 'Stats' },
          { value: 'team', label: 'My team' },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v)"
      />
      <div class="panel">
        <CommentaryFeed
          v-if="tab === 'feed'"
          :events="match.events.slice()"
          :names="names"
          :verbose="settings.verboseCommentary"
          :mine="mine"
        />
        <StatsPanel
          v-else-if="tab === 'stats'"
          :home="{ ...match.home.stats, possession: livePossession[0] }"
          :away="{ ...match.away.stats, possession: livePossession[1] }"
        />
        <div v-else-if="mySide" class="team-panel">
          <PitchView
            :formation="mySide.tactics.formation"
            :slots="pitchSlots"
            :player="(id) => world.world?.state.players[id]"
          />
          <ul class="stamina">
            <li v-for="p in mySide.pitch" :key="p.id">
              <span class="role">{{ p.slot }}</span>
              <span class="name">{{ names.player(p.id) }}</span>
              <span class="bar"><span :style="{ width: `${p.stamina}%` }"></span></span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="match.phase !== 'done'" class="controls">
      <button class="control" @click="toggle">
        <Pause v-if="running" :size="20" />
        <Play v-else :size="20" />
        <span>{{ running ? "Pause" : "Play" }}</span>
      </button>
      <button class="control" @click="cycleSpeed">
        <FastForward :size="20" />
        <span>{{ settings.liveMatchSpeed }}×</span>
      </button>
      <button class="control" @click="((running = false), (showSubs = true))">
        <ArrowLeftRight :size="20" />
        <span>Subs</span>
      </button>
      <button class="control" @click="((running = false), (showTactics = true))">
        <ClipboardList :size="20" />
        <span>Tactics</span>
      </button>
      <button class="control" @click="skipToEnd">
        <SkipForward :size="20" />
        <span>Skip</span>
      </button>
    </div>

    <SubSheet
      v-if="showSubs && mySide"
      :side="mySide"
      :name="(id) => names.player(id)"
      :max-subs="match.setup.maxSubs ?? 5"
      :force-out="forceOut"
      @close="closeSubs"
      @sub="doSub"
    />
    <LiveTacticsSheet
      v-if="showTactics && mySide"
      :tactics="mySide.tactics"
      @close="showTactics = false"
      @apply="applyTactics"
    />
  </div>
</template>

<style scoped>
.teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-2);
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  text-align: center;
}

.vs {
  color: var(--text-muted);
  font-weight: 700;
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.venue {
  text-align: center;
  margin: var(--sp-3) 0 0;
}

.form {
  display: flex;
  gap: var(--sp-1);
  margin-bottom: var(--sp-2);
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
  padding: var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.notice-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.notice--bad {
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, var(--surface));
  color: var(--text);
}

.notice--bad .notice-icon {
  color: var(--danger);
}

.problems {
  margin: var(--sp-1) 0 0;
  padding-inline-start: var(--sp-4);
}

.live {
  /* Viewport minus what <html> pads on top and the no-nav spacer adds below;
     a plain 100vh overflows by both insets and scrolls on Android. */
  min-height: calc(100vh - var(--safe-top) - var(--safe-bottom));
  min-height: calc(100dvh - var(--safe-top) - var(--safe-bottom));
  display: flex;
  flex-direction: column;
}

.live-body {
  flex: 1;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: var(--sp-3) var(--sp-4) calc(96px + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.break :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.talks {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.panel {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.team-panel {
  padding: var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.stamina {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1-5);
}

.stamina li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.role {
  width: 28px;
  font-weight: 800;
  color: var(--text-muted);
  font-size: var(--fs-xs);
}

.name {
  flex: 1;
}

.bar {
  width: 90px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: var(--success);
}

.controls {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-bottom-bar);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: var(--sp-1) var(--sp-2) calc(var(--safe-bottom) + var(--sp-1));
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-light);
}

.control {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  border: none;
  border-radius: var(--radius);
  background: none;
  color: var(--text);
  font-size: var(--fs-xs);
  font-weight: 600;
}

.control:active {
  background: var(--accent-subtle);
}
</style>
