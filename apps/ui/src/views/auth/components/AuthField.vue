<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  error?: string | null
}>()
</script>

<template>
  <div class="field">
    <label class="field-label">
      <span>{{ label }}</span>
      <span v-if="hint" class="field-hint">{{ hint }}</span>
    </label>
    <slot />
    <div v-if="error" class="field-error">{{ error }}</div>
  </div>
</template>
