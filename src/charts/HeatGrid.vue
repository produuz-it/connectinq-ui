<script lang="ts">
/** The step of a value on a scale of `steps` (0 for nothing), against the largest value of the grid. */
export function heatLevel(value: number, max: number, steps = 4): number {
  if (!value || value <= 0 || max <= 0) return 0
  return Math.min(steps, Math.max(1, Math.ceil((value / max) * steps)))
}
</script>

<script setup lang="ts">
/**
 * Rows against buckets as a heat grid: one cell per bucket, darker for more, on one scale for the
 * whole grid; an empty cell stays the surface colour. The figure is written in a cell when there
 * are few enough buckets to read it, and always in its tooltip. A row lighter than the ones before
 * it is what the eye should find. Presentation only: the front passes the rows and the labels.
 */
import { computed } from 'vue'

export interface HeatRow { key: string; name: string; data: number[]; total: number }

const props = defineProps<{ labels: string[]; rows: HeatRow[] }>()
const max = computed(() => Math.max(1, ...props.rows.flatMap((row) => row.data)))
const figures = computed(() => props.labels.length <= 16)
const every = computed(() => Math.ceil(props.labels.length / 8))
</script>

<template>
  <div class="hg-box"><div class="hg" :style="{ '--cols': labels.length }">
    <template v-for="row in rows" :key="row.key">
      <span class="name" :title="row.name">{{ row.name }}</span>
      <span class="cells">
        <span v-for="(label, i) in labels" :key="i" class="cell mono" :class="`l${heatLevel(row.data[i] ?? 0, max)}`" :title="`${row.name} · ${label}: ${row.data[i] ?? 0}`">{{ figures && row.data[i] ? row.data[i] : '' }}</span>
      </span>
      <b class="mono total">{{ row.total }}</b>
    </template>
    <span />
    <span class="cells axis"><span v-for="(label, i) in labels" :key="i" class="mono">{{ i % every === 0 ? label : '' }}</span></span>
    <span />
  </div></div>
</template>

<style scoped>
.hg { display: grid; grid-template-columns: minmax(90px, 200px) minmax(0, 1fr) auto; gap: 2px 10px; align-items: center; font-size: 12.5px; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cells { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 2px; }
.cell { height: 22px; display: flex; align-items: center; justify-content: center; font-size: 10px; overflow: hidden; background: var(--cq-n50); color: var(--cq-heat-ink); }
/* One blue ramp, light to dark: an ordered scale. */
.cell.l1 { background: var(--cq-heat-1); }
.cell.l2 { background: var(--cq-heat-2); }
.cell.l3 { background: var(--cq-heat-3); }
.cell.l4 { background: var(--cq-heat-4); color: var(--cq-on-strong); }
.total { text-align: right; min-width: 34px; }
.axis { font-size: 10px; color: var(--cq-n500); }
.axis span { overflow: visible; white-space: nowrap; }
/* In a narrow card the cells are too small for a figure or for every other date. */
.hg-box { container-type: inline-size; }
@container (max-width: 560px) {
  .hg { grid-template-columns: minmax(70px, 120px) minmax(0, 1fr) auto; }
  .cell { font-size: 0; }
  .axis span:not(:first-child) { visibility: hidden; }
}
</style>
