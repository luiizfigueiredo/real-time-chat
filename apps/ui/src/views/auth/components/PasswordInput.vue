<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

defineProps<{
  modelValue: string
  placeholder?: string
  error?: string | null
  autocomplete?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const show = ref(false)
</script>

<template>
  <div class="input-wrap">
    <span class="icon"><AppIcon name="lock" /></span>
    <input
      :type="show ? 'text' : 'password'"
      class="input with-right"
      :class="{ error: !!error }"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete ?? 'current-password'"
      spell-check="false"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur')"
    />
    <button
      type="button"
      class="icon-right"
      :aria-label="show ? 'Ocultar senha' : 'Mostrar senha'"
      @click="show = !show"
    >
      <AppIcon :name="show ? 'eyeOff' : 'eye'" />
    </button>
  </div>
</template>
