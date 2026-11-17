<script setup lang="ts">
/**
 * A modal over the page, on the native <dialog> (`showModal()`, Baseline Widely available):
 * focus moves in and comes back, the page behind is inert, and Escape or the back gesture
 * closes it. Four shapes: `center` (a dialog), `side` (a drawer on the right), `sheet` (a
 * bottom sheet on a phone) and `full` (full screen on a phone).
 *
 * Clicking the backdrop closes it too. `closedby="any"` would do that on its own but is not
 * Baseline Widely available, so a click that lands on the <dialog> itself (only the backdrop
 * can: the content fills it) closes it here. The styles are `dialog.cq-dialog` and `cq-dialog--<shape>` in
 * base.css (prefixed, so they never meet an app's own `center` or `side` class);
 * the content uses `dlg-head` (with a `ttl`), `dlg-body` and `dlg-foot`.
 */
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** The dialog's name for a screen reader, when it has no visible title. */
  label?: string
  labelledby?: string
  shape?: 'center' | 'side' | 'sheet' | 'full'
  /** Width of a `center` or `side` dialog, in px. */
  width?: number
  /** A click on the backdrop does not close it (a form with edits); Escape still does. */
  persistent?: boolean
}>(), { label: undefined, labelledby: undefined, shape: 'center', width: 460, persistent: false })

const open = defineModel<boolean>({ default: false })
const el = ref<HTMLDialogElement | null>(null)

function sync() {
  const dialog = el.value
  if (!dialog) return
  if (open.value && !dialog.open) dialog.showModal()
  else if (!open.value && dialog.open) dialog.close()
}
onMounted(sync)
watch(open, sync, { flush: 'post' })

function onClose() {
  open.value = false
}
function onClick(event: MouseEvent) {
  if (!props.persistent && event.target === el.value) open.value = false
}
</script>

<template>
  <dialog
    ref="el"
    class="cq-dialog"
    :class="`cq-dialog--${shape}`"
    :style="shape === 'center' || shape === 'side' ? { width: `${width}px` } : undefined"
    :aria-label="label"
    :aria-labelledby="labelledby"
    @close="onClose"
    @click="onClick"
  >
    <div v-if="open" class="dlg">
      <div v-if="shape === 'sheet'" class="grab" />
      <slot />
    </div>
  </dialog>
</template>
