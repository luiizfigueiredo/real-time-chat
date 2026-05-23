import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type {
  SigninPayload,
  SignupPayload,
  CreateUserResponseDto,
} from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const user = ref<{ id: string; username: string } | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  async function login(payload: SigninPayload) {
    const res = await authService.signin(payload);
    accessToken.value = res.accessToken;
    user.value = res.user;
    return res;
  }

  async function register(
    payload: SignupPayload,
  ): Promise<CreateUserResponseDto> {
    return authService.signup(payload);
  }

  async function refresh() {
    const res = await authService.refresh();
    accessToken.value = res.accessToken;
    user.value = res.user;
    return res;
  }

  async function logout() {
    await authService.logout().catch(() => null);
    accessToken.value = null;
    user.value = null;
  }

  async function fetchMe() {
    const me = await authService.me();
    user.value = me;
    return me;
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    login,
    register,
    refresh,
    logout,
    fetchMe,
  };
});
