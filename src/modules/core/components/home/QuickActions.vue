<script setup lang="ts">
import { CalendarDays, ClipboardList, ListOrdered, Users } from "@lucide/vue"

const items = [
  { to: "/squad", icon: Users, label: "Squad" },
  { to: "/squad/tactics", icon: ClipboardList, label: "Tactics" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/rankings", icon: ListOrdered, label: "Ranking" },
]
</script>

<template>
  <nav class="quick">
    <RouterLink v-for="i in items" :key="i.to" :to="i.to" class="tile">
      <span class="tile-icon"><component :is="i.icon" :size="20" /></span>
      <span class="tile-label">{{ i.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-2);
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-1);
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
  font-size: var(--fs-xs);
  font-weight: 600;
}
</style>
