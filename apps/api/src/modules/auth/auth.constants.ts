import { envValues } from '../../shared/env-values';

export const DEFAULT_JWT_SECRET = 'dev-only-secret-change-me';
export const DEFAULT_JWT_EXPIRES_IN_SECONDS = 3600;
export const DEFAULT_INVITE_TTL_SECONDS = 900;
export const DEFAULT_REFRESH_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
export const REFRESH_TOKEN_COOKIE_NAME = 'rt_chat_refresh_token';

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

export function getCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'none' | 'lax' | 'strict';
} {
  const isProd = envValues.NODE_ENV === 'production';

  const secure = envValues.COOKIE_SECURE
    ? envValues.COOKIE_SECURE === 'true'
    : isProd;

  const sameSite = envValues.COOKIE_SAME_SITE
    ? (envValues.COOKIE_SAME_SITE as 'none' | 'lax' | 'strict')
    : isProd
      ? 'none'
      : 'lax';

  return {
    httpOnly: true,
    secure,
    sameSite,
  };
}
