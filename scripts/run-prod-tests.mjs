// Triggers both tasks in Production with {} and waits for completion.
// Uses TRIGGER_ACCESS_TOKEN (tr_pat_) to look up the Production environment key the same
// way the Trigger.dev CLI does (GET /api/v1/projects/{ref}/prod). The key stays in memory
// and is never printed.
import { configure, tasks, runs } from "@trigger.dev/sdk";

const projectRef = "proj_vjirfqjbxrwdblvnjyjm";
const apiUrl = process.env.TRIGGER_API_URL ?? "https://api.trigger.dev";
const taskIds = ["sumac-health-check", "sumac-claude-access-check"];

const pat = process.env.TRIGGER_ACCESS_TOKEN;
if (!pat) throw new Error("TRIGGER_ACCESS_TOKEN is not set");

const envResponse = await fetch(`${apiUrl}/api/v1/projects/${projectRef}/prod`, {
  headers: { Authorization: `Bearer ${pat}` },
});
if (!envResponse.ok) throw new Error(`Production environment lookup failed: HTTP ${envResponse.status}`);
const env = await envResponse.json();
configure({ accessToken: env.apiKey, baseURL: env.apiUrl ?? apiUrl });

let failed = false;
for (const taskId of taskIds) {
  const handle = await tasks.trigger(taskId, {});
  const run = await runs.poll(handle.id, { pollIntervalMs: 3000 });
  console.log(JSON.stringify({ taskId, runId: run.id, status: run.status, version: run.version, output: run.output }));
  if (run.status !== "COMPLETED") failed = true;
}
if (failed) process.exit(1);
