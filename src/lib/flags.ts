// Root-absolute on purpose: a relative glob silently resolves to nothing the
// moment this file moves, and an empty flag set looks like a rendering bug
// rather than a broken path.
const raws = import.meta.glob("/node_modules/circle-flags/flags/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>

const urls: Record<string, string> = {}
for (const path in raws) {
  const code = path.split("/").pop()!.replace(".svg", "").toLowerCase()
  urls[code] = raws[path]
}

/** URL of a circle flag, or undefined for an unknown code. */
export function flagUrl(code: string | undefined | null): string | undefined {
  return code ? urls[code.toLowerCase()] : undefined
}
