<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import type { Player } from "@/engine/types"
import type { Coach } from "@/engine/world/types"
import { faceSvg, type FaceSubject } from "@/lib/faces"
import { nationDef } from "@/modules/world/services/statics"
import { useWorldStore } from "@/modules/world/store"

const props = withDefaults(
  defineProps<{
    player?: Pick<Player, "id" | "last" | "nationId" | "face"> | null
    coach?: Pick<Coach, "face" | "last" | "nationality" | "nationId"> | null
    /** The user: his name, nationality, the job he holds, the save's seed and the face he chose. */
    manager?: {
      name: string
      nationality: string
      nationId: string | null
      seed: number
      face?: string
    } | null
    /** Width in px. */
    size?: number
    /** Head and shoulders on a card in the nation's colours (for lists). */
    head?: boolean
    /** The head in a circle (tokens on the pitch). */
    round?: boolean
  }>(),
  { player: null, coach: null, manager: null, size: 96, head: false, round: false }
)

const world = useWorldStore()

function subject(): FaceSubject | null {
  if (props.player) {
    const def = nationDef(props.player.nationId)
    // A short record (id, name, nation) carries no face edits of its own: ask the world.
    const edit = props.player.face ?? world.world?.state.players[props.player.id]?.face
    return {
      key: props.player.id,
      edit,
      last: props.player.last,
      nationId: props.player.nationId,
      cultures: def?.cultures ?? [],
      role: "player",
      color: def?.color,
    }
  }
  const c = props.coach
  const m = props.manager
  if (!c && !m) return null
  const nationality = c?.nationality ?? m!.nationality
  const job = c?.nationId ?? m?.nationId ?? nationality
  return {
    key: c?.face ?? m!.face ?? `manager:${m!.seed}:${m!.name}`,
    last: c?.last ?? m!.name.split(" ").pop() ?? "",
    nationId: nationality,
    cultures: nationDef(nationality)?.cultures ?? [],
    role: "coach",
    color: nationDef(job)?.color,
  }
}

// Drawn once on screen: a long list only pays for the faces it shows.
const el = ref<HTMLElement | null>(null)
const seen = ref(typeof IntersectionObserver === "undefined")
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (seen.value || !el.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      seen.value = true
      observer?.disconnect()
    },
    { rootMargin: "200px" }
  )
  observer.observe(el.value)
})
onBeforeUnmount(() => observer?.disconnect())

/** The card's tint: the colour of the shirt he wears. */
const tint = computed(() => subject()?.color ?? "")

const svg = computed(() => {
  if (!seen.value) return ""
  const s = subject()
  return s ? faceSvg(s, props.round ? "round" : props.head ? "card" : "full") : ""
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- SVG markup built locally by facesjs -->
  <span
    ref="el"
    class="face"
    :class="{ head: head && !round, round }"
    :style="{ width: `${size}px`, '--face-tint': tint || undefined }"
    aria-hidden="true"
    v-html="svg"
  />
</template>

<style scoped>
.face {
  display: inline-block;
  flex: none;
  aspect-ratio: 2 / 3;
  line-height: 0;
}

.face.head {
  --face-tint: var(--accent);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 25%;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--face-tint) 12%, var(--surface)),
    color-mix(in srgb, var(--face-tint) 38%, var(--surface))
  );
}

.face.round {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 50%;
}

.face :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
