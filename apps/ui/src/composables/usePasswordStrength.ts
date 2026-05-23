import { computed, type Ref } from 'vue'

export function usePasswordStrength(password: Ref<string>) {
  const strength = computed(() => {
    const p = password.value
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^a-zA-Z0-9]/.test(p)) s++
    return Math.min(s, 4)
  })

  const strengthLabel = computed(() => ['—', 'fraca', 'ok', 'boa', 'forte'][strength.value])

  const checks = computed(() => ({
    len:     password.value.length >= 8 && password.value.length <= 16,
    upper:   /[A-Z]/.test(password.value),
    digit:   /\d/.test(password.value),
    special: /[^a-zA-Z0-9]/.test(password.value),
  }))

  return { strength, strengthLabel, checks }
}
