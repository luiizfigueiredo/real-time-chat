<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ active: 'login' | 'register' }>()

const router = useRouter()
</script>

<template>
  <div class="tabs">
    <button
      type="button"
      :class="{ active: active === 'login' }"
      @click="router.push({ name: 'login' })"
    >
      Entrar
    </button>
    <button
      type="button"
      :class="{ active: active === 'register' }"
      @click="router.push({ name: 'register' })"
    >
      Criar conta
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  padding: 3px;
  background: var(--bg-2);
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  margin-bottom: 28px;
  width: fit-content;
}

.tabs button {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--text-mute);
  padding: 7px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  border-radius: 7px;
  cursor: default;
  transition: all 0.15s ease;
}

.tabs button.active {
  background: var(--bg-3);
  color: var(--text);
  box-shadow: 0 1px 0 oklch(1 0 0 / 0.04) inset;
}
</style>
