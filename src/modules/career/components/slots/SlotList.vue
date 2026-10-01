<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { Plus, Trash2 } from "@lucide/vue"
import { AppButton } from "@/components/ui"
import { NationFlag } from "@/modules/nations/components/badge"
import { deleteSlot, listSlots, SLOT_COUNT, type SlotMeta } from "@/modules/world/services/saves"
import { useWorldStore } from "@/modules/world/store"
import { nationName } from "@/i18n/text"
import { formatDate } from "@/i18n/dates"
import { showConfirm } from "@/composables/useDialog"

const props = defineProps<{
  /** load: open a save. new: pick a slot for a new career (overwrite asks first). */
  mode: "load" | "new"
}>()

const emit = defineEmits<{ pick: [slot: number] }>()

const { t } = useI18n()
const world = useWorldStore()
const slots = ref<(SlotMeta | null)[]>(Array(SLOT_COUNT).fill(null))

async function refresh() {
  slots.value = await listSlots()
}

onMounted(refresh)

const nationLabel = (id: string | null) => (id ? nationName(id) : t("career.slots.unemployed"))

async function choose(n: number) {
  const meta = slots.value[n - 1]
  if (props.mode === "load" && !meta) return
  if (props.mode === "new" && meta) {
    const ok = await showConfirm(t("career.slots.overwrite", { name: meta.managerName, n }), {
      confirmLabel: t("career.slots.overwriteBtn"),
      dangerous: true,
    })
    if (!ok) return
  }
  emit("pick", n)
}

async function remove(n: number) {
  const ok = await showConfirm(t("career.slots.deleteConfirm"), {
    confirmLabel: t("career.slots.delete"),
    dangerous: true,
  })
  if (!ok) return
  await deleteSlot(n)
  if (world.slot === n) world.close()
  await refresh()
}
</script>

<template>
  <div class="slots">
    <div v-for="(meta, i) in slots" :key="i" class="slot" :class="{ 'slot--empty': !meta }">
      <button class="slot-main" :disabled="mode === 'load' && !meta" @click="choose(i + 1)">
        <span class="slot-num">{{ i + 1 }}</span>
        <template v-if="meta">
          <NationFlag :id="meta.nationId" :size="36" />
          <span class="slot-text">
            <span class="slot-title">{{ meta.managerName }}</span>
            <span class="slot-sub">
              {{ nationLabel(meta.nationId) }} · {{ formatDate(meta.date) }}
            </span>
          </span>
        </template>
        <template v-else>
          <span class="slot-empty-icon"><Plus :size="20" /></span>
          <span class="slot-text">
            <span class="slot-title">{{ t("career.slots.empty") }}</span>
            <span class="slot-sub">
              {{ mode === "new" ? t("career.slots.startHere") : t("career.slots.noSave") }}
            </span>
          </span>
        </template>
      </button>
      <AppButton
        v-if="meta && mode === 'load'"
        variant="text"
        icon-only
        :aria-label="t('career.slots.deleteSave')"
        @click="remove(i + 1)"
      >
        <Trash2 :size="18" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.slots {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.slot {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.slot--empty {
  border-style: dashed;
  background: transparent;
}

.slot-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  min-width: 0;
  border: none;
  background: none;
  color: inherit;
  text-align: start;
  padding: 0;
}

.slot-num {
  width: 20px;
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-muted);
}

.slot-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-subtle);
  color: var(--accent);
}

.slot-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.slot-title {
  font-weight: 700;
}

.slot-sub {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
