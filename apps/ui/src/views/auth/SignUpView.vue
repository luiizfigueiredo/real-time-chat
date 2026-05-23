<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useValidation } from '@/composables/useValidation';
import { usePasswordStrength } from '@/composables/usePasswordStrength';
import { useToast } from '@/composables/useToast';
import AppBrand from './components/AppBrand.vue';
import AppIcon from './components/AppIcon.vue';
import AuthTabs from './components/AuthTabs.vue';
import AuthField from './components/AuthField.vue';
import PasswordInput from './components/PasswordInput.vue';
import PasswordStrength from './components/PasswordStrength.vue';

const router = useRouter();
const authStore = useAuthStore();
const { validateUsername, validateEmail, validatePassword } = useValidation();
const { show: showToast } = useToast();

const email = ref('');
const username = ref('');
const password = ref('');
const accept = ref(false);
const touched = ref({ email: false, username: false, password: false });
const submitting = ref(false);
const serverError = ref<string | null>(null);

const { strength, strengthLabel, checks } = usePasswordStrength(password);

const errEmail = computed(() =>
  touched.value.email ? validateEmail(email.value) : null,
);
const errUser = computed(() =>
  touched.value.username ? validateUsername(username.value) : null,
);
const errPassword = computed(() =>
  touched.value.password ? validatePassword(password.value, true) : null,
);

const canSubmit = computed(
  () =>
    !validateEmail(email.value) &&
    email.value.length > 0 &&
    !validateUsername(username.value) &&
    username.value.length >= 3 &&
    !validatePassword(password.value, true) &&
    password.value.length >= 8 &&
    accept.value &&
    !submitting.value,
);

async function submit() {
  touched.value = { email: true, username: true, password: true };
  if (!canSubmit.value) return;

  submitting.value = true;
  serverError.value = null;

  try {
    await authStore.register({
      email: email.value,
      username: username.value,
      password: password.value,
    });
    showToast(`Conta criada: ${username.value}`, '201 Created');
    router.push({ name: 'login' });
  } catch (err) {
    serverError.value =
      err instanceof Error ? err.message : 'Não foi possível criar a conta.';
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

    <div class="form-eyebrow">
      <span class="step">01</span>
      <span>POST /auth/signup</span>
    </div>
    <h2 class="form-title">Criar sua conta</h2>
    <p class="form-sub">É grátis e leva menos de um minuto.</p>

    <AuthTabs active="register" />

    <AuthField label="Email" :error="errEmail">
      <div class="input-wrap">
        <span class="icon"><AppIcon name="mail" /></span>
        <input
          v-model="email"
          type="email"
          class="input"
          :class="{ error: !!errEmail }"
          placeholder="voce@dominio.com"
          autocomplete="email"
          spell-check="false"
          @blur="touched.email = true"
        />
      </div>
    </AuthField>

    <AuthField label="Usuário" hint="3–40 · a-z, 0-9, . _ -" :error="errUser">
      <div class="input-wrap">
        <span class="icon"><AppIcon name="user" /></span>
        <input
          v-model="username"
          type="text"
          class="input"
          :class="{ error: !!errUser }"
          placeholder="seu_usuario"
          autocomplete="username"
          spell-check="false"
          @input="
            username = ($event.target as HTMLInputElement).value.toLowerCase()
          "
          @blur="touched.username = true"
        />
      </div>
    </AuthField>

    <AuthField label="Senha" hint="8–16 caracteres" :error="errPassword">
      <PasswordInput
        v-model="password"
        placeholder="Escolha uma senha forte"
        autocomplete="new-password"
        :error="errPassword"
        @blur="touched.password = true"
      />
      <PasswordStrength
        :strength="strength"
        :strength-label="strengthLabel"
        :checks="checks"
      />
    </AuthField>

    <div
      v-if="serverError"
      class="field-error"
      style="margin-bottom: 14px; font-size: 12px"
    >
      {{ serverError }}
    </div>

    <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
      <span v-if="submitting" class="spinner" />
      <template v-if="submitting">Criando conta…</template>
      <template v-else
        >Criar conta
        <AppIcon name="arrowRight" style="width: 16px; height: 16px"
      /></template>
    </button>

    <div class="form-footer">
      Já tem uma conta?{{ ' ' }}
      <button
        type="button"
        class="link"
        @click="router.push({ name: 'login' })"
      >
        Entrar
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
