<script setup lang="ts" generic="Row">
/**
 * A list: a table on the desk, one row per item on a phone (management app split proposal,
 * section 6.4). Sortable headers, a selection column, rows that open, group rows, an empty and a
 * loading state. The cells are the front's (`cell-<key>` slots, else the row's value); on a phone
 * the `phone` slot draws each row (usually a PhoneRow). 
 * connectinq-ui.
 */
import { computed } from 'vue'
import { LucideArrowDown, LucideArrowUp } from '@lucide/vue'
import { useIsPhone } from '../display'

export interface Column {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** Numbers, dates, references: Roboto Mono. */
  mono?: boolean
  sortable?: boolean
  width?: string
  /** Hidden below this width (px) on the desk: the less needed columns go first. */
  hideBelow?: number
}

export interface Sort { key: string; dir: 'asc' | 'desc' }

const props = withDefaults(defineProps<{
  columns: Column[]
  rows: Row[]
  rowKey: (row: Row) => string
  /** Groups: the group's title for each row; rows of one group must be next to each other. */
  groupOf?: (row: Row) => string
  selectable?: boolean
  loading?: boolean
  empty?: string
  loadingText?: string
  /** The row that is open (a drawer), drawn as selected. */
  openKey?: string
  /** Rows open on click. */
  clickable?: boolean
  /** A fixed height scrolls the body with a sticky header. */
  maxHeight?: string
}>(), { groupOf: undefined, selectable: false, loading: false, empty: '', loadingText: '', openKey: '', clickable: true, maxHeight: '' })

const emit = defineEmits<{ open: [row: Row] }>()
const selected = defineModel<string[]>('selected', { default: () => [] })
const sort = defineModel<Sort | null>('sort', { default: null })

const phone = useIsPhone()

const keys = computed(() => props.rows.map(props.rowKey))
const allSelected = computed(() => keys.value.length > 0 && keys.value.every((key) => selected.value.includes(key)))
const someSelected = computed(() => !allSelected.value && keys.value.some((key) => selected.value.includes(key)))

function toggleAll() {
  selected.value = allSelected.value
    ? selected.value.filter((key) => !keys.value.includes(key))
    : [...new Set([...selected.value, ...keys.value])]
}
function toggle(key: string) {
  selected.value = selected.value.includes(key) ? selected.value.filter((k) => k !== key) : [...selected.value, key]
}
function sortBy(column: Column) {
  if (!column.sortable) return
  sort.value = sort.value?.key === column.key
    ? { key: column.key, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
    : { key: column.key, dir: 'asc' }
}

const items = computed(() => {
  const out: { group?: string; row?: Row; key: string }[] = []
  let last: string | null = null
  for (const row of props.rows) {
    if (props.groupOf) {
      const group = props.groupOf(row)
      if (group !== last) out.push({ group, key: `g:${group}` })
      last = group
    }
    out.push({ row, key: props.rowKey(row) })
  }
  return out
})

function value(row: Row, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}
</script>

<template>
  <div class="dt" :class="{ phone }">
    <p v-if="loading && !rows.length" class="dt-state">{{ loadingText }}</p>
    <p v-else-if="!rows.length" class="dt-state">{{ empty }}</p>

    <template v-else-if="phone">
      <template v-for="item in items" :key="item.key">
        <div v-if="item.group !== undefined" class="dt-group">{{ item.group }}</div>
        <div v-else class="dt-phone-row" :class="{ on: item.key === openKey, sel: selectable && selected.includes(item.key) }">
          <label v-if="selectable && selected.length" class="dt-phone-check" @click.stop>
            <input type="checkbox" :checked="selected.includes(item.key)" @change="toggle(item.key)" />
          </label>
          <slot name="phone" :row="item.row as Row" :open="() => emit('open', item.row as Row)" />
        </div>
      </template>
    </template>

    <div v-else class="dt-wrap" :style="maxHeight ? { maxHeight } : undefined">
      <table class="cq dt-table">
        <thead>
          <tr>
            <th v-if="selectable" class="dt-check">
              <input type="checkbox" :checked="allSelected" :indeterminate="someSelected" :aria-label="'all'" @change="toggleAll" />
            </th>
            <th v-for="column in columns" :key="column.key" :class="[column.align, { sortable: column.sortable }]"
                :style="{ width: column.width }" :data-hide-below="column.hideBelow"
                :aria-sort="sort?.key === column.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined"
                @click="sortBy(column)">
              <span class="dt-th">{{ column.label }}
                <LucideArrowUp v-if="sort?.key === column.key && sort.dir === 'asc'" :size="12" />
                <LucideArrowDown v-else-if="sort?.key === column.key" :size="12" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in items" :key="item.key">
            <tr v-if="item.group !== undefined" class="dt-grp"><td :colspan="columns.length + (selectable ? 1 : 0)">{{ item.group }}</td></tr>
            <tr v-else :class="{ click: clickable, on: item.key === openKey }" @click="clickable && emit('open', item.row as Row)">
              <td v-if="selectable" class="dt-check" @click.stop>
                <input type="checkbox" :checked="selected.includes(item.key)" :aria-label="item.key" @change="toggle(item.key)" />
              </td>
              <td v-for="column in columns" :key="column.key" :class="[column.align, { mono: column.mono }]" :data-hide-below="column.hideBelow">
                <slot :name="`cell-${column.key}`" :row="item.row as Row">{{ value(item.row as Row, column.key) ?? '—' }}</slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <slot name="foot" />
  </div>
</template>

<style scoped>
.dt-state { margin: 0; padding: 32px 18px; text-align: center; color: var(--cq-n500); }
.dt-wrap { overflow: auto; }
.dt-table thead th { position: sticky; top: 0; z-index: 1; background: var(--cq-white); }
.dt-table th.sortable { cursor: pointer; user-select: none; }
.dt-table th.sortable:hover { color: var(--cq-ink); }
.dt-th { display: inline-flex; align-items: center; gap: 4px; }
.dt-table .right { text-align: right; }
.dt-table .center { text-align: center; }
.dt-table td.mono { font-family: var(--cq-mono); font-size: 12px; }
.dt-check { width: 36px; padding-right: 0 !important; }
.dt-check input { width: 15px; height: 15px; margin: 0; vertical-align: middle; }
.dt-grp td { height: 30px; background: var(--cq-n50); font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cq-n500); }
.dt-table td { max-width: 360px; overflow: hidden; text-overflow: ellipsis; }
.dt-group { padding: 8px 14px 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cq-n500); background: var(--cq-n50); }
.dt-phone-row { display: flex; align-items: stretch; border-bottom: 1px solid var(--cq-n100); }
.dt-phone-row.on, .dt-phone-row.sel { background: var(--cq-selected); }
.dt-phone-row > :last-child { flex: 1; min-width: 0; }
.dt-phone-check { display: flex; align-items: center; padding-left: 12px; }
.dt-phone-check input { width: 20px; height: 20px; }
@media (max-width: 1200px) { .dt-table [data-hide-below="1200"] { display: none; } }
@media (max-width: 1000px) { .dt-table [data-hide-below="1000"] { display: none; } }
@media (max-width: 800px) { .dt-table [data-hide-below="800"] { display: none; } }
</style>
