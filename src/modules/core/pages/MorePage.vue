<script setup lang="ts">
import { useRouter } from "vue-router"
import {
  Briefcase,
  CalendarDays,
  FolderOpen,
  LogOut,
  ListOrdered,
  Medal,
  Save,
  Settings,
} from "@lucide/vue"
import { AppCard } from "@/components/ui"
import { showConfirm } from "@/composables/useDialog"
import { PageShell } from "@/modules/core/components"
import { useWorldStore } from "@/modules/world/store"

const router = useRouter()
const world = useWorldStore()

const items = [
  {
    to: "/career",
    icon: Briefcase,
    label: "Career",
    hint: "Objectives, confidence and job offers",
  },
  { to: "/rankings", icon: ListOrdered, label: "FIFA ranking", hint: "All 211 nations" },
  {
    to: "/calendar",
    icon: CalendarDays,
    label: "Calendar",
    hint: "Your fixtures and the FIFA windows",
  },
  { to: "/honours", icon: Medal, label: "Honours", hint: "Every trophy since 2026" },
  { to: "/settings", icon: Settings, label: "Settings", hint: "Theme, match speed" },
]

async function exitWithoutSaving() {
  const ok = await showConfirm("Leave without saving? Progress since the last save is lost.", {
    confirmLabel: "Exit",
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
  <PageShell title="More">
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
          <span class="label">Save game</span>
          <span class="hint">Also saved automatically</span>
        </span>
      </button>
      <button class="item" @click="exitWithoutSaving">
        <LogOut :size="20" class="icon" />
        <span class="text">
          <span class="label">Exit without saving</span>
          <span class="hint">Lose everything since the last save</span>
        </span>
      </button>
      <button class="item" @click="saveAndExit">
        <FolderOpen :size="20" class="icon" />
        <span class="text">
          <span class="label">Save and exit</span>
          <span class="hint">Back to the main menu</span>
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
  text-decoration: none;
  text-align: start;
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
