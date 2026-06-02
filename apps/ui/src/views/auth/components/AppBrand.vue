<script setup lang="ts">
import AppIcon from './AppIcon.vue';
</script>

<template>
  <div class="brand">
    <div class="brand-mark">
      <AppIcon name="chat" />
    </div>
    <div>
      <span class="brand-name">
        Real Time Chat<span class="mono">v0.0.1</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
  position: relative;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    oklch(0.55 0.22 280) 100%
  );
  display: grid;
  place-items: center;
  box-shadow:
    0 6px 24px -8px var(--accent),
    inset 0 1px 0 oklch(1 0 0 / 0.25);
  position: relative;
  color: white;
  flex-shrink: 0;
}

.brand-mark::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.12);
}

.brand-mark :deep(svg) {
  width: 18px;
  height: 18px;
}

.brand-name {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.brand-name .mono {
  color: var(--text-mute);
  font-weight: 500;
  font-size: 12px;
  margin-left: 6px;
}
</style>
