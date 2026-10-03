<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { Trophy } from "@lucide/vue"
import { AppButton, AppSheet } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { nationName } from "@/i18n/text"
import { formatDate } from "@/i18n/dates"
import { useWorldStore } from "@/modules/world/store"
import { windowById } from "@/engine/competition/defs/invitational"

const { t } = useI18n()
const router = useRouter()
const world = useWorldStore()
const sheet = ref<InstanceType<typeof AppSheet> | null>(null)

const info = world.derive((w) => {
  const inv = w.state.invite
  const win = inv && windowById(inv.window)
  if (!inv || !win) return null
  const me = w.state.career.nationId
  return {
    host: inv.teams[0],
    hostName: nationName(inv.teams[0]),
    guests: inv.teams.slice(1).filter((id) => id !== me),
    size: inv.teams.length,
    format: inv.format,
    from: win.start,
    to: win.end,
    expires: inv.expires,
  }
}, null)

/** What closing the sheet means; read once its exit animation has run. */
let decided = false

function answer(yes: boolean) {
  decided = true
  const out = world.answerInvite(yes)
  sheet.value?.close()
  if (out && "id" in out) router.push(`/competitions/${out.id}`)
}

function onClose() {
  if (!decided) world.seenInvitation()
}
</script>

<template>
  <AppSheet
    ref="sheet"
    :title="t('invitational.invite.title')"
    :dismiss-on-outside-click="false"
    @close="onClose"
  >
    <div v-if="info" class="invite">
      <div class="badge">
        <Trophy :size="16" />
        {{ t("invitational.invite.badge") }}
      </div>
      <NationFlag :id="info.host" :size="64" />
      <p class="pitch">
        {{ t("invitational.invite.pitch", { host: info.hostName, n: info.size }) }}
      </p>
      <div class="facts">
        <div class="fact">
          <strong>{{ formatDate(info.from) }} – {{ formatDate(info.to) }}</strong>
          <span>{{ t("invitational.window") }}</span>
        </div>
        <div class="fact">
          <strong>{{ t(`invitational.format.${info.format}.name`) }}</strong>
          <span>{{ t(`invitational.format.${info.format}.hint${info.size}`) }}</span>
        </div>
      </div>
      <div class="guests">
        <NationFlag v-for="g in info.guests" :id="g" :key="g" :size="20" name="short" />
      </div>
      <p class="note">{{ t("invitational.invite.expires", { date: formatDate(info.expires) }) }}</p>
    </div>
    <template #footer>
      <div class="actions">
        <AppButton variant="filled" block @click="answer(true)">
          {{ t("invitational.invite.accept") }}
        </AppButton>
        <div class="row">
          <AppButton variant="tonal" block @click="sheet?.close()">
            {{ t("invitational.invite.later") }}
          </AppButton>
          <AppButton variant="text" block @click="answer(false)">
            {{ t("invitational.invite.decline") }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.invite {
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
}

.pitch,
.note {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-2);
  width: 100%;
}

.fact {
  display: flex;
  flex-direction: column;
  padding: var(--sp-2) var(--sp-1);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.fact strong {
  font-size: var(--fs-sm);
  color: var(--text);
}

.fact span {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.guests {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-1) var(--sp-3);
  font-size: var(--fs-sm);
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
</style>
