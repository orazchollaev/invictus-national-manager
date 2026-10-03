<script setup lang="ts">
import { PersonFace } from "@/modules/core/components/face"

defineProps<{
  players: { id: string; name: string; detail: string; value?: string }[]
  /** Whose players they are, for their faces. */
  nationId: string
}>()

const lastOf = (name: string) => name.split(" ").slice(1).join(" ")
</script>

<template>
  <div class="players">
    <RouterLink v-for="p in players" :key="p.id" :to="`/player/${p.id}`" class="row">
      <PersonFace :player="{ id: p.id, last: lastOf(p.name), nationId }" :size="36" head />
      <div class="main">
        <div class="name">{{ p.name }}</div>
        <div class="detail">{{ p.detail }}</div>
      </div>
      <strong v-if="p.value" class="value">{{ p.value }}</strong>
    </RouterLink>
  </div>
</template>

<style scoped>
.players {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: var(--tap-min);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.main {
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.detail {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.value {
  font-variant-numeric: tabular-nums;
}
</style>
