<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { Sparkles } from "@lucide/vue"
import {
  AppButton,
  AppButtonGroup,
  AppCard,
  AppField,
  AppSectionHeader,
  AppSelect,
  AppSheet,
  AppSubTabBar,
  AppToggle,
} from "@/components/ui"
import { PageShell, StatPill, StickyCta } from "@/modules/core/components"
import { PitchView } from "@/modules/squad/components/pitch"
import {
  lineOptions,
  mentalityOptions,
  pressingOptions,
  tempoOptions,
  widthOptions,
} from "@/modules/squad/constants"
import { PlayerRow } from "@/modules/squad/components/list"
import { useWorldStore } from "@/modules/world/store"
import { FORMATIONS, FORMATION_LIST } from "@/engine/match/formations"
import { aiTeamSheet, pickBench } from "@/engine/ai/squad"
import { matchAbility, positionFit, positionGroup } from "@/engine/players/ability"
import type { Role } from "@/engine/match/roles"
import type { Formation, Level, Mentality, Tactics } from "@/engine/match/types"
import type { Player, PositionGroup } from "@/engine/types"
import type { UserTeam } from "@/engine/world/types"
import { showAlert, showConfirm } from "@/composables/useDialog"
import { unavailableIn } from "@/modules/squad/utils/availability"
import { spiritLabel, spiritOf } from "@/engine/players/bonds"
import { bondLines, chemistryWith, signed } from "@/modules/squad/utils/chemistry"
import { carryFormation, placePlayer, roleChoices, setSlotRole } from "@/modules/squad/utils/lineup"
import { useSettingsStore } from "@/modules/settings/store"

const { t } = useI18n()
const settings = useSettingsStore()

const router = useRouter()
const world = useWorldStore()

/** The squad if one is named, otherwise the whole pool. */
const squad = world.derive((w) => {
  const id = w.state.career.nationId
  if (!id) return [] as Player[]
  const n = w.state.nations[id]
  return n.squad.length ? n.squad.map((pid) => w.state.players[pid]).filter(Boolean) : w.pool(id)
}, [] as Player[])

const byId = computed(() => new Map(squad.value.map((p) => [p.id, p])))
const player = (id: string) => byId.value.get(id) ?? world.world?.state.players[id]

/** No eleven saved yet: the first visit is the set-up, starting from a blank sheet. */
const setup = !world.world?.state.userTeam

function initial(): UserTeam {
  const ut = world.world!.state.userTeam
  if (ut) return JSON.parse(JSON.stringify(ut)) as UserTeam
  return {
    tactics: { formation: "4-4-2", mentality: 0, pressing: 1, tempo: 1, line: 1, width: 1 },
    xi: [],
    bench: [],
  }
}

const team = ref(initial())
/** On the set-up the formation is the user's first choice; the pitch waits for it. */
const formationChosen = ref(!setup)
const selectedSlot = ref<number | null>(null)

/** Leaving with edits that were never saved would play the old eleven; ask first. */
const baseline = JSON.stringify(team.value)
let saved = false
onBeforeRouteLeave(async () => {
  if (saved || JSON.stringify(team.value) === baseline) return true
  return showConfirm(t("squad.tactics.leaveConfirm"), {
    confirmLabel: t("squad.tactics.leave"),
    dangerous: true,
  })
})

const positions = computed(() => FORMATIONS[team.value.tactics.formation])
const slots = computed(() => positions.value.map((_, i) => team.value.xi[i]?.playerId || null))
const inXI = computed(() => new Set(slots.value.filter(Boolean) as string[]))

function setFormation(f: Formation) {
  formationChosen.value = true
  team.value.tactics.formation = f
  team.value.xi = carryFormation(team.value.xi, FORMATIONS[f])
}

const GROUP_OPTIONS = [
  { value: "ALL", label: t("common.all") },
  { value: "GK", label: t("squad.pos.GK") },
  { value: "DEF", label: t("squad.pos.DEF") },
  { value: "MID", label: t("squad.pos.MID") },
  { value: "FWD", label: t("squad.pos.FWD") },
]

/** Opens on the tapped slot's line; "ALL" shows the whole squad. */
const groupFilter = ref<PositionGroup | "ALL">("ALL")
watch(selectedSlot, (i) => {
  if (i !== null) groupFilter.value = positionGroup(FORMATIONS[team.value.tactics.formation][i])
})

const candidates = computed(() => {
  if (selectedSlot.value === null) return []
  const pos = FORMATIONS[team.value.tactics.formation][selectedSlot.value]
  const g = groupFilter.value
  const pool =
    g === "ALL"
      ? squad.value
      : squad.value.filter((p) => [p.pos, ...p.alt].some((q) => positionGroup(q) === g))
  return [...pool].sort(
    (a, b) => matchAbility(b) * positionFit(b, pos) - matchAbility(a) * positionFit(a, pos)
  )
})

function choose(p: Player) {
  const i = selectedSlot.value
  if (i === null) return
  team.value.xi = placePlayer(team.value.xi, positions.value, i, p.id, player)
  selectedSlot.value = null
}

/** Who is in the eleven now, and what they give each other. */
const eleven = computed(() =>
  slots.value
    .filter(Boolean)
    .map((id) => player(id!)!)
    .filter(Boolean)
)
const spirit = computed(() => spiritOf(eleven.value))
const ties = computed(() => bondLines(eleven.value, (id) => world.world?.clubs.get(id)?.name))

/** What a player would add to the eleven through his bonds, in place of whoever holds the slot. */
function chem(p: Player): number {
  const i = selectedSlot.value
  const holder = i === null || !slots.value[i] ? undefined : player(slots.value[i]!)
  return chemistryWith(p, eleven.value, holder)
}

const roleLabels = computed(() =>
  positions.value.map((_, i) => {
    const r = team.value.xi[i]?.role
    return r ? t(`role.${r}.label`) : null
  })
)

/** The roles the tapped slot can ask for, and what the current choice means for its player. */
const slotRoles = computed(() => {
  const i = selectedSlot.value
  if (i === null) return null
  const id = slots.value[i]
  return roleChoices(positions.value[i], id ? player(id) : undefined, team.value.xi[i]?.role)
})

function setRole(role: Role | undefined) {
  const i = selectedSlot.value
  if (i !== null) team.value.xi = setSlotRole(team.value.xi, positions.value, i, role)
}

function auto() {
  const w = world.world!
  // Before a formation is chosen the staff pick the one that suits the squad.
  const { formation: _formation, ...instructions } = team.value.tactics
  const sheet = aiTeamSheet(
    w.state.career.nationId!,
    squad.value,
    world.date,
    formationChosen.value ? team.value.tactics : instructions
  )
  team.value.tactics.formation = sheet.tactics.formation
  formationChosen.value = true
  team.value.xi = sheet.xi
  team.value.captainId = sheet.captainId
  team.value.penaltyTakerId = sheet.penaltyTakerId
  team.value.setPieceTakerId = sheet.setPieceTakerId
}

const xiOptions = computed(() =>
  [...inXI.value].map((id) => ({
    value: id,
    label: `${player(id)?.first ?? ""} ${player(id)?.last ?? ""}`,
  }))
)

const mentality = computed({
  get: () => String(team.value.tactics.mentality),
  set: (v: string) => (team.value.tactics.mentality = Number(v) as Mentality),
})
const pressing = computed({
  get: () => String(team.value.tactics.pressing),
  set: (v: string) => (team.value.tactics.pressing = Number(v) as Level),
})
const line = computed({
  get: () => String(team.value.tactics.line ?? 1),
  set: (v: string) => (team.value.tactics.line = Number(v) as Level),
})
const width = computed({
  get: () => String(team.value.tactics.width ?? 1),
  set: (v: string) => (team.value.tactics.width = Number(v) as Level),
})
const counter = computed({
  get: () => team.value.tactics.counter ?? false,
  set: (v: boolean) => (team.value.tactics.counter = v),
})
const tempo = computed({
  get: () => String(team.value.tactics.tempo),
  set: (v: string) => (team.value.tactics.tempo = Number(v) as Level),
})

async function save() {
  if (!formationChosen.value) return showAlert(t("squad.tactics.chooseFormation"))
  const xi = FORMATIONS[team.value.tactics.formation]
    .map((pos, i) => ({ playerId: slots.value[i] ?? "", pos, role: team.value.xi[i]?.role }))
    .filter((s) => s.playerId)
  if (xi.length < 11) return showAlert(t("squad.tactics.fillAll"))
  const blocked = unavailableIn(
    xi.map((s) => player(s.playerId)),
    world.date
  )
  if (blocked.length)
    return showAlert(t("squad.tactics.replaceFirst", { list: blocked.join("; ") }))
  const bench = pickBench(squad.value, xi, world.date)
  world.setUserTeam({ ...team.value, xi, bench, tactics: { ...(team.value.tactics as Tactics) } })
  saved = true
  router.back()
}
</script>

<template>
  <PageShell
    :title="t(setup ? 'squad.tactics.setupTitle' : 'squad.tactics.title')"
    :subtitle="t('squad.tactics.subtitle')"
    back
  >
    <p v-if="settings.assistantPicks" class="assistant-note">
      {{ t("squad.tactics.assistantNote") }}
    </p>
    <p v-else-if="setup" class="assistant-note">
      {{ t("squad.tactics.setupNote") }}
    </p>
    <template #actions>
      <AppButton variant="tonal" @click="auto">
        <Sparkles :size="16" />
        {{ t("squad.tactics.bestXI") }}
      </AppButton>
    </template>

    <AppSelect
      :model-value="formationChosen ? team.tactics.formation : ''"
      :options="FORMATION_LIST.map((f) => ({ value: f, label: f }))"
      :placeholder="t('squad.tactics.chooseFormation')"
      @update:model-value="(v) => setFormation(v as Formation)"
    />

    <PitchView
      v-if="formationChosen"
      :formation="team.tactics.formation"
      :slots="slots"
      :player="player"
      :selected="selectedSlot"
      :role-labels="roleLabels"
      @select="(i) => (selectedSlot = i)"
    />

    <AppCard padding="md" class="chemistry">
      <AppSectionHeader :title="t('squad.tactics.chemistry')" />
      <div class="spirit">
        <strong>{{ $tx(spiritLabel(spirit)) }}</strong>
        <span class="tie-note">{{ t("squad.tactics.chemistryNote") }}</span>
      </div>
      <ul v-if="ties.length" class="ties">
        <li v-for="tie in ties" :key="tie.key" class="tie" :class="`tie--${tie.kind}`">
          <span class="tie-points">{{ signed(tie.points) }}</span>
          {{ tie.text }}
        </li>
      </ul>
      <p v-else class="tie-note">{{ t("squad.tactics.noTies") }}</p>
    </AppCard>

    <AppCard padding="md" class="instructions">
      <AppField :label="t('squad.tactics.mentality')" layout="stack">
        <AppSelect v-model="mentality" :options="mentalityOptions()" />
      </AppField>
      <AppField :label="t('squad.tactics.pressing')" layout="stack">
        <AppButtonGroup v-model="pressing" block :options="pressingOptions()" />
      </AppField>
      <AppField :label="t('squad.tactics.tempo')" layout="stack">
        <AppButtonGroup v-model="tempo" block :options="tempoOptions()" />
      </AppField>
      <AppField :label="t('squad.tactics.line')" layout="stack">
        <AppButtonGroup v-model="line" block :options="lineOptions()" />
      </AppField>
      <AppField :label="t('squad.tactics.width')" layout="stack">
        <AppButtonGroup v-model="width" block :options="widthOptions()" />
      </AppField>
      <AppField :label="t('squad.tactics.counter')" layout="row">
        <AppToggle v-model="counter" :aria-label="t('squad.tactics.counter')" />
      </AppField>
      <AppField :label="t('squad.tactics.captain')" layout="stack">
        <AppSelect
          :model-value="team.captainId ?? ''"
          :options="xiOptions"
          :placeholder="t('squad.tactics.choose')"
          @update:model-value="(v) => (team.captainId = v)"
        />
      </AppField>
      <AppField :label="t('squad.tactics.penalties')" layout="stack">
        <AppSelect
          :model-value="team.penaltyTakerId ?? ''"
          :options="xiOptions"
          :placeholder="t('squad.tactics.choose')"
          @update:model-value="(v) => (team.penaltyTakerId = v)"
        />
      </AppField>
      <AppField :label="t('squad.tactics.setPieces')" layout="stack">
        <AppSelect
          :model-value="team.setPieceTakerId ?? ''"
          :options="xiOptions"
          :placeholder="t('squad.tactics.choose')"
          @update:model-value="(v) => (team.setPieceTakerId = v)"
        />
      </AppField>
    </AppCard>

    <StickyCta above-nav>
      <AppButton variant="filled" block @click="save">{{ t("squad.tactics.save") }}</AppButton>
    </StickyCta>

    <AppSheet
      v-if="selectedSlot !== null"
      :title="t('squad.tactics.pick', { pos: FORMATIONS[team.tactics.formation][selectedSlot] })"
      max-height="min(640px, 85dvh)"
      max-height-mobile="85dvh"
      @close="selectedSlot = null"
    >
      <div v-if="slotRoles" class="role-pick">
        <div class="role-label">{{ t("squad.tactics.role") }}</div>
        <div class="role-chips">
          <button class="role-chip" :class="{ on: !slotRoles.current }" @click="setRole(undefined)">
            {{ t("squad.tactics.standard") }}
          </button>
          <button
            v-for="r in slotRoles.options"
            :key="r.id"
            class="role-chip"
            :class="{ on: slotRoles.current === r.id }"
            @click="setRole(r.id)"
          >
            {{ r.label }}
            <span v-if="r.suits" class="role-suits" :title="t('squad.tactics.suitsStyle')">★</span>
          </button>
        </div>
        <p class="role-blurb">
          {{ slotRoles.blurb }}
          <strong v-if="slotRoles.suited">
            {{ t("squad.tactics.suits", { style: slotRoles.style }) }}
          </strong>
          <template v-else-if="slotRoles.style && slotRoles.current">
            {{ t("squad.tactics.notStyle", { style: slotRoles.style }) }}
          </template>
        </p>
      </div>
      <div class="pick-filter">
        <AppSubTabBar
          :model-value="groupFilter"
          :options="GROUP_OPTIONS"
          size="sm"
          @update:model-value="(v) => (groupFilter = v as PositionGroup | 'ALL')"
        />
      </div>
      <div class="pick-list">
        <button v-for="p in candidates" :key="p.id" class="pick" @click="choose(p)">
          <PlayerRow :player="p" static compact>
            <template #trailing>
              <span
                v-if="signed(chem(p))"
                class="chem"
                :class="chem(p) > 0 ? 'chem--up' : 'chem--down'"
                :title="t('squad.tactics.chemWith')"
              >
                {{ signed(chem(p)) }}
              </span>
              <span v-if="inXI.has(p.id)" class="in-xi">{{ t("squad.tactics.inXI") }}</span>
              <StatPill
                :value="
                  Math.round(
                    matchAbility(p) *
                      positionFit(p, FORMATIONS[team.tactics.formation][selectedSlot!])
                  )
                "
                :tone="
                  positionFit(p, FORMATIONS[team.tactics.formation][selectedSlot!]) >= 1
                    ? 'var(--success)'
                    : 'var(--warning)'
                "
              />
            </template>
          </PlayerRow>
        </button>
      </div>
    </AppSheet>
  </PageShell>
</template>

<style scoped>
.chemistry :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.spirit {
  display: flex;
  flex-direction: column;
}

.tie-note {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.ties {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--fs-sm);
}

.tie {
  padding: 2px 0;
}

.tie-points {
  display: inline-block;
  min-width: 34px;
  font-weight: 700;
  color: var(--success);
}

.tie--feud .tie-points {
  color: var(--danger);
}

.chem {
  font-size: var(--fs-xs);
  font-weight: 700;
}

.chem--up {
  color: var(--success);
}

.chem--down {
  color: var(--danger);
}

.instructions :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.role-pick {
  flex-shrink: 0;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.role-label {
  margin-bottom: var(--sp-1);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
}

.role-chip {
  padding: 4px 10px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: none;
  color: inherit;
  font-size: var(--fs-xs);
}

.role-chip.on {
  border-color: var(--accent);
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 700;
}

.role-suits {
  color: var(--gold);
}

.role-blurb {
  margin: var(--sp-1) 0 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.pick-filter {
  flex-shrink: 0;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.pick-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: env(safe-area-inset-bottom);
}

.pick {
  display: block;
  width: 100%;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  text-align: start;
}

.in-xi {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--accent);
}

.assistant-note {
  margin: 0;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: var(--fs-sm);
}
</style>
