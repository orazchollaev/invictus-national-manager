<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { flagUrl } from "@/lib/flags"
import { NATION_DEFS } from "@/modules/world/services/statics"
import { isPlaceholder, placeholderText } from "@/engine/competition/placeholders"
import { nationName, resolveText } from "@/i18n/text"

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

const { t } = useI18n()

const def = computed(() => NATION_DEFS.find((n) => n.id === props.id))
/** A place still to be decided in a draw ("UEFA play-off Path A winner"). */
const pending = computed(() => isPlaceholder(props.id))
const label = computed(() => {
  if (pending.value) return resolveText(placeholderText(props.id!, props.name === "short"))
  return (
    (props.name === "short" ? def.value?.id : def.value && nationName(def.value.id)) ??
    props.id ??
    t("common.tbd")
  )
})
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
      :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.55)}px` }"
    >
      {{ pending ? "?" : "" }}
    </span>
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--border-light);
  color: var(--text-muted);
  font-weight: 800;
}

.nation-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
