import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("kaplay")) return "kaplay";
        },
      },
    },
  },
});
