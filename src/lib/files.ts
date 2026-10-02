/**
 * Handing a text file to the user and reading one back. In the browser a download
 * does; in the Android app a download link goes nowhere, so the file is written to
 * the cache and offered through the share sheet (Drive, Files, a chat…).
 */
import { Capacitor } from "@capacitor/core"

export async function exportTextFile(name: string, text: string, mime = "application/json") {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem")
    const { Share } = await import("@capacitor/share")
    const { uri } = await Filesystem.writeFile({
      path: name,
      data: text,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    await Share.share({ title: name, files: [uri] })
    return
  }
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Ask for a file and read it as text; null when the user picks nothing. */
export function pickTextFile(accept = ".json,application/json"): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.addEventListener("change", async () => {
      const file = input.files?.[0]
      resolve(file ? await file.text() : null)
    })
    input.addEventListener("cancel", () => resolve(null))
    input.click()
  })
}
