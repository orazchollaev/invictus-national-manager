<script setup lang="ts">
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import {
  Briefcase,
  CalendarDays,
  FolderOpen,
  Landmark,
  LogOut,
  ListOrdered,
  Medal,
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

const items = [
  {
    to: "/career",
    icon: Briefcase,
    label: t("core.more.career"),
    hint: t("core.more.careerHint"),
  },
  {
    to: "/coaches",
    icon: Users,
    label: t("core.more.coaches"),
    hint: t("core.more.coachesHint"),
  },
  {
    to: "/stadiums",
    icon: Landmark,
    label: t("core.more.stadiums"),
    hint: t("core.more.stadiumsHint"),
  },
  {
    to: "/rankings",
    icon: ListOrdered,
    label: t("core.more.ranking"),
    hint: t("core.more.rankingHint"),
  },
  {
    to: "/calendar",
    icon: CalendarDays,
    label: t("core.more.calendar"),
    hint: t("core.more.calendarHint"),
  },
  {
    to: "/invitational",
    icon: Trophy,
    label: t("core.more.invitational"),
    hint: t("core.more.invitationalHint"),
  },
  { to: "/honours", icon: Medal, label: t("core.more.honours"), hint: t("core.more.honoursHint") },
  {
    to: "/settings",
    icon: Settings,
    label: t("core.more.settings"),
    hint: t("core.more.settingsHint"),
  },
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
    <AppCard padding="none" class="menu">
      <RouterLink v-for="i in items" :key="i.to" :to="i.to" class="item">
        <component :is="i.icon" :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ i.label }}</span>
          <span class="hint">{{ i.hint }}</span>
        </span>
      </RouterLink>
      <button class="item" @click="world.save()">
        <Save :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ t("core.more.saveGame") }}</span>
          <span class="hint">{{ t("core.more.saveGameHint") }}</span>
        </span>
      </button>
      <button class="item" @click="exitWithoutSaving">
        <LogOut :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ t("core.more.exitNoSave") }}</span>
          <span class="hint">{{ t("core.more.exitNoSaveHint") }}</span>
        </span>
      </button>
      <button class="item" @click="saveAndExit">
        <FolderOpen :size="20" class="icon" />
        <span class="text">
          <span class="label">{{ t("core.more.saveExit") }}</span>
          <span class="hint">{{ t("core.more.saveExitHint") }}</span>
        </span>
      </button>
    </AppCard>
  </PageShell>
</template>

<style scoped>
.menu {
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-3);
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

.hint {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
