<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Copy, Download, Pencil, Plus, Trash2, Upload, Wrench } from "@lucide/vue"
import { AppButton, AppCard, AppEmptyState, AppField, AppSheet } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { showAlert, showConfirm } from "@/composables/useDialog"
import { formatDate } from "@/i18n/dates"
import {
  createMod,
  deleteMod,
  duplicateMod,
  exportMod,
  importMod,
  listMods,
  loadMod,
} from "@/modules/mods/services/mods"
import { ModError, type ModMeta } from "@/modules/mods/utils/format"
import { useModsStore } from "@/modules/mods/store"

const { t } = useI18n()
const router = useRouter()
const store = useModsStore()

const mods = ref<ModMeta[]>([])
const busy = ref(false)
const creating = ref(false)
const newName = ref("")

async function refresh() {
  mods.value = await listMods()
}

onMounted(refresh)

/** Run a slow action with the buttons held. */
async function work(fn: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  try {
    await fn()
  } finally {
    busy.value = false
  }
}

const day = (ms: number) => formatDate(new Date(ms).toISOString().slice(0, 10))

function create() {
  const name = newName.value.trim() || t("mods.namePlaceholder")
  creating.value = false
  void work(async () => {
    const mod = await createMod(name)
    newName.value = ""
    router.push(`/mods/${mod.id}`)
  })
}

function doImport() {
  void work(async () => {
    try {
      const mod = await importMod()
      if (!mod) return
      await refresh()
      await showAlert(t("mods.imported", { name: mod.name }))
    } catch (e) {
      if (e instanceof ModError) await showAlert(t("mods.importFailed"))
      else throw e
    }
  })
}

function doExport(m: ModMeta) {
  void work(async () => {
    const mod = await loadMod(m.id)
    if (mod) await exportMod(mod)
  })
}

function duplicate(m: ModMeta) {
  void work(async () => {
    await duplicateMod(m.id, t("mods.copyOf", { name: m.name }).slice(0, 40))
    await refresh()
  })
}

async function remove(m: ModMeta) {
  const ok = await showConfirm(t("mods.deleteConfirm", { name: m.name }), {
    confirmLabel: t("common.delete"),
    dangerous: true,
  })
  if (!ok) return
  if (store.mod?.id === m.id) store.close()
  await deleteMod(m.id)
  await refresh()
}
</script>

<template>
  <PageShell back :title="t('mods.title')" :subtitle="t('mods.subtitle')">
    <div class="top-actions">
      <AppButton variant="filled" :disabled="busy" @click="creating = true">
        <Plus :size="16" />
        {{ t("mods.new") }}
      </AppButton>
      <AppButton variant="tonal" :disabled="busy" @click="doImport">
        <Upload :size="16" />
        {{ t("mods.import") }}
      </AppButton>
      <span v-if="busy" class="working">{{ t("mods.working") }}</span>
    </div>

    <AppEmptyState
      v-if="!mods.length"
      :icon="Wrench"
      :title="t('mods.empty')"
      :description="t('mods.emptyHint')"
    />

    <AppCard v-for="m in mods" :key="m.id" padding="md" class="mod">
      <button class="mod-main" :disabled="busy" @click="router.push(`/mods/${m.id}`)">
        <span class="mod-name">{{ m.name }}</span>
        <span class="mod-sub">
          <template v-if="m.author">{{ m.author }} ·</template>
          {{ t("mods.players", { n: m.players.toLocaleString() }) }} ·
          {{ t("mods.updated", { date: day(m.updatedAt) }) }}
        </span>
      </button>
      <div class="mod-actions">
        <AppButton size="xs" variant="tonal" :disabled="busy" @click="router.push(`/mods/${m.id}`)">
          <Pencil :size="14" />
          {{ t("mods.edit") }}
        </AppButton>
        <AppButton size="xs" variant="text" :disabled="busy" @click="doExport(m)">
          <Download :size="14" />
          {{ t("mods.export") }}
        </AppButton>
        <AppButton size="xs" variant="text" :disabled="busy" @click="duplicate(m)">
          <Copy :size="14" />
          {{ t("mods.duplicate") }}
        </AppButton>
        <AppButton
          size="xs"
          variant="text"
          icon-only
          class="mod-delete"
          :aria-label="t('common.delete')"
          :disabled="busy"
          @click="remove(m)"
        >
          <Trash2 :size="14" />
        </AppButton>
      </div>
    </AppCard>

    <AppSheet v-if="creating" :title="t('mods.new')" @close="creating = false">
      <div class="sheet-body">
        <AppField :label="t('mods.name')" layout="stack">
          <input
            v-model="newName"
            class="input"
            maxlength="40"
            :placeholder="t('mods.namePlaceholder')"
            autocomplete="off"
            @keydown.enter="create"
          />
        </AppField>
        <AppButton variant="filled" block @click="create">{{ t("mods.create") }}</AppButton>
      </div>
    </AppSheet>
  </PageShell>
</template>

<style scoped>
.top-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.working {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.mod :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.mod-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--text);
  text-align: start;
}

.mod-name,
.mod-sub {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mod-name {
  font-size: var(--fs-base);
  font-weight: 700;
}

.mod-sub {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.mod-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1);
}

.mod-delete {
  margin-inline-start: auto;
  color: var(--danger);
}

.sheet-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-4) calc(var(--sp-4) + var(--safe-bottom));
}

.input {
  width: 100%;
}
</style>
