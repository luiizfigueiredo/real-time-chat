export const DEFAULT_JWT_SECRET = 'dev-only-secret-change-me';
export const DEFAULT_JWT_EXPIRES_IN_SECONDS = 3600;
export const DEFAULT_INVITE_TTL_SECONDS = 900;

export function readPositiveIntEnv(
  varName: string,
  defaultValue: number,
): number {
  const envValue = process.env[varName];

  if (!envValue) {
    return defaultValue;
  }

  const parsed = Number.parseInt(envValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}
