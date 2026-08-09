export const POSTGRES_EXCLUSION_VIOLATION_CODE = '23P01';

export function hasPostgresErrorCode(
  error: unknown,
  expectedCode: string,
): boolean {
  if (typeof error !== 'object' || error === null) return false;

  if ('code' in error && error.code === expectedCode) return true;

  if ('cause' in error) return hasPostgresErrorCode(error.cause, expectedCode);

  return false;
}
