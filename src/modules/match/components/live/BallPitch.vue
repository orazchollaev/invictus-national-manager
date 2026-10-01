<script setup lang="ts">
import { computed } from "vue"
import type { Lane, Side } from "@/engine/match/types"

const props = defineProps<{
  /** Who has the ball, which lane they work and how far up the pitch. */
  ball: { side: Side; lane: Lane; depth: 1 | 2 | 3 }
  home: string
  away: string
  /** Each nation's own colour. */
  homeColor: string
  awayColor: string
  /** Bumped by something worth a pop: a goal, a shot, a corner. */
  flash?: { key: number; kind: "goal" | "shot"; label?: string } | null
  /** A goal just scored, shown across the pitch for a moment. */
  banner?: { key: number; title: string; text: string; color: string } | null
}>()

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
/** A chevron's points, pointing the way the side attacks. */
const points = computed(() => (props.ball.side === "home" ? "6,4 18,16 6,28" : "18,4 6,16 18,28"))
</script>

<template>
  <div class="field" :style="{ '--team': team }">
    <svg class="lines" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
      <rect x="1" y="1" width="198" height="98" />
      <line x1="100" y1="1" x2="100" y2="99" />
      <circle cx="100" cy="50" r="13" />
      <rect x="1" y="26" width="28" height="48" />
      <rect x="171" y="26" width="28" height="48" />
      <rect x="1" y="39" width="10" height="22" />
      <rect x="189" y="39" width="10" height="22" />
    </svg>
    <div v-if="banner" :key="banner.key" class="banner" :style="{ '--team': banner.color }">
      <strong>{{ banner.title }}</strong>
      <span>{{ banner.text }}</span>
    </div>
    <div class="ball" :style="{ left: `${x}%`, top: `${y}%` }">
      <span
        :key="flash?.key"
        class="chevrons"
        :class="[`chevrons--${ball.side}`, flash && `chevrons--${flash.kind}`]"
      >
        <svg v-for="n in ball.depth" :key="n" viewBox="0 0 24 32" width="26" height="34">
          <!-- Team colour as a thick edge round a white core, so it reads on any nation's colour. -->
          <polyline class="edge" :points="points" />
          <polyline class="core" :points="points" />
        </svg>
      </span>
      <span v-if="flash?.label" :key="flash.key" class="shout">{{ flash.label }}</span>
    </div>
    <span class="tag" :class="ball.side === 'home' ? 'tag--home' : 'tag--away'">{{ code }}</span>
  </div>
</template>

<style scoped>
.field {
  position: relative;
  aspect-ratio: 2 / 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--pitch-a);
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--pitch-line);
  stroke-width: 0.8;
  vector-effect: non-scaling-stroke;
}

.lines * {
  vector-effect: non-scaling-stroke;
}

.ball {
  position: absolute;
  width: 0;
  height: 0;
  transition:
    left 0.7s var(--ease),
    top 0.7s var(--ease);
}

.chevrons {
  position: absolute;
  display: flex;
  transform: translate(-50%, -50%);
}

.chevrons svg {
  margin-inline: -7px;
  overflow: visible;
}

.edge,
.core {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.edge {
  stroke: var(--team);
  stroke-width: 9;
}

.core {
  stroke: var(--pitch-ink);
  stroke-width: 4;
}

.chevrons--shot {
  animation: pop 0.6s var(--ease) 2;
}

.chevrons--goal {
  animation: pop 0.7s var(--ease) 2;
}

.shout {
  position: absolute;
  bottom: 30px;
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

.banner {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  z-index: 1;
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

.tag {
  position: absolute;
  bottom: var(--sp-1);
  padding: 1px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--team);
  color: var(--pitch-ink);
  font-size: var(--fs-xs);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.tag--home {
  right: var(--sp-2);
}

.tag--away {
  left: var(--sp-2);
}

@keyframes pop {
  50% {
    transform: translate(-50%, -50%) scale(1.6);
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
  .ball {
    transition: none;
  }

  .chevrons,
  .shout,
  .banner {
    animation: none;
  }

  .banner {
    opacity: 0;
  }
}
</style>
