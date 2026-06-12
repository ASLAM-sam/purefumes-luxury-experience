// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}/purefumes-vite-cache/frontend`
      : "../.vite-cache/frontend",
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            if (id.includes("recharts")) {
              return "vendor-charts";
            }

            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }

            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }

            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }

            if (id.includes("react") || id.includes("scheduler")) {
              return "vendor-react";
            }
          },
        },
      },
    },
  },
});
