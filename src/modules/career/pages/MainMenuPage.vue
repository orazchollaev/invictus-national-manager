<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { FolderOpen, Play, Plus, Settings, Wrench } from "@lucide/vue"
import { AppLogo } from "@/components/layout"
import { NationFlag } from "@/modules/nations/components/badge"
import { activeSlot, listSlots, type SlotMeta } from "@/modules/world/services/saves"
import { useWorldStore } from "@/modules/world/store"
import { nationDef } from "@/modules/world/services/statics"
import { formatDate } from "@/i18n/dates"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
const last = ref<SlotMeta | null>(null)
const hasSaves = ref(false)

onMounted(async () => {
  const slots = await listSlots()
  hasSaves.value = slots.some(Boolean)
  const n = await activeSlot()
  last.value = (n && slots[n - 1]) || slots.find(Boolean) || null
})

const lastNation = computed(() => nationDef(last.value?.nationId))

async function resume() {
  if (!last.value) return
  if (world.slot === last.value.slot && world.world) return router.push("/home")
  if (await world.load(last.value.slot)) router.replace("/home")
}
</script>

<template>
  <div class="menu">
    <div class="brand">
      <AppLogo class="brand-logo" />
      <h1 class="brand-title">{{ t("app.name") }}</h1>
      <p class="brand-sub">{{ t("app.subtitle") }}</p>
    </div>

    <div class="actions">
      <button v-if="last" class="item item--primary" @click="resume">
        <Play :size="22" />
        <span class="item-text">
          <span class="item-label">{{ t("career.menu.continue") }}</span>
          <span class="item-hint">
            <NationFlag v-if="lastNation" :id="lastNation.id" :size="16" />
            {{ last.managerName }} ·
            {{ lastNation ? $nation(lastNation.id) : t("career.menu.unemployed") }} ·
            {{ formatDate(last.date) }}
          </span>
        </span>
      </button>
      <button class="item" @click="router.push('/new')">
        <Plus :size="22" />
        <span class="item-text">
          <span class="item-label">{{ t("career.menu.newGame") }}</span>
          <span class="item-hint">{{ t("career.menu.newGameHint") }}</span>
        </span>
      </button>
      <button class="item" :disabled="!hasSaves" @click="router.push('/load')">
        <FolderOpen :size="22" />
        <span class="item-text">
          <span class="item-label">{{ t("career.menu.loadGame") }}</span>
          <span class="item-hint">{{ t("career.menu.loadGameHint") }}</span>
        </span>
      </button>
      <button class="item" @click="router.push('/mods')">
        <Wrench :size="22" />
        <span class="item-text">
          <span class="item-label">{{ t("career.menu.mods") }}</span>
          <span class="item-hint">{{ t("career.menu.modsHint") }}</span>
        </span>
      </button>
      <button class="item" @click="router.push('/settings')">
        <Settings :size="22" />
        <span class="item-text">
          <span class="item-label">{{ t("career.menu.settings") }}</span>
          <span class="item-hint">{{ t("career.menu.settingsHint") }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu {
  min-height: calc(100vh - var(--safe-top) - var(--safe-bottom));
  min-height: calc(100dvh - var(--safe-top) - var(--safe-bottom));
  max-width: 480px;
  margin: 0 auto;
  padding: calc(var(--safe-top) + var(--sp-5)) var(--sp-4) calc(var(--safe-bottom) + var(--sp-5));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--sp-6);
}

.brand {
  text-align: center;
}

.brand-logo {
  display: block;
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 22%;
}

.brand-title {
  margin: var(--sp-3) 0 0;
  font-size: var(--fs-2xl);
  font-weight: 800;
  letter-spacing: 0.02em;
}

.brand-sub {
  margin: var(--sp-1) 0 0;
  color: var(--text-muted);
  font-size: var(--fs-base);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text);
  text-align: start;
}

.item:disabled {
  opacity: 0.5;
}

.item--primary {
  border-color: transparent;
  background: var(--accent);
  color: var(--on-accent);
}

.item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-label {
  font-size: var(--fs-base);
  font-weight: 700;
}

.item-hint {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--fs-sm);
  opacity: 0.8;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
