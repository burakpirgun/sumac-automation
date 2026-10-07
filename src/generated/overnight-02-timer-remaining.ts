export function remainingTimerSeconds(deadlineMs: number, nowMs: number): number {
  if (typeof deadlineMs !== 'number' || typeof nowMs !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  if (!isFinite(deadlineMs) || !isFinite(nowMs)) {
    throw new Error('Both arguments must be finite');
  }
  if (deadlineMs < 0 || nowMs < 0) {
    throw new Error('Both arguments must be nonnegative');
  }
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}