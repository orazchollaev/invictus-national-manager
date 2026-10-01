<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { CircleCheck, CircleX, Trophy } from "@lucide/vue"
import { AppToggle } from "@/components/ui"
import type { HostCheck, HostRequirement } from "@/engine/world/stadiums"
import { seats } from "@/modules/stadiums/utils/hosting"

const props = defineProps<{
  title: string
  req: HostRequirement
  /** The grounds as they stand. */
  now: HostCheck
  /** Once the projects under way are finished. */
  planned: HostCheck
  hosting: { id: string; name: string }[]
  /** Show the bid switch (the user's own nation). */
  canBid: boolean
  bid: boolean
}>()

const emit = defineEmits<{ bid: [value: boolean] }>()

const { t } = useI18n()

const percent = computed(() => Math.round(props.now.score * 100))
const status = computed(() =>
  props.now.ready
    ? { label: t("stadiums.card.ready"), tone: "var(--success)" }
    : props.planned.ready
      ? { label: t("stadiums.card.readyAfter"), tone: "var(--pos-2)" }
      : { label: t("stadiums.card.percentReady", { n: percent.value }), tone: "var(--warning)" }
)
</script>

<template>
  <article class="host" :class="{ ready: now.ready }">
    <header class="host-head">
      <Trophy :size="18" class="host-icon" />
      <span class="host-title">{{ title }}</span>
      <span class="host-status" :style="{ color: status.tone }">{{ status.label }}</span>
    </header>

    <div
      class="bar"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span class="bar-planned" :style="{ width: `${planned.score * 100}%` }"></span>
      <span
        class="bar-now"
        :style="{ width: `${now.score * 100}%`, background: status.tone }"
      ></span>
    </div>

    <ul class="checks">
      <li>
        <CircleCheck v-if="now.venues >= req.venues" :size="16" class="ok" />
        <CircleX v-else :size="16" class="no" />
        <span class="check-text">
          {{ t("stadiums.card.grounds", { seats: seats(req.minCapacity) }) }}
        </span>
        <strong>
          {{ now.venues }}/{{ req.venues }}
          <small v-if="planned.venues > now.venues" class="soon">→ {{ planned.venues }}</small>
        </strong>
      </li>
      <li>
        <CircleCheck v-if="now.showpiece" :size="16" class="ok" />
        <CircleX v-else :size="16" class="no" />
        <span class="check-text">
          {{ t("stadiums.card.showpiece", { seats: seats(req.showpiece) }) }}
        </span>
        <strong>{{ seats(now.biggest) }}</strong>
      </li>
    </ul>

    <div v-if="hosting.length" class="hosting">
      <RouterLink
        v-for="h in hosting"
        :key="h.id"
        :to="`/competitions/${h.id}`"
        class="hosting-chip"
      >
        {{ t("stadiums.card.hosting", { name: h.name }) }}
      </RouterLink>
    </div>

    <label v-if="canBid" class="bid">
      <span>
        <span class="bid-title">{{ t("stadiums.card.bid") }}</span>
        <span class="bid-hint">{{ t("stadiums.card.bidHint") }}</span>
      </span>
      <AppToggle
        :model-value="bid"
        :aria-label="t('stadiums.card.bid')"
        @update:model-value="emit('bid', $event)"
      />
    </label>
  </article>
</template>

<style scoped>
.host {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.host.ready {
  border-color: color-mix(in srgb, var(--success) 45%, transparent);
}

.host-head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.host-icon {
  color: var(--gold);
  flex-shrink: 0;
}

.host-title {
  flex: 1;
  min-width: 0;
  font-weight: 700;
}

.host-status {
  font-size: var(--fs-xs);
  font-weight: 700;
  white-space: nowrap;
}

.bar {
  position: relative;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
  overflow: hidden;
}

.bar span {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  transition: width var(--dur) var(--ease);
}

.bar-planned {
  background: color-mix(in srgb, var(--pos-2) 35%, transparent);
}

.checks {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1-5);
  font-size: var(--fs-sm);
}

.checks li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.check-text {
  flex: 1;
  min-width: 0;
  color: var(--text-muted);
}

.ok {
  color: var(--success);
  flex-shrink: 0;
}

.no {
  color: var(--danger);
  flex-shrink: 0;
}

.soon {
  color: var(--pos-2);
  font-weight: 700;
}

.hosting {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.hosting-chip {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--gold-soft);
  color: var(--gold-text);
  font-size: var(--fs-xs);
  font-weight: 700;
  text-decoration: none;
}

.bid {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding-top: var(--sp-2);
  border-top: 1px solid var(--border-light);
  cursor: pointer;
}

.bid > span {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.bid-title {
  font-weight: 600;
  font-size: var(--fs-sm);
}

.bid-hint {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}
</style>
