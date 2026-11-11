import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import { readFileSync } from "node:fs"

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "./",
  server: {
    host: true,
    port: 2010,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    // Flags are ~1 KB SVGs; inlined as base64 they would all sit in the startup
    // chunk. As files only the ones on screen are read.
    assetsInlineLimit: (file) => (file.endsWith(".svg") ? false : undefined),
    rolldownOptions: {
      output: {
        codeSplitting: {
          // facesjs (~300 kB) in a chunk of its own, loaded with the first face drawn
          // (PersonFace). Left to itself the bundler shares a chunk between it and the
          // name pools the engine needs at startup, so it came with the app.
          groups: [{ name: "facesjs", test: /[\\/]node_modules[\\/].*facesjs/ }],
        },
      },
    },
  },
})
