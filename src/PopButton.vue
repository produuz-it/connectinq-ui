<script setup lang="ts">
/**
 * A button that opens a floating panel beside it: a switcher, an account menu, a list of
 * notifications. The panel closes on a click outside, on Escape and when the route changes. On
 * a phone it is a sheet under the top bar, at the full width. Fixed positioning and a backdrop
 * instead of the Popover API and anchor positioning, which are not Baseline Widely available yet.
 *
 * Classes for the panel's content: `pop-head` (a tracked caption), `pop-row` (a row; `current`
 * marks the selected one), `pop-foot` (a note at the bottom), `pop-error`.
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// Two roots (the button and the teleported panel): what the parent sets goes on the button.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** What the button does, for a screen reader and as its tooltip. */
  label: string
  /** Where the panel opens from the button. */
  side?: 'below' | 'right' | 'above'
  width?: number
  phone?: boolean
}>(), { side: 'below', width: 300, phone: false })

const emit = defineEmits<{ open: [] }>()

const open = ref(false)
const button = ref<HTMLButtonElement | null>(null)
const place = ref<Record<string, string>>({})
const route = useRoute()

const GAP = 6
const EDGE = 8

function position() {
  const anchor = button.value?.getBoundingClientRect()
  if (!anchor) return
  if (props.phone) {
    place.value = { left: '0', right: '0', top: `${Math.round(anchor.bottom + GAP)}px`, width: 'auto' }
    return
  }
  const width = Math.min(props.width, window.innerWidth - 2 * EDGE)
  const fromLeft = props.side === 'right' ? anchor.right + GAP : anchor.left
  const left = Math.max(EDGE, Math.min(fromLeft, window.innerWidth - width - EDGE))
  const style: Record<string, string> = { left: `${Math.round(left)}px`, width: `${width}px` }
  if (props.side === 'above') {
    style.bottom = `${Math.round(window.innerHeight - anchor.top + GAP)}px`
    style.maxHeight = `${Math.round(anchor.top - GAP - EDGE)}px`
  } else {
    const top = props.side === 'right' ? anchor.top : anchor.bottom + GAP
    style.top = `${Math.round(top)}px`
    style.maxHeight = `${Math.round(window.innerHeight - top - EDGE)}px`
  }
  place.value = style
}

function close() {
  if (!open.value) return
  open.value = false
  button.value?.focus({ preventScroll: true })
}

async function toggle() {
  if (open.value) return close()
  position()
  open.value = true
  emit('open')
  await nextTick()
  position()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
  } else {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', close)
  }
})
watch(() => route.fullPath, close)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', close)
})

defineExpose({ close })
</script>

<template>
  <button
    ref="button"
    type="button"
    v-bind="$attrs"
    class="pop-button"
    :class="{ on: open }"
    :title="label"
    :aria-label="label"
    :aria-expanded="open"
    aria-haspopup="true"
    @click="toggle"
  >
    <slot name="button" :open="open" />
  </button>
  <Teleport to="body">
    <template v-if="open">
      <div class="pop-backdrop" @click="close" />
      <div class="pop-panel" :class="{ sheet: phone }" :style="place" role="dialog" :aria-label="label">
        <slot :close="close" />
      </div>
    </template>
  </Teleport>
</template>

<style>
/* Not scoped: the panel is teleported to the body. */
.pop-button {
  border: 0; background: none; padding: 0; margin: 0; font: inherit; color: inherit; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
/* A button that is only an icon: the switcher. */
.pop-button.icon { width: 32px; height: 32px; flex: none; color: var(--cq-ink); }
.pop-button.icon.touch { width: 44px; height: 44px; }
.pop-button.icon:hover, .pop-button.icon.on { color: var(--cq-accent-hover); background: var(--cq-n50); }
.pop-backdrop { position: fixed; inset: 0; z-index: 60; }
.pop-panel {
  position: fixed; z-index: 61; background: var(--cq-white); border: 1px solid var(--cq-n200);
  box-shadow: var(--cq-float-shadow); overflow: auto; overscroll-behavior: contain; font-size: 13px; color: var(--cq-ink);
}
.pop-panel.sheet { border-width: 1px 0; max-height: 70vh; }
.pop-head {
  font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--cq-n500); padding: 10px 14px 6px; display: flex; align-items: center; gap: 8px;
}
.pop-head .grow { flex: 1; }
.pop-error { color: var(--cq-accent-hover); font-weight: 600; padding: 6px 14px; }
.pop-foot { font-size: 11.5px; color: var(--cq-n500); padding: 8px 14px; border-top: 1px solid var(--cq-n100); line-height: 1.4; }
.pop-row {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 36px; padding: 6px 14px;
  border: 0; background: none; font: inherit; color: inherit; text-align: left; text-decoration: none; cursor: pointer;
}
.pop-row:hover { background: var(--cq-n50); }
.pop-row.current { background: var(--cq-selected); cursor: default; }
.pop-row[disabled] { cursor: default; color: var(--cq-n400); }
.pop-panel.sheet .pop-row { min-height: 48px; }
</style>
