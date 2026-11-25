<script setup lang="ts">
/** The `?` that opens the help, with a dot while something new is unread. Self-contained like the frame. */
import { LucideCircleHelp } from '@lucide/vue'

defineProps<{ label: string; unseen?: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <button type="button" class="cq-help-btn" :title="label" :aria-label="label" @click="$emit('open')">
    <LucideCircleHelp :size="18" />
    <span v-if="unseen" class="dot cq-help-dot" aria-hidden="true" />
  </button>
</template>

<style scoped>
.cq-help-btn {
  position: relative; display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0; flex: none;
  border: 1px solid transparent; background: none; color: var(--cq-ink); cursor: pointer;
}
.cq-help-btn:hover { background: var(--cq-hover); }
.cq-help-dot { position: absolute; top: 3px; right: 3px; width: 7px; height: 7px; border-radius: 50%; background: var(--cq-accent); }
</style>
