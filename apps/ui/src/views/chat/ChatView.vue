<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="chat-placeholder">
    <p>Bem-vindo, <strong>{{ authStore.user?.username }}</strong></p>
    <button @click="handleLogout">Sair</button>
  </div>
</template>

<style scoped>
.chat-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
  font-family: sans-serif;
}

button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
</style>
