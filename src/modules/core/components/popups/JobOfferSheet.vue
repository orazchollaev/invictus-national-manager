<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Briefcase } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { showConfirm } from "@/composables/useDialog"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/engine/calendar/dates"

const props = defineProps<{ nationId: string }>()

const router = useRouter()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const info = world.derive((w) => {
  const def = w.def(props.nationId)
  const n = w.state.nations[props.nationId]
  const c = w.state.career
  const offer = c.offers.find((o) => o.nationId === props.nationId)
  return {
    name: def.name,
    confed: def.confed,
    rank: w.fifaRank(props.nationId),
    federation: n?.reputation ?? 0,
    stadium: n?.stadium ?? 1,
    expires: offer?.expires,
    current: c.nationId ? w.def(c.nationId).name : null,
    currentRank: c.nationId ? w.fifaRank(c.nationId) : 0,
  }
}, null)

/** What closing the sheet means; read once its exit animation has run. */
let decided = false

async function accept() {
  const current = info.value?.current
  if (current) {
    const ok = await showConfirm(`Leave ${current} to take the ${info.value!.name} job?`, {
      confirmLabel: "Take the job",
    })
    if (!ok) return
  }
  decided = true
  world.takeJob(props.nationId)
  sheet.value?.close()
  router.push("/home")
}

function decline() {
  decided = true
  world.turnDown(props.nationId)
  sheet.value?.close()
}

function later() {
  sheet.value?.close()
}

function onClose() {
  if (!decided) world.seenOffer()
}
</script>

<template>
  <AppSheet ref="sheet" title="Job offer" :dismiss-on-outside-click="false" @close="onClose">
    <div v-if="info" class="offer">
      <div class="badge">
        <Briefcase :size="16" />
        A federation wants you
      </div>
      <NationFlag :id="nationId" :size="72" />
      <h2 class="name">{{ info.name }}</h2>
      <p class="pitch">The {{ info.name }} federation would like you as their new head coach.</p>
      <div class="facts">
        <div class="fact">
          <strong>{{ info.rank ? `#${info.rank}` : "—" }}</strong>
          <span>FIFA ranking</span>
        </div>
        <div class="fact">
          <strong>{{ info.federation.toFixed(1) }}</strong>
          <span>Federation /10</span>
        </div>
        <div class="fact">
          <strong>{{ "★".repeat(info.stadium) }}</strong>
          <span>Stadiums</span>
        </div>
      </div>
      <p v-if="info.current" class="note">
        You coach {{ info.current }}{{ info.currentRank ? ` (#${info.currentRank})` : "" }}.
        Accepting means leaving them.
      </p>
      <p v-if="info.expires" class="note">The offer stands until {{ formatDate(info.expires) }}.</p>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="filled" block @click="accept">Accept</AppButton>
        <div class="row">
          <AppButton variant="tonal" block @click="later">Decide later</AppButton>
          <AppButton variant="text" block @click="decline">Decline</AppButton>
        </div>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.offer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: var(--fs-xs);
  font-weight: 700;
  animation: pop 0.5s var(--ease) both;
}

.name {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 800;
}

.pitch,
.note {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-2);
  width: 100%;
  margin: var(--sp-1) 0;
}

.fact {
  display: flex;
  flex-direction: column;
  padding: var(--sp-2) var(--sp-1);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.fact strong {
  font-size: var(--fs-md);
  color: var(--text);
}

.fact span {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4) calc(var(--sp-3) + var(--safe-bottom));
}

.row {
  display: flex;
  gap: var(--sp-2);
}

@keyframes pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
