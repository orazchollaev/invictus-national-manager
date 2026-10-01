<script setup lang="ts">
/** The job is gone: a look back over the spell, then on to the offers. */
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Briefcase, Trophy } from "@lucide/vue"
import { AppButton, AppEmptyState } from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()

const stint = world.derive((w) => {
  const h = w.state.career.history.at(-1)
  if (!h || !h.left || h.left === "moved") return null
  return { ...h, name: w.def(h.nationId).name }
}, null)

const winRate = computed(() =>
  stint.value?.played ? Math.round((stint.value.won / stint.value.played) * 100) : 0
)

function next() {
  world.seenSacked()
  router.replace("/career")
}
</script>

<template>
  <PageShell :title="t('career.farewell.title')">
    <AppEmptyState v-if="!stint" :icon="Briefcase" :title="t('career.farewell.nothing')" />
    <template v-else>
      <section class="card">
        <NationFlag :id="stint.nationId" :size="64" />
        <h2 class="title">
          {{
            t(
              stint.left === "sacked"
                ? "career.farewell.sacked"
                : stint.left === "resigned"
                  ? "career.farewell.resigned"
                  : "career.farewell.notRenewed"
            )
          }}
        </h2>
        <p class="lead">
          {{
            t("career.farewell.lead", {
              name: $nation(stint.nationId),
              from: formatDate(stint.from),
              to: stint.to ? formatDate(stint.to) : "",
            })
          }}
        </p>
        <div class="stats">
          <div>
            <strong>{{ stint.played }}</strong>
            <span>{{ t("career.farewell.matches") }}</span>
          </div>
          <div>
            <strong>{{ stint.won }}–{{ stint.drawn }}–{{ stint.lost }}</strong>
            <span>{{ t("career.farewell.wdl") }}</span>
          </div>
          <div>
            <strong>{{ winRate }}%</strong>
            <span>{{ t("career.farewell.won") }}</span>
          </div>
        </div>
        <ul v-if="stint.trophies.length" class="trophies">
          <li v-for="(trophy, i) in stint.trophies" :key="i">
            <Trophy :size="16" />
            {{ $tx(trophy) }}
          </li>
        </ul>
        <p class="lead">
          {{ t("career.farewell.heard") }}
        </p>
      </section>
      <StickyCta above-nav>
        <AppButton variant="filled" block @click="next">
          {{ t("career.farewell.seeOffers") }}
        </AppButton>
      </StickyCta>
    </template>
  </PageShell>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-5) var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent);
  background: var(--surface);
  text-align: center;
}

.title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 800;
  color: var(--danger);
}

.lead {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-2);
  width: 100%;
  margin: var(--sp-2) 0;
}

.stats div {
  display: flex;
  flex-direction: column;
  padding: var(--sp-2);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.stats strong {
  font-size: var(--fs-md);
  font-variant-numeric: tabular-nums;
}

.stats span {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.trophies {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  color: var(--gold-text);
  font-weight: 700;
}

.trophies li {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
}
</style>
