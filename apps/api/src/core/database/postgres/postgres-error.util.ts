export const POSTGRES_EXCLUSION_VIOLATION_CODE = '23P01';
export const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

export function hasPostgresErrorCode(
  error: unknown,
  expectedCode: string,
): boolean {
  if (typeof error !== 'object' || error === null) return false;

  if ('code' in error && error.code === expectedCode) return true;

  if ('cause' in error) return hasPostgresErrorCode(error.cause, expectedCode);

  return false;
}

export function getPostgresErrorConstraint(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null;

  if ('constraint_name' in error && typeof error.constraint_name === 'string') {
    return error.constraint_name;
  }

  if ('constraint' in error && typeof error.constraint === 'string') {
    return error.constraint;
  }

  if ('cause' in error) {
    return getPostgresErrorConstraint(error.cause);
  }

  return null;
}
