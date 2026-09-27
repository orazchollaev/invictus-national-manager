<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import { Mail } from "@lucide/vue"
import { AppEmptyState, AppSubTabBar } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"
import type { NewsItem } from "@/engine/world/types"

const world = useWorldStore()
const tab = ref("mine")
const news = world.derive((w) => w.state.news, [] as NewsItem[])
const shown = computed(() =>
  news.value.filter((n) => (tab.value === "mine" ? n.mine : true)).slice(0, 120)
)

// Reading the inbox marks it read.
onBeforeUnmount(() => world.markRead(shown.value.filter((n) => !n.read).map((n) => n.id)))
</script>

<template>
  <PageShell title="Inbox">
    <AppSubTabBar
      :model-value="tab"
      :options="[
        { value: 'mine', label: 'For you' },
        { value: 'all', label: 'World' },
      ]"
      size="sm"
      @update:model-value="(v) => (tab = v)"
    />
    <AppEmptyState v-if="!shown.length" :icon="Mail" title="Nothing here yet" />
    <div v-else class="list">
      <component
        :is="n.link ? 'RouterLink' : 'div'"
        v-for="n in shown"
        :key="n.id"
        :to="n.link"
        class="item"
        :class="{ unread: !n.read }"
      >
        <div class="item-head">
          <span class="item-title">{{ n.title }}</span>
          <span class="item-date">{{ formatDate(n.date) }}</span>
        </div>
        <div class="item-body">{{ n.body }}</div>
      </component>
    </div>
  </PageShell>
</template>

<style scoped>
.list {
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.item {
  display: block;
  padding: var(--sp-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.item.unread {
  border-left: 3px solid var(--accent);
}

.item-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-2);
}

.item-title {
  font-weight: 700;
}

.item-date {
  flex-shrink: 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.item-body {
  margin-top: 2px;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
