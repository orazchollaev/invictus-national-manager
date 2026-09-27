<script setup lang="ts">
import { computed } from "vue"
import { flagUrl } from "@/lib/flags"
import { NATION_DEFS } from "@/modules/world/services/statics"

const props = withDefaults(
  defineProps<{
    id: string | null | undefined
    size?: number
    /** Show the name beside the flag. */
    name?: boolean | "short"
    /** Link to the nation page. */
    link?: boolean
  }>(),
  { size: 20, name: false, link: false }
)

const def = computed(() => NATION_DEFS.find((n) => n.id === props.id))
const label = computed(
  () => (props.name === "short" ? def.value?.id : def.value?.name) ?? props.id ?? "TBD"
)
</script>

<template>
  <component
    :is="link && def ? 'RouterLink' : 'span'"
    :to="link && def ? `/nation/${def.id}` : undefined"
    class="nation"
  >
    <img
      v-if="def"
      :src="flagUrl(def.flag)"
      :width="size"
      :height="size"
      alt=""
      class="nation-flag"
      loading="lazy"
    />
    <span
      v-else
      class="nation-flag nation-flag--empty"
      :style="{ width: `${size}px`, height: `${size}px` }"
    ></span>
    <span v-if="name" class="nation-name">{{ label }}</span>
  </component>
</template>

<style scoped>
.nation {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1-5);
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.nation-flag {
  flex-shrink: 0;
  border-radius: 50%;
}

.nation-flag--empty {
  background: var(--border-light);
}

.nation-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
