<script setup lang="ts">
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Briefcase } from "@lucide/vue"
import { AppButton, AppEmptyState } from "@/components/ui"
import { PageShell } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { nationName } from "@/i18n/text"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { showConfirm } from "@/composables/useDialog"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
// A fresh copy each tick, so a declined offer disappears at once.
const career = world.derive((w) => ({ ...w.state.career }), null)

async function accept(nationId: string) {
  const name = nationName(nationId)
  const leaving = career.value?.nationId
    ? t("career.acceptLeaving", { name: nationName(career.value.nationId) })
    : ""
  if (
    !(await showConfirm(t("career.acceptConfirm", { name, leaving }), {
      confirmLabel: t("career.accept"),
    }))
  )
    return
  world.takeJob(nationId)
  router.push("/home")
}
</script>

<template>
  <PageShell back :title="t('career.jobOffers')">
    <section v-for="o in career?.offers ?? []" :key="o.nationId" class="offer">
      <div class="offer-head">
        <NationFlag :id="o.nationId" :size="32" name link />
        <span class="muted">{{ t("career.until", { date: formatDate(o.expires) }) }}</span>
      </div>
      <div class="offer-actions">
        <AppButton variant="text" @click="world.turnDown(o.nationId)">
          {{ t("career.decline") }}
        </AppButton>
        <AppButton variant="filled" @click="accept(o.nationId)">
          {{ t("career.accept") }}
        </AppButton>
      </div>
    </section>
    <AppEmptyState
      v-if="!career?.offers.length"
      :icon="Briefcase"
      :title="t('core.home.offers', { n: 0 })"
    />
  </PageShell>
</template>

<style scoped>
.offer {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.offer-head {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.offer-head :deep(.nation) {
  font-size: var(--fs-md);
  font-weight: 700;
}

.muted {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.offer-actions {
  display: flex;
  gap: var(--sp-2);
  justify-content: flex-end;
}
</style>
