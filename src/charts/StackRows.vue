<script setup lang="ts">
/**
 * One horizontal stacked bar per row (a line's backlog by status): the row's name and total on
 * the left, the parts in order with a 2px gap, a value on each part wide enough to hold it, and
 * the parts' names in the legend. The bars share one scale. 
 * connectinq-ui.
 */
import { computed } from 'vue'

export interface StackRow { name: string; total: number; parts: Record<string, number> }

const props = defineProps<{ rows: StackRow[]; keys: string[]; colors: Record<string, string>; labels: Record<string, string> }>()
const max = computed(() => Math.max(1, ...props.rows.map((r) => r.total)))
</script>

<template>
  <div class="sr">
    <div v-for="r in rows" :key="r.name" class="row">
      <span class="name" :title="r.name">{{ r.name }}</span>
      <span class="bar" :style="{ width: `${(r.total / max) * 100}%` }">
        <span v-for="k in keys.filter((x) => (r.parts[x] ?? 0) > 0)" :key="k" class="part" :style="{ flexGrow: r.parts[k], background: colors[k] }"
              :title="`${labels[k]}: ${r.parts[k]}`">
          <span v-if="((r.parts[k] ?? 0) / max) > 0.06" class="v mono">{{ r.parts[k] }}</span>
        </span>
      </span>
      <b class="mono total">{{ r.total }}</b>
    </div>
    <div class="legend">
      <span v-for="k in keys" :key="k" class="li"><span class="sw" :style="{ background: colors[k] }" />{{ labels[k] }}</span>
    </div>
  </div>
</template>

<style scoped>
.row { display: grid; grid-template-columns: minmax(80px, 140px) 1fr 48px; align-items: center; gap: 10px; min-height: 30px; font-size: 12.5px; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar { display: flex; gap: 2px; height: 18px; min-width: 2px; grid-column: 2; }
.row { position: relative; }
.part { display: flex; align-items: center; justify-content: center; min-width: 2px; }
.part:last-child { border-radius: 0 4px 4px 0; }
.v { font-size: 10.5px; color: #fff; text-shadow: 0 0 2px rgb(0 0 0 / .5); }
.total { text-align: right; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font-size: 12px; }
.li { display: inline-flex; align-items: center; gap: 6px; }
.sw { width: 10px; height: 10px; }
</style>
