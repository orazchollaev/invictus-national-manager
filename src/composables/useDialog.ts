import { reactive } from "vue"
import { i18n } from "@/i18n"

const t = (key: string) => i18n.global.t(key)

interface DialogState {
  visible: boolean
  type: "alert" | "confirm"
  message: string
  confirmLabel: string
  dangerous: boolean
  resolve: ((value: boolean) => void) | null
}

export const dialogState = reactive<DialogState>({
  visible: false,
  type: "alert",
  message: "",
  confirmLabel: "",
  dangerous: false,
  resolve: null,
})

export function resolveDialog(value: boolean) {
  dialogState.visible = false
  dialogState.resolve?.(value)
  dialogState.resolve = null
}

export function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    dialogState.type = "alert"
    dialogState.message = message
    dialogState.dangerous = false
    dialogState.confirmLabel = t("common.ok")
    dialogState.resolve = () => resolve()
    dialogState.visible = true
  })
}

export interface ConfirmOptions {
  confirmLabel?: string
  dangerous?: boolean
}

export function showConfirm(message: string, opts: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    dialogState.type = "confirm"
    dialogState.message = message
    dialogState.dangerous = opts.dangerous ?? false
    dialogState.confirmLabel = opts.confirmLabel ?? t("common.confirm")
    dialogState.resolve = resolve
    dialogState.visible = true
  })
}
