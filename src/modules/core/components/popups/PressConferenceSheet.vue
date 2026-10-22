<script setup lang="ts">
/**
 * The press room after the squad for a tournament is named: one journalist at a
 * time asks a question, the manager answers boldly, carefully or bluntly, and sees
 * at once what it did to the federation, the fans and the player concerned. Leaving
 * early (or closing the sheet) costs a little goodwill for every question left.
 */
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { Landmark, Mic, Smile, Users } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { PersonFace } from "@/modules/core/components/face"
import { useWorldStore } from "@/modules/world/store"
import { answerText, PRESS_TONES, questionText } from "@/engine/career/press"
import type { PressAnswer, PressTone, Reporter } from "@/engine/world/types"
import { compText, msg, type Text } from "@/engine/text"

const { t } = useI18n()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)
/** The question on screen. */
const at = ref(0)

interface Row {
  reporter: Reporter
  question: Text
  answers: { tone: PressTone; text: Text }[]
  answer?: PressAnswer
  player: string
}

const info = world.derive((w) => {
  const conf = w.state.pendingPress
  if (!conf) return null
  const inst = w.state.competitions[conf.compId]
  const rows: Row[] = conf.questions.map((q) => {
    const p = q.playerId ? w.state.players[q.playerId] : undefined
    return {
      reporter: q.reporter,
      question: questionText(q, w),
      answers: PRESS_TONES.map((tone) => ({ tone, text: answerText(q, tone) })),
      answer: q.answer,
      player: p ? `${p.first} ${p.last}` : "",
    }
  })
  return {
    nationId: conf.nationId,
    comp: inst ? compText(inst.defId, inst.year) : msg("fx.window"),
    rows,
  }
}, null)

const row = computed(() => info.value?.rows[at.value] ?? null)
const last = computed(() => !!info.value && at.value >= info.value.rows.length - 1)

function say(tone: PressTone) {
  if (!row.value?.answer) world.sayToPress(at.value, tone)
}

function next() {
  if (last.value) sheet.value?.close()
  else at.value++
}

function signed(v: number) {
  const r = Math.round(v * 10) / 10
  return r > 0 ? `+${r}` : String(r)
}

function tone(v: number) {
  return v > 0 ? "var(--success)" : v < 0 ? "var(--danger)" : "var(--text-muted)"
}

function onClose() {
  world.closePress()
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="t('core.press.title')"
    max-height="90dvh"
    max-height-mobile="90dvh"
    :dismiss-on-outside-click="false"
    @close="onClose"
  >
    <div v-if="info && row" class="press">
      <div class="badge">
        <Mic :size="16" />
        {{ t("core.press.badge") }}
      </div>
      <div class="head">
        <NationFlag :id="info.nationId" :size="32" />
        <i18n-t keypath="core.press.lead" tag="p" class="lead">
          <template #comp>
            <strong>{{ $tx(info.comp) }}</strong>
          </template>
        </i18n-t>
      </div>
      <div
        class="dots"
        :aria-label="t('core.press.progress', { n: at + 1, total: info.rows.length })"
      >
        <span
          v-for="(r, i) in info.rows"
          :key="i"
          class="dot"
          :class="{ on: i === at, done: !!r.answer }"
        />
      </div>

      <div class="reporter">
        <PersonFace :reporter="row.reporter" head :size="56" />
        <div class="who">
          <strong>{{ row.reporter.first }} {{ row.reporter.last }}</strong>
          <span>{{ $tx(row.reporter.outlet) }}</span>
        </div>
      </div>
      <p class="ask">{{ $tx(row.question) }}</p>

      <div class="choices" role="radiogroup">
        <button
          v-for="a in row.answers"
          :key="a.tone"
          class="choice"
          :class="{ on: row.answer?.tone === a.tone }"
          role="radio"
          :aria-checked="row.answer?.tone === a.tone"
          :disabled="!!row.answer"
          @click="say(a.tone)"
        >
          {{ $tx(a.text) }}
        </button>
      </div>

      <div v-if="row.answer" class="after">
        <p class="reaction">{{ $tx(row.answer.reaction) }}</p>
        <div class="chips">
          <span class="chip" :style="{ '--chip': tone(row.answer.board) }">
            <Landmark :size="14" />
            {{ t("core.press.federation") }} {{ signed(row.answer.board) }}
          </span>
          <span class="chip" :style="{ '--chip': tone(row.answer.fans) }">
            <Users :size="14" />
            {{ t("core.press.fans") }} {{ signed(row.answer.fans) }}
          </span>
          <span
            v-if="row.answer.morale"
            class="chip"
            :style="{ '--chip': tone(row.answer.morale) }"
          >
            <Smile :size="14" />
            {{ t("core.press.morale", { name: row.player }) }} {{ signed(row.answer.morale) }}
          </span>
        </div>
      </div>
    </div>
    <template #footer>
      <div v-if="info && row" class="actions">
        <AppButton v-if="row.answer" variant="filled" block @click="next">
          {{ last ? t("core.press.finish") : t("core.press.next") }}
        </AppButton>
        <AppButton v-else variant="text" block @click="sheet?.close()">
          {{ t("core.press.leave") }}
        </AppButton>
        <p v-if="!row.answer" class="note">{{ t("core.press.leaveNote") }}</p>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.press {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: var(--fs-xs);
  font-weight: 700;
}

.head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  width: 100%;
}

.lead,
.note {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.lead strong {
  color: var(--text);
}

.dots {
  display: flex;
  gap: var(--sp-1);
}

.dot {
  width: 22px;
  height: 4px;
  border-radius: var(--radius-pill);
  background: var(--border-light);
}

.dot.done {
  background: color-mix(in srgb, var(--accent) 45%, var(--border-light));
}

.dot.on {
  background: var(--accent);
}

.reporter {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
}

.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: var(--fs-sm);
}

.who span {
  color: var(--text-muted);
  font-size: var(--fs-xs);
}

.ask {
  width: 100%;
  margin: 0;
  padding: var(--sp-3);
  border-radius: var(--radius) var(--radius) var(--radius) 2px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  font-size: var(--fs-md);
  font-weight: 600;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  width: 100%;
}

.choice {
  width: 100%;
  min-height: var(--tap-min);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  color: var(--text);
  font-size: var(--fs-sm);
  text-align: start;
  cursor: pointer;
}

.choice.on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
}

.choice:disabled:not(.on) {
  opacity: 0.5;
  cursor: default;
}

.after {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  width: 100%;
}

.reaction {
  margin: 0;
  font-size: var(--fs-sm);
  font-style: italic;
  color: var(--text-muted);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--chip) 14%, transparent);
  color: var(--chip);
  font-size: var(--fs-xs);
  font-weight: 700;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  text-align: center;
  padding: var(--sp-3) var(--sp-4) calc(var(--sp-3) + var(--safe-bottom));
}
</style>
