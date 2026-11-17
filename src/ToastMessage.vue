<script setup lang="ts">
/**
 * One short message at the bottom of the screen, gone after a few seconds or on its close
 * button. A status region, so a screen reader reads it without moving focus; an error is
 * marked by the vermilion bar on its left.
 */
import { onBeforeUnmount, watch } from 'vue'
import { LucideX } from '@lucide/vue'

const props = withDefaults(defineProps<{
  message: { text: string; error: boolean; key: number } | null
  closeLabel: string
  /** How long it stays, in ms. */
  timeout?: number
}>(), { timeout: 5000 })
const emit = defineEmits<{ close: [] }>()

let timer: ReturnType<typeof setTimeout> | undefined
watch(() => props.message?.key, (key) => {
  clearTimeout(timer)
  if (key !== undefined) timer = setTimeout(() => emit('close'), props.timeout)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div role="status" aria-live="polite">
    <div v-if="message" :key="message.key" class="cq-toast" :class="{ bad: message.error }">
      <span class="grow">{{ message.text }}</span>
      <button type="button" class="icon-btn plain" :aria-label="closeLabel" :title="closeLabel" @click="emit('close')">
        <LucideX :size="16" />
      </button>
    </div>
  </div>
</template>
