<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="toast.current" class="toast">
      <span class="toast-dot" />
      {{ toast.current.msg }}
      <span v-if="toast.current.mono" class="mono">{{ toast.current.mono }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-2);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 12px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 12px 40px -10px oklch(0 0 0 / 0.6);
  z-index: 100;
  white-space: nowrap;
}

.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 3px oklch(0.78 0.16 155 / 0.2);
  flex-shrink: 0;
}

.toast .mono {
  color: var(--text-dim);
  font-size: 11.5px;
  margin-left: 6px;
}

.toast-enter-active,
.toast-leave-active {
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(-50%) translateY(80px);
  opacity: 0;
}

.toast-enter-to,
.toast-leave-from {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
</style>
