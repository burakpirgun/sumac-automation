export function scaleLinearAmount(amount: number, originalServings: number, targetServings: number): number {
  // Validate all arguments are finite numbers (not boolean, null, string, etc.)
  if (typeof amount !== 'number' || typeof originalServings !== 'number' || typeof targetServings !== 'number') {
    throw new Error('All arguments must be numbers');
  }
  if (!isFinite(amount) || !isFinite(originalServings) || !isFinite(targetServings)) {
    throw new Error('All arguments must be finite numbers');
  }
  if (amount < 0) {
    throw new Error('amount must be >= 0');
  }
  if (originalServings <= 0) {
    throw new Error('originalServings must be > 0');
  }
  if (targetServings <= 0) {
    throw new Error('targetServings must be > 0');
  }

  const ratio = targetServings / originalServings;

  if (!isFinite(ratio) || ratio === 0) {
    throw new Error('ratio must be finite and nonzero');
  }

  const result = amount * ratio;

  if (!isFinite(result)) {
    throw new Error('result is not finite');
  }

  // Positive amount must not underflow to zero
  if (amount > 0 && result === 0) {
    throw new Error('result underflowed to zero');
  }

  return result;
}