<script setup lang="ts">
import { computed } from "vue"
import type { CareerReview } from "@/engine/world/types"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { verdictLabel, verdictTone } from "@/modules/career/utils/verdict"

const props = defineProps<{ review: CareerReview }>()

const world = useWorldStore()
const champion = computed(() =>
  props.review.winner && props.review.winner !== props.review.nationId
    ? world.world?.def(props.review.winner).name
    : null
)
</script>

<template>
  <section class="head" :style="{ '--verdict': verdictTone(review.verdict) }">
    <span class="verdict">{{ verdictLabel(review.verdict) }}</span>
    <NationFlag :id="review.nationId" :size="56" />
    <div class="comp">{{ review.name }}</div>
    <div class="reached">{{ review.reached }}</div>
    <div class="record">
      <span>
        <strong>{{ review.played }}</strong>
        P
      </span>
      <span>
        <strong>{{ review.won }}</strong>
        W
      </span>
      <span>
        <strong>{{ review.drawn }}</strong>
        D
      </span>
      <span>
        <strong>{{ review.lost }}</strong>
        L
      </span>
      <span>
        <strong>{{ review.gf }}–{{ review.ga }}</strong>
        goals
      </span>
    </div>
    <div v-if="champion" class="champion">Won by {{ champion }}</div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--verdict) 45%, transparent);
  background:
    radial-gradient(
      circle at 50% 0,
      color-mix(in srgb, var(--verdict) 22%, transparent),
      transparent 70%
    ),
    var(--surface);
  text-align: center;
}

.verdict {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--verdict) 18%, transparent);
  color: var(--verdict);
  font-size: var(--fs-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  animation: pop 0.5s var(--ease) both;
}

.comp {
  margin-top: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.reached {
  font-size: var(--fs-xl);
  font-weight: 800;
  line-height: 1.15;
}

.record {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-3);
  margin-top: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.record strong {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.champion {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

@keyframes pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
