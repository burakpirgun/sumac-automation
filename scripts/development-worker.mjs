import { configure, tasks, runs } from '@trigger.dev/sdk';
import ts from 'typescript';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateJob, validateProposal, jobDigest, resultBranch, resumeAttempt } from './development-core.mjs';

const repository = process.env.GITHUB_REPOSITORY;
const githubToken = process.env.GITHUB_TOKEN;
if (repository !== 'burakpirgun/sumac-automation' || !githubToken) throw new Error('Worker is restricted to the Sumac automation repository');
const runUrl = `https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const reportDir = resolve('.sumac-run');
await mkdir(reportDir, { recursive: true });

async function github(path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    method, headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 404 && method === 'GET') return null;
  if (!response.ok) throw new Error(`GitHub ${method} failed: HTTP ${response.status}`);
  return response.status === 204 ? {} : response.json();
}
async function checkpoint(branch, id, state) {
  const path = `.sumac/results/${id}.json`;
  const file = await github(`contents/${path}?ref=${encodeURIComponent(branch)}`);
  await github(`contents/${path}`, 'PUT', { message: `Checkpoint ${id}: ${state.status}`, branch,
    content: Buffer.from(JSON.stringify(state, null, 2) + '\n').toString('base64'), ...(file ? { sha: file.sha } : {}) });
  await writeFile(`${reportDir}/${id}.json`, JSON.stringify(state, null, 2) + '\n');
}
async function saveSource(branch, path, source) {
  const file = await github(`contents/${path}?ref=${encodeURIComponent(branch)}`);
  await github(`contents/${path}`, 'PUT', { message: `Add verified development result ${path}`, branch,
    content: Buffer.from(source).toString('base64'), ...(file ? { sha: file.sha } : {}) });
}
let triggerReady = false;
async function initializeTrigger() {
  if (triggerReady) return;
  const pat = process.env.TRIGGER_ACCESS_TOKEN;
  if (!pat) throw new Error('TRIGGER_ACCESS_TOKEN is missing');
  const response = await fetch('https://api.trigger.dev/api/v1/projects/proj_vjirfqjbxrwdblvnjyjm/prod', {
    headers: { Authorization: `Bearer ${pat}` }, signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Trigger environment lookup failed: HTTP ${response.status}`);
  const env = await response.json();
  if (typeof env.apiKey !== 'string' || env.apiUrl && new URL(env.apiUrl).hostname !== 'api.trigger.dev') throw new Error('Unexpected Trigger environment response');
  // Hide the derived environment key before SDK calls could log an error containing it.
  console.log(`::add-mask::${env.apiKey}`);
  configure({ accessToken: env.apiKey, baseURL: 'https://api.trigger.dev' });
  triggerReady = true;
}
function command(program, args, options = {}) {
  const result = spawnSync(program, args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 100_000, ...options });
  if (result.error || result.status !== 0) throw new Error(`${program} check failed: ${(result.stderr || result.stdout || result.error?.message || 'nonzero exit').slice(-2000)}`);
  return result.stdout;
}
function sandboxTest(source, job, directory) {
  command('docker', ['pull', 'node:24-bookworm-slim'], { timeout: 180_000 });
  const containerName = `sumac-${process.env.GITHUB_RUN_ID}-${job.id}`;
  try {
    const output = command('docker', ['run', '--name', containerName, '--rm', '--network', 'none', '--read-only',
      '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--pids-limit', '64', '--memory', '256m', '--cpus', '1',
      '--user', '65534:65534', '--tmpfs', '/tmp:rw,noexec,nosuid,size=16m',
      '--env', 'HTTP_PROXY=', '--env', 'HTTPS_PROXY=', '--env', 'ALL_PROXY=',
      '--mount', `type=bind,src=${directory},dst=/app,readonly`, '--workdir', '/app',
      'node:24-bookworm-slim', 'node', 'acceptance.cjs'], { timeout: 30_000 });
    const expectedMarker = `SUMAC_ACCEPTANCE_PASSED:${job.cases.length}`;
    if (!output.split('\n').includes(expectedMarker)) throw new Error('Acceptance harness did not finish all cases');
    return { passed: job.cases.length, network: 'none', credentials: 'none', containerRoot: 'read-only' };
  } finally {
    spawnSync('docker', ['rm', '-f', containerName], { encoding: 'utf8', timeout: 10_000 });
  }
}

if (process.env.SUMAC_DIAGNOSTIC_RUN_ID) {
  await initializeTrigger();
  const diagnostic = await runs.retrieve(process.env.SUMAC_DIAGNOSTIC_RUN_ID);
  const result = { runId: diagnostic.id, status: diagnostic.status, error: String(diagnostic.error?.message ?? '').replace(/(?:tr_(?:pat|prod|dev)_|sk-ant-)[A-Za-z0-9_-]+/g, '[redacted]') };
  console.log(JSON.stringify(result));
  await writeFile(`${reportDir}/diagnostic.json`, JSON.stringify(result) + '\n');
}

const files = (await readdir('.sumac/jobs')).filter(name => /^[a-z0-9-]+\.json$/.test(name)).sort();
let selected = false;
for (const file of files) {
  const job = validateJob(JSON.parse(await readFile(`.sumac/jobs/${file}`, 'utf8')));
  if (file !== `${job.id}.json`) throw new Error('Job filename must match its ID');
  const branch = resultBranch(job);
  const remote = await github(`contents/.sumac/results/${job.id}.json?ref=${encodeURIComponent(branch)}`);
  let state = remote ? JSON.parse(Buffer.from(remote.content, 'base64').toString('utf8')) : null;
  if (state && (state.digest !== jobDigest(job) || state.jobId !== job.id)) throw new Error('Checkpoint identity mismatch');
  if (resumeAttempt(state, job.maxAttempts) === null) continue;
  selected = true;
  const head = await github('git/ref/heads/main');
  if (!await github(`git/ref/heads/${branch}`)) await github('git/refs', 'POST', { ref: `refs/heads/${branch}`, sha: head.object.sha });
  await initializeTrigger();
  let attempt = resumeAttempt(state, job.maxAttempts);
  while (attempt <= job.maxAttempts) {
    state = { ...state, jobId: job.id, digest: jobDigest(job), branch, attempt, status: 'running', workflow: runUrl, updatedAt: new Date().toISOString() };
    await checkpoint(branch, job.id, state);
    try {
      let handleId = state.handleId;
      const resumedExistingRun = Boolean(handleId);
      if (resumedExistingRun) console.log(JSON.stringify({ jobId: job.id, phase: "resume", runId: handleId }));
      if (!handleId) {
        const handle = await tasks.trigger('sumac-development-job', { jobId: job.id, objective: job.objective,
          exportName: job.exportName, acceptance: job.cases, ...(state.feedback ? { feedback: state.feedback } : {}) },
          { idempotencyKey: `dev-${job.id}-${state.digest}-${attempt}`, idempotencyKeyTTL: '7d' });
        handleId = handle.id;
        state = { ...state, handleId };
        await checkpoint(branch, job.id, state);
      }
      const run = await runs.poll(handleId, { pollIntervalMs: 3000 });
      if (run.status !== 'COMPLETED') throw new Error(`Development task ended with ${run.status}: ${run.error?.message ?? 'no error details'}`);
      const source = validateProposal(run.output, job);
      const directory = resolve(reportDir, `${job.id}-${attempt}`);
      await mkdir(directory, { recursive: true });
      const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }, reportDiagnostics: true });
      if (compiled.diagnostics?.some(d => d.category === ts.DiagnosticCategory.Error)) throw new Error('Generated TypeScript syntax is invalid');
      // Type checking does not execute the proposed module.
      await writeFile(`${directory}/unit.ts`, source);
      command('node', ['node_modules/typescript/bin/tsc', '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2022', `${directory}/unit.ts`]);
      await writeFile(`${directory}/unit.cjs`, compiled.outputText);
      await writeFile(`${directory}/cases.json`, JSON.stringify(job.cases));
      const harness = `const assert = require('node:assert/strict');\nconst fn = require('./unit.cjs')[${JSON.stringify(job.exportName)}];\nconst cases = require('./cases.json');\nassert.equal(typeof fn, 'function');\nfor (const c of cases) { if (c.throws) assert.throws(() => fn(...c.args)); else assert.deepStrictEqual(fn(...c.args), c.expected); }\nconsole.log('SUMAC_ACCEPTANCE_PASSED:' + cases.length);\n`;
      await writeFile(`${directory}/acceptance.cjs`, harness);
      const tests = sandboxTest(source, job, directory);
      await saveSource(branch, `src/generated/${job.id}.ts`, source);
      state = { ...state, status: 'passed', resumedExistingRun, tests, audit: run.output.audit, summary: run.output.summary, generationRunId: handleId, completedAt: new Date().toISOString() };
      await checkpoint(branch, job.id, state);
      // Some repositories disable Actions-created PRs. Preserve the branch/report even then.
      const existing = await github(`pulls?head=${encodeURIComponent(repository.split('/')[0] + ':' + branch)}&state=all`);
      let pull = existing?.[0];
      if (!pull) {
        try {
          pull = await github('pulls', 'POST', { title: `Sumac job: ${job.id}`, head: branch, base: 'main',
            body: `${state.summary}\n\nVerified ${tests.passed} fixed acceptance cases in an isolated container with no network or credentials. Separate Claude source audit passed.\n\nGenerated source: src/generated/${job.id}.ts\nExecution report: .sumac/results/${job.id}.json\nWorkflow: ${runUrl}\n\nGenerated results are not automatically merged.` });
        } catch { state = { ...state, pullRequestStatus: 'unavailable; verified branch retained' }; }
      }
      if (pull) state = { ...state, pullRequestUrl: pull.html_url };
      await checkpoint(branch, job.id, state);
      console.log(JSON.stringify({ jobId: job.id, status: state.status, branch, tests, pullRequestUrl: state.pullRequestUrl }));
      break;
    } catch (error) {
      // No raw provider objects, keys, or unlimited diagnostic output are persisted.
      const feedback = String(error.message).replace(/(?:tr_(?:pat|prod|dev)_|sk-ant-)[A-Za-z0-9_-]+/g, '[redacted]').slice(0, 2000);
      state = { ...state, feedback, status: attempt < job.maxAttempts ? 'retry' : 'blocked', attempt: attempt < job.maxAttempts ? attempt + 1 : attempt, handleId: null, updatedAt: new Date().toISOString() };
      await checkpoint(branch, job.id, state);
      console.log(JSON.stringify({ jobId: job.id, status: state.status, attempt }));
      if (state.status === 'blocked') { process.exitCode = 1; break; }
      attempt = state.attempt;
    }
  }
  break; // Bound each invocation to one job and at most two generation attempts.
}
if (!selected) {
  await writeFile(`${reportDir}/idle.json`, JSON.stringify({ status: 'idle', reason: 'No queued nonterminal jobs' }) + '\n');
  console.log('No queued jobs. No Claude calls made.');
}
