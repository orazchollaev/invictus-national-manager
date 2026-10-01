<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import confetti from "canvas-confetti"
import { Landmark } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { useWorldStore } from "@/modules/world/store"
import { formatDate } from "@/i18n/dates"
import { hostCheck, hostLevelOf, hostRequirement, withProjects } from "@/engine/world/stadiums"
import { compName, nationName } from "@/i18n/text"
import { seats } from "@/modules/stadiums/utils/hosting"

const props = defineProps<{ compId: string }>()

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const info = world.derive((w) => {
  const inst = w.state.competitions[props.compId]
  const me = w.state.career.nationId
  if (!inst || !me) return null
  const partners = inst.hosts.filter((h) => h !== me).map((h) => nationName(h))
  const level = hostLevelOf(inst.kind)
  const req = level ? hostRequirement(level, w.def(inst.hosts[0]).confed) : null
  const nations = inst.hosts.map((h) => w.state.nations[h]).filter(Boolean)
  const now = req
    ? hostCheck(
        nations.flatMap((n) => n.stadiums ?? []),
        req
      )
    : null
  const building = (w.state.nations[me]?.projects ?? []).filter((p) => p.forComp === inst.id)
  const planned = req
    ? hostCheck(
        nations.flatMap((n) => withProjects(n)),
        req
      )
    : null
  return {
    inst: { defId: inst.defId, year: inst.year },
    start: inst.start,
    hosts: inst.hosts,
    partners,
    world: inst.kind === "world-cup",
    req,
    now,
    planned,
    building,
  }
}, null)

const compLabel = computed(() => (info.value ? compName(info.value.inst) : ""))

onMounted(() => {
  // A small celebration: the reduced-motion setting is honoured by the library.
  void confetti({
    particleCount: 120,
    spread: 75,
    origin: { y: 0.35 },
    disableForReducedMotion: true,
  })
})

function stadiums() {
  sheet.value?.close()
  router.push("/stadiums")
}
</script>

<template>
  <AppSheet ref="sheet" :title="t('core.hosting.title')" @close="world.seenHosting()">
    <div v-if="info" class="hosting">
      <div class="flags">
        <NationFlag
          v-for="h in info.hosts"
          :id="h"
          :key="h"
          :size="info.hosts.length > 2 ? 44 : 64"
        />
      </div>
      <div class="eyebrow">
        <Landmark :size="14" />
        {{ t("core.hosting.eyebrow") }}
      </div>
      <h2 class="title">{{ compLabel }}</h2>
      <p class="lead">
        {{
          info.partners.length
            ? t("core.hosting.together", { partners: info.partners.join(", "), name: compLabel })
            : t("core.hosting.coming", { name: compLabel })
        }}
        {{
          t("core.hosting.kickoff", {
            date: formatDate(info.start),
            extra: info.world ? t("core.hosting.worldWatching") : "",
          })
        }}
      </p>
      <ul v-if="info.req && info.now && info.planned" class="checks">
        <li>
          <span>{{ t("core.hosting.grounds", { seats: seats(info.req.minCapacity) }) }}</span>
          <strong>{{ info.now.venues }}/{{ info.req.venues }}</strong>
        </li>
        <li>
          <span>{{ t("core.hosting.showpiece") }}</span>
          <strong>
            {{
              info.now.showpiece
                ? t("core.hosting.ready")
                : t("core.hosting.needed", { seats: seats(info.req.showpiece) })
            }}
          </strong>
        </li>
      </ul>
      <p v-if="info.building.length" class="note">
        {{ t("core.hosting.projects", { n: info.building.length }, info.building.length) }}
      </p>
      <p v-else-if="info.now?.ready" class="note">{{ t("core.hosting.groundsReady") }}</p>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="tonal" block @click="stadiums">
          {{ t("core.hosting.seeStadiums") }}
        </AppButton>
        <AppButton variant="filled" block @click="sheet?.close()">
          {{ t("core.hosting.brilliant") }}
        </AppButton>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.hosting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
  text-align: center;
}

.flags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-2);
  animation: rise 0.6s var(--ease) both;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--gold-soft);
  color: var(--gold-text);
  font-size: var(--fs-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 800;
}

.lead,
.note {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.checks {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  font-size: var(--fs-sm);
}

.checks li {
  display: flex;
  justify-content: space-between;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.actions {
  display: flex;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4) calc(var(--sp-3) + var(--safe-bottom));
}

@keyframes rise {
  from {
    transform: translateY(12px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
</style>
