<script setup lang="ts">
/**
 * What to do with the selected rows: *N selected* and the bulk actions (default slot). Over the
 * list on the desk, a bar at the bottom on a phone. Presentation only.
 */
import { LucideX } from '@lucide/vue'
import { useIsPhone } from '../display'

defineProps<{ count: number; labels: { selected: string; clear: string } }>()
const emit = defineEmits<{ clear: [] }>()
const phone = useIsPhone()
</script>

<template>
  <div v-if="count" class="sb" :class="{ phone }">
    <b>{{ labels.selected }}</b>
    <span class="grow" />
    <slot />
    <button type="button" class="icon-btn plain" :title="labels.clear" :aria-label="labels.clear" @click="emit('clear')"><LucideX :size="16" /></button>
  </div>
</template>

<style scoped>
.sb {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 0 18px 10px; padding: 6px 8px 6px 14px;
  background: var(--cq-ink); color: var(--cq-white); font-size: 12.5px;
}
.sb :deep(.btn) { background: transparent; color: var(--cq-white); border-color: var(--cq-n500); height: 28px; }
.sb :deep(.btn:hover) { border-color: var(--cq-white); }
.sb :deep(.icon-btn) { color: var(--cq-white); }
.sb.phone { position: fixed; left: 0; right: 0; bottom: 0; margin: 0; z-index: 20; padding: 8px 10px 8px 14px; }
.sb.phone :deep(.btn) { height: 44px; }
</style>
