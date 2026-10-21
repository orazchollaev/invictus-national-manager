<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, type Component } from "vue"

withDefaults(
  defineProps<{
    options: { value: string; label: string; icon?: Component; disabled?: boolean }[]
    modelValue: string
    size?: "xs" | "sm" | "md"
    block?: boolean
  }>(),
  { size: "sm" }
)

defineEmits<{ "update:modelValue": [value: string] }>()

// A strip wider than its box scrolls sideways; fade the edge that still has
// content so the scroll is visible.
const root = ref<HTMLElement | null>(null)
const fadeStart = ref(false)
const fadeEnd = ref(false)

function measure() {
  const el = root.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  const x = Math.abs(el.scrollLeft)
  fadeStart.value = x > 1
  fadeEnd.value = max - x > 1
}

let ro: ResizeObserver | undefined
onMounted(() => {
  measure()
  if (typeof ResizeObserver !== "undefined" && root.value) {
    ro = new ResizeObserver(measure)
    ro.observe(root.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="btn-group"
    :class="[
      `btn-group--${size}`,
      { 'btn-group--block': block, 'fade-start': fadeStart, 'fade-end': fadeEnd },
    ]"
    @scroll.passive="measure"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :disabled="opt.disabled"
      :class="{ active: modelValue === opt.value, 'icon-only': opt.icon }"
      :title="opt.icon ? opt.label : undefined"
      :aria-label="opt.icon ? opt.label : undefined"
      @click="$emit('update:modelValue', opt.value)"
    >
      <component :is="opt.icon" v-if="opt.icon" :size="14" />
      <template v-else>{{ opt.label }}</template>
    </button>
  </div>
</template>

<style scoped>
.btn-group {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.btn-group--block {
  display: flex;
  width: 100%;
  min-height: var(--control-h);
}
.btn-group.btn-group--block button {
  flex: 1;
  justify-content: center;
  height: auto;
}

.btn-group button {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  border: none;
  background: none;
  box-shadow: none;
  border-radius: calc(var(--radius) - 3px);
  font-family: var(--font-ui);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
}

.btn-group--sm button {
  height: 28px;
  font-size: var(--fs-sm);
  padding: 0 var(--sp-3);
}
.btn-group--xs button {
  font-size: var(--fs-xs);
  padding: 2px var(--sp-2);
}

.btn-group--md button {
  height: 26px;
  font-size: var(--fs-xs);
  padding: 0 var(--sp-2);
}

.btn-group button:hover:not(.active):not(:disabled) {
  color: var(--text);
  background: var(--bg-hover);
}

.btn-group button.active {
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 600;
  box-shadow: var(--elev-1);
}

.btn-group button.active:hover {
  background: var(--accent-hover);
}

.btn-group button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-group button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-group button.icon-only {
  padding: 0;
  justify-content: center;
}
.btn-group--sm button.icon-only {
  width: 24px;
  height: 24px;
}
/* 24px is the floor a tap target may be painted at (WCAG 2.5.8). */
.btn-group--xs button.icon-only {
  width: 24px;
  height: 24px;
}
.btn-group--md button.icon-only {
  width: 26px;
  height: 26px;
}

/* ── Design languages ────────────────────────────────────────────
   iOS: the system segmented control — grey track, white thumb, dark
   label. The accent never fills a segment there. */
[data-design="ios"] .btn-group {
  gap: 0;
  padding: 2px;
  border-color: transparent;
  border-radius: var(--radius-pill);
  background: var(--fill-1);
}
[data-design="ios"] .btn-group button {
  border-radius: var(--radius-pill);
}
[data-design="ios"] .btn-group button.active,
[data-design="ios"] .btn-group button.active:hover {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-sm);
}

/* A long strip of options scrolls sideways instead of wrapping onto a second
   row, which broke the pill; a block group fills the row and shares it. */
@media (max-width: 600px) {
  .btn-group:not(.btn-group--block) {
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .btn-group:not(.btn-group--block)::-webkit-scrollbar {
    display: none;
  }
  .btn-group:not(.btn-group--block) button {
    flex-shrink: 0;
  }
  .btn-group.fade-end {
    mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent);
  }
  .btn-group.fade-start {
    mask-image: linear-gradient(to left, #000 calc(100% - 32px), transparent);
  }
  .btn-group.fade-start.fade-end {
    mask-image: linear-gradient(
      to right,
      transparent,
      #000 32px,
      #000 calc(100% - 32px),
      transparent
    );
  }
  .btn-group.btn-group--block button {
    min-width: 0;
    padding-inline: var(--sp-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-group button {
    transition: none;
  }
}
</style>
