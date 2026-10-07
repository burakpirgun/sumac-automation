import { z } from 'zod';

export const planSchema = z.object({
  summary: z.string().min(1),
  steps: z.array(z.object({ action: z.string().min(1), verification: z.string().min(1) }).strict()).min(1).max(8),
  risks: z.array(z.string()).max(8),
}).strict();
export const auditSchema = z.object({
  verdict: z.enum(['pass', 'revise', 'blocked']),
  findings: z.array(z.string()).max(10),
}).strict();

export async function askClaude<T>(system: string, input: unknown, schema: z.ZodType<T>): Promise<T> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is missing');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1600, system,
      messages: [{ role: 'user', content: JSON.stringify(input) }] }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Claude advisory request failed: HTTP ${response.status}`);
  const body = await response.json() as { content: Array<{ type: string; text?: string }> };
  const text = body.content.filter(item => item.type === 'text').map(item => item.text ?? '').join('').trim();
  try { return schema.parse(JSON.parse(text)); }
  catch { throw new Error('Claude advisory response failed JSON/schema validation'); }
}
