<script setup lang="ts">
/**
 * A player's face, feature by feature: the face drawn from his id is the starting
 * point, and every change is kept as an edit over it. An edit equal to what is
 * drawn is dropped, so an untouched face stays without any.
 */
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { ChevronLeft, ChevronRight, RotateCcw } from "@lucide/vue"
import { AppButton, AppField, AppNumberInput } from "@/components/ui"
import type { FaceEdit } from "@/engine/types"
import {
  FACE_FEATURES,
  HAIR_COLORS,
  SKIN_TONES,
  buildFace,
  faceOptions,
  faceValue,
  type FaceFeature,
  type FaceSubject,
} from "@/lib/faces"
import { PersonFace } from "@/modules/core/components/face"
import { nationDef } from "@/modules/world/services/statics"

const props = defineProps<{ player: { id: string; last: string; nationId: string } }>()
const model = defineModel<FaceEdit | undefined>()

const { t } = useI18n()

function subject(edit?: FaceEdit): FaceSubject {
  const def = nationDef(props.player.nationId)
  return {
    key: props.player.id,
    last: props.player.last,
    nationId: props.player.nationId,
    cultures: def?.cultures ?? [],
    role: "player",
    color: def?.color,
    edit,
  }
}

/** The face as drawn, and as shown with the edits. */
const base = computed(() => buildFace(subject()))
const shown = computed(() => buildFace(subject(model.value)))

function set<K extends keyof FaceEdit>(key: K, value: FaceEdit[K]) {
  const next: FaceEdit = { ...model.value, [key]: value }
  if (value === faceValue(base.value, key)) delete next[key]
  model.value = Object.keys(next).length ? next : undefined
}

const options = computed(
  () => new Map(FACE_FEATURES.map((f) => [f, faceOptions(f)] as [FaceFeature, string[]]))
)

/** Position of the feature in its list, and its length. */
function place(f: FaceFeature) {
  const list = options.value.get(f)!
  return { at: list.indexOf(faceValue(shown.value, f) as string), of: list.length }
}

function step(f: FaceFeature, dir: 1 | -1) {
  const list = options.value.get(f)!
  const { at } = place(f)
  set(f, list[(at + dir + list.length) % list.length])
}

const same = (a: string | number, b: string) => String(a).toLowerCase() === b.toLowerCase()

const fatness = computed({
  get: () => Math.round(shown.value.fatness * 100),
  set: (v: number) => set("fatness", Math.round(v) / 100),
})

/** The preview shows the edits already; its own record carries none to look up. */
const preview = computed(() => ({ ...props.player, face: model.value ?? {} }))
</script>

<template>
  <div class="face-editor">
    <!-- Stays at the top of the sheet while the controls below it scroll. -->
    <div class="preview">
      <PersonFace :player="preview" :size="88" head />
      <AppButton variant="text" size="sm" :disabled="!model" @click="model = undefined">
        <RotateCcw :size="14" />
        {{ t("mods.face.reset") }}
      </AppButton>
    </div>

    <div class="controls">
      <AppField :label="t('mods.face.skin')" layout="stack">
        <div class="swatches">
          <button
            v-for="c in SKIN_TONES"
            :key="c"
            type="button"
            class="swatch"
            :class="{ 'swatch--on': same(faceValue(shown, 'skin'), c) }"
            :style="{ background: c }"
            :aria-label="t('mods.face.skin')"
            @click="set('skin', c.toLowerCase())"
          />
        </div>
      </AppField>
      <AppField :label="t('mods.face.hairColor')" layout="stack">
        <div class="swatches">
          <button
            v-for="c in HAIR_COLORS"
            :key="c"
            type="button"
            class="swatch"
            :class="{ 'swatch--on': same(faceValue(shown, 'hairColor'), c) }"
            :style="{ background: c }"
            :aria-label="t('mods.face.hairColor')"
            @click="set('hairColor', c.toLowerCase())"
          />
        </div>
      </AppField>

      <div v-for="f in FACE_FEATURES" :key="f" class="step">
        <span class="step-label">{{ t(`mods.face.${f}`) }}</span>
        <button
          type="button"
          class="step-btn"
          :aria-label="t('mods.face.previous')"
          @click="step(f, -1)"
        >
          <ChevronLeft :size="16" />
        </button>
        <span class="step-value">{{ place(f).at + 1 }} / {{ place(f).of }}</span>
        <button type="button" class="step-btn" :aria-label="t('mods.face.next')" @click="step(f, 1)">
          <ChevronRight :size="16" />
        </button>
      </div>

      <AppField :label="t('mods.face.fatness')">
        <AppNumberInput v-model="fatness" :min="0" :max="100" :step="5" size="sm" />
      </AppField>
    </div>
  </div>
</template>

<style scoped>
.face-editor {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.preview {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  /* Full width of the sheet, so nothing shows through at the sides. */
  margin: 0 calc(-1 * var(--sp-4));
  padding: var(--sp-2) var(--sp-4);
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.swatch {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid var(--border);
  border-radius: 50%;
}

.swatch--on {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-subtle);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.step-label {
  flex: 1;
  min-width: 0;
  font-size: var(--fs-base);
  font-weight: 600;
}

.step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
}

.step-value {
  min-width: 56px;
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
