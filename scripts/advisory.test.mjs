import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function adapter(fetch) {
  const source = readFileSync(new URL('../src/lib/advisory.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require, fetch, AbortSignal, process: { env: { ANTHROPIC_API_KEY: 'test-placeholder' } } };
  vm.runInNewContext(js, context); // Trusted checked-in adapter only, never generated code.
  return context.exports;
}
test('request uses provider-enforced JSON while local audit bounds are retained', async () => {
  let request;
  const api = adapter(async (_url, options) => { request = JSON.parse(options.body); return { ok: true, json: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ verdict: 'pass', findings: Array(15).fill('Finding') }) }] }) }; });
  const result = await api.askClaude('test', {}, api.auditSchema);
  assert.equal(result.findings.length, 15);
  assert.equal(request.output_config.format.type, 'json_schema');
  assert.equal(request.output_config.format.schema.additionalProperties, false);
  assert.equal(request.output_config.format.schema.properties.findings.maxItems, undefined);
  assert.equal(api.auditSchema.safeParse({ verdict: 'pass', findings: Array(31).fill('Finding') }).success, false);
});
test('truncated and malformed responses cannot become accepted work', async () => {
  const truncated = adapter(async () => ({ ok: true, json: async () => ({ stop_reason: 'max_tokens', content: [{ type: 'text', text: '{}' }] }) }));
  await assert.rejects(truncated.askClaude('test', {}, truncated.auditSchema), /truncated/);
  const malformed = adapter(async () => ({ ok: true, json: async () => ({ content: [{ type: 'text', text: 'not JSON' }] }) }));
  await assert.rejects(malformed.askClaude('test', {}, malformed.auditSchema), /not valid JSON/);
});
