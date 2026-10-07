<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { onBeforeRouteLeave } from "vue-router"
import { useI18n } from "vue-i18n"
import { Save } from "@lucide/vue"
import { AppButton, AppEmptyState, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { showConfirm } from "@/composables/useDialog"
import { snapshotEdits } from "@/engine/world/edit"
import { useModsStore } from "@/modules/mods/store"
import { useWorldStore } from "@/modules/world/store"
import {
  ClubsPanel,
  NationsPanel,
  OverviewPanel,
  PlayersPanel,
} from "@/modules/mods/components/editor"

type Tab = "overview" | "nations" | "players" | "clubs"

const { t } = useI18n()
const store = useModsStore()
const world = useWorldStore()

const ready = ref(false)
const saving = ref(false)
const tab = ref<Tab>("overview")

/** Edits wait while the game needs an answer (a match, a draw, a call-up). */
const blocked = computed(() => world.interrupt.kind !== "none" || world.busy)

function load() {
  const w = world.world
  if (w) store.openLive(snapshotEdits(w), w.state.date)
}

onMounted(async () => {
  await world.resume()
  if (!blocked.value) load()
  ready.value = true
})

async function save() {
  if (saving.value || !store.mod) return
  saving.value = true
  try {
    const { nations, clubs, players } = store.mod
    await world.applyEditorChanges({ nations, clubs, players })
    // What the game made of the edits (clamped values) is what the editor shows next.
    load()
  } finally {
    saving.value = false
  }
}

onBeforeRouteLeave(async () => {
  if (store.dirty) {
    const ok = await showConfirm(t("mods.leaveConfirm"), {
      confirmLabel: t("mods.leave"),
      dangerous: true,
    })
    if (!ok) return false
  }
  store.close()
  return true
})
</script>

<template>
  <PageShell
    back
    :title="t('editor.title')"
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

    <AppEmptyState v-if="ready && !world.world" :title="t('editor.noGame')" />
    <AppEmptyState
      v-else-if="ready && blocked"
      :title="t('editor.blocked')"
      :description="t('editor.blockedHint')"
    />

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
      <KeepAlive>
        <OverviewPanel v-if="tab === 'overview'" />
        <NationsPanel v-else-if="tab === 'nations'" />
        <PlayersPanel v-else-if="tab === 'players'" />
        <ClubsPanel v-else />
      </KeepAlive>
    </template>
  </PageShell>
</template>
