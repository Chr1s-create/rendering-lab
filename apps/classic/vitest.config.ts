import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@lab/learn-ui/client": path.resolve(__dirname, "../../packages/learn-ui/src/client.ts"),
      "@lab/learn-ui/server": path.resolve(__dirname, "../../packages/learn-ui/src/server.ts"),
      "@lab/learn-ui/ui": path.resolve(__dirname, "../../packages/learn-ui/src/ui/index.ts"),
      "@lab/learn-ui/lib": path.resolve(__dirname, "../../packages/learn-ui/src/lib.ts"),
      "@lab/learn-ui/content": path.resolve(__dirname, "../../packages/learn-ui/src/content/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.tsx", "**/*.test.ts"],
  },
});
