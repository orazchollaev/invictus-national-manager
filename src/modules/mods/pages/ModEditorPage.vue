<script setup lang="ts">
import { onMounted, ref } from "vue"
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Save } from "@lucide/vue"
import { AppButton, AppEmptyState, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { showConfirm } from "@/composables/useDialog"
import { exportMod } from "@/modules/mods/services/mods"
import { useModsStore } from "@/modules/mods/store"
import {
  ClubsPanel,
  NationsPanel,
  OverviewPanel,
  PlayersPanel,
} from "@/modules/mods/components/editor"

type Tab = "overview" | "nations" | "players" | "clubs"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useModsStore()

const ready = ref(false)
const missing = ref(false)
const saving = ref(false)
const tab = ref<Tab>("overview")
const title = store.derive((m) => m.name, "")

onMounted(async () => {
  missing.value = !(await store.open(String(route.params.id)))
  ready.value = true
})

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    await store.save()
  } finally {
    saving.value = false
  }
}

async function doExport() {
  if (!store.mod) return
  if (store.dirty) await save()
  await exportMod(store.mod)
}

async function start() {
  if (!store.mod) return
  if (store.dirty) await save()
  router.push({ path: "/new", query: { mod: store.mod.id } })
}

onBeforeRouteLeave(async () => {
  if (store.dirty) {
    const ok = await showConfirm(t("mods.leaveConfirm"), {
      confirmLabel: t("mods.leave"),
      dangerous: true,
    })
    if (!ok) return false
  }
  // Unsaved edits are dropped; the next visit reads the mod from disk again.
  store.close()
  return true
})
</script>

<template>
  <PageShell
    back
    :title="title || t('mods.title')"
    :subtitle="store.mod ? (store.dirty ? t('mods.unsaved') : t('mods.saved')) : undefined"
  >
    <template #actions>
      <AppButton
        v-if="store.mod"
        variant="filled"
        size="sm"
        :disabled="!store.dirty || saving"
        @click="save"
      >
        <Save :size="16" />
        {{ t("mods.save") }}
      </AppButton>
    </template>

    <AppEmptyState v-if="ready && missing" :title="t('mods.notFound')" />

    <template v-else-if="store.mod">
      <AppSubTabBar
        :model-value="tab"
        :options="[
          { value: 'overview', label: t('mods.tabs.overview') },
          { value: 'nations', label: t('mods.tabs.nations') },
          { value: 'players', label: t('mods.tabs.players') },
          { value: 'clubs', label: t('mods.tabs.clubs') },
        ]"
        size="sm"
        @update:model-value="(v) => (tab = v as Tab)"
      />
      <!-- Kept alive: a panel built once (and its list, search and page) comes back at once. -->
      <KeepAlive>
        <OverviewPanel v-if="tab === 'overview'" @export="doExport" @start="start" />
        <NationsPanel v-else-if="tab === 'nations'" />
        <PlayersPanel v-else-if="tab === 'players'" />
        <ClubsPanel v-else />
      </KeepAlive>
    </template>
  </PageShell>
</template>
