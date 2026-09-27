import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  // Leave absolute URLs such as <img src="/logo.png"> (served from public/) alone:
  // as imports they resolve to file:///logo.png, which Node cannot load.
  plugins: [vue({ template: { transformAssetUrls: { includeAbsolute: false } } })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/*.test.ts"],
    // Several suites simulate the world for years (every nation, every match).
    // On a shared build machine (Vercel) with the pool running files in
    // parallel they take several times longer than locally, so they must fail
    // on assertions, never on the clock.
    testTimeout: 300000,
    hookTimeout: 300000,
  },
})
