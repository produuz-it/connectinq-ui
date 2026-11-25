<script setup lang="ts">
/**
 * The detail of an item: a drawer on the right on the desk, full screen on a phone, on
 * connectinq-ui's ModalDialog. A title, the actions (slot `actions`), the body, a foot. The list
 * stays under it, and the address carries the item, so a link opens it. Presentation only.
 */
import { LucideX } from '@lucide/vue'
import ModalDialog from '../ModalDialog.vue'
import { useIsPhone } from '../display'

withDefaults(defineProps<{ title: string; closeLabel: string; width?: number }>(), { width: 560 })
const open = defineModel<boolean>({ default: false })
const phone = useIsPhone()
</script>

<template>
  <ModalDialog v-model="open" :shape="phone ? 'full' : 'side'" :width="width" :label="title">
    <div class="dlg-head">
      <span class="ttl">{{ title }}</span>
      <slot name="actions" />
      <button type="button" class="icon-btn plain" :title="closeLabel" :aria-label="closeLabel" @click="open = false"><LucideX :size="18" /></button>
    </div>
    <div class="dlg-body dd-body"><slot /></div>
    <div v-if="$slots.foot" class="dlg-foot"><slot name="foot" /></div>
  </ModalDialog>
</template>

<style scoped>
.dd-body { display: flex; flex-direction: column; gap: 16px; }
</style>
