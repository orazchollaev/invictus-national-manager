<script setup lang="ts">
/** On a player's page: ask his club to give him more football. */
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppButton, AppCard, AppSectionHeader } from "@/components/ui"
import { addDays } from "@/engine/calendar/dates"
import { ASK_COOLDOWN, askBlock, askChance } from "@/engine/clubs/ties"
import type { Player } from "@/engine/types"
import { showAlert } from "@/composables/useDialog"
import { formatDate } from "@/i18n/dates"
import { fullName } from "@/engine/players/ability"
import { useWorldStore } from "@/modules/world/store"

const props = defineProps<{ player: Player }>()

const { t } = useI18n()
const world = useWorldStore()

const club = computed(() => world.world?.clubs.get(props.player.clubId))
const block = world.derive((w) => askBlock(props.player, w.state.clubTies, w.state.date), null)
const chance = world.derive((w) => {
  const club = w.clubs.get(props.player.clubId)
  if (!club) return 0
  return Math.round(
    askChance(props.player.role, w.clubProfile(club.id).reputation, w.clubRel(club.id)) * 100
  )
}, 0)
const retryOn = world.derive((w) => {
  const last = w.state.clubTies?.asked[props.player.id]
  return last ? formatDate(addDays(last, ASK_COOLDOWN)) : ""
}, "")

async function ask() {
  const out = world.askClub(props.player.id)
  if (out.status === "blocked") return
  await showAlert(
    t(`clubs.ask.${out.status}`, {
      club: club.value?.name ?? "",
      name: fullName(props.player),
    })
  )
}
</script>

<template>
  <AppCard v-if="club" padding="md" class="ask">
    <AppSectionHeader :title="t('clubs.ask.title')" />
    <p class="hint">{{ t("clubs.ask.hint") }}</p>
    <p v-if="block === 'role'" class="hint">{{ t("clubs.ask.role") }}</p>
    <p v-else-if="block === 'wait'" class="hint">{{ t("clubs.ask.wait", { date: retryOn }) }}</p>
    <p v-else class="hint">{{ t("clubs.ask.chance", { n: chance }) }}</p>
    <AppButton variant="tonal" block :disabled="block !== null" @click="ask">
      {{ t("clubs.ask.button") }}
    </AppButton>
  </AppCard>
</template>

<style scoped>
.ask {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
