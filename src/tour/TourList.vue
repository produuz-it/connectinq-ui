<script setup lang="ts">
/**
 * The tours of a front, one row each: its icon, its name, a line (what it shows, how many steps),
 * whether it was done or skipped, and *Start* (or *Again* once done). The front builds the rows
 * and draws the page around them; on a phone the rows are full width with no card.
 */
import type { Component } from 'vue'
import { LucideCheck } from '@lucide/vue'
import { useIsPhone } from '../display'
import type { TourOutcome } from './memory'

export interface TourRow { id: string; icon?: Component; title: string; line: string; outcome?: TourOutcome }

defineProps<{
  rows: TourRow[]
  labels: { start: string; again: string; done: string; skipped: string }
}>()
const emit = defineEmits<{ start: [id: string] }>()
const phone = useIsPhone()
</script>

<template>
  <div class="cq-tour-list" :class="{ phone }">
    <div v-for="row in rows" :key="row.id" class="tl-row">
      <component :is="row.icon" v-if="row.icon" :size="22" class="tl-icon" />
      <div class="tl-main">
        <b>{{ row.title }}</b>
        <small>{{ row.line }}</small>
      </div>
      <span v-if="row.outcome && !phone" class="tl-chip" :class="row.outcome">
        <LucideCheck v-if="row.outcome === 'done'" :size="12" />{{ row.outcome === 'done' ? labels.done : labels.skipped }}
      </span>
      <button type="button" class="tl-btn" :class="{ quiet: row.outcome === 'done' }" @click="emit('start', row.id)">
        {{ row.outcome === 'done' ? labels.again : labels.start }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cq-tour-list { background: var(--cq-white); border: 1px solid var(--cq-n100); }
.cq-tour-list.phone { border: 0; }
.tl-row { display: flex; align-items: center; gap: 14px; padding: 12px 18px; border-top: 1px solid var(--cq-n100); }
.tl-row:first-child { border-top: 0; }
.phone .tl-row { padding: 10px 12px 10px 14px; border-top: 0; border-bottom: 1px solid var(--cq-n100); }
.tl-icon { color: var(--cq-accent); flex: none; }
.tl-main { flex: 1; min-width: 0; }
.tl-main b { display: block; font-weight: 800; }
.tl-main small { display: block; font-size: 12.5px; color: var(--cq-n500); }
.tl-chip {
  display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; white-space: nowrap; border: 1px solid currentColor;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cq-n400);
}
.tl-chip.done { color: var(--cq-good-ink); }
.tl-btn {
  flex: none; display: inline-flex; align-items: center; height: 32px; padding: 0 14px; border: 1px solid var(--cq-n200); background: var(--cq-white);
  color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}
.tl-btn:hover { border-color: var(--cq-ink); }
.tl-btn.quiet { border-color: transparent; background: none; }
.tl-btn.quiet:hover { background: var(--cq-n50); }
.phone .tl-btn { height: 44px; }
</style>
