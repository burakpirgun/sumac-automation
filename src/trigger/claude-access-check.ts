import { logger, task } from "@trigger.dev/sdk";

export const sumacClaudeAccessCheck = task({
  id: "sumac-claude-access-check",
  retry: { maxAttempts: 1 },
  run: async () => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is missing from the worker environment");

    const model = "claude-sonnet-4-6";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 100,
        messages: [{
          role: "user",
          content: "This is a connection test for Sumac. Reply with exactly: SUMAC_ADVISOR_READY",
        }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Claude API request failed with HTTP ${response.status}`);

    const body = await response.json() as {
      content: Array<{ type: string; text?: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };
    const reply = body.content.filter((item) => item.type === "text")
      .map((item) => item.text ?? "").join("").trim();
    if (reply !== "SUMAC_ADVISOR_READY") throw new Error("Claude returned an unexpected connection-test reply");

    const result = { ok: true, model, reply, usage: body.usage };
    logger.info("Claude advisor access verified", result);
    return result;
  },
});
