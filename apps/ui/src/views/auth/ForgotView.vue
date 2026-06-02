<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useValidation } from '@/composables/useValidation';
import AppIcon from './components/AppIcon.vue';
import AuthField from './components/AuthField.vue';

const router = useRouter();
const { validateEmail } = useValidation();

const email = ref('');
const touched = ref(false);
const submitting = ref(false);

const err = computed(() => (touched.value ? validateEmail(email.value) : null));
const canSubmit = computed(
  () =>
    !validateEmail(email.value) && email.value.length > 0 && !submitting.value,
);

async function submit() {
  touched.value = true;
  if (!canSubmit.value) return;

  submitting.value = true;
  await new Promise((r) => setTimeout(r, 900));
  submitting.value = false;

  router.push({ name: 'forgot-password-sent', query: { email: email.value } });
}
</script>

<template>
  <form class="form-card" novalidate @submit.prevent="submit">
    <button type="button" class="back" @click="router.push({ name: 'login' })">
      <AppIcon name="arrowLeft" style="width: 14px; height: 14px" /> Voltar para
      entrar
    </button>

    <div class="form-eyebrow">
      <span class="step">02</span>
      <span>POST /auth/password/forgot</span>
    </div>
    <h2 class="form-title">Redefinir senha</h2>
    <p class="form-sub">
      Informe o e-mail vinculado à sua conta. Enviaremos um link seguro para
      você criar uma nova senha.
    </p>

    <AuthField label="Email" :error="err">
      <div class="input-wrap">
        <span class="icon"><AppIcon name="mail" /></span>
        <input
          v-model="email"
          type="email"
          class="input"
          :class="{ error: !!err }"
          placeholder="Email@dominio.com"
          autocomplete="email"
          autofocus
          spell-check="false"
          @blur="touched = true"
        />
      </div>
    </AuthField>

    <button
      type="submit"
      class="btn btn-primary"
      :disabled="!canSubmit"
      style="margin-top: 8px"
    >
      <span v-if="submitting" class="spinner" />
      <template v-if="submitting">Enviando…</template>
      <template v-else
        >Enviar link de redefinição
        <AppIcon name="send" style="width: 16px; height: 16px"
      /></template>
    </button>

    <div class="form-footer" style="margin-top: 18px">
      Lembrou da senha?{{ ' ' }}
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

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-mute);
  margin-bottom: 18px;
  cursor: default;
  background: transparent;
  border: 0;
  padding: 0;
  font-family: inherit;
}

.back:hover {
  color: var(--text);
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
