<script setup lang="ts">
/**
 * A row's actions (woodwall-web docs/table-row-actions-proposal.md): at most two as icon
 * buttons, the rest in a menu; *Delete* is always last in the menu and confirmed by the front.
 * An action that cannot run now stays in its place, disabled, and says why. Presentation only.
 */
import { computed, type Component } from 'vue'
import { LucideEllipsisVertical } from '@lucide/vue'
import PopButton from '../PopButton.vue'

export interface RowAction {
  key: string
  label: string
  icon: Component
  danger?: boolean
  hidden?: boolean
  /** Shown but not usable now; `reason` says why (its tooltip, and a second line in the menu). */
  disabled?: boolean
  reason?: string
}

const props = withDefaults(defineProps<{ actions: RowAction[]; visible?: number; moreLabel: string }>(), { visible: 2 })
const emit = defineEmits<{ run: [key: string] }>()

const shown = computed(() => props.actions.filter((a) => !a.hidden))
const direct = computed(() => shown.value.filter((a) => !a.danger).slice(0, props.visible))
const menu = computed(() => {
  const rest = shown.value.filter((a) => !direct.value.includes(a))
  return [...rest.filter((a) => !a.danger), ...rest.filter((a) => a.danger)]
})
</script>

<template>
  <span class="ra" @click.stop>
    <button v-for="a in direct" :key="a.key" type="button" class="icon-btn plain" :disabled="a.disabled" :title="a.disabled && a.reason ? `${a.label}: ${a.reason}` : a.label" :aria-label="a.label"
            @click="emit('run', a.key)">
      <component :is="a.icon" :size="16" />
    </button>
    <PopButton v-if="menu.length" class="icon-btn plain" :label="moreLabel" side="below" :width="220">
      <template #button><LucideEllipsisVertical :size="16" /></template>
      <template #default="{ close }">
        <button v-for="a in menu" :key="a.key" type="button" class="pop-row" :class="{ danger: a.danger }" :disabled="a.disabled" @click="close(); emit('run', a.key)">
          <component :is="a.icon" :size="16" />
          <span class="grow">{{ a.label }}<small v-if="a.disabled && a.reason" class="why">{{ a.reason }}</small></span>
        </button>
      </template>
    </PopButton>
  </span>
</template>

<style scoped>
.ra { display: inline-flex; align-items: center; gap: 2px; justify-content: flex-end; }
.pop-row.danger { color: var(--cq-danger); }
.pop-row:disabled { color: var(--cq-n300); cursor: default; }
.why { display: block; font-size: 11px; color: var(--cq-n400); }
</style>
