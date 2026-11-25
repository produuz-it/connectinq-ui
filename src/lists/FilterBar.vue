<script setup lang="ts">
/**
 * The filters of a list: in a row on the desk; on a phone a *Filters (n)* button and a sheet
 * that says how many rows it will show (management app split proposal, section 6.4). The fields
 * are the front's (default slot); `search` sits beside the button on a phone. Presentation only.
 */
import { ref } from 'vue'
import { LucideSlidersHorizontal } from '@lucide/vue'
import ModalDialog from '../ModalDialog.vue'
import { useIsPhone } from '../display'

defineProps<{
  /** How many filters are set, for the button. */
  active?: number
  labels: { filters: string; clear: string; show: string }
}>()
const emit = defineEmits<{ clear: [] }>()

const phone = useIsPhone()
const open = ref(false)
</script>

<template>
  <div v-if="!phone" class="fb">
    <slot name="search" />
    <slot />
    <button v-if="active" type="button" class="btn text" @click="emit('clear')">{{ labels.clear }}</button>
    <span class="grow" />
    <slot name="end" />
  </div>
  <div v-else class="fb phone">
    <slot name="search" />
    <button type="button" class="btn" @click="open = true">
      <LucideSlidersHorizontal :size="16" />
      <span v-if="active" class="count on">{{ active }}</span>
    </button>
    <slot name="end" />
    <ModalDialog v-model="open" shape="sheet" :label="labels.filters">
      <div class="dlg-head"><span class="ttl">{{ labels.filters }}</span>
        <button v-if="active" type="button" class="btn text" @click="emit('clear')">{{ labels.clear }}</button>
      </div>
      <div class="dlg-body fb-sheet"><slot /></div>
      <div class="dlg-foot"><button type="button" class="btn primary block" @click="open = false">{{ labels.show }}</button></div>
    </ModalDialog>
  </div>
</template>

<style scoped>
.fb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 0 18px 12px; }
.fb.phone { flex-wrap: nowrap; padding: 0 12px 10px; }
.fb.phone :deep(.search), .fb.phone :deep(input[type="search"]) { flex: 1; }
.fb-sheet { display: flex; flex-direction: column; gap: 12px; }
.fb-sheet :deep(.pick), .fb-sheet :deep(select) { width: 100%; }
</style>
