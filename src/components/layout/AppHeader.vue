<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { Settings } from "@lucide/vue"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { flagUrl } from "@/lib/flags"

const { t } = useI18n()
const world = useWorldStore()
const nation = world.derive(
  (w) => (w.state.career.nationId ? w.def(w.state.career.nationId) : null),
  null
)
const date = computed(() => (world.date ? formatDate(world.date) : ""))
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink to="/home" class="brand">
        <img v-if="nation" :src="flagUrl(nation.flag)" alt="" class="brand-flag" />
        <span class="brand-name">{{ nation ? $nation(nation.id) : t("app.name") }}</span>
      </RouterLink>
      <div class="header-end">
        <span v-if="date" class="header-date">{{ date }}</span>
        <RouterLink to="/settings" class="settings-btn" :aria-label="t('nav.settings')">
          <Settings :size="18" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  padding-top: var(--safe-top);
  padding-inline: var(--safe-left) var(--safe-right);
}

.header-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 var(--sp-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  height: 52px;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  min-width: 0;
  color: var(--text);
  text-decoration: none;
}

.brand-flag {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

.brand-name {
  font-size: var(--fs-base);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-end {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.header-date {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  color: var(--text-muted);
}

.settings-btn:hover {
  background: var(--bg);
  color: var(--text);
}
</style>
