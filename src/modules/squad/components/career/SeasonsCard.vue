<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { AppCard, AppSectionHeader, AppTable } from "@/components/ui"
import type { Player } from "@/engine/types"
import { useWorldStore } from "@/modules/world/store"
import { seasonLabel, seasonOf, seasonRows } from "@/modules/squad/utils/international"

const props = defineProps<{ player: Player }>()

const { t } = useI18n()
const world = useWorldStore()

const rows = computed(() => seasonRows(props.player, seasonOf(world.date)))
const clubName = (id: string) => world.world?.clubs.get(id)?.name ?? "—"
</script>

<template>
  <AppCard padding="md">
    <AppSectionHeader :title="t('squad.player.intl.seasons')" />
    <AppTable>
      <thead>
        <tr>
          <th>{{ t("squad.player.intl.season") }}</th>
          <th>{{ t("squad.player.club") }}</th>
          <th class="num">{{ t("squad.player.intl.capsShort") }}</th>
          <th class="num">{{ t("squad.player.intl.goalsShort") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.season" :class="{ current: r.current }">
          <td>{{ seasonLabel(r.season) }}</td>
          <td class="club">{{ clubName(r.clubId) }}</td>
          <td class="num">{{ r.capsGained }}</td>
          <td class="num">{{ r.goalsGained }}</td>
        </tr>
      </tbody>
    </AppTable>
  </AppCard>
</template>

<style scoped>
.num {
  text-align: end;
}

.club {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current td {
  font-weight: 700;
}
</style>
