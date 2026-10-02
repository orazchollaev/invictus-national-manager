<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { CalendarDays, ClipboardList, Landmark, ListOrdered, Users } from "@lucide/vue"

const { t } = useI18n()

const items = [
  { to: "/squad", icon: Users, label: "core.quick.squad" },
  { to: "/squad/tactics", icon: ClipboardList, label: "core.quick.tactics" },
  { to: "/calendar", icon: CalendarDays, label: "core.quick.calendar" },
  { to: "/rankings", icon: ListOrdered, label: "core.quick.ranking" },
  { to: "/career/federation", icon: Landmark, label: "core.quick.federation" },
]
</script>

<template>
  <nav class="quick">
    <RouterLink v-for="i in items" :key="i.to" :to="i.to" class="tile">
      <span class="tile-icon"><component :is="i.icon" :size="20" /></span>
      <span class="tile-label">{{ t(i.label) }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.quick {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(64px, 1fr);
  gap: var(--sp-1-5);
  overflow-x: auto;
  scrollbar-width: none;
}

.quick::-webkit-scrollbar {
  display: none;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.tile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-subtle);
  color: var(--accent);
}

.tile-label {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--fs-xs);
  font-weight: 600;
}
</style>
