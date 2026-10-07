import { logger, task } from "@trigger.dev/sdk";

export const sumacHealthCheck = task({
  id: "sumac-health-check",
  run: async (payload: { message?: string }) => {
    const result = {
      ok: true,
      project: "sumac-automation",
      message: payload.message ?? "Sumac background task is running",
      completedAt: new Date().toISOString(),
    };
    logger.info("Sumac health check completed", result);
    return result;
  },
});
