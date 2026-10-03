<script setup lang="ts">
/**
 * Invitational tournaments: answer another federation's invitation, see the ones
 * the user's nation is in, and set one up — a free window, three or seven nations
 * that want to come, a format — with the user's nation hosting.
 */
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { Check } from "@lucide/vue"
import {
  AppButton,
  AppButtonGroup,
  AppCard,
  AppEmptyState,
  AppSectionHeader,
} from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { compName, nationName } from "@/i18n/text"
import { formatDate } from "@/i18n/dates"
import { useWorldStore } from "@/modules/world/store"
import {
  fits,
  formatsFor,
  matchDays,
  roundsOf,
  windowById,
} from "@/engine/competition/defs/invitational"
import { candidatesFor, openWindows, type SetupProblem } from "@/engine/world/invitational"
import type { InvitationalFormat } from "@/engine/competition/types"
import type { MatchWindow } from "@/engine/calendar/windows"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const world = useWorldStore()
const me = world.derive((w) => w.state.career.nationId, null as string | null)

const invite = world.derive((w) => {
  const inv = w.state.invite
  const win = inv && windowById(inv.window)
  return inv && win ? { ...inv, from: win.start, to: win.end } : null
}, null)

const mine = world.derive(
  (w) =>
    Object.values(w.state.competitions)
      .filter(
        (c) =>
          c.kind === "invitational" &&
          c.status !== "done" &&
          !!me.value &&
          !!c.invitational?.teams.includes(me.value)
      )
      .sort((a, b) => a.start.localeCompare(b.start)),
  []
)

const windows = world.derive((w) => (me.value ? openWindows(w, me.value) : []), [] as MatchWindow[])
// Opened from the home screen or the calendar: that window is already chosen.
const asked = String(route.query.window ?? "")
const windowId = ref<string | null>(windows.value.some((w) => w.id === asked) ? asked : null)
const size = ref<"4" | "8">("4")
const picked = ref<string[]>([])
const format = ref<InvitationalFormat | null>(null)
const problem = ref<SetupProblem | null>(null)

const chosen = computed(() => windows.value.find((w) => w.id === windowId.value) ?? null)
const needed = computed(() => Number(size.value) - 1)

const candidates = world.derive((w) => {
  const win = chosen.value
  return win && me.value ? candidatesFor(w, me.value, win) : []
}, [])

const formats = computed(() => {
  const win = chosen.value
  const n = Number(size.value)
  if (!win) return []
  return formatsFor(n)
    .filter((f) => fits(win, f, n))
    .map((f) => ({ id: f, days: matchDays(win, roundsOf(f, n)) ?? [] }))
})

// A new window or size starts the choice of teams and format again.
watch([windowId, size], () => {
  picked.value = picked.value.filter((id) => candidates.value.some((c) => c.id === id))
  picked.value = picked.value.slice(0, needed.value)
  format.value = null
  problem.value = null
})

function toggle(id: string) {
  if (picked.value.includes(id)) picked.value = picked.value.filter((x) => x !== id)
  else if (picked.value.length < needed.value) picked.value = [...picked.value, id]
}

const ready = computed(
  () => !!chosen.value && picked.value.length === needed.value && !!format.value
)

function create() {
  if (!ready.value || !chosen.value || !format.value) return
  const out = world.hostInvitational(chosen.value.id, picked.value, format.value)
  if ("id" in out) router.push(`/competitions/${out.id}`)
  else problem.value = out.problem
}

function answer(yes: boolean) {
  const out = world.answerInvite(yes)
  if (out && "id" in out) router.push(`/competitions/${out.id}`)
}

const sizeOptions = computed(() => [
  { value: "4", label: t("invitational.size", { n: 4 }) },
  { value: "8", label: t("invitational.size", { n: 8 }) },
])
</script>

<template>
  <PageShell back :title="t('invitational.title')" :subtitle="t('invitational.subtitle')">
    <AppEmptyState v-if="!me" :title="t('invitational.noJob')" />
    <template v-else>
      <template v-if="invite">
        <AppSectionHeader :title="t('invitational.invite.title')" />
        <AppCard padding="md" class="invite">
          <div class="invite-head">
            <NationFlag :id="invite.teams[0]" :size="32" />
            <span>
              {{
                t("invitational.invite.pitch", {
                  host: nationName(invite.teams[0]),
                  n: invite.teams.length,
                })
              }}
            </span>
          </div>
          <div class="muted">
            {{ formatDate(invite.from) }} – {{ formatDate(invite.to) }} ·
            {{ t(`invitational.format.${invite.format}.name`) }}
          </div>
          <div class="guests">
            <NationFlag
              v-for="g in invite.teams.slice(1)"
              :id="g"
              :key="g"
              :size="16"
              name="short"
            />
          </div>
          <div class="muted">
            {{ t("invitational.invite.expires", { date: formatDate(invite.expires) }) }}
          </div>
          <div class="actions">
            <AppButton variant="text" @click="answer(false)">
              {{ t("invitational.invite.decline") }}
            </AppButton>
            <AppButton variant="filled" @click="answer(true)">
              {{ t("invitational.invite.accept") }}
            </AppButton>
          </div>
        </AppCard>
      </template>

      <template v-if="mine.length">
        <AppSectionHeader :title="t('invitational.yours')" />
        <div class="list">
          <RouterLink v-for="c in mine" :key="c.id" :to="`/competitions/${c.id}`" class="row">
            <NationFlag :id="c.hosts[0]" :size="20" />
            <span class="row-text">
              {{ compName(c) }}
              <small class="muted">
                {{ formatDate(c.start) }} ·
                {{ t(`invitational.format.${c.invitational?.format ?? "knockout"}.name`) }}
                · {{ t("invitational.teams", { n: c.invitational?.teams.length ?? 0 }) }}
              </small>
            </span>
          </RouterLink>
        </div>
      </template>

      <AppSectionHeader :title="t('invitational.organise')" />
      <p class="intro">{{ t("invitational.intro") }}</p>

      <AppSectionHeader :title="t('invitational.step.window')" />
      <AppEmptyState v-if="!windows.length" :title="t('invitational.noWindow')" />
      <div v-else class="choices">
        <button
          v-for="w in windows"
          :key="w.id"
          class="choice"
          :class="{ on: w.id === windowId }"
          @click="windowId = w.id"
        >
          <strong>{{ formatDate(w.start) }} – {{ formatDate(w.end) }}</strong>
          <small class="muted">{{ t("invitational.days", { n: w.slots.length }) }}</small>
        </button>
      </div>

      <template v-if="chosen">
        <AppSectionHeader :title="t('invitational.step.teams')" />
        <AppButtonGroup v-model="size" :options="sizeOptions" block size="sm" />
        <p class="muted count">
          {{ t("invitational.picked", { n: picked.length, of: needed }) }}
        </p>
        <AppEmptyState v-if="!candidates.length" :title="t('invitational.noTeams')" />
        <p v-else-if="candidates.length < needed" class="muted">
          {{ t("invitational.tooFew") }}
        </p>
        <div class="list">
          <button
            v-for="c in candidates"
            :key="c.id"
            class="row pick"
            :class="{ on: picked.includes(c.id) }"
            :disabled="!picked.includes(c.id) && picked.length >= needed"
            @click="toggle(c.id)"
          >
            <span class="tick"><Check v-if="picked.includes(c.id)" :size="14" /></span>
            <NationFlag :id="c.id" :size="20" name />
            <span class="muted rank">
              {{ c.rank ? `#${c.rank}` : "—" }} · {{ Math.round(c.points) }}
            </span>
          </button>
        </div>

        <template v-if="picked.length === needed">
          <AppSectionHeader :title="t('invitational.step.format')" />
          <div class="choices">
            <button
              v-for="f in formats"
              :key="f.id"
              class="choice"
              :class="{ on: format === f.id }"
              @click="format = f.id"
            >
              <strong>{{ t(`invitational.format.${f.id}.name`) }}</strong>
              <small class="muted">{{ t(`invitational.format.${f.id}.hint${size}`) }}</small>
              <small class="muted">
                {{ f.days.map((d) => formatDate(d)).join(" · ") }}
              </small>
            </button>
          </div>
        </template>

        <p v-if="problem" class="problem">{{ t(`invitational.problem.${problem}`) }}</p>
        <AppButton variant="filled" block :disabled="!ready" class="create" @click="create">
          {{ t("invitational.create") }}
        </AppButton>
      </template>
    </template>
  </PageShell>
</template>

<style scoped>
.intro,
.count {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.muted {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.invite :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.invite-head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-weight: 600;
}

.guests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-3);
  font-size: var(--fs-sm);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-2);
}

.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  width: 100%;
  padding: var(--sp-2) var(--sp-3);
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: none;
  color: var(--text);
  font: inherit;
  text-align: start;
  text-decoration: none;
}

.row:last-child {
  border-bottom: none;
}

.row-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pick {
  cursor: pointer;
}

.pick:disabled {
  opacity: 0.45;
  cursor: default;
}

.pick.on {
  background: var(--accent-subtle);
}

.tick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm, 4px);
  border: 1px solid var(--border);
  color: var(--accent);
}

.pick.on .tick {
  border-color: var(--accent);
}

.rank {
  margin-inline-start: auto;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.choices {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--sp-2);
}

.choice {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.choice.on {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.choice small {
  font-size: var(--fs-xs);
}

.problem {
  margin: 0;
  color: var(--danger);
  font-size: var(--fs-sm);
}

.create {
  margin-top: var(--sp-2);
}
</style>
