<script setup lang="ts">
/**
 * A unit's, a batch's or a file's state as an outlined chip: ready in green, working in ink,
 * waiting in grey, failures on vermilion. The word is the front's.
 */
import { computed } from 'vue'

const props = defineProps<{ status: string; label: string }>()

const TONES: Record<string, string> = {
  ready: 'ok', done: 'ok', delivered: 'ok', resolved: 'ok', valid: 'ok', finished: 'ok', success: 'ok',
  working: 'run', started: 'run', in_rack: 'run', sent: 'run', running: 'run', generating: 'run',
  error: 'bad', failed: 'bad', invalid: 'bad', blocked: 'bad',
  hot: 'warn', open: 'warn', late: 'warn', kitted_parts: 'warn',
}
const tone = computed(() => TONES[props.status] ?? 'grey')
</script>

<template>
  <span class="chip" :class="tone">{{ label }}</span>
</template>
