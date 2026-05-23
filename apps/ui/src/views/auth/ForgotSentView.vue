<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from './components/AppIcon.vue'

const route = useRoute()
const router = useRouter()

const email = computed(() => (route.query.email as string) ?? '')
</script>

<template>
  <div class="form-card">
    <div class="form-eyebrow">
      <span class="step">02</span>
      <span>link enviado</span>
    </div>
    <h2 class="form-title">Verifique seu e-mail</h2>
    <p class="form-sub">
      Se existir uma conta vinculada a esse endereço, você receberá um link para redefinir sua senha em até alguns minutos.
    </p>

    <div class="confirm-card">
      <div class="icon-circle">
        <AppIcon name="mailCheck" style="width:20px;height:20px;" />
      </div>
      <div class="text">
        Enviamos para <b>{{ email }}</b>.<br />
        O link expira em <b>30 minutos</b>. Não esqueça de checar a pasta de spam.
      </div>
    </div>

    <button type="button" class="btn btn-primary" @click="router.push({ name: 'reset-password' })">
      Simular abrir o link de redefinição
      <AppIcon name="arrowRight" style="width:16px;height:16px;" />
    </button>

    <div class="form-footer" style="margin-top: 18px;">
      Não recebeu?{{ ' ' }}
      <button type="button" class="link" @click="router.push({ name: 'forgot-password' })">Reenviar</button>
      {{ ' · ' }}
      <button type="button" class="link muted" @click="router.push({ name: 'login' })">Voltar</button>
    </div>
  </div>
</template>

<style scoped>
.form-card { width: 100%; max-width: 400px; }

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

.form-eyebrow .step { color: var(--accent); }

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

.confirm-card {
  background: var(--bg-2);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.confirm-card .text {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text-mute);
}

.confirm-card .text b {
  color: var(--text);
  font-weight: 500;
}

.form-footer {
  text-align: center;
  font-size: 13px;
  color: var(--text-mute);
}

.form-footer .link { font-weight: 500; }

.btn svg { width: 16px; height: 16px; }
</style>
