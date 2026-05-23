export function useValidation() {
  function validateUsername(u: string): string | null {
    if (!u) return null
    if (u.length < 3) return 'Mínimo 3 caracteres'
    if (u.length > 40) return 'Máximo 40 caracteres'
    if (!/^[a-zA-Z0-9._-]+$/.test(u)) return 'Use apenas letras, números, . _ -'
    return null
  }

  function validateEmail(e: string): string | null {
    if (!e) return null
    if (e.length > 255) return 'Email muito longo'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Email inválido'
    return null
  }

  function validatePassword(p: string, signup = false): string | null {
    if (!p) return null
    if (signup) {
      if (p.length < 8) return 'Mínimo 8 caracteres'
      if (p.length > 16) return 'Máximo 16 caracteres'
    }
    return null
  }

  return { validateUsername, validateEmail, validatePassword }
}
