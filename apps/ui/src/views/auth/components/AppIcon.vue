<script setup lang="ts">
export type IconName =
  | 'user' | 'mail' | 'lock' | 'eye' | 'eyeOff'
  | 'arrowLeft' | 'arrowRight' | 'send' | 'github' | 'google'
  | 'check' | 'mailCheck' | 'chat'

defineProps<{ name: IconName }>()
</script>

<template>
  <!-- user -->
  <svg v-if="name === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="3.5"/>
    <path d="M4.5 20c.8-3.5 4-5.5 7.5-5.5s6.7 2 7.5 5.5"/>
  </svg>

  <!-- mail -->
  <svg v-else-if="name === 'mail'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2.5"/>
    <path d="m4 7 7.4 5.4a1 1 0 0 0 1.2 0L20 7"/>
  </svg>

  <!-- lock -->
  <svg v-else-if="name === 'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/>
    <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5"/>
  </svg>

  <!-- eye -->
  <svg v-else-if="name === 'eye'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>

  <!-- eyeOff -->
  <svg v-else-if="name === 'eyeOff'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 3l18 18"/>
    <path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a17.2 17.2 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.4 4.8-1.1"/>
    <path d="M9.5 9.6a3 3 0 0 0 4 4"/>
  </svg>

  <!-- arrowLeft -->
  <svg v-else-if="name === 'arrowLeft'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 5l-7 7 7 7"/>
  </svg>

  <!-- arrowRight -->
  <svg v-else-if="name === 'arrowRight'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>

  <!-- send -->
  <svg v-else-if="name === 'send'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 2 11 13"/>
    <path d="M22 2l-7 20-4-9-9-4 20-7Z"/>
  </svg>

  <!-- check -->
  <svg v-else-if="name === 'check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m5 12 5 5L20 7"/>
  </svg>

  <!-- mailCheck -->
  <svg v-else-if="name === 'mailCheck'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2.5"/>
    <path d="m4 7 7.4 5.4a1 1 0 0 0 1.2 0L20 7"/>
    <path d="m9 14 2 2 4-4"/>
  </svg>

  <!-- chat -->
  <svg v-else-if="name === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12c0 4.4-4 8-9 8a10 10 0 0 1-4-.8L3 20l1.2-4A8 8 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z"/>
  </svg>

  <!-- github -->
  <svg v-else-if="name === 'github'" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.1.39-2 1.03-2.7-.1-.25-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.4.2 2.44.1 2.69.64.7 1.03 1.6 1.03 2.7 0 3.86-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>
  </svg>

  <!-- google -->
  <svg v-else-if="name === 'google'" viewBox="0 0 24 24">
    <path fill="#FFC107" d="M21.8 10.2H12v3.8h5.6c-.5 2.5-2.6 3.9-5.6 3.9a6 6 0 1 1 3.9-10.5l2.8-2.8A10 10 0 1 0 22 12c0-.6-.1-1.2-.2-1.8Z"/>
    <path fill="#FF3D00" d="M3.2 7.3 6.3 9.5a6 6 0 0 1 9.6-2.1l2.8-2.8A10 10 0 0 0 3.2 7.3Z"/>
    <path fill="#4CAF50" d="M12 22a10 10 0 0 0 6.7-2.6L15.8 17a6 6 0 0 1-9.5-2.9L3.2 16.6A10 10 0 0 0 12 22Z"/>
    <path fill="#1976D2" d="M21.8 10.2H12v3.8h5.6a6 6 0 0 1-2 2.9l3 2.5A10 10 0 0 0 22 12c0-.6-.1-1.2-.2-1.8Z"/>
  </svg>
</template>
