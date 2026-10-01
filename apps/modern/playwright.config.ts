import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node ../../mock-api/server.mjs",
      url: "http://localhost:4000/health",
      reuseExistingServer: true,
    },
    {
      command: "pnpm start",
      url: "http://localhost:3001",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
