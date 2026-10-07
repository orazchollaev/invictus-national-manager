<script setup lang="ts">
import { computed, reactive, ref, toRaw } from "vue"
import { useI18n } from "vue-i18n"
import { Trash2 } from "@lucide/vue"
import { AppButton, AppButtonGroup, AppField, AppSelect, AppSheet } from "@/components/ui"
import { showAlert, showConfirm } from "@/composables/useDialog"
import { useModsStore } from "@/modules/mods/store"
import type { ClubEdit } from "@/modules/mods/utils/format"

const props = defineProps<{ club: ClubEdit }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useModsStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const draft = reactive<ClubEdit>(structuredClone(toRaw(props.club)))
const isNew = computed(() => !store.mod?.clubs.some((c) => c[0] === props.club.id))
const players = computed(() => store.clubCounts.get(props.club.id) ?? 0)

const TIERS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))

function save() {
  if (!draft.name.trim()) return
  store.saveClub(structuredClone(toRaw(draft)))
  sheet.value?.close()
}

async function remove() {
  if (players.value > 0) return showAlert(t("mods.club.deleteBlocked"))
  const ok = await showConfirm(t("mods.club.deleteConfirm", { name: props.club.name }), {
    confirmLabel: t("common.delete"),
    dangerous: true,
  })
  if (ok && store.deleteClub(props.club.id)) sheet.value?.close()
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="isNew ? t('mods.club.new') : club.name"
    :subtitle="isNew ? undefined : t('mods.club.players', { n: players })"
    :dismiss-on-outside-click="false"
    @close="emit('close')"
  >
    <div class="form">
      <AppField :label="t('mods.club.name')" layout="stack">
        <input v-model="draft.name" class="input" maxlength="40" autocomplete="off" />
      </AppField>
      <AppField :label="t('mods.club.nation')" layout="stack">
        <span v-if="store.live && !isNew" class="fixed">
          {{ store.nationOptions.find((n) => n.value === draft.nationId)?.label }}
        </span>
        <AppSelect v-else v-model="draft.nationId" :options="store.nationOptions" searchable />
      </AppField>
      <AppField :label="t('mods.club.tier')" :hint="t('mods.club.tierHint')" layout="stack">
        <AppButtonGroup
          :model-value="String(draft.tier)"
          block
          :options="TIERS"
          @update:model-value="(v) => (draft.tier = Number(v))"
        />
      </AppField>
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
        <AppButton variant="filled" block :disabled="!draft.name.trim()" @click="save">
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
</style>
<style scoped src="./editor.css"></style>
