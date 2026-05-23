import { reactive } from 'vue'

interface Toast {
  msg: string
  mono?: string
}

const state = reactive<{ current: Toast | null }>({ current: null })
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(msg: string, mono?: string) {
    state.current = { msg, mono }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { state.current = null }, 3500)
  }

  function hide() {
    state.current = null
    if (timer) clearTimeout(timer)
  }

  return { toast: state, show, hide }
}
