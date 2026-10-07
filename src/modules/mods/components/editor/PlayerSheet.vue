<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, toRaw, watch } from "vue"
import { useI18n } from "vue-i18n"
import { Trash2 } from "@lucide/vue"
import {
  AppButton,
  AppButtonGroup,
  AppField,
  AppNumberInput,
  AppSelect,
  AppSheet,
} from "@/components/ui"
import { POSITIONS, type Position } from "@/engine/types"
import {
  attrKeys,
  caFromAttrs,
  deriveAttrs,
  type Attr,
  type Attrs,
} from "@/engine/players/attributes"
import { EDIT_MAX_AGE, EDIT_MIN_AGE } from "@/engine/world/edit"
import { showConfirm } from "@/composables/useDialog"
import FaceEditor from "./FaceEditor.vue"
import { useModsStore } from "@/modules/mods/store"
import { PERSONALITY, ageOn, type PlayerEdit } from "@/modules/mods/utils/format"

const props = defineProps<{ player: PlayerEdit }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useModsStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const draft = reactive<PlayerEdit>(structuredClone(toRaw(props.player)))
// Only his own nation's rows can hold him: a scan of one squad, not of every player.
const isNew = !store.mod?.players[props.player.nationId]?.some((r) => r[0] === props.player.id)

/**
 * The face editor draws a face as soon as it appears, which would land in the same
 * frames as the sheet sliding in. It comes a moment later, below the fold anyway.
 */
const faceReady = ref(false)
const faceTimer = setTimeout(() => (faceReady.value = true), 260)
onBeforeUnmount(() => clearTimeout(faceTimer))
/** The league the club plays in, picked first so the club list stays short. */
const clubNation = ref(store.mod?.clubs.find((c) => c[0] === draft.clubId)?.[2] ?? draft.nationId)
const clubOptions = computed(() =>
  (store.mod?.clubs ?? [])
    .filter((c) => c[2] === clubNation.value)
    .sort((a, b) => a[3] - b[3] || a[1].localeCompare(b[1]))
    .map((c) => ({ value: c[0], label: c[1] }))
)

function pickLeague(id: string) {
  clubNation.value = id
  if (!clubOptions.value.some((c) => c.value === draft.clubId))
    draft.clubId = clubOptions.value[0]?.value ?? draft.clubId
}
const POS_OPTIONS = POSITIONS.map((p) => ({ value: p, label: p }))
const FOOT = computed(() => [
  { value: "L", label: t("mods.player.left") },
  { value: "R", label: t("mods.player.right") },
  { value: "B", label: t("mods.player.both") },
])

const age = computed(() =>
  /^\d{4}-\d{2}-\d{2}$/.test(draft.born) ? ageOn(draft.born, store.today) : null
)

/** Who the face is drawn for: his id, surname and nation decide what it starts as. */
const faceOwner = computed(() => ({
  id: draft.id,
  last: draft.last.trim() || draft.first.trim(),
  nationId: draft.nationId,
}))

function toggleAlt(p: Position) {
  const i = draft.alt.indexOf(p)
  if (i >= 0) draft.alt.splice(i, 1)
  else draft.alt.push(p)
}

const attrList = computed(() => attrKeys(draft.pos))
/** What the grid shows: his own attributes, or the ones his ability would draw. */
const shownAttrs = computed<Attrs>(
  () => draft.attrs ?? deriveAttrs({ id: draft.id, pos: draft.pos, ca: draft.ca })
)

/** Editing one attribute makes them all his own, and his ability follows them. */
function setAttr(key: Attr, value: number) {
  const attrs = { ...shownAttrs.value, [key]: value }
  draft.attrs = attrs
  draft.ca = caFromAttrs(attrs, draft.pos)
  if (draft.pa < draft.ca) draft.pa = Math.ceil(draft.ca)
}

/** In a running game his own attributes stay editable, so ability set by hand redraws them. */
function setAbility(v: number) {
  draft.ca = v
  draft.attrs = undefined
  if (draft.pa < v) draft.pa = Math.ceil(v)
}

function resetAttrs() {
  draft.attrs = undefined
}

// A goalkeeper has other attributes than an outfield player; otherwise ability follows the set.
watch(
  () => draft.pos,
  (now, was) => {
    if (!draft.attrs) return
    if ((now === "GK") !== (was === "GK")) draft.attrs = undefined
    else draft.ca = caFromAttrs(draft.attrs, now)
  }
)

const valid = computed(
  () =>
    draft.first.trim().length + draft.last.trim().length > 0 &&
    age.value !== null &&
    (!store.live || (age.value >= EDIT_MIN_AGE && age.value <= EDIT_MAX_AGE))
)

function save() {
  if (!valid.value) return
  store.savePlayer(structuredClone(toRaw(draft)))
  sheet.value?.close()
}

async function remove() {
  const ok = await showConfirm(
    t("mods.player.deleteConfirm", { name: `${props.player.first} ${props.player.last}` }),
    { confirmLabel: t("common.delete"), dangerous: true }
  )
  if (!ok) return
  store.deletePlayer(props.player.id)
  sheet.value?.close()
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="isNew ? t('mods.player.new') : `${player.first} ${player.last}`"
    max-height="90dvh"
    max-height-mobile="92dvh"
    :dismiss-on-outside-click="false"
    @close="emit('close')"
  >
    <div class="form">
      <div class="grid2">
        <AppField :label="t('mods.player.first')" layout="stack">
          <input v-model="draft.first" class="input" maxlength="30" autocomplete="off" />
        </AppField>
        <AppField :label="t('mods.player.last')" layout="stack">
          <input v-model="draft.last" class="input" maxlength="30" autocomplete="off" />
        </AppField>
      </div>
      <AppField
        :label="t('mods.player.born')"
        :hint="age !== null ? t('mods.player.age', { n: age }) : undefined"
        layout="stack"
      >
        <input v-model="draft.born" class="input" type="date" min="1960-01-01" max="2015-12-31" />
      </AppField>
      <AppField :label="t('mods.player.nation')" layout="stack">
        <span v-if="store.live && !isNew" class="fixed">
          {{ store.nationOptions.find((n) => n.value === draft.nationId)?.label }}
        </span>
        <AppSelect v-else v-model="draft.nationId" :options="store.nationOptions" searchable />
      </AppField>
      <div class="grid2">
        <AppField :label="t('mods.club.nation')" layout="stack">
          <AppSelect
            :model-value="clubNation"
            :options="store.nationOptions"
            searchable
            @update:model-value="pickLeague"
          />
        </AppField>
        <AppField :label="t('mods.player.club')" layout="stack">
          <AppSelect v-model="draft.clubId" :options="clubOptions" searchable />
        </AppField>
      </div>

      <div class="grid2">
        <AppField :label="t('mods.player.pos')" layout="stack">
          <AppSelect v-model="draft.pos" :options="POS_OPTIONS" />
        </AppField>
        <AppField :label="t('mods.player.foot')" layout="stack">
          <AppButtonGroup
            :model-value="draft.foot"
            block
            :options="FOOT"
            @update:model-value="(v) => (draft.foot = v as PlayerEdit['foot'])"
          />
        </AppField>
      </div>
      <AppField :label="t('mods.player.alt')" layout="stack">
        <div class="chips">
          <button
            v-for="p in POSITIONS.filter((x) => x !== draft.pos)"
            :key="p"
            class="chip"
            :class="{ 'chip--on': draft.alt.includes(p) }"
            @click="toggleAlt(p)"
          >
            {{ p }}
          </button>
        </div>
      </AppField>

      <AppField
        :label="t('mods.player.ca')"
        :hint="draft.attrs ? t('mods.player.caFromAttrs') : undefined"
      >
        <AppNumberInput
          v-if="store.live"
          :model-value="draft.ca"
          :min="1"
          :max="99"
          editable
          @update:model-value="setAbility"
        />
        <AppNumberInput
          v-else
          v-model="draft.ca"
          :min="1"
          :max="99"
          :disabled="!!draft.attrs"
          editable
        />
      </AppField>
      <AppField :label="t('mods.player.pa')">
        <AppNumberInput v-model="draft.pa" :min="1" :max="99" editable />
      </AppField>

      <h3 class="section">{{ t("mods.player.attributes") }}</h3>
      <AppField v-for="key in attrList" :key="key" :label="t(`squad.player.attr.${key}`)">
        <AppNumberInput
          :model-value="Math.round(shownAttrs[key] ?? 1)"
          :min="1"
          :max="99"
          size="sm"
          editable
          @update:model-value="(v) => setAttr(key, v)"
        />
      </AppField>
      <AppButton v-if="draft.attrs" variant="tonal" size="sm" class="delete" @click="resetAttrs">
        {{ t("mods.player.attributesReset") }}
      </AppButton>

      <h3 class="section">{{ t("mods.player.personality") }}</h3>
      <AppField v-for="(key, i) in PERSONALITY" :key="key" :label="t(`mods.player.pers.${key}`)">
        <AppNumberInput v-model="draft.pers[i]" :min="1" :max="20" size="sm" editable />
      </AppField>

      <h3 class="section">{{ t("mods.player.face") }}</h3>
      <FaceEditor v-if="faceReady" v-model="draft.face" :player="faceOwner" />
      <div v-else class="face-wait" aria-hidden="true" />

      <AppButton
        v-if="!isNew && !store.live"
        variant="danger"
        size="sm"
        class="delete"
        @click="remove"
      >
        <Trash2 :size="14" />
        {{ t("common.delete") }}
      </AppButton>
    </div>
    <template #footer>
      <div class="sheet-actions">
        <AppButton variant="tonal" block @click="sheet?.close()">
          {{ t("common.cancel") }}
        </AppButton>
        <AppButton variant="filled" block :disabled="!valid" @click="save">
          {{ t("common.save") }}
        </AppButton>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.delete {
  align-self: flex-start;
}

.fixed {
  color: var(--text-muted);
}

/* Holds some of the face editor's place for the moment before it arrives. */
.face-wait {
  min-height: 240px;
}
</style>
<style scoped src="./editor.css"></style>
