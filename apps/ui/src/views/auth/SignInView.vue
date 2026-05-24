<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useValidation } from '@/composables/useValidation';
import { useToast } from '@/composables/useToast';
import AppBrand from './components/AppBrand.vue';
import AppIcon from './components/AppIcon.vue';
import AuthTabs from './components/AuthTabs.vue';
import AuthField from './components/AuthField.vue';
import PasswordInput from './components/PasswordInput.vue';

const router = useRouter();
const authStore = useAuthStore();
const { validateUsername } = useValidation();
const { show: showToast } = useToast();

const username = ref('');
const password = ref('');
const remember = ref(true);
const touched = ref({ username: false, password: false });
const submitting = ref(false);
const serverError = ref<string | null>(null);

const errUser = computed(() =>
  touched.value.username ? validateUsername(username.value) : null,
);
const canSubmit = computed(
  () =>
    username.value.length >= 3 &&
    password.value.length >= 1 &&
    !submitting.value,
);

async function submit() {
  touched.value = { username: true, password: true };
  if (!canSubmit.value) return;

  submitting.value = true;
  serverError.value = null;

  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });
    showToast(
      `Sessão iniciada como ${username.value}`,
      '200 OK · accessToken emitido',
    );
    router.push({ name: 'chat' });
  } catch (err) {
    serverError.value =
      err instanceof Error ? err.message : 'Usuário ou senha inválidos.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="form-card" novalidate @submit.prevent="submit">
    <div class="brand-centered">
      <AppBrand />
    </div>

    <h2 class="form-title">Bem-vindo de volta</h2>
    <p class="form-sub">
      Entre com seu usuário e senha para continuar a conversa.
    </p>

    <AuthTabs active="login" />

    <AuthField label="Usuário" hint="3–40 caracteres" :error="errUser">
      <div class="input-wrap">
        <span class="icon"><AppIcon name="user" /></span>
        <input
          v-model="username"
          type="text"
          class="input"
          :class="{ error: !!errUser }"
          q
          placeholder="username"
          autocomplete="username"
          spell-check="false"
          @blur="touched.username = true"
        />
      </div>
    </AuthField>

    <AuthField label="Senha">
      <PasswordInput
        v-model="password"
        placeholder="••••••••"
        :error="null"
        @blur="touched.password = true"
      />
    </AuthField>

    <div class="row-between">
      <label class="check">
        <input v-model="remember" type="checkbox" />
        <span class="box" />
        <span>Manter conectado</span>
      </label>
      <button
        type="button"
        class="link"
        @click="router.push({ name: 'forgot-password' })"
      >
        Esqueceu a senha?
      </button>
    </div>

    <div
      v-if="serverError"
      class="field-error"
      style="margin-bottom: 14px; font-size: 12px"
    >
      {{ serverError }}
    </div>

    <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
      <span v-if="submitting" class="spinner" />
      <template v-if="submitting">Autenticando…</template>
      <template v-else
        >Entrar
        <AppIcon
          name="arrowRight"
          style="width: 16px; height: 16px; cursor: pointer"
      /></template>
    </button>

    <!-- <div class="or-divider">ou continue com</div>
    <div class="sso">
      <button type="button" class="btn btn-ghost">
        <AppIcon name="google" />Google
      </button>
      <button type="button" class="btn btn-ghost">
        <AppIcon name="github" />GitHub
      </button>
    </div> -->

    <div class="form-footer">
      Ainda não tem conta?{{ ' ' }}
      <button
        type="button"
        class="link"
        @click="router.push({ name: 'register' })"
      >
        Criar conta
      </button>
    </div>
  </form>
</template>

<style scoped>
.form-card {
  width: 100%;
  max-width: 400px;
}

.brand-centered {
  display: none;
}

.form-eyebrow {
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-eyebrow .step {
  color: var(--accent);
}

.form-title {
  font-size: 26px;
  letter-spacing: -0.02em;
  font-weight: 500;
  margin: 0 0 8px;
}

.form-sub {
  font-size: 14px;
  color: var(--text-mute);
  margin: 0 0 28px;
  line-height: 1.55;
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0 22px;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-mute);
}

.form-footer .link {
  font-weight: 500;
}

.btn svg {
  width: 16px;
  height: 16px;
}
</style>
