export function isResumeCompatible(
  storedSchema: unknown,
  currentSchema: unknown,
  storedRecipe: unknown,
  currentRecipe: unknown,
  storedRevision: unknown,
  currentRevision: unknown,
  storedLocale: unknown,
  currentLocale: unknown
): boolean {
  try {
    const isFinitePositiveInteger = (v: unknown): v is number =>
      typeof v === 'number' &&
      Number.isFinite(v) &&
      Number.isInteger(v) &&
      v > 0;

    const isNonEmptyTrimmedString = (v: unknown): v is string =>
      typeof v === 'string' &&
      v.length > 0 &&
      v === v.trim();

    if (!isFinitePositiveInteger(storedSchema)) return false;
    if (!isFinitePositiveInteger(currentSchema)) return false;
    if (!isNonEmptyTrimmedString(storedRecipe)) return false;
    if (!isNonEmptyTrimmedString(currentRecipe)) return false;
    if (!isNonEmptyTrimmedString(storedRevision)) return false;
    if (!isNonEmptyTrimmedString(currentRevision)) return false;
    if (!isNonEmptyTrimmedString(storedLocale)) return false;
    if (!isNonEmptyTrimmedString(currentLocale)) return false;

    return (
      storedSchema === currentSchema &&
      storedRecipe === currentRecipe &&
      storedRevision === currentRevision &&
      storedLocale === currentLocale
    );
  } catch {
    return false;
  }
}