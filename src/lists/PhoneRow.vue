<script setup lang="ts">
/**
 * One item on a phone (management app split proposal, section 6.4): an icon, the title, a line
 * of facts, a value at the end (a status, a count). The whole row is the button that opens it,
 * 62 px high so a finger hits it. Presentation only.
 */
import type { Component } from 'vue'

defineProps<{ icon?: Component; title: string; facts?: string; mono?: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <button type="button" class="pr" @click="$emit('open')">
    <component :is="icon" v-if="icon" :size="20" class="pr-lead" />
    <span class="pr-main">
      <span class="pr-title" :class="{ mono }">{{ title }}</span>
      <span v-if="facts" class="pr-facts">{{ facts }}</span>
    </span>
    <span class="pr-end"><slot /></span>
  </button>
</template>

<style scoped>
.pr {
  display: flex; align-items: center; gap: 12px; width: 100%; min-height: 62px; padding: 8px 12px 8px 14px;
  border: 0; background: none; color: var(--cq-ink); font: inherit; text-align: left; cursor: pointer;
}
.pr:active { background: var(--cq-n50); }
.pr-lead { flex: none; color: var(--cq-n500); }
.pr-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pr-title { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr-title.mono { font-family: var(--cq-mono); font-size: 13px; }
.pr-facts { font-size: 12px; color: var(--cq-n500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.pr-end { flex: none; font-size: 12px; text-align: right; }
</style>
