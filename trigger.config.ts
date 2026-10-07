import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_vjirfqjbxrwdblvnjyjm",
  runtime: "node",
  dirs: ["./src/trigger"],
  maxDuration: 60,
  retries: { enabledInDev: true, default: { maxAttempts: 3 } },
});
