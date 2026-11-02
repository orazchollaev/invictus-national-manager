<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { Tag } from "@lucide/vue"
import type { Lane, Side } from "@/engine/match/types"
import type { Dot, Spot } from "@/modules/match/utils/shape"

const props = defineProps<{
  /** Who has the ball, which lane they work and how far up the pitch. */
  ball: { side: Side; lane: Lane; depth: 1 | 2 | 3 }
  home: string
  away: string
  /** Each nation's own colour. */
  homeColor: string
  awayColor: string
  /** A goal just scored, shown across the pitch for a moment. */
  banner?: { key: number; title: string; text: string; color: string } | null
  /** Each side's players, in the places their formation gives them. */
  dots?: Record<Side, Dot[]>
  /** The side whose players are bigger on the pitch and can be named. */
  mine?: Side | null
  nameOf?: (id: string) => string
}>()

const { t } = useI18n()

/** Home attacks to the right, away to the left; the ball is in its own third, midfield or the final third. */
const x = computed(() => {
  const reach = { 1: 30, 2: 52, 3: 78 }[props.ball.depth]
  return props.ball.side === "home" ? reach : 100 - reach
})
const y = computed(() => {
  const top = props.ball.lane === "left" ? 24 : props.ball.lane === "right" ? 76 : 50
  return props.ball.side === "home" ? top : 100 - top
})
const code = computed(() => (props.ball.side === "home" ? props.home : props.away))
const team = computed(() => (props.ball.side === "home" ? props.homeColor : props.awayColor))
const colorOf = (s: Side) => (s === "home" ? props.homeColor : props.awayColor)

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

/** Names on the pitch are the user's own players, and only when asked for. */
const showNames = ref(false)
</script>

<template>
  <div class="pitch">
    <div class="field" :style="{ '--team': team }">
      <!-- Each half in its own side's colour: the left goal is the home side's, the right the away side's. -->
      <span class="half half--home" :style="{ background: homeColor }"></span>
      <span class="half half--away" :style="{ background: awayColor }"></span>
      <!-- The markings are the real pitch's, in metres: 105 × 68. -->
      <svg class="lines" viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true">
        <rect x="0.2" y="0.2" width="104.6" height="67.6" />
        <line x1="52.5" y1="0.2" x2="52.5" y2="67.8" />
        <circle cx="52.5" cy="34" r="9.15" />
        <rect x="0.2" y="13.84" width="16.3" height="40.32" />
        <rect x="88.5" y="13.84" width="16.3" height="40.32" />
        <rect x="0.2" y="24.84" width="5.3" height="18.32" />
        <rect x="99.5" y="24.84" width="5.3" height="18.32" />
        <path d="M16.5 26.69 A9.15 9.15 0 0 1 16.5 41.31" />
        <path d="M88.5 26.69 A9.15 9.15 0 0 0 88.5 41.31" />
        <circle class="spot" cx="52.5" cy="34" r="0.5" />
        <circle class="spot" cx="11" cy="34" r="0.5" />
        <circle class="spot" cx="94" cy="34" r="0.5" />
        <rect class="goal" x="0" y="30.34" width="1.6" height="7.32" />
        <rect class="goal" x="103.4" y="30.34" width="1.6" height="7.32" />
      </svg>

      <span
        v-for="p in players"
        :key="`${p.side}-${p.id}`"
        class="dot"
        :class="{ 'dot--mine': mine === p.side }"
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
        <span class="ball-shadow"></span>
        <!-- A football: white, with its black panels. -->
        <svg class="ball-dot" viewBox="-10 -10 20 20" aria-hidden="true">
          <circle class="ball-skin" cx="0" cy="0" r="9" />
          <path
            class="ball-seam"
            d="M0 -3.6 L0 -9 M3.4 -1.1 L8.6 -2.8 M2.1 2.9 L5.3 7.3 M-2.1 2.9 L-5.3 7.3 M-3.4 -1.1 L-8.6 -2.8"
          />
          <polygon class="ball-panel" points="0,-3.6 3.4,-1.1 2.1,2.9 -2.1,2.9 -3.4,-1.1" />
          <path
            class="ball-panel"
            d="M-4 -8.1 L0 -9 L4 -8.1 L2.2 -6 L-2.2 -6 Z M8.6 -2.8 L9 0.6 L7 2.4 L5.5 -0.2 Z M-8.6 -2.8 L-9 0.6 L-7 2.4 L-5.5 -0.2 Z M5.3 7.3 L1.8 8.9 L0.8 6.7 L3.2 5.2 Z M-5.3 7.3 L-1.8 8.9 L-0.8 6.7 L-3.2 5.2 Z"
          />
        </svg>
      </div>
      <span class="tag tag--home" :style="{ background: homeColor }">{{ home }}</span>
      <span class="tag tag--away" :style="{ background: awayColor }">{{ away }}</span>
    </div>

    <p class="caption" aria-live="polite">
      <b class="caption-team" :style="{ background: team }">{{ code }}</b>
      {{ caption }}
    </p>
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
  aspect-ratio: 105 / 68;
  border-radius: var(--radius);
  overflow: hidden;
  /* Mown stripes, ten across the length of the pitch. */
  background: repeating-linear-gradient(90deg, var(--pitch-a) 0 10%, var(--pitch-b) 10% 20%);
}

/* A faint wash of each side's colour over its half. */
.half {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  opacity: 0.12;
  pointer-events: none;
}

.half--home {
  left: 0;
}

.half--away {
  right: 0;
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--pitch-line);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}

.lines * {
  vector-effect: non-scaling-stroke;
}

.lines .spot {
  fill: var(--pitch-line);
  stroke: none;
}

.lines .goal {
  fill: color-mix(in srgb, var(--pitch-ink) 25%, transparent);
  stroke: none;
}

/* A player is a disc in his nation's colour with a white rim; the user's own are larger. */
.dot {
  position: absolute;
  z-index: 1;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--c);
  box-shadow:
    0 0 0 2px var(--pitch-ink),
    0 2px 4px color-mix(in srgb, var(--pitch-token-text) 55%, transparent);
  transform: translate(-50%, -50%);
  transition:
    left 0.7s var(--ease),
    top 0.7s var(--ease);
}

.dot--mine {
  width: 15px;
  height: 15px;
}

.dot-name {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 4px;
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
  margin-bottom: 4px;
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

/* The ball: a white football with its black panels, and a shadow on the grass. */
.ball-dot {
  position: absolute;
  width: 18px;
  height: 18px;
  overflow: visible;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 1px 1.5px color-mix(in srgb, var(--pitch-token-text) 60%, transparent));
}

.ball-skin {
  fill: var(--pitch-ink);
  stroke: color-mix(in srgb, var(--pitch-token-text) 45%, transparent);
  stroke-width: 0.8;
}

.ball-panel {
  fill: var(--pitch-token-text);
}

.ball-seam {
  fill: none;
  stroke: var(--pitch-token-text);
  stroke-width: 0.7;
}

.ball-shadow {
  position: absolute;
  width: 16px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--pitch-token-text) 35%, transparent);
  transform: translate(-45%, 4px);
}

.caption-team {
  padding: 1px var(--sp-2);
  border-radius: var(--radius-pill);
  color: var(--pitch-ink);
  font-size: var(--fs-xs);
  font-weight: 800;
  letter-spacing: 0.04em;
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

  .banner {
    animation: none;
    opacity: 0;
  }
}
</style>
