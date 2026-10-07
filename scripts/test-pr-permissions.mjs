// Test Actions' own token; no external service credentials are used.
import { mkdir, writeFile } from 'node:fs/promises';
const repo = process.env.GITHUB_REPOSITORY;
if (repo !== 'burakpirgun/sumac-automation') throw new Error('Unexpected repository');
async function api(path, method = 'GET', body) {
  const response = await fetch('https://api.github.com/repos/' + repo + '/' + path, {
    method, headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error('GitHub ' + method + ': HTTP ' + response.status + ' ' + String(data.message ?? '').slice(0, 300));
  return data;
}
const branch = 'sumac/permission-test-' + process.env.GITHUB_RUN_ID + '-' + process.env.GITHUB_RUN_ATTEMPT;
const head = await api('git/ref/heads/main');
await api('git/refs', 'POST', { ref: 'refs/heads/' + branch, sha: head.object.sha });
await api('contents/.sumac/permission-tests/' + process.env.GITHUB_RUN_ID + '.md', 'PUT', {
  branch, message: 'Record Actions pull request permission test',
  content: Buffer.from('Actions token permission diagnostic. No product code changes.\n').toString('base64')
});
const pr = await api('pulls', 'POST', { head: branch, base: 'main', draft: true,
  title: 'Diagnostic: Actions token can create pull requests',
  body: 'Created by the workflow GITHUB_TOKEN to verify the repository permission setting. No website changes or Claude calls. This diagnostic is closed after successful creation.' });
await mkdir('.sumac-run', { recursive: true });
await writeFile('.sumac-run/pr-permission-test.json', JSON.stringify({ status: 'passed', pullRequestUrl: pr.html_url, token: 'workflow GITHUB_TOKEN' }, null, 2));
console.log('ACTIONS_PR_PERMISSION_PASSED ' + pr.html_url);
await api('pulls/' + pr.number, 'PATCH', { state: 'closed' });
console.log('Diagnostic pull request closed; branch retained.');
