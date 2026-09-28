<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import {
  Briefcase,
  ChevronRight,
  CircleCheck,
  CircleX,
  Play,
  Shuffle,
  Target,
  Users,
} from "@lucide/vue"
import { AppButton, AppSectionHeader } from "@/components/ui"
import { PageShell, StatPill, StickyCta } from "@/modules/core/components"
import {
  GroupSnapshot,
  HomeHero,
  NextMatchCard,
  QuickActions,
} from "@/modules/core/components/home"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { useSettingsStore } from "@/modules/settings/store"
import { formatDate, formatShort } from "@/engine/calendar/dates"
import { resultLetter } from "@/modules/core/utils/format"
import type { Interrupt } from "@/engine/world/types"

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
  return { ...d, label: inst ? `${inst.name} · ${stage?.name ?? "Draw"}` : "Draw" }
}, null)
/** An offer or hosting news on screen: the popup is the next step. */
const popup = world.derive((w) => !!(w.state.pendingOffer || w.state.pendingHosting), false)

const results = world.derive((w) => {
  const id = w.state.career.nationId
  return id ? [...w.state.nations[id].results].reverse().slice(0, 5) : []
}, [])

const news = world.derive((w) => w.state.news.filter((n) => n.mine).slice(0, 3), [])
const unread = world.derive((w) => w.state.news.filter((n) => n.mine && !n.read).length, 0)
const objectives = world.derive((w) => w.state.career.objectives.slice(-5).reverse(), [])

const letterTone = (l: "W" | "D" | "L") =>
  l === "W" ? "var(--success)" : l === "L" ? "var(--danger)" : "var(--text-muted)"

function go(i: Interrupt) {
  if (i.kind === "callup") router.push("/squad/callup")
  else if (i.kind === "match") router.push(`/match/${i.fixtureId}`)
  else if (i.kind === "draw") router.push(`/draw/${i.compId}/${i.stageKey}`)
  // A new offer or hosting news shows as a popup where the user is.
  else if ((i.kind === "offer" && !i.nationId) || i.kind === "sacked") router.push("/career")
}

async function proceed() {
  if (popup.value) return
  if (pending.value && settings.assistantPicks) world.assistantCallup()
  else if (pending.value) return router.push("/squad/callup")
  const draw = world.world?.state.pendingDraw
  if (draw) return router.push(`/draw/${draw.compId}/${draw.stageKey}`)
  if (today.value) return router.push(`/match/${today.value.id}`)
  go(await world.proceed(settings.advanceStep))
}

const cta = computed(() => {
  if (pending.value && !settings.assistantPicks) return { label: "Name your squad", icon: Users }
  if (drawReady.value) return { label: "Watch the draw", icon: Shuffle }
  if (today.value) return { label: "Match day — go to the match", icon: Play }
  const step = settings.advanceStep
  const how = step === "match" ? "to next match" : step === 1 ? "1 day" : `${step} days`
  return { label: `Continue · ${how}`, icon: ChevronRight }
})
</script>

<template>
  <PageShell>
    <HomeHero v-if="me" />

    <section v-else class="panel jobless">
      <Briefcase :size="28" class="jobless-icon" />
      <div>
        <div class="panel-title">Out of work</div>
        <p class="muted">Federations get in touch when a job opens up. Keep the calendar moving.</p>
      </div>
      <AppButton variant="tonal" @click="router.push('/career')">
        Offers ({{ career?.offers.length ?? 0 }})
      </AppButton>
    </section>

    <section
      v-if="pending && pending.kind === 'callup'"
      class="panel alert"
      @click="router.push('/squad/callup')"
    >
      <Users :size="20" class="alert-icon" />
      <div class="alert-text">
        <div class="panel-title">Squad announcement due</div>
        <div class="muted">
          {{ pending.label }} · first match {{ formatDate(pending.deadline) }}
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
        <div class="panel-title">The draw is ready</div>
        <div class="muted">{{ drawReady.label }} · watch it to see who we face</div>
      </div>
      <ChevronRight :size="18" class="muted" />
    </section>

    <NextMatchCard v-if="me && !drawReady" />
    <QuickActions v-if="me" />
    <GroupSnapshot v-if="me && !drawReady" />

    <section v-if="objectives.length" class="panel">
      <AppSectionHeader>
        <span class="section-title">
          <Target :size="16" />
          Federation objectives
        </span>
      </AppSectionHeader>
      <ul class="objectives">
        <li v-for="o in objectives" :key="o.id" :class="`obj--${o.status}`">
          <CircleCheck v-if="o.status === 'met'" :size="18" class="obj-icon" />
          <CircleX v-else-if="o.status === 'failed'" :size="18" class="obj-icon" />
          <span v-else class="obj-dot"></span>
          <span class="obj-text">{{ o.text }}</span>
          <StatPill v-if="o.critical" value="Key" tone="var(--danger)" />
        </li>
      </ul>
    </section>

    <section v-if="results.length" class="panel">
      <AppSectionHeader title="Form" />
      <div class="form-strip">
        <StatPill
          v-for="r in [...results].reverse()"
          :key="r.fixture"
          :value="resultLetter(r.gf, r.ga, r.pens)"
          :tone="letterTone(resultLetter(r.gf, r.ga, r.pens))"
        />
      </div>
      <RouterLink v-for="r in results" :key="r.fixture" :to="`/report/${r.fixture}`" class="result">
        <span class="result-date">{{ formatShort(r.date) }}</span>
        <NationFlag :id="r.opp" :size="20" name />
        <span class="result-comp">{{ r.comp }}</span>
        <span class="result-score" :style="{ color: letterTone(resultLetter(r.gf, r.ga, r.pens)) }">
          {{ r.gf }}–{{ r.ga }}
        </span>
      </RouterLink>
    </section>

    <section v-if="news.length" class="panel">
      <AppSectionHeader>
        Inbox
        <template #actions>
          <RouterLink to="/inbox" class="link">
            {{ unread ? `${unread} unread` : "All" }}
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
          <span class="news-title">{{ n.title }}</span>
          <span class="news-date">{{ formatShort(n.date) }}</span>
        </div>
        <div class="news-body">{{ n.body }}</div>
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

.section-title {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1-5);
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

.objectives {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.objectives li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.obj-text {
  flex: 1;
  min-width: 0;
}

.obj-dot {
  width: 10px;
  height: 10px;
  margin: 0 4px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  flex-shrink: 0;
}

.obj--met .obj-icon {
  color: var(--success);
}

.obj--failed .obj-icon {
  color: var(--danger);
}

.obj--met .obj-text,
.obj--failed .obj-text {
  color: var(--text-muted);
}

.form-strip {
  display: flex;
  gap: var(--sp-1);
  margin-bottom: var(--sp-2);
}

.result {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) 0;
  border-top: 1px solid var(--border-light);
  color: var(--text);
  text-decoration: none;
}

.result :deep(.nation) {
  flex: 1;
  min-width: 0;
}

.result-date {
  width: 48px;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.result-comp {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  max-width: 90px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.result-score {
  width: 40px;
  text-align: end;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
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
