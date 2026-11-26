<script setup lang="ts">
/**
 * The one button for notifications, help and tickets, in the head of the menu. One glyph of its
 * own, two speech bubbles, one each way (what comes to the person and what they send), drawn on
 * Lucide's grid so it sits beside the menu's other icons. An orange dot only while the person
 * has something unread addressed to them (a notification, an answer to a ticket), never for what
 * is new in the help, and never a number. Self-contained like the frame.
 */
defineProps<{ label: string; unread?: boolean; phone?: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <button type="button" class="cq-support-btn" :class="{ phone }" :title="label" :aria-label="label" @click="$emit('open')">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <path d="M10 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-3-3" />
      <path d="M5 8h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-4 3v-3a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
    </svg>
    <span v-if="unread" class="dot cq-support-dot" aria-hidden="true" />
  </button>
</template>

<style scoped>
.cq-support-btn {
  position: relative; display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0; flex: none;
  border: 1px solid transparent; background: none; color: var(--cq-ink); cursor: pointer;
}
.cq-support-btn.phone { width: 44px; height: 44px; }
.cq-support-btn:hover { background: var(--cq-hover); }
.cq-support-dot {
  position: absolute; top: 3px; right: 3px; width: 8px; height: 8px; border-radius: 50% !important;
  background: var(--cq-accent-hover); box-shadow: 0 0 0 2px var(--cq-white);
}
.cq-support-btn.phone .cq-support-dot { top: 8px; right: 8px; }
</style>
