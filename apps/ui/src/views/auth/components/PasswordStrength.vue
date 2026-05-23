<script setup lang="ts">
withDefaults(defineProps<{
  strength: number
  strengthLabel: string
  checks: { len: boolean; upper: boolean; digit: boolean; special: boolean }
  showChecklist?: boolean
}>(), { showChecklist: true })
</script>

<template>
  <div>
    <div class="strength" aria-hidden="true">
      <div
        v-for="i in 4"
        :key="i"
        class="strength-bar"
        :class="strength >= i ? `on-${strength}` : ''"
      />
    </div>
    <div class="strength-label">
      <span>força</span>
      <span>{{ strengthLabel }}</span>
    </div>
    <div v-if="showChecklist" class="checklist">
      <div class="item" :class="{ ok: checks.len }">
        <span class="tick" />8–16 chars
      </div>
      <div class="item" :class="{ ok: checks.upper }">
        <span class="tick" />A-Z + a-z
      </div>
      <div class="item" :class="{ ok: checks.digit }">
        <span class="tick" />número
      </div>
      <div class="item" :class="{ ok: checks.special }">
        <span class="tick" />símbolo
      </div>
    </div>
  </div>
</template>

<style scoped>
.strength {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.strength-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--bg-3);
  transition: background-color 0.2s ease;
}

.strength-bar.on-1 { background: oklch(0.72 0.17 25); }
.strength-bar.on-2 { background: oklch(0.78 0.16 60); }
.strength-bar.on-3 { background: oklch(0.78 0.14 130); }
.strength-bar.on-4 { background: var(--success); }

.strength-label {
  font-family: 'Geist Mono', monospace;
  font-size: 10.5px;
  color: var(--text-dim);
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
}

.checklist {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 14px;
  margin-top: 10px;
}

.checklist .item {
  font-family: 'Geist Mono', monospace;
  font-size: 10.5px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 6px;
}

.checklist .item .tick {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--line);
  display: inline-block;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.checklist .item.ok { color: var(--text-mute); }

.checklist .item.ok .tick {
  background: var(--success);
  border-color: var(--success);
}
</style>
