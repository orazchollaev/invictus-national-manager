import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  plugins: [vue()],
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
