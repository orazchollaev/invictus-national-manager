<script setup lang="ts">
/**
 * A free window coming up with no match in it: a nudge to host a tournament there,
 * opening the set-up with that window already chosen.
 */
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { ChevronRight, Trophy } from "@lucide/vue"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { suggestedWindow } from "@/engine/world/invitational"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

// Worked out when the calendar stops, not on every day it turns.
const win = world.derive((w) => {
  const me = w.state.career.nationId
  return me && !world.busy ? suggestedWindow(w, me) : null
}, null)
</script>

<template>
  <section
    v-if="win"
    class="hint"
    role="button"
    tabindex="0"
    @click="router.push(`/invitational?window=${win.id}`)"
    @keydown.enter="router.push(`/invitational?window=${win.id}`)"
  >
    <Trophy :size="20" class="icon" />
    <div class="text">
      <div class="title">{{ t("core.home.inviteHint") }}</div>
      <div class="muted">
        {{
          t("core.home.inviteHintBody", { from: formatDate(win.start), to: formatDate(win.end) })
        }}
      </div>
    </div>
    <ChevronRight :size="18" class="muted" />
  </section>
</template>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
  background: color-mix(in srgb, var(--gold) 10%, var(--surface));
  cursor: pointer;
}

.icon {
  flex-shrink: 0;
  color: var(--gold);
}

.text {
  flex: 1;
  min-width: 0;
}

.title {
  font-weight: 700;
}

.muted {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}
</style>
