<script setup lang="ts">
import { House, Users, Trophy, CalendarDays, Menu } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { useNavActive } from "@/composables/useNavActive"

const { t } = useI18n()
const { isNavActive } = useNavActive()

const items = [
  { to: "/home", icon: House, label: () => t("nav.home") },
  { to: "/squad", icon: Users, label: () => t("nav.squad") },
  { to: "/competitions", icon: Trophy, label: () => t("nav.competitions") },
  { to: "/fixtures", icon: CalendarDays, label: () => t("nav.fixtures") },
  { to: "/more", icon: Menu, label: () => t("nav.more") },
]
</script>

<template>
  <nav class="mobile-nav">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="mobile-nav-item"
      :class="{ 'router-link-active': isNavActive(item.to) }"
    >
      <!-- The icon is wrapped so a design language can paint a selection
           indicator behind it alone without resizing the glyph. -->
      <span class="mobile-nav-indicator">
        <component :is="item.icon" :size="20" class="mobile-nav-icon" />
      </span>
      <span class="mobile-nav-label">{{ item.label() }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
/* Mobile first: the bottom bar is the navigation on every screen size. */
@media all {
  .mobile-nav {
    display: flex;
    position: fixed;
    left: calc(var(--safe-left) + var(--sp-2));
    right: calc(var(--safe-right) + var(--sp-2));
    bottom: calc(var(--safe-bottom) + var(--mobile-nav-gap));
    z-index: var(--z-mobile-nav);
    height: var(--mobile-nav-height);
    padding: var(--sp-1);
    gap: var(--sp-1);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    box-shadow: var(--elev-3);
  }

  .mobile-nav-item {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: var(--radius);
    color: var(--text-muted);
    text-decoration: none;
    font-size: var(--fs-xs);
    font-weight: 500;
    line-height: 1.2;
    transition:
      background var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease),
      transform var(--dur-fast) var(--ease);
  }

  .mobile-nav-item:hover {
    text-decoration: none;
  }

  .mobile-nav-item:active {
    transform: scale(0.94);
  }

  .mobile-nav-item.router-link-active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  .mobile-nav-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mobile-nav-icon {
    flex-shrink: 0;
  }

  .mobile-nav-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ══ iOS tab bar ══════════════════════════════════════════════
     A floating capsule on a near-opaque color-mix surface (no blur: cheap to
     paint), a hairline edge, a soft cast shadow so it reads as hovering. Nothing is painted behind the selected item — the
     accent tint alone marks it, which is what keeps the bar quiet. */
  [data-design="ios"] .mobile-nav {
    left: calc(var(--safe-left) + var(--sp-3));
    right: calc(var(--safe-right) + var(--sp-3));
    bottom: calc(var(--safe-bottom) + var(--sp-2));
    height: 56px;
    padding: 4px;
    gap: 0;
    border: 0.5px solid color-mix(in srgb, var(--text) 10%, transparent);
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
  }

  [data-design="ios"] .mobile-nav-item {
    gap: 2px;
    border-radius: var(--radius-pill);
    font-size: var(--fs-xs);
    font-weight: 500;
    letter-spacing: 0;
  }

  [data-design="ios"] .mobile-nav-icon {
    width: 23px;
    height: 23px;
    stroke-width: 1.9;
  }

  [data-design="ios"] .mobile-nav-item.router-link-active {
    background: none;
    color: var(--accent);
  }

  [data-design="ios"] .mobile-nav-item:active {
    transform: none;
    opacity: 0.45;
  }

  [data-theme="dark"][data-design="ios"] .mobile-nav {
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  }

}
</style>
