<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { Download, Play } from "@lucide/vue"
import { AppButton, AppCard, AppField } from "@/components/ui"
import { useModsStore } from "@/modules/mods/store"

const emit = defineEmits<{ export: []; start: [] }>()

const { t } = useI18n()
const store = useModsStore()

const name = ref(store.mod?.name ?? "")
const author = ref(store.mod?.author ?? "")

const counts = store.derive(
  (m) => ({
    nations: m.nations.length,
    clubs: m.clubs.length.toLocaleString(),
    players: Object.values(m.players)
      .reduce((a, r) => a + r.length, 0)
      .toLocaleString(),
  }),
  { nations: 0, clubs: "0", players: "0" }
)

function commit() {
  if (name.value !== store.mod?.name || author.value !== store.mod?.author)
    store.setInfo(name.value, author.value)
}
</script>

<template>
  <div class="panel">
    <AppCard v-if="store.live" padding="md" class="info">
      <p class="hint">{{ t("mods.counts", counts) }}</p>
      <p class="hint">{{ t("editor.rules") }}</p>
    </AppCard>
    <AppCard v-else padding="md" class="info">
      <AppField :label="t('mods.name')" layout="stack">
        <input v-model="name" class="input" maxlength="40" autocomplete="off" @change="commit" />
      </AppField>
      <AppField :label="t('mods.author')" layout="stack">
        <input v-model="author" class="input" maxlength="40" autocomplete="off" @change="commit" />
      </AppField>
      <p class="hint">{{ t("mods.counts", counts) }}</p>
    </AppCard>
    <AppButton v-if="!store.live" variant="tonal" block @click="emit('export')">
      <Download :size="16" />
      {{ t("mods.export") }}
    </AppButton>
    <AppButton v-if="!store.live" variant="filled" block @click="emit('start')">
      <Play :size="16" />
      {{ t("mods.startCareer") }}
    </AppButton>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.info :deep(.card-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
</style>
<style scoped src="./editor.css"></style>
