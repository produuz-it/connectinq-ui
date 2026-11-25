<script setup lang="ts">
/**
 * The notifications of the person, newest first: an icon by level, the title, a line of facts,
 * when, and an orange dot while it is unread. A row that opens something in this front is a
 * button (`open`); one that opens nothing is plain text. No number is drawn anywhere: the dot is
 * the only mark of what is unread. The front loads the rows and words them.
 */
import { LucideCheckCheck, LucideCircleAlert, LucideCircleCheck, LucideInfo, LucideTriangleAlert } from '@lucide/vue'
import type { NotificationRow } from './index'

defineProps<{
  rows: NotificationRow[]
  labels: { none: string; loading: string; readAll: string; unread: string }
  loading?: boolean
  /** A failure, in the front's words. */
  error?: string
  /** A line at the foot, such as how many more there are. */
  more?: string
  phone?: boolean
}>()
const emit = defineEmits<{ open: [key: string]; 'read-all': [] }>()

const ICONS = { info: LucideInfo, success: LucideCircleCheck, warning: LucideTriangleAlert, error: LucideCircleAlert }
</script>

<template>
  <div class="nl" :class="{ phone }">
    <div v-if="rows.some((row) => row.unread)" class="nl-head">
      <button type="button" class="nl-all" @click="emit('read-all')">
        <LucideCheckCheck :size="14" aria-hidden="true" /> {{ labels.readAll }}
      </button>
    </div>
    <p v-if="error" class="nl-state bad" role="alert">{{ error }}</p>
    <p v-else-if="loading && !rows.length" class="nl-state">{{ labels.loading }}</p>
    <p v-else-if="!rows.length" class="nl-state">{{ labels.none }}</p>
    <component
      :is="row.opens ? 'button' : 'div'"
      v-for="row in rows"
      :key="row.key"
      class="nl-row"
      :class="[row.level ?? 'info', { unread: row.unread, plain: !row.opens }]"
      :type="row.opens ? 'button' : undefined"
      @click="row.opens && emit('open', row.key)"
    >
      <component :is="ICONS[row.level ?? 'info'] ?? LucideInfo" :size="16" class="nl-level" aria-hidden="true" />
      <span class="nl-text">
        <b>{{ row.title }}</b>
        <small v-if="row.facts">{{ row.facts }}</small>
        <small class="nl-when">{{ row.when }}</small>
      </span>
      <i v-if="row.unread" class="dot nl-dot" role="img" :aria-label="labels.unread" />
    </component>
    <p v-if="more" class="nl-state">{{ more }}</p>
  </div>
</template>

<style scoped>
.nl { display: flex; flex-direction: column; }
.nl-head { display: flex; justify-content: flex-end; padding: 6px 12px; }
.nl-all {
  border: 0; background: none; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; color: var(--cq-ink);
  display: inline-flex; align-items: center; gap: 5px; min-height: 30px; padding: 0 6px;
}
.phone .nl-all { min-height: 44px; }
.nl-all:hover { color: var(--cq-accent-hover); }
.nl-state { margin: 0; padding: 12px 18px; color: var(--cq-n500); font-size: 12.5px; }
.nl-state.bad { color: var(--cq-warn-ink); background: var(--cq-warn-tint); }
.nl-row {
  display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 11px 16px 11px 18px; text-align: left;
  border: 0; border-top: 1px solid var(--cq-n100); background: none; color: var(--cq-ink); font: inherit; cursor: pointer;
}
.phone .nl-row { min-height: 62px; }
.nl-row:hover { background: var(--cq-n50); }
.nl-row.plain { cursor: default; }
.nl-row.plain:hover { background: none; }
.nl-level { flex: none; margin-top: 1px; color: var(--cq-n400); }
.nl-row.warning .nl-level, .nl-row.error .nl-level { color: var(--cq-accent-hover); }
.nl-row.success .nl-level { color: var(--cq-good-ink); }
.nl-text { flex: 1; min-width: 0; line-height: 1.35; }
.nl-text b { display: block; font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
.nl-row.unread .nl-text b { font-weight: 800; }
.nl-text small { display: block; font-size: 11.5px; color: var(--cq-n500); }
.nl-when { font-family: var(--cq-mono); font-size: 10.5px !important; color: var(--cq-n400) !important; margin-top: 2px; }
.nl-dot { width: 8px; height: 8px; flex: none; margin-top: 5px; border-radius: 50%; background: var(--cq-accent-hover); }
</style>
