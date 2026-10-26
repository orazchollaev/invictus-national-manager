import { ref } from "vue"
import { useWorldStore } from "@/modules/world/store"
import { useSettingsStore } from "@/modules/settings/store"

export type NoticeKind = "offer" | "hosting" | "press" | "board" | "intake" | "invite"

export interface Notice {
  kind: NoticeKind
  /** Tells two notices of one kind apart (two objectives, two offers). */
  key: string
  /** The locale key of the sheet's title. */
  title: string
}

/** The notice whose sheet the user has opened from the home screen. */
const opened = ref<string | null>(null)

/**
 * News and choices that can wait: with quiet notices on they sit on the home screen
 * until the user opens them, instead of stopping the calendar (see GamePopups).
 */
export function useNotices() {
  const world = useWorldStore()
  const settings = useSettingsStore()

  const items = world.derive((w): Notice[] => {
    const s = w.state
    const out: Notice[] = []
    if (s.pendingOffer && s.career.nationId)
      out.push({ kind: "offer", key: `offer-${s.pendingOffer}`, title: "core.offer.title" })
    if (s.pendingHosting)
      out.push({ kind: "hosting", key: `host-${s.pendingHosting}`, title: "core.hosting.title" })
    if (s.pendingPress && !settings.assistantPress)
      out.push({ kind: "press", key: "press", title: "core.press.title" })
    const board = s.career.objectives.find((o) => o.agreed === false)
    if (board && !settings.assistantBoard)
      out.push({ kind: "board", key: `board-${board.id}`, title: "core.board.title" })
    if (s.pendingIntake && settings.showIntake)
      out.push({ kind: "intake", key: "intake", title: "core.intake.title" })
    if (s.invite) out.push({ kind: "invite", key: "invite", title: "invitational.invite.title" })
    return out
  }, [])

  return {
    items,
    opened,
    open: (n: Notice) => (opened.value = n.key),
    close: () => (opened.value = null),
  }
}
