<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useValidation } from '@/composables/useValidation'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { useToast } from '@/composables/useToast'
import AppIcon from './components/AppIcon.vue'
import AuthField from './components/AuthField.vue'
import PasswordInput from './components/PasswordInput.vue'
import PasswordStrength from './components/PasswordStrength.vue'

const router = useRouter()
const { validatePassword } = useValidation()
const { show: showToast } = useToast()

const password = ref('')
const confirm  = ref('')
const touched  = ref({ password: false, confirm: false })
const submitting = ref(false)

const { strength, strengthLabel, checks } = usePasswordStrength(password)

const errPass    = computed(() => touched.value.password ? validatePassword(password.value, true)                              : null)
const errConfirm = computed(() => touched.value.confirm && confirm.value && confirm.value !== password.value ? 'As senhas não coincidem' : null)

const canSubmit = computed(() =>
  !validatePassword(password.value, true) && password.value.length >= 8 &&
  confirm.value === password.value && confirm.value.length > 0 &&
  !submitting.value
)

async function submit() {
  touched.value = { password: true, confirm: true }
  if (!canSubmit.value) return

  submitting.value = true
  await new Promise((r) => setTimeout(r, 900))
  submitting.value = false

  showToast('Senha atualizada com sucesso', '204 No Content')
  router.push({ name: 'login' })
}
</script>

<template>
  <form class="form-card" novalidate @submit.prevent="submit">
    <button type="button" class="back" @click="router.push({ name: 'login' })">
      <AppIcon name="arrowLeft" style="width:14px;height:14px;" /> Voltar para entrar
    </button>

    <div class="form-eyebrow">
      <span class="step">03</span>
      <span>POST /auth/password/reset</span>
    </div>
    <h2 class="form-title">Crie uma nova senha</h2>
    <p class="form-sub">Escolha uma senha que você não usou antes. Você precisará entrar novamente em todos os dispositivos.</p>

    <AuthField label="Nova senha" hint="8–16 caracteres" :error="errPass">
      <PasswordInput
        v-model="password"
        placeholder="Nova senha"
        autocomplete="new-password"
        :error="errPass"
        @blur="touched.password = true"
      />
      <PasswordStrength :strength="strength" :strength-label="strengthLabel" :checks="checks" :show-checklist="false" />
    </AuthField>

    <AuthField label="Confirmar senha" :error="errConfirm">
      <PasswordInput
        v-model="confirm"
        placeholder="Repita a nova senha"
        autocomplete="new-password"
        :error="errConfirm"
        @blur="touched.confirm = true"
      />
    </AuthField>

    <button type="submit" class="btn btn-primary" :disabled="!canSubmit" style="margin-top: 8px;">
      <span v-if="submitting" class="spinner" />
      <template v-if="submitting">Atualizando…</template>
      <template v-else>Atualizar senha <AppIcon name="check" style="width:16px;height:16px;" /></template>
    </button>
  </form>
</template>

<style scoped>
.form-card { width: 100%; max-width: 400px; }

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

.back:hover { color: var(--text); }

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

.btn svg { width: 16px; height: 16px; }
</style>
