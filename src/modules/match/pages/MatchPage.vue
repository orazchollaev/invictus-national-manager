<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, triggerRef, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import {
  ArrowLeftRight,
  CalendarClock,
  ClipboardList,
  ChartNoAxesColumn,
  FastForward,
  Pause,
  Play,
  SkipForward,
  TriangleAlert,
} from "@lucide/vue"
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill, StickyCta } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { ScoutReportCard } from "@/modules/match/components/scout"
import {
  BallPitch,
  KeyEvents,
  LiveNarration,
  LiveTacticsSheet,
  PressureBar,
  Scoreboard,
  StatsSheet,
  SubSheet,
} from "@/modules/match/components/live"
import { compName as compNameOf, nationName, resolveText } from "@/i18n/text"
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
import { KEY_EVENTS, type MatchEventKind, type Side, type Tactics } from "@/engine/match/types"
import { clock } from "@/engine/match/commentary"
import { surname } from "@/engine/players/ability"
import type { Msg } from "@/engine/text"
import { laneCounts } from "@/engine/match/lanes"
import { FORMATIONS } from "@/engine/match/formations"
import { formatDate } from "@/i18n/dates"
import { resultLetter } from "@/modules/core/utils/format"
import { useHaptic } from "@/composables/useHaptic"
import { showConfirm } from "@/composables/useDialog"

const { t } = useI18n()
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
    ? t("match.friendly")
    : ((i) => (i ? compNameOf(i) : ""))(
        world.world?.state.competitions[fixture.value?.compId ?? ""]
      )
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
  [] as Msg[]
)
/** No eleven saved yet: the user sets up his team and tactics before the first match. */
const needsSetup = world.derive((w) => !settings.assistantPicks && !w.state.userTeam, false)
const blocked = computed(() => needsSetup.value || problems.value.length > 0)

// ── Live state ──────────────────────────────────────────────────────────────

const match = shallowRef<MatchState | null>(null)
const running = ref(false)
const showStats = ref(false)
const showSubs = ref(false)
const forceOut = ref<string | null>(null)
const showTactics = ref(false)
const talkGiven = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const MS_PER_MINUTE: Record<LiveMatchSpeed, number> = { 1: 1100, 2: 550, 4: 260 }

const names = {
  player: (id: string | undefined) => {
    const p = id ? world.world?.state.players[id] : undefined
    return p ? surname(p) : "—"
  },
  team: (s: Side) =>
    fixture.value ? nationName(s === "home" ? fixture.value.home : fixture.value.away) : "",
}

/** Start the match, if it is today and the eleven is ready. Returns whether it started. */
async function kickOff(): Promise<boolean> {
  const w = world.world
  const f = fixture.value
  if (!w || !f || !mine.value || !due.value) return false
  if (needsSetup.value) {
    router.push("/squad/tactics")
    return false
  }
  if (problems.value.length) {
    const fix = await showConfirm(
      t("match.page.ready", { problems: problems.value.map((p) => resolveText(p)).join("; ") }),
      {
        confirmLabel: t("match.page.fixEleven"),
      }
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
  const order: LiveMatchSpeed[] = [1, 2, 4]
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

function applyTactics(tac: Tactics) {
  if (!match.value || !mine.value) return
  const side = match.value[mine.value]
  if (tac.formation !== side.tactics.formation)
    changeFormation(match.value, mine.value, tac.formation)
  setTactics(match.value, mine.value, {
    mentality: tac.mentality,
    pressing: tac.pressing,
    tempo: tac.tempo,
    line: tac.line,
    width: tac.width,
    counter: tac.counter,
  })
  showTactics.value = false
  refresh()
}

function talk(kind: TeamTalk) {
  if (!match.value || !mine.value) return
  teamTalk(match.value, mine.value, kind)
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
  if (m.phase === "done")
    return m.pens
      ? t("match.page.penalties")
      : m.ft
        ? t("match.page.afterET")
        : t("match.page.fullTime")
  if (m.phase === "half-time") return t("match.page.halfTime")
  if (m.phase === "et-break") return t("match.page.endOf90")
  if (m.phase === "et-half-time") return t("match.page.etHalf")
  if (m.phase === "shootout") return t("match.page.shootoutClock")
  return clock({ minute: m.minute, added: m.added || undefined })
})
const aggregate = computed<[number, number] | undefined>(() => {
  const agg = match.value?.setup.knockout?.aggregate
  return agg ? [agg[0] + score.value[0], agg[1] + score.value[1]] : undefined
})

/** Each nation's colour; when the two clash the away side plays in white. */
const colors = computed<[string, string]>(() => {
  const f = fixture.value
  const w = world.world
  if (!f || !w) return ["var(--accent)", "var(--pitch-token-text)"]
  const h = w.def(f.home).color
  const a = w.def(f.away).color
  return [h, h.toLowerCase() === a.toLowerCase() ? "var(--pitch-token-text)" : a]
})

const SHOUTS = new Set<MatchEventKind>([
  "shot-saved",
  "shot-wide",
  "shot-blocked",
  "woodwork",
  "big-chance-missed",
  "corner",
  "penalty-awarded",
  "pen-miss",
  "pen-saved",
])
const GOAL_KINDS = new Set<MatchEventKind>(["goal", "pen-goal", "own-goal"])

/** A pop on the ball for the latest event, if it was a shot or a goal. */
const flash = computed<{ key: number; kind: "goal" | "shot"; label?: string } | null>(() => {
  const evs = match.value?.events
  const last = evs?.[evs.length - 1]
  if (!evs || !last) return null
  if (GOAL_KINDS.has(last.kind)) return { key: evs.length, kind: "goal" }
  return SHOUTS.has(last.kind)
    ? { key: evs.length, kind: "shot", label: t(`match.shout.${last.kind}`) }
    : null
})

/** The strip across the pitch when the latest event is a goal. */
const banner = computed(() => {
  const evs = match.value?.events
  const last = evs?.[evs.length - 1]
  if (!evs || !last?.side || !GOAL_KINDS.has(last.kind)) return null
  const title =
    last.kind === "own-goal"
      ? t("match.banner.ownGoal")
      : last.kind === "pen-goal"
        ? t("match.banner.penalty")
        : t("match.banner.goal")
  return {
    key: evs.length,
    title,
    text: `${clock(last)} ${names.player(last.playerId)}`,
    color: colors.value[last.side === "home" ? 0 : 1],
  }
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
    <PageShell back :title="t('match.title')">
      <AppEmptyState :title="t('match.notFound')" :description="t('match.notInvolved')" />
    </PageShell>
  </div>

  <PageShell
    v-else-if="!match"
    back
    :title="compName"
    :subtitle="t('match.subtitle', { label: $tx(fixture.label), date: formatDate(fixture.date) })"
  >
    <AppCard padding="md">
      <div class="teams">
        <div class="team">
          <NationFlag :id="fixture.home" :size="52" />
          <strong>{{ $nation(fixture.home) }}</strong>
          <span v-if="rankOf(fixture.home)" class="muted">#{{ rankOf(fixture.home) }}</span>
        </div>
        <span class="vs">{{ t("match.page.vs") }}</span>
        <div class="team">
          <NationFlag :id="fixture.away" :size="52" />
          <strong>{{ $nation(fixture.away) }}</strong>
          <span v-if="rankOf(fixture.away)" class="muted">#{{ rankOf(fixture.away) }}</span>
        </div>
      </div>
      <p class="muted venue">
        {{
          fixture.atHome
            ? t("match.page.atHome", { name: nationName(fixture.home) })
            : t("match.page.neutral")
        }}
        <template v-if="fixture.knockout?.decisive">{{ t("match.page.extraTime") }}</template>
      </p>
    </AppCard>

    <AppCard v-if="opp" padding="md">
      <AppSectionHeader :title="t('match.page.recentForm', { name: nationName(opp) })" />
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
        <span v-if="!oppForm.length" class="muted">{{ t("match.page.noRecent") }}</span>
      </div>
      <div class="muted">
        {{
          t("match.page.coach", { name: world.world?.nation(opp).coach || t("coaches.caretaker") })
        }}
      </div>
    </AppCard>

    <ScoutReportCard
      v-if="scout && opp"
      :report="scout"
      :name="nationName(opp)"
      :player="(id) => world.world?.state.players[id]"
      :assisted="settings.assistantPicks"
      @apply="world.applyAdvice(fixture)"
    />

    <div v-if="!due" class="notice">
      <CalendarClock :size="20" class="notice-icon" />
      <span>
        {{ t("match.page.matchDay", { date: formatDate(fixture.date) }) }}
      </span>
    </div>
    <div v-else-if="needsSetup" class="notice notice--bad">
      <TriangleAlert :size="20" class="notice-icon" />
      <div>
        <strong>{{ t("match.page.setupTitle") }}</strong>
        <p class="setup-text">{{ t("match.page.setupText") }}</p>
        <AppButton variant="filled" size="sm" @click="router.push('/squad/tactics')">
          {{ t("match.page.setup") }}
        </AppButton>
      </div>
    </div>
    <div v-else-if="problems.length" class="notice notice--bad">
      <TriangleAlert :size="20" class="notice-icon" />
      <div>
        <strong>{{ t("match.page.notReady") }}</strong>
        <ul class="problems">
          <li v-for="(p, i) in problems" :key="i">{{ $tx(p) }}</li>
        </ul>
      </div>
    </div>

    <StickyCta>
      <AppButton variant="tonal" @click="router.push('/squad/tactics')">
        <ClipboardList :size="16" />
        {{ t("match.page.tactics") }}
      </AppButton>
      <template v-if="due">
        <AppButton variant="outlined" :disabled="blocked" @click="quickResult">
          <SkipForward :size="16" />
          {{ t("match.page.instant") }}
        </AppButton>
        <AppButton variant="filled" :disabled="blocked" @click="kickOff">
          <Play :size="16" />
          {{ t("match.page.kickOff") }}
        </AppButton>
      </template>
    </StickyCta>
  </PageShell>

  <div v-else class="live">
    <Scoreboard
      :home="fixture.home"
      :away="fixture.away"
      :score="score"
      :clock="clockLabel"
      :label="`${compName} · ${$tx(fixture.label)}`"
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
          :title="
            match.phase === 'half-time' ? t('match.page.halfTimeTalk') : t('match.page.beforeET')
          "
        />
        <div v-if="!talkGiven" class="talks">
          <AppButton variant="tonal" @click="talk('calm')">{{ t("match.page.calm") }}</AppButton>
          <AppButton variant="tonal" @click="talk('praise')">
            {{ t("match.page.praise") }}
          </AppButton>
          <AppButton variant="tonal" @click="talk('demand')">
            {{ t("match.page.demand") }}
          </AppButton>
        </div>
        <p v-else class="muted">{{ t("match.page.headBack") }}</p>
        <AppButton variant="filled" block @click="resume">{{ t("common.continue") }}</AppButton>
      </AppCard>

      <AppCard v-if="match.phase === 'shootout'" padding="md" class="break">
        <AppSectionHeader :title="t('match.page.shootout')" />
        <AppButton variant="filled" block @click="resume">{{ t("match.page.takePens") }}</AppButton>
      </AppCard>

      <LiveNarration
        :events="match.events.slice()"
        :names="names"
        :verbose="settings.verboseCommentary"
      />
      <BallPitch
        :ball="match.ball"
        :home="fixture.home"
        :away="fixture.away"
        :home-color="colors[0]"
        :away-color="colors[1]"
        :flash="flash"
        :banner="banner"
      />
      <PressureBar
        :home="fixture.home"
        :away="fixture.away"
        :share="livePossession"
        :home-color="colors[0]"
        :away-color="colors[1]"
      />
      <KeyEvents :events="match.events.slice()" :names="names" />
    </div>

    <StickyCta v-if="match.phase === 'done'">
      <AppButton variant="filled" block @click="finish">{{ t("match.page.report") }}</AppButton>
    </StickyCta>
    <div v-else class="controls">
      <button class="control" @click="toggle">
        <Pause v-if="running" :size="20" />
        <Play v-else :size="20" />
        <span>{{ running ? t("match.page.pause") : t("match.page.play") }}</span>
      </button>
      <button class="control" @click="cycleSpeed">
        <FastForward :size="20" />
        <span>{{ settings.liveMatchSpeed }}×</span>
      </button>
      <button class="control" @click="((running = false), (showSubs = true))">
        <ArrowLeftRight :size="20" />
        <span>{{ t("match.page.subs") }}</span>
      </button>
      <button class="control" @click="((running = false), (showTactics = true))">
        <ClipboardList :size="20" />
        <span>{{ t("match.page.tactics") }}</span>
      </button>
      <button class="control" @click="showStats = true">
        <ChartNoAxesColumn :size="20" />
        <span>{{ t("match.page.stats") }}</span>
      </button>
      <button class="control" @click="skipToEnd">
        <SkipForward :size="20" />
        <span>{{ t("match.page.skip") }}</span>
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
    <StatsSheet
      v-if="showStats && mySide"
      :home="{ ...match.home.stats, possession: livePossession[0] }"
      :away="{ ...match.away.stats, possession: livePossession[1] }"
      :lanes="laneCounts(match.events)"
      :side="mySide"
      :slots="pitchSlots"
      :player="(id) => world.world?.state.players[id]"
      :name="(id) => names.player(id)"
      @close="showStats = false"
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

.setup-text {
  margin: var(--sp-1) 0 var(--sp-2);
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

.controls {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-bottom-bar);
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: var(--sp-1) var(--sp-2) calc(var(--safe-bottom) + var(--sp-1));
  background: var(--surface);
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
