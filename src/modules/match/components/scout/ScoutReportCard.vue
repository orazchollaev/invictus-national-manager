<script setup lang="ts">
import { computed } from "vue"
import { RouterLink } from "vue-router"
import { ArrowDown, ArrowUp, Lightbulb } from "@lucide/vue"
import { AppButton, AppCard, AppChip, AppSectionHeader } from "@/components/ui"
import type { ScoutReport } from "@/engine/match/scouting"
import type { Player } from "@/engine/types"
import { matchupNotes } from "@/modules/match/utils/scout"

const props = defineProps<{
  report: ScoutReport
  name: string
  player: (id: string) => Player | undefined
  /** The assistant sets the instructions himself, so there is nothing to apply. */
  assisted?: boolean
}>()

const emit = defineEmits<{ apply: [] }>()

const notes = computed(() => matchupNotes(props.report))
const who = { you: "You", them: "Them" }
</script>

<template>
  <AppCard padding="md" class="scout">
    <AppSectionHeader :title="`Scouting: ${name}`" />
    <p class="shape">{{ report.formation }}</p>
    <div class="traits">
      <AppChip v-for="t in report.traits" :key="t" variant="accent" size="sm">{{ t }}</AppChip>
    </div>

    <h3 class="sub">Players to watch</h3>
    <ul class="players">
      <li v-for="k in report.key" :key="k.playerId">
        <RouterLink :to="`/player/${k.playerId}`" class="player">
          <span class="player-name">
            {{ player(k.playerId)?.last ?? "—" }}
            <span class="player-pos">{{ player(k.playerId)?.pos }}</span>
          </span>
          <span class="player-note">
            {{ k.note }} · {{ k.archetype }}
            <template v-if="k.role && k.role !== k.archetype">({{ k.role }})</template>
          </span>
        </RouterLink>
      </li>
    </ul>

    <h3 class="sub">How your styles meet</h3>
    <p v-if="!notes.good.length && !notes.bad.length" class="quiet">
      Neither way of playing has an edge over the other.
    </p>
    <ul v-else class="notes">
      <li v-for="n in notes.good" :key="`g-${n.who}-${n.label}`" class="note note--good">
        <ArrowUp :size="14" />
        <span>
          <strong>{{ who[n.who] }}</strong>
          · {{ n.label }}
        </span>
      </li>
      <li v-for="n in notes.bad" :key="`b-${n.who}-${n.label}`" class="note note--bad">
        <ArrowDown :size="14" />
        <span>
          <strong>{{ who[n.who] }}</strong>
          · {{ n.label }}
        </span>
      </li>
    </ul>

    <div class="advice" :class="{ 'advice--none': !report.advice.changes.length }">
      <Lightbulb :size="18" class="advice-icon" />
      <div class="advice-body">
        <template v-if="report.advice.changes.length">
          <strong>Your assistant suggests</strong>
          <ul class="changes">
            <li v-for="c in report.advice.changes" :key="c">{{ c }}</li>
          </ul>
          <p v-if="report.advice.reasons.length" class="quiet">
            {{ report.advice.reasons.join(" · ") }}
          </p>
          <p v-if="assisted" class="quiet">Your assistant sets this up for you.</p>
          <AppButton v-else variant="tonal" block @click="emit('apply')">
            Apply to my tactics
          </AppButton>
        </template>
        <template v-else>
          <strong>No changes needed</strong>
          <p class="quiet">Your set-up already suits the way they play.</p>
        </template>
      </div>
    </div>
  </AppCard>
</template>

<style scoped>
.scout :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.shape {
  margin: 0;
  font-weight: 700;
}

.traits {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.sub {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.players,
.notes,
.changes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.player {
  display: flex;
  flex-direction: column;
  padding: var(--sp-1) 0;
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px solid var(--border-light);
}

.player-name {
  font-weight: 700;
}

.player-pos {
  margin-inline-start: var(--sp-1);
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-muted);
}

.player-note,
.quiet {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.note {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-1-5);
  padding: 2px 0;
  font-size: var(--fs-sm);
}

.note svg {
  flex-shrink: 0;
  margin-top: 3px;
}

.note--good svg {
  color: var(--success);
}

.note--bad svg {
  color: var(--danger);
}

.advice {
  display: flex;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
  padding: var(--sp-3);
  border-radius: var(--radius);
  background: var(--accent-subtle);
}

.advice--none {
  background: var(--surface);
  border: 1px solid var(--border-light);
}

.advice-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.advice-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--sp-1);
  min-width: 0;
}

.changes {
  font-size: var(--fs-sm);
}
</style>
