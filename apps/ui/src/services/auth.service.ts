import type { AuthResponseDto, CreateUserResponseDto, SigninPayload, SignupPayload } from '@/types/auth'
import { authedRequest, request } from './api'

export const authService = {
  signin: (payload: SigninPayload) =>
    request<AuthResponseDto>('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),

  signup: (payload: SignupPayload) =>
    request<CreateUserResponseDto>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  refresh: () =>
    request<AuthResponseDto>('/auth/refresh', { method: 'POST' }),

  me: () =>
    authedRequest<{ id: string; username: string }>('/auth/me', { method: 'GET' }),

  logout: () =>
    authedRequest<{ success: true }>('/auth/logout', { method: 'POST' }),
}
