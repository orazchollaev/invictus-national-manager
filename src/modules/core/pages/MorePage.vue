<script setup lang="ts">
import type { Component } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import {
  Briefcase,
  Mail,
  FolderOpen,
  Landmark,
  LogOut,
  ListOrdered,
  Medal,
  Pencil,
  Save,
  Settings,
  Trophy,
  Users,
} from "@lucide/vue"
import { AppCard } from "@/components/ui"
import { showConfirm } from "@/composables/useDialog"
import { PageShell } from "@/modules/core/components"
import { useWorldStore } from "@/modules/world/store"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

const link = (to: string, icon: Component, key: string) => ({
  to,
  icon,
  label: t(`core.more.${key}`),
})

/** Grouped by what the player is after; each group is its own card. */
const groups = [
  // My team.
  [link("/career", Briefcase, "career"), link("/coaches", Users, "coaches")],
  // The world around it.
  [
    link("/rankings", ListOrdered, "ranking"),
    { to: "/inbox", icon: Mail, label: t("nav.inbox") },
    link("/honours", Medal, "honours"),
    link("/stadiums", Landmark, "stadiums"),
    link("/invitational", Trophy, "invitational"),
  ],
  // The app.
  [link("/editor", Pencil, "editor"), link("/settings", Settings, "settings")],
]

async function exitWithoutSaving() {
  const ok = await showConfirm(t("core.more.leaveConfirm"), {
    confirmLabel: t("core.more.exit"),
    dangerous: true,
  })
  if (!ok) return
  world.discard()
  router.replace("/menu")
}

async function saveAndExit() {
  await world.save()
  world.close()
  router.replace("/menu")
}
</script>

<template>
  <PageShell :title="t('core.more.title')">
    <AppCard v-for="(group, gi) in groups" :key="gi" padding="none" class="menu">
      <RouterLink v-for="i in group" :key="i.to" :to="i.to" class="item">
        <component :is="i.icon" :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ i.label }}</span>
        </span>
      </RouterLink>
    </AppCard>
    <AppCard padding="none" class="menu">
      <button class="item" @click="world.save()">
        <Save :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ t("core.more.saveGame") }}</span>
        </span>
      </button>
      <button class="item" @click="saveAndExit">
        <FolderOpen :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ t("core.more.saveExit") }}</span>
        </span>
      </button>
      <button class="item danger" @click="exitWithoutSaving">
        <LogOut :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ t("core.more.exitNoSave") }}</span>
        </span>
      </button>
    </AppCard>
  </PageShell>
</template>

<style scoped>
.menu {
  overflow: hidden;
}

.menu + .menu {
  margin-top: var(--sp-3);
}

.item:last-child {
  border-bottom: none;
}

.item.danger .icon,
.item.danger .label {
  color: var(--danger);
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4) var(--sp-3);
  border: none;
  border-bottom: 1px solid var(--border-light);
  background: none;
  color: var(--text);
  border-radius: 0;
  font: inherit;
  text-decoration: none;
  text-align: start;
}

/* The buttons drop the global button look so they read like the links above. */
button.item:hover {
  border-color: var(--border-light);
  background: none;
  color: var(--text);
  box-shadow: none;
}

button.item:active:not(:disabled) {
  transform: none;
}

.icon {
  color: var(--accent);
  flex-shrink: 0;
}

.text {
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: 600;
}

</style>
