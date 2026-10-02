<script setup lang="ts">
/** A nation as the mod has it: its own flag and name, not the game's. */
import type { NationDef } from "@/engine/types"
import { flagUrl } from "@/lib/flags"

withDefaults(defineProps<{ nation: NationDef | undefined; size?: number }>(), { size: 22 })
</script>

<template>
  <span class="mod-nation">
    <img
      v-if="nation && flagUrl(nation.flag)"
      :src="flagUrl(nation.flag)"
      :width="size"
      :height="size"
      alt=""
      class="mod-nation-flag"
      loading="lazy"
    />
    <span
      v-else
      class="mod-nation-flag mod-nation-flag--empty"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <span class="mod-nation-name">{{ nation?.name ?? "" }}</span>
  </span>
</template>

<style scoped>
.mod-nation {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1-5);
  min-width: 0;
}

.mod-nation-flag {
  flex-shrink: 0;
  border-radius: 50%;
}

.mod-nation-flag--empty {
  background: var(--border-light);
}

.mod-nation-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
