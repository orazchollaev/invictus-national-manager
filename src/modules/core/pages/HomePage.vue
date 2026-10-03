<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { Briefcase, ChevronRight, Landmark, Play, Shuffle, Users } from "@lucide/vue"
import { AppButton, AppSectionHeader } from "@/components/ui"
import { PageShell, StickyCta } from "@/modules/core/components"
import {
  GroupSnapshot,
  InvitationalHint,
  MatchStrip,
  NextMatchCard,
  QuickActions,
} from "@/modules/core/components/home"
import { useWorldStore } from "@/modules/world/store"
import { useSettingsStore } from "@/modules/settings/store"
import { formatDate, formatShort } from "@/i18n/dates"
import { compName, stageLabel } from "@/i18n/text"
import type { Interrupt } from "@/engine/world/types"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
const settings = useSettingsStore()

const career = world.derive((w) => w.state.career, null)
const me = computed(() => world.me)
const pending = world.derive((w) => w.state.pendingCallup, null)
const today = world.derive((w) => w.userMatchDue(), null)
/** A draw waiting to be watched: its fixtures stay hidden until then. */
const drawReady = world.derive((w) => {
  const d = w.state.pendingDraw
  if (!d) return null
  const inst = w.state.competitions[d.compId]
  const stage = inst?.stages.find((s) => s.key === d.stageKey)
  return {
    ...d,
    inst: inst ? { defId: inst.defId, year: inst.year } : null,
    stage: stage?.name ?? null,
  }
}, null)
/** A popup on screen (see GamePopups): answering it is the next step. */
const popup = world.derive(
  (w) =>
    !!(
      w.state.pendingUltimatum ||
      w.state.pendingOffer ||
      w.state.pendingHosting ||
      (!settings.assistantBoard && w.state.career.objectives.some((o) => o.agreed === false)) ||
      (settings.showIntake && w.state.pendingIntake)
    ),
  false
)
/** A review or a lost job waiting on its own page. */
const careerPage = world.derive(
  (w) =>
    w.state.pendingReview
      ? `/career/review/${w.state.pendingReview}`
      : w.state.pendingSacked
        ? "/career/farewell"
        : null,
  null
)

const drawLabel = computed(() => {
  const d = drawReady.value
  if (!d?.inst) return t("core.home.draw")
  return `${compName(d.inst)} · ${d.stage ? stageLabel(d.stage) : t("core.home.draw")}`
})

const news = world.derive((w) => w.state.news.filter((n) => n.mine).slice(0, 3), [])
const unread = world.derive((w) => w.state.news.filter((n) => n.mine && !n.read).length, 0)

function go(i: Interrupt) {
  if (i.kind === "callup") router.push("/squad/callup")
  else if (i.kind === "match") router.push(`/match/${i.fixtureId}`)
  else if (i.kind === "draw") router.push(`/draw/${i.compId}/${i.stageKey}`)
  else if (i.kind === "review") router.push(`/career/review/${i.id}`)
  else if (i.kind === "sacked") router.push("/career/farewell")
  // Anything else new shows as a popup where the user is.
  else if (i.kind === "offer" && !i.nationId) router.push("/career")
}

async function proceed() {
  if (careerPage.value) return router.push(careerPage.value)
  if (popup.value) return
  if (pending.value && settings.assistantPicks) world.assistantCallup()
  else if (pending.value) return router.push("/squad/callup")
  const draw = world.world?.state.pendingDraw
  if (draw) return router.push(`/draw/${draw.compId}/${draw.stageKey}`)
  if (today.value) return router.push(`/match/${today.value.id}`)
  go(await world.proceed(settings.advanceStep))
}

const cta = computed(() => {
  if (careerPage.value?.startsWith("/career/review"))
    return { label: t("core.home.verdict"), icon: Landmark }
  if (careerPage.value) return { label: t("core.home.clearDesk"), icon: Briefcase }
  if (pending.value && !settings.assistantPicks)
    return { label: t("core.home.nameSquad"), icon: Users }
  if (drawReady.value) return { label: t("core.home.watchDraw"), icon: Shuffle }
  if (today.value) return { label: t("core.home.matchDay"), icon: Play }
  const step = settings.advanceStep
  const how =
    step === "match"
      ? t("core.home.toNextMatch")
      : step === 1
        ? t("core.home.oneDay")
        : t("core.home.nDays", { n: step })
  return { label: t("core.home.continueHow", { how }), icon: ChevronRight }
})
</script>

<template>
  <PageShell>
    <section v-if="!me" class="panel jobless">
      <Briefcase :size="28" class="jobless-icon" />
      <div>
        <div class="panel-title">{{ t("core.home.outOfWork") }}</div>
        <p class="muted">{{ t("core.home.outOfWorkHint") }}</p>
      </div>
      <AppButton variant="tonal" @click="router.push('/career')">
        {{ t("core.home.offers", { n: career?.offers.length ?? 0 }) }}
      </AppButton>
    </section>

    <section
      v-if="pending && pending.kind === 'callup'"
      class="panel alert"
      @click="router.push('/squad/callup')"
    >
      <Users :size="20" class="alert-icon" />
      <div class="alert-text">
        <div class="panel-title">{{ t("core.home.squadDue") }}</div>
        <div class="muted">
          {{
            t("core.home.squadDueHint", {
              label: $tx(pending.label),
              date: formatDate(pending.deadline),
            })
          }}
        </div>
      </div>
      <ChevronRight :size="18" class="muted" />
    </section>

    <section
      v-if="drawReady"
      class="panel alert draw"
      @click="router.push(`/draw/${drawReady.compId}/${drawReady.stageKey}`)"
    >
      <Shuffle :size="20" class="alert-icon" />
      <div class="alert-text">
        <div class="panel-title">{{ t("core.home.drawReady") }}</div>
        <div class="muted">{{ t("core.home.drawReadyHint", { label: drawLabel }) }}</div>
      </div>
      <ChevronRight :size="18" class="muted" />
    </section>

    <NextMatchCard v-if="me" />
    <MatchStrip v-if="me" />
    <InvitationalHint v-if="me" />
    <QuickActions v-if="me" />
    <GroupSnapshot v-if="me" />

    <section v-if="news.length" class="panel">
      <AppSectionHeader>
        {{ t("core.home.inbox") }}
        <template #actions>
          <RouterLink to="/inbox" class="link">
            {{ unread ? t("core.home.unread", { n: unread }) : t("core.home.all") }}
          </RouterLink>
        </template>
      </AppSectionHeader>
      <RouterLink
        v-for="n in news"
        :key="n.id"
        to="/inbox"
        class="news"
        :class="{ unread: !n.read }"
      >
        <div class="news-head">
          <span class="news-title">{{ $tx(n.title) }}</span>
          <span class="news-date">{{ formatShort(n.date) }}</span>
        </div>
        <div class="news-body">{{ $tx(n.body) }}</div>
      </RouterLink>
    </section>

    <StickyCta above-nav>
      <AppButton variant="filled" block :disabled="world.busy" @click="proceed">
        <component :is="cta.icon" :size="18" />
        {{ cta.label }}
      </AppButton>
    </StickyCta>
  </PageShell>
</template>

<style scoped>
.panel {
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--surface);
}

.panel-title {
  font-weight: 700;
}

.muted {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.jobless {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-2);
}

.jobless-icon {
  color: var(--accent);
}

.alert {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  border-color: color-mix(in srgb, var(--warning) 50%, transparent);
  background: color-mix(in srgb, var(--warning) 10%, var(--surface));
  cursor: pointer;
}

.alert-icon {
  color: var(--warning);
  flex-shrink: 0;
}

.alert.draw {
  border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  background: color-mix(in srgb, var(--accent) 10%, var(--surface));
}

.alert.draw .alert-icon {
  color: var(--accent);
}

.alert-text {
  flex: 1;
  min-width: 0;
}

.news {
  display: block;
  padding: var(--sp-2) 0;
  border-top: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.news-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-2);
}

.news.unread .news-title {
  color: var(--accent);
}

.news-title {
  font-weight: 600;
}

.news-date {
  flex-shrink: 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.news-body {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link {
  font-size: var(--fs-sm);
  color: var(--accent);
}
</style>
