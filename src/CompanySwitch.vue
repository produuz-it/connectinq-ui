<script setup lang="ts">
/**
 * The company the account works in, under the application's name in the side menu. A staff
 * account opens it to change company: a searchable list, the current one checked, the one being
 * moved to marked. Any other account sees the name only.
 *
 * Presentation only: the front loads the companies when the panel opens (`open`), moves the
 * account when one is picked (`pick`, with its uuid) and passes back `loading`, `moving` and
 * `failure` while it works. Which companies are listed and what a move does stay in the front.
 */
import { computed, ref } from 'vue'
import { LucideBuilding2, LucideCheck, LucideChevronDown, LucideSearch } from '@lucide/vue'
import PopButton from './PopButton.vue'

export interface CompanyRow {
  uuid: string
  name: string
}

export interface CompanySwitchLabels {
  /** The panel's title and the button's label: "Switch company". */
  switch: string
  /** The name shown when the account works in no company. */
  none: string
  /** The tooltip of the STAFF chip. */
  staffOnly: string
  search: string
  loading: string
  noMatch: string
  /** Beside the company being moved to. */
  moving: string
  /** The note at the foot: what a move changes. */
  hint: string
}

const props = withDefaults(defineProps<{
  /** The company the account works in now. */
  company: CompanyRow | null
  /** The companies staff may move to; filled by the front on `open`. */
  companies: readonly CompanyRow[]
  /** Only staff change company; anyone else sees the name. */
  staff: boolean
  labels: CompanySwitchLabels
  loading?: boolean
  /** The uuid of the company being moved to, while the move runs. */
  moving?: string
  /** Why loading or moving failed, already in words. */
  failure?: string
  rail?: boolean
  phone?: boolean
}>(), { loading: false, moving: '', failure: '', rail: false, phone: false })

const emit = defineEmits<{ open: []; pick: [uuid: string] }>()

const search = ref('')

const found = computed(() => {
  const text = search.value.trim().toLowerCase()
  return props.companies
    .filter((row) => !text || row.name.toLowerCase().includes(text))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
})

function onOpen() {
  search.value = ''
  emit('open')
}

function pick(row: CompanyRow) {
  if (row.uuid === props.company?.uuid || props.moving) return
  emit('pick', row.uuid)
}
</script>

<template>
  <PopButton v-if="staff" class="cq-company staff" :class="{ rail }" :label="labels.switch"
             :side="rail ? 'right' : 'below'" :phone="phone" :width="300" @open="onOpen">
    <template #button>
      <LucideBuilding2 v-if="rail" :size="18" />
      <template v-else>
        <span class="cq-company-name">{{ company?.name ?? labels.none }}</span>
        <span class="cq-staff-chip" :title="labels.staffOnly">STAFF</span>
        <LucideChevronDown :size="14" class="cq-company-chevron" />
      </template>
    </template>
    <div class="pop-head">{{ labels.switch }}<span class="grow" /><span class="cq-staff-chip" :title="labels.staffOnly">STAFF</span></div>
    <label class="cq-company-search">
      <LucideSearch :size="14" />
      <input v-model="search" type="search" :placeholder="labels.search" :aria-label="labels.search" />
    </label>
    <p v-if="failure" class="pop-error">{{ failure }}</p>
    <p v-else-if="loading" class="cq-company-state">{{ labels.loading }}</p>
    <p v-else-if="!found.length" class="cq-company-state">{{ labels.noMatch }}</p>
    <button v-for="row in found" :key="row.uuid" type="button" class="pop-row"
            :class="{ current: row.uuid === company?.uuid }" :disabled="!!moving && moving !== row.uuid" @click="pick(row)">
      <span class="cq-company-name">{{ row.name }}</span>
      <LucideCheck v-if="row.uuid === company?.uuid" :size="15" />
      <span v-else-if="moving === row.uuid" class="cq-company-moving">{{ labels.moving }}</span>
    </button>
    <div class="pop-foot">{{ labels.hint }}</div>
  </PopButton>
  <div v-else-if="!rail" class="cq-company"><span class="cq-company-name">{{ company?.name ?? '' }}</span></div>
</template>

<!-- Not scoped: the button is PopButton's own element and the panel is teleported to the body. -->
<style>
.cq-company {
  display: flex; align-items: center; gap: 6px; width: 100%; min-height: 30px; padding: 0 6px;
  font-size: 12px; font-weight: 700; color: var(--cq-n500); text-align: left; justify-content: flex-start;
}
.cq-company.staff:hover, .cq-company.staff.on { color: var(--cq-ink); background: var(--cq-n50); }
.cq-company.rail { width: 40px; height: 36px; padding: 0; justify-content: center; color: var(--cq-ink); }
.cq-company-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cq-company-chevron { flex: none; }
/* Staff only: the same word in every language, so it is not translated. */
.cq-staff-chip {
  flex: none; display: inline-flex; align-items: center; height: 16px; padding: 0 6px; border-radius: 4px;
  background: var(--cq-staff); color: var(--cq-on-strong); font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; line-height: 1;
}
.cq-company-search {
  display: flex; align-items: center; gap: 6px; margin: 0 14px 8px; padding: 0 8px; height: 32px;
  border: 1px solid var(--cq-n200); color: var(--cq-n500);
}
.cq-company-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; height: 28px; padding: 0; color: var(--cq-ink); }
.cq-company-state { margin: 0; padding: 6px 14px 12px; color: var(--cq-n500); }
.cq-company-moving { font-size: 11.5px; color: var(--cq-n500); }
</style>
