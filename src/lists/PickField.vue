<script setup lang="ts">
/**
 * A filter or a choice: a native select for one value, a list with checkboxes and a search for
 * several (`multiple`), with a count beside each option when the front gives one. The caption
 * sits inside the button, as in the proposal's mocks. Presentation only.
 */
import { computed, ref } from 'vue'
import { LucideChevronDown, LucideSearch } from '@lucide/vue'
import PopButton from '../PopButton.vue'
import { useIsPhone } from '../display'

export interface Option { value: string; label: string; count?: number }

const props = withDefaults(defineProps<{
  label: string
  options: Option[]
  multiple?: boolean
  /** What the button says with nothing picked. */
  allLabel?: string
  searchLabel?: string
}>(), { multiple: false, allLabel: '', searchLabel: '' })
const model = defineModel<string | string[]>({ default: '' })
const phone = useIsPhone()
const search = ref('')

const picked = computed(() => (Array.isArray(model.value) ? model.value : model.value ? [model.value] : []))
const summary = computed(() => {
  if (!picked.value.length) return props.allLabel
  const first = props.options.find((o) => o.value === picked.value[0])?.label ?? picked.value[0]
  return picked.value.length > 1 ? `${first} +${picked.value.length - 1}` : first
})
const found = computed(() => {
  const text = search.value.trim().toLowerCase()
  return props.options.filter((o) => !text || o.label.toLowerCase().includes(text))
})

function toggle(value: string) {
  const now = picked.value
  model.value = now.includes(value) ? now.filter((v) => v !== value) : [...now, value]
}
</script>

<template>
  <label v-if="!multiple" class="pick single">
    <span class="k">{{ label }}</span>
    <select v-model="model">
      <option value="">{{ allLabel }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}{{ o.count !== undefined ? ` (${o.count})` : '' }}</option>
    </select>
  </label>
  <PopButton v-else class="pick multi" :class="{ on: picked.length }" :label="label" :phone="phone" :width="280" @open="search = ''">
    <template #button>
      <span class="k">{{ label }}</span><span class="v">{{ summary }}</span><LucideChevronDown :size="13" />
    </template>
    <label v-if="options.length > 8" class="pk-search">
      <LucideSearch :size="14" /><input v-model="search" type="search" :placeholder="searchLabel" :aria-label="searchLabel" />
    </label>
    <label v-for="o in found" :key="o.value" class="pop-row pk-row">
      <input type="checkbox" :checked="picked.includes(o.value)" @change="toggle(o.value)" />
      <span class="grow">{{ o.label }}</span>
      <span v-if="o.count !== undefined" class="pk-count">{{ o.count }}</span>
    </label>
  </PopButton>
</template>

<!-- PopButton's button is its own element: these rules are not scoped. -->
<style>
.pick { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 8px; border: 1px solid var(--cq-n200);
  background: var(--cq-white); font-size: 12.5px; white-space: nowrap; max-width: 260px; }
.pick .k { font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cq-n500); }
.pick .v { overflow: hidden; text-overflow: ellipsis; }
.pick.on { border-color: var(--cq-ink); }
.pick.single select { border: 0; height: 28px; padding: 0 4px; background: none; width: auto; min-width: 80px; }
@media (max-width: 599px) { .pick { height: 44px; max-width: none; width: 100%; } }
</style>

<style scoped>
.pk-search { display: flex; align-items: center; gap: 6px; margin: 8px 14px; padding: 0 8px; height: 32px; border: 1px solid var(--cq-n200); color: var(--cq-n500); }
.pk-search input { flex: 1; border: 0; outline: 0; background: none; font: inherit; height: 28px; padding: 0; color: var(--cq-ink); }
.pk-row { cursor: pointer; }
.pk-row input { width: 15px; height: 15px; margin: 0; }
.pk-count { font-family: var(--cq-mono); font-size: 11px; color: var(--cq-n500); }
</style>
