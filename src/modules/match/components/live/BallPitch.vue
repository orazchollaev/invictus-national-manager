<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { Tag } from "@lucide/vue"
import type { Lane, MatchEventKind, Side } from "@/engine/match/types"
import type { Dot, ShotMark, Spot } from "@/modules/match/utils/shape"

const props = defineProps<{
  /** Who has the ball, which lane they work and how far up the pitch. */
  ball: { side: Side; lane: Lane; depth: 1 | 2 | 3 }
  home: string
  away: string
  /** Each nation's own colour. */
  homeColor: string
  awayColor: string
  /** Bumped by something worth a pop: a goal, a shot, a corner. */
  flash?: {
    key: number
    kind: "goal" | "shot"
    side?: Side
    label?: string
    xg?: number
  } | null
  /** A goal just scored, shown across the pitch for a moment. */
  banner?: { key: number; title: string; text: string; color: string } | null
  /** Each side's players, in the places their formation gives them. */
  dots?: Record<Side, Dot[]>
  /** Every shot so far, where it was taken. */
  shots?: ShotMark[]
  /** Who the latest event is about: his dot is lit and named, and the move is drawn. */
  spotlight?: {
    key: number
    index: number
    side: Side
    id: string
    name: string
    assistId?: string
  } | null
  /** The side whose players are bigger on the pitch and can be named. */
  mine?: Side | null
  nameOf?: (id: string) => string
}>()

const { t } = useI18n()

/** Home attacks to the right, away to the left; a lane is the attacker's own left or right. */
const x = computed(() => {
  const reach = 50 + props.ball.depth * 10
  return props.ball.side === "home" ? reach : 100 - reach
})
const y = computed(() => {
  const top = props.ball.lane === "left" ? 24 : props.ball.lane === "right" ? 76 : 50
  return props.ball.side === "home" ? top : 100 - top
})
const code = computed(() => (props.ball.side === "home" ? props.home : props.away))
const team = computed(() => (props.ball.side === "home" ? props.homeColor : props.awayColor))
const colorOf = (s: Side) => (s === "home" ? props.homeColor : props.awayColor)
const codeOf = (s: Side) => (s === "home" ? props.home : props.away)

/** In plain words: how far up the pitch the ball is, and down which flank. */
const ZONE = { 1: "match.pitch.build", 2: "match.pitch.mid", 3: "match.pitch.final" } as const
const caption = computed(
  () => `${t(ZONE[props.ball.depth])} · ${t(`match.pitch.${props.ball.lane}`)}`
)

/** Which way a label leans so it stays inside the pitch when its player is near a side. */
const lean = (x: number) => (x < 14 ? "lean-start" : x > 86 ? "lean-end" : "")

/** The side on the ball pushes up with it; the other drops back. The keeper stays. */
function forward(side: Side, spot: Spot): number {
  if (spot.x < 10) return 0
  const d = props.ball.depth - 1
  return side === props.ball.side ? d * 3 : -d * 2
}

/** Screen place of a slot: the away side is the home side turned round. */
function place(side: Side, spot: Spot): Spot {
  const x = Math.min(96, Math.max(4, spot.x + forward(side, spot)))
  return side === "home" ? { x, y: spot.y } : { x: 100 - x, y: 100 - spot.y }
}

const players = computed(() =>
  (["home", "away"] as Side[]).flatMap((side) =>
    (props.dots?.[side] ?? []).map((d) => ({ id: d.id, side, ...place(side, d) }))
  )
)
const dotOf = (id: string | undefined, side: Side) =>
  id ? players.value.find((p) => p.id === id && p.side === side) : undefined
const spotDot = computed(() =>
  props.spotlight ? dotOf(props.spotlight.id, props.spotlight.side) : undefined
)
const assistDot = computed(() =>
  props.spotlight ? dotOf(props.spotlight.assistId, props.spotlight.side) : undefined
)
const spotMark = computed(() => props.shots?.find((m) => m.key === props.spotlight?.index))

/** Names on the pitch are the user's own players, and only when asked for. */
const showNames = ref(false)

/** The last places the ball was, drawn as a thin dotted line behind it. */
const TRAIL = 3
const trail = ref<{ x: number; y: number }[]>([])
watch([x, y], (_now, [ox, oy]) => {
  trail.value = [{ x: ox, y: oy }, ...trail.value].slice(0, TRAIL)
})
const path = computed(() =>
  [{ x: x.value, y: y.value }, ...trail.value].map((p) => `${p.x},${p.y}`).join(" ")
)

const MARK: Partial<Record<MatchEventKind, string>> = {
  goal: "goal",
  "pen-goal": "goal",
  "shot-saved": "saved",
  "pen-saved": "saved",
  "shot-wide": "wide",
  "big-chance-missed": "wide",
  "pen-miss": "wide",
  "shot-blocked": "blocked",
  woodwork: "post",
}
</script>

<template>
  <div class="pitch">
    <div class="field" :style="{ '--team': team }">
      <!-- Each half in its own side's colour: the left goal is the home side's, the right the away side's. -->
      <span class="half half--home" :style="{ background: homeColor }"></span>
      <span class="half half--away" :style="{ background: awayColor }"></span>
      <svg class="lines" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
        <rect x="1" y="1" width="198" height="98" />
        <line x1="100" y1="1" x2="100" y2="99" />
        <circle cx="100" cy="50" r="13" />
        <rect x="1" y="26" width="28" height="48" />
        <rect x="171" y="26" width="28" height="48" />
        <rect x="1" y="39" width="10" height="22" />
        <rect x="189" y="39" width="10" height="22" />
      </svg>

      <svg
        v-if="trail.length"
        class="trail"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline :points="path" :style="{ stroke: team }" />
      </svg>

      <!-- The latest move: who set it up, who took it, and where it ended up. -->
      <svg
        v-if="spotlight && spotDot"
        :key="spotlight.key"
        class="moves"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        :style="{ '--c': colorOf(spotlight.side) }"
      >
        <line
          v-if="assistDot"
          class="move move--pass"
          :x1="assistDot.x"
          :y1="assistDot.y"
          :x2="spotDot.x"
          :y2="spotDot.y"
        />
        <line
          v-if="spotMark"
          class="move move--shot"
          :x1="spotDot.x"
          :y1="spotDot.y"
          :x2="spotMark.x"
          :y2="spotMark.y"
        />
      </svg>

      <!-- Shots are squares and diamonds, players are circles, so the two never read alike. -->
      <span
        v-for="m in shots"
        :key="m.key"
        class="mark"
        :class="[`mark--${MARK[m.kind]}`, { 'mark--latest': m.key === spotlight?.index }]"
        :style="{ left: `${m.x}%`, top: `${m.y}%`, '--c': colorOf(m.side) }"
      ></span>

      <span
        v-for="p in players"
        :key="`${p.side}-${p.id}`"
        class="dot"
        :class="{
          'dot--lit': spotlight?.id === p.id && spotlight?.side === p.side,
          'dot--mine': mine === p.side,
        }"
        :style="{ left: `${p.x}%`, top: `${p.y}%`, '--c': colorOf(p.side) }"
      >
        <span
          v-if="showNames && nameOf && mine === p.side"
          class="dot-name"
          :class="[p.y > 78 && 'dot-name--up', lean(p.x)]"
        >
          {{ nameOf(p.id) }}
        </span>
      </span>
      <span
        v-if="spotlight && spotDot"
        :key="`name-${spotlight.key}`"
        class="who"
        :class="[spotDot.y < 24 && 'who--down', lean(spotDot.x)]"
        :style="{ left: `${spotDot.x}%`, top: `${spotDot.y}%`, '--c': colorOf(spotlight.side) }"
      >
        {{ spotlight.name }}
      </span>

      <button
        v-if="mine && nameOf"
        type="button"
        class="names"
        :class="{ 'names--on': showNames }"
        :aria-pressed="showNames"
        :aria-label="t('match.pitch.names')"
        @click="showNames = !showNames"
      >
        <Tag :size="14" />
      </button>

      <div v-if="banner" :key="banner.key" class="banner" :style="{ '--team': banner.color }">
        <strong>{{ banner.title }}</strong>
        <span>{{ banner.text }}</span>
      </div>
      <div class="ball" :style="{ left: `${x}%`, top: `${y}%` }">
        <!-- A white ball ringed in the colour of the side that has it. -->
        <span :key="flash?.key" class="ball-dot" :class="flash && `ball-dot--${flash.kind}`"></span>
        <span v-if="flash?.label" :key="flash.key" class="shout">
          <span>
            <b v-if="flash.side" class="shout-team" :style="{ background: colorOf(flash.side) }">
              {{ codeOf(flash.side) }}
            </b>
            {{ flash.label }}
          </span>
          <small v-if="flash.xg">{{ t("match.pitch.xg", { n: flash.xg.toFixed(2) }) }}</small>
        </span>
      </div>
      <span class="tag tag--home" :style="{ background: homeColor }">{{ home }}</span>
      <span class="tag tag--away" :style="{ background: awayColor }">{{ away }}</span>
    </div>

    <p class="caption" aria-live="polite">
      <b class="caption-team" :style="{ background: team }">{{ code }}</b>
      {{ caption }}
    </p>

    <ul class="legend">
      <li>
        <i class="dot dot--key"></i>
        {{ t("match.pitch.legend.player") }}
      </li>
      <li>
        <i class="ball-dot ball-dot--key"></i>
        {{ t("match.pitch.legend.ball") }}
      </li>
      <li>
        <i class="mark mark--goal mark--key"></i>
        {{ t("match.pitch.legend.goal") }}
      </li>
      <li>
        <i class="mark mark--saved mark--key"></i>
        {{ t("match.pitch.legend.shot") }}
      </li>
      <li>
        <i class="mark mark--wide mark--key"></i>
        {{ t("match.pitch.legend.miss") }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pitch {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1-5);
}

.field {
  position: relative;
  aspect-ratio: 2 / 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--pitch-a);
}

/* A faint wash of each side's colour over its half. */
.half {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  opacity: 0.14;
  pointer-events: none;
}

.half--home {
  left: 0;
}

.half--away {
  right: 0;
}

.lines,
.moves,
.trail {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--pitch-line);
  stroke-width: 0.8;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}

.lines * {
  vector-effect: non-scaling-stroke;
}

.moves {
  stroke: none;
}

.trail polyline {
  stroke-width: 2;
  stroke-dasharray: 2 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.7;
  vector-effect: non-scaling-stroke;
}

.move {
  stroke: var(--c);
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  animation: draw 3s var(--ease) both;
}

.move--pass {
  stroke-width: 2;
}

.move--shot {
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}

/* A player is a small disc in his nation's colour; the user's own are a touch larger. */
.dot {
  position: absolute;
  z-index: 1;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 1.5px var(--pitch-ink);
  opacity: 0.7;
  transform: translate(-50%, -50%);
  transition:
    left 0.7s var(--ease),
    top 0.7s var(--ease);
}

.dot--mine {
  width: 10px;
  height: 10px;
  opacity: 1;
}

.dot--lit {
  z-index: 2;
  opacity: 1;
  animation: lit 1.2s var(--ease) 2;
}

.dot-name {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 3px;
  transform: translateX(-50%);
  color: var(--pitch-ink);
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 1px 2px color-mix(in srgb, var(--pitch-token-text) 80%, transparent);
  white-space: nowrap;
}

/* Names near the edge of the pitch lean inwards, so none is cut off by it. */
.dot-name--up {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 3px;
}

.dot-name.lean-start {
  left: 0;
  transform: none;
}

.dot-name.lean-end {
  left: auto;
  right: 0;
  transform: none;
}

.who {
  --tx: -50%;
  --ty: -190%;
  position: absolute;
  z-index: 3;
  padding: 1px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--c);
  color: var(--pitch-ink);
  font-size: var(--fs-xs);
  font-weight: 800;
  white-space: nowrap;
  transform: translate(var(--tx), var(--ty));
  box-shadow: 0 0 0 1.5px var(--pitch-ink);
  animation: who 3s var(--ease) both;
  pointer-events: none;
}

.who--down {
  --ty: 90%;
}

.who.lean-start {
  --tx: 0%;
}

.who.lean-end {
  --tx: -100%;
}

/* Shots taken so far: squares and diamonds, the shape of the match at each end. */
.mark {
  position: absolute;
  z-index: 1;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background: var(--c);
  border: 1.5px solid var(--pitch-ink);
  transform: translate(-50%, -50%);
}

/* A goal is a gold diamond. */
.mark--goal {
  width: 15px;
  height: 15px;
  background: var(--gold);
  border-width: 2px;
  transform: translate(-50%, -50%) rotate(45deg);
}

.mark--blocked {
  background: none;
  border: 2px solid var(--c);
}

.mark--post {
  width: 13px;
  height: 5px;
  background: var(--pitch-ink);
  border: none;
}

/* A miss is a cross. */
.mark--wide {
  background: none;
  border: none;
}

.mark--wide::before,
.mark--wide::after {
  content: "";
  position: absolute;
  inset: 3px -2px;
  border-top: 2.5px solid var(--c);
  border-radius: 1px;
  box-shadow: 0 0 0 0.5px var(--pitch-ink);
}

.mark--wide::before {
  transform: rotate(45deg);
}

.mark--wide::after {
  transform: rotate(-45deg);
}

.mark--latest {
  z-index: 2;
  animation: ping 1.2s var(--ease) 3;
}

.names {
  position: absolute;
  top: var(--sp-1);
  left: var(--sp-1);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--pitch-token-text) 45%, transparent);
  color: var(--pitch-ink);
}

.names--on {
  background: var(--pitch-ink);
  color: var(--pitch-token-text);
}

.ball {
  position: absolute;
  z-index: 2;
  width: 0;
  height: 0;
  transition:
    left 0.7s var(--ease),
    top 0.7s var(--ease);
}

/* The ball: white, with a dark centre, ringed in the colour of the side that has it. */
.ball-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--pitch-ink);
  box-shadow:
    0 0 0 3px var(--team),
    0 1px 5px color-mix(in srgb, var(--pitch-token-text) 55%, transparent);
  transform: translate(-50%, -50%);
}

.ball-dot::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--pitch-token-text);
}

.ball-dot--shot {
  animation: pop 0.6s var(--ease) 2;
}

.ball-dot--goal {
  animation: pop 0.7s var(--ease) 2;
}

.shout {
  position: absolute;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--pitch-ink);
  color: var(--pitch-token-text);
  font-size: var(--fs-xs);
  font-weight: 900;
  letter-spacing: 0.06em;
  white-space: nowrap;
  animation: shout 1.4s var(--ease) both;
}

.shout small {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.75;
}

.shout-team,
.caption-team {
  padding: 1px var(--sp-2);
  border-radius: var(--radius-pill);
  color: var(--pitch-ink);
  font-size: var(--fs-xs);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.shout-team {
  margin-inline-end: var(--sp-1);
}

.banner {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--sp-2);
  background: var(--team);
  color: var(--pitch-ink);
  transform: translateY(-50%);
  animation: banner 3.2s var(--ease) both;
}

.banner strong {
  font-size: var(--fs-2xl);
  font-weight: 900;
  letter-spacing: 0.08em;
}

.banner span {
  font-size: var(--fs-sm);
  font-weight: 700;
}

/* Each side's code sits at its own goal, and never moves. */
.tag {
  position: absolute;
  bottom: var(--sp-1);
  z-index: 3;
  padding: 1px var(--sp-2);
  border-radius: var(--radius-pill);
  color: var(--pitch-ink);
  font-size: var(--fs-xs);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.tag--home {
  left: var(--sp-2);
}

.tag--away {
  right: var(--sp-2);
}

.caption {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
  font-weight: 600;
}

/* What each shape on the pitch means. */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--text-muted);
  font-size: var(--fs-xs);
}

.legend li {
  display: flex;
  align-items: center;
  gap: var(--sp-1-5);
}

.legend i {
  position: relative;
  flex-shrink: 0;
  transform: none;
  --c: var(--accent);
  --team: var(--accent);
}

.legend .dot--key {
  box-shadow: none;
  opacity: 1;
}

.legend .ball-dot--key {
  width: 11px;
  height: 11px;
  box-shadow: 0 0 0 2px var(--accent);
  background: var(--text);
}

.legend .ball-dot--key::after {
  inset: 3px;
  background: var(--surface);
}

.legend .mark--key {
  border-color: var(--surface);
}

.legend .mark--goal {
  width: 11px;
  height: 11px;
  transform: rotate(45deg);
  margin: 2px;
}

.legend .mark--wide {
  width: 10px;
  height: 10px;
}

@keyframes pop {
  50% {
    transform: translate(-50%, -50%) scale(1.6);
  }
}

@keyframes lit {
  50% {
    transform: translate(-50%, -50%) scale(1.7);
  }
}

@keyframes ping {
  0% {
    box-shadow: 0 0 0 0 var(--c);
  }
  100% {
    box-shadow: 0 0 0 14px transparent;
  }
}

@keyframes draw {
  0% {
    opacity: 0;
  }
  15%,
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes who {
  0% {
    opacity: 0;
  }
  12%,
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes shout {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) scale(1.2);
  }
  25%,
  80% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes banner {
  0% {
    opacity: 0;
    transform: translateY(-50%) scaleY(0);
  }
  10% {
    opacity: 1;
    transform: translateY(-50%) scaleY(1.15);
  }
  15%,
  85% {
    opacity: 1;
    transform: translateY(-50%) scaleY(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50%) scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ball,
  .dot {
    transition: none;
  }

  .ball-dot,
  .shout,
  .banner,
  .dot--lit,
  .mark--latest,
  .move,
  .who {
    animation: none;
  }

  .banner {
    opacity: 0;
  }
}
</style>
