import { useAuthStore } from '@/stores/auth';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string | string[] }).message;
    throw new Error(
      Array.isArray(message)
        ? message.join(', ')
        : (message ?? `HTTP ${res.status}`),
    );
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    },
  });
  return parseResponse<T>(res);
}

export async function authedRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const store = useAuthStore();

  const buildHeaders = (token: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(store.accessToken),
  });

  if (res.status === 401) {
    try {
      await store.refresh();
    } catch {
      store.accessToken = null;
      store.user = null;
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const retryRes = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: buildHeaders(store.accessToken),
    });
    return parseResponse<T>(retryRes);
  }

  return parseResponse<T>(res);
}
