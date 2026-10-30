import { Capacitor } from "@capacitor/core"
import type { Theme } from "@/modules/settings/store"

/**
 * Native status-bar tint. The colours must match `--surface` in
 * assets/style/design.css: the header sits under the status bar and is
 * painted with it, so any other shade shows as a band.
 *
 * They are duplicated rather than read from CSS because this runs
 * before paint and the Capacitor bridge needs a plain hex string.
 */
const THEME_COLORS: Record<Theme, { color: string; dark: boolean }> = {
  light: { color: "#ffffff", dark: false },
  dark: { color: "#1c1c1e", dark: true },
}

export function useStatusBar() {
  async function setTheme(theme: Theme) {
    if (!Capacitor.isNativePlatform()) return
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar")
      const { color, dark } = THEME_COLORS[theme] ?? THEME_COLORS.dark
      await StatusBar.setBackgroundColor({ color })
      await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
    } catch {
      // ignore — status bar API unavailable
    }
  }

  return { setTheme }
}
