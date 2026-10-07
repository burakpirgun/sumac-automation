import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateJob, validateProposal, resultBranch, resumeAttempt } from './development-core.mjs';
const job = { id: 'test-job', objective: 'Return twice a numeric input', exportName: 'double', cases: [{ args: [1], expected: 2 }, { args: [2], expected: 4 }, { args: [0], expected: 0 }], maxAttempts: 2 };
test('reject malformed jobs and traversal before calling any service', () => {
  assert.equal(validateJob(job), job);
  assert.throws(() => validateJob({ ...job, id: '../escape' }));
  assert.throws(() => validateJob({ ...job, cases: [{ args: [] }] }));
  assert.throws(() => validateJob({ ...job, maxAttempts: 100 }));
});
test('only accept matching, audited, bounded exports', () => {
  const p = { jobId: job.id, source: 'export function double(x: number) { return x * 2; }', audit: { verdict: 'pass' } };
  assert.equal(validateProposal(p, job), p.source);
  assert.throws(() => validateProposal({ ...p, audit: { verdict: 'revise' } }, job));
  assert.throws(() => validateProposal({ ...p, source: 'export function double() { return process.env; }' }, job));
  assert.throws(() => validateProposal({ ...p, jobId: 'other' }, job));
});
test('stable branches distinguish changed jobs and terminal work is not repeated', () => {
  assert.equal(resultBranch(job), resultBranch(structuredClone(job)));
  assert.notEqual(resultBranch(job), resultBranch({ ...job, objective: job.objective + '.' }));
  assert.equal(resumeAttempt({ status: 'running', attempt: 1 }, 2), 1);
  assert.equal(resumeAttempt({ status: 'retry', attempt: 2 }, 2), 2);
  assert.equal(resumeAttempt({ status: 'passed' }, 2), null);
  assert.equal(resumeAttempt({ status: 'blocked' }, 2), null);
  assert.equal(resumeAttempt({ status: 'retry', attempt: 3 }, 2), null);
});
