export function scaleIngredientAmount(amount: number, originalServings: number, targetServings: number): number {
  if (typeof amount !== 'number' || typeof originalServings !== 'number' || typeof targetServings !== 'number') {
    throw new Error('All inputs must be numbers');
  }
  if (!isFinite(amount) || !isFinite(originalServings) || !isFinite(targetServings)) {
    throw new Error('All inputs must be finite numbers');
  }
  if (amount < 0) {
    throw new Error('amount must be nonnegative');
  }
  if (originalServings <= 0) {
    throw new Error('originalServings must be strictly positive');
  }
  if (targetServings <= 0) {
    throw new Error('targetServings must be strictly positive');
  }
  const scaled = amount * (targetServings / originalServings);
  if (!isFinite(scaled)) {
    throw new Error('Resulting scaled amount is not finite');
  }
  const result = Math.round(scaled * 1000) / 1000;
  if (!isFinite(result)) {
    throw new Error('Resulting scaled amount is not finite after rounding');
  }
  return result;
}