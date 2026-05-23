import type { AuthResponseDto, CreateUserResponseDto, SigninPayload, SignupPayload } from '@/types/auth'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = (body as { message?: string | string[] }).message
    throw new Error(Array.isArray(message) ? message.join(', ') : (message ?? `HTTP ${res.status}`))
  }

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

export const authService = {
  signin: (payload: SigninPayload) =>
    request<AuthResponseDto>('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),

  signup: (payload: SignupPayload) =>
    request<CreateUserResponseDto>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  refresh: () =>
    request<AuthResponseDto>('/auth/refresh', { method: 'POST' }),

  me: () =>
    request<{ id: string; username: string }>('/auth/me', { method: 'GET' }),

  logout: () =>
    request<{ success: true }>('/auth/logout', { method: 'POST' }),
}
