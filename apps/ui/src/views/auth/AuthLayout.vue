<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LeftPanel from './components/LeftPanel.vue';
import AppToast from './components/AppToast.vue';

const route = useRoute();
const router = useRouter();

const topBar = computed(() => {
  return {
    text: 'Precisa de ajuda?',
    action: { label: 'suporte@chat.app', to: null },
  };
});
</script>

<template>
  <div class="shell">
    <LeftPanel class="left-panel" />

    <div class="right">
      <div class="right-top">
        <span>{{ topBar.text }}</span>
        <button
          v-if="topBar.action.to"
          type="button"
          class="link"
          @click="router.push({ name: topBar.action.to! })"
        >
          {{ topBar.action.label }}
        </button>
        <a v-else href="mailto:suporte@chat.app" class="link">
          {{ topBar.action.label }}
        </a>
      </div>

      <div class="form-wrap">
        <RouterView />
      </div>
    </div>

    <AppToast />
  </div>
</template>

<style scoped>
.shell {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background:
    radial-gradient(
      1200px 700px at -10% -10%,
      oklch(0.32 0.08 285 / 0.18),
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 110% 110%,
      oklch(0.32 0.1 240 / 0.14),
      transparent 55%
    ),
    var(--bg-0);
}

.right {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
}

.right-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 24px 40px 0;
  gap: 14px;
  font-size: 13px;
  color: var(--text-mute);
}

.form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 40px 48px;
}

@media (max-width: 1500px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .left-panel {
    display: none;
  }
}
</style>
