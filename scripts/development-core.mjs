import { createHash } from 'node:crypto';

export function validateJob(job) {
  if (!job || !/^[a-z0-9-]{1,60}$/.test(job.id) || !/^[A-Za-z][A-Za-z0-9]{0,60}$/.test(job.exportName)) throw new Error('Invalid job identity');
  if (typeof job.objective !== 'string' || job.objective.length < 10 || job.objective.length > 4000) throw new Error('Invalid objective');
  if (!Array.isArray(job.cases) || job.cases.length < 3 || job.cases.length > 30) throw new Error('Invalid acceptance cases');
  for (const c of job.cases) {
    if (!Array.isArray(c.args) || c.args.length > 10 || (c.throws !== true && !Object.hasOwn(c, 'expected'))) throw new Error('Case needs arguments and an expected result or throws=true');
  }
  if (![1, 2].includes(job.maxAttempts)) throw new Error('Job attempts must be one or two');
  return job;
}
export function jobDigest(job) { return createHash('sha256').update(JSON.stringify(job)).digest('hex').slice(0, 12); }
export function resultBranch(job) { return `sumac/jobs/${job.id}-${jobDigest(job)}`; }
export function validateProposal(result, job) {
  if (!result || result.jobId !== job.id || typeof result.source !== 'string' || result.source.length > 20000 || !result.source.length) throw new Error('Invalid development proposal');
  if (result.audit?.verdict !== 'pass') throw new Error('Source audit did not pass');
  // Reject privileged and dynamic capabilities even though execution is also isolated.
  if (/\b(import|require|process|globalThis|eval|Function|fetch|WebSocket|constructor|__proto__|prototype)\b/.test(result.source)) throw new Error('Generated code uses a forbidden capability');
  if (!new RegExp(`export\\s+(?:function\\s+${job.exportName}\\b|const\\s+${job.exportName}\\b)`).test(result.source)) throw new Error('Expected named export is missing');
  return result.source;
}
export function resumeAttempt(state, maxAttempts) {
  if (state?.status === 'passed' || state?.status === 'blocked') return null;
  const attempt = state?.attempt ?? 1;
  return attempt <= maxAttempts ? attempt : null;
}
