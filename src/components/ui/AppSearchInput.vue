<script setup lang="ts">
/**
 * Search field with a leading magnifier. Replaces the three separate
 * `.search-wrap` / `.search-icon` / `.search-input` triples that
 * TeamsPage, FlagPicker and TeamSelector each defined for themselves.
 */
import { Search } from "@lucide/vue"
import AppIcon from "./AppIcon.vue"

withDefaults(
  defineProps<{
    placeholder?: string
    disabled?: boolean
    /** Shorter field for dense panels. */
    size?: "sm" | "md"
  }>(),
  { size: "md" }
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="search-field" :class="`search-field--${size}`">
    <AppIcon :icon="Search" size="sm" class="search-field-icon" />
    <input
      v-model="model"
      type="text"
      class="search-field-input"
      :disabled="disabled"
      :placeholder="placeholder"
    />
  </div>
</template>

<style scoped>
.search-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.search-field-icon {
  position: absolute;
  left: var(--sp-3);
  color: var(--text-muted);
  pointer-events: none;
}

.search-field-input {
  width: 100%;
  padding: var(--sp-2) var(--sp-3) var(--sp-2) var(--sp-6);
  font-size: var(--fs-base);
  font-family: var(--font-ui);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  box-sizing: border-box;
  transition: border-color var(--dur-fast) var(--ease);
}
/* Same 32px outer box as an icon AppButton and an AppButtonGroup — the three
   share every search row. */
.search-field--md .search-field-input {
  height: 32px;
}
.search-field-input:focus {
  outline: none;
  border-color: var(--accent);
}
.search-field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.search-field-input::placeholder {
  color: var(--text-muted);
}

/* ── Design languages ────────────────────────────────────────────
   A borderless, filled search field kept as a soft grey capsule. */
[data-design="ios"] .search-field-input {
  border-color: transparent;
  border-radius: var(--radius-pill);
  background: var(--fill-1);
}
[data-design="ios"] .search-field-input:focus {
  border-color: transparent;
  background: color-mix(in srgb, var(--text) 10%, transparent);
}
</style>
