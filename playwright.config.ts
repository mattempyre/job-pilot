import { defineConfig, devices } from "playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? "3100");
const configuredBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = configuredBaseURL ?? `http://localhost:${port}`;
const webServer = configuredBaseURL
  ? undefined
  : {
      command: `JOB_PILOT_E2E_AUTH=1 npm run dev -- --port ${port}`,
      reuseExistingServer: false,
      timeout: 120 * 1000,
      url: baseURL,
    };

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
