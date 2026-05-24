<script setup lang="ts">
import AppBrand from './AppBrand.vue';

const messages = [
  {
    side: 'left',
    who: 'AB',
    msg: 'Pipeline do Harness rodando — espera só.',
    t: '12:04',
  },
  {
    side: 'right',
    who: 'LF',
    msg: 'Beleza, vou trabalhar no front do auth enquanto isso.',
    t: '12:04',
  },
  {
    side: 'left',
    who: 'AB',
    msg: 'Boa. JWT + refresh em cookie httpOnly já tá na main.',
    t: '12:05',
  },
  { side: 'typing', who: 'LF' },
] as const;
</script>

<template>
  <div class="left">
    <div class="viz">
      <div class="viz-grid" />
    </div>

    <div class="left-top">
      <AppBrand />

      <div class="hero">
        <div class="hero-eyebrow">Mensagens em tempo real</div>
        <h1>Converse com quem importa, <em>sem espera</em>.</h1>
        <p>
          NestJS + Socket.IO entregando mensagens com latência baixa, sessões
          persistentes e refresh tokens rotativos. Entre para continuar de onde
          parou.
        </p>
      </div>
    </div>

    <div class="bubbles">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="bubble"
        :class="[
          m.side === 'right' ? 'right' : '',
          m.side === 'typing' ? 'typing' : '',
        ]"
        :style="{ animationDelay: `${i * 0.18 + 0.1}s` }"
      >
        <div class="av">{{ m.who }}</div>
        <div v-if="m.side === 'typing'" class="msg">
          <span class="dot" />
          <span class="dot" />
          <span class="dot" />
        </div>
        <div v-else class="msg">
          {{ (m as { msg: string }).msg }}
          <span class="meta">{{ (m as { t: string }).t }}</span>
        </div>
      </div>
    </div>

    <div class="left-footer">
      <div class="status-pill">
        <span class="dot" />
        API · operacional
      </div>
      <span>p95 · 42ms</span>
      <span style="margin-left: auto">© 2026</span>
    </div>
  </div>
</template>

<style scoped>
.left {
  position: relative;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--line-soft);
  overflow: hidden;
}

.left-top {
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

/* Grid background */
.viz {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.viz-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(oklch(1 0 0 / 0.025) 1px, transparent 1px),
    linear-gradient(90deg, oklch(1 0 0 / 0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse at 70% 80%, black 0%, transparent 65%);
  -webkit-mask-image: radial-gradient(
    ellipse at 70% 80%,
    black 0%,
    transparent 65%
  );
}

/* Hero */
.hero {
  z-index: 2;
  position: relative;
  max-width: 520px;
}

.hero-eyebrow {
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.hero-eyebrow::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--text-dim);
}

.hero h1 {
  font-size: 44px;
  line-height: 1.06;
  letter-spacing: -0.025em;
  font-weight: 500;
  margin: 0 0 20px;
  text-wrap: balance;
}

.hero h1 em {
  font-style: normal;
  background: linear-gradient(120deg, var(--accent), oklch(0.78 0.14 240));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 0;
  max-width: 440px;
}

/* Chat bubbles */
.bubbles {
  padding-top: 24px;
  position: absolute;
  right: 5px;
  bottom: 96px;
  width: 540px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 1;
}

.bubble {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  opacity: 0;
  transform: translateY(8px);
  animation: bubble-in 0.5s ease-out forwards;
}

.bubble.right {
  flex-direction: row-reverse;
}

.bubble .av {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-3);
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-mute);
  border: 1px solid var(--line);
}

.bubble .msg {
  padding: 10px 14px;
  border-radius: 16px;
  background: var(--bg-2);
  border: 1px solid var(--line-soft);
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--text);
  max-width: 320px;
  box-shadow: 0 1px 0 oklch(1 0 0 / 0.02) inset;
}

.bubble.right .msg {
  background: var(--accent-soft);
  border-color: var(--accent-line);
}

.bubble .msg .meta {
  display: block;
  font-size: 10.5px;
  color: var(--text-dim);
  margin-top: 4px;
  font-family: 'Geist Mono', monospace;
}

.bubble.typing .msg {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 14px;
}

.bubble.typing .msg .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-mute);
  animation: typing 1.2s infinite ease-in-out;
}

.bubble.typing .msg .dot:nth-child(2) {
  animation-delay: 0.15s;
}
.bubble.typing .msg .dot:nth-child(3) {
  animation-delay: 0.3s;
}

/* Footer */
.left-footer {
  z-index: 2;
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: var(--text-dim);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--bg-2);
  border: 1px solid var(--line-soft);
}

.status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 3px oklch(0.78 0.16 155 / 0.18);
  animation: pulse 2s infinite;
}
</style>
