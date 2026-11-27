<script setup lang="ts">
/**
 * A rate over time, 0 to 100 %, as a line: a bucket with no value is a gap, not a zero, and the
 * 100 % target is a dashed line. Hovering a bucket says its value and, when the front gives one,
 * what it was counted from. Drawn like BarChart (same axis, same tooltip). Presentation only: the
 * front passes the labels, the values, the colour and the words.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ labels: string[]; data: (number | null)[]; color: string; height?: number; target?: string; detail?: (index: number) => string }>(), {
  height: 220, target: '', detail: undefined,
})

const box = ref<HTMLElement | null>(null)
const W = ref(640)
let observer: ResizeObserver | null = null
onMounted(() => {
  observer = new ResizeObserver((entries) => { const entry = entries[0]; if (entry) W.value = Math.max(240, Math.round(entry.contentRect.width)) })
  if (box.value) observer.observe(box.value)
})
onBeforeUnmount(() => observer?.disconnect())

const PAD = { top: 14, right: 8, bottom: 26, left: 40 }
const plotW = computed(() => W.value - PAD.left - PAD.right)
const plotH = computed(() => props.height - PAD.top - PAD.bottom)
const slot = computed(() => plotW.value / Math.max(1, props.labels.length))
const x = (i: number) => PAD.left + slot.value * (i + 0.5)
const y = (v: number) => PAD.top + plotH.value - (Math.max(0, Math.min(100, v)) / 100) * plotH.value
const has = (v: number | null | undefined): v is number => v !== null && v !== undefined && !Number.isNaN(Number(v))

/** The line in pieces: it breaks at every bucket with no value. */
const pieces = computed(() => {
  const out: string[] = []
  let run: string[] = []
  props.data.forEach((v, i) => {
    if (has(v)) run.push(`${x(i)},${y(v)}`)
    else { if (run.length) out.push(run.join(' ')); run = [] }
  })
  if (run.length) out.push(run.join(' '))
  return out
})
const points = computed(() => props.data.flatMap((v, i) => (has(v) ? [{ i, x: x(i), y: y(v) }] : [])))
const ticks = [0, 25, 50, 75, 100]
const every = computed(() => Math.ceil(props.labels.length / Math.max(2, Math.floor(plotW.value / 70))))
const hover = ref<number | null>(null)
</script>

<template>
  <div ref="box" class="rl">
    <svg :width="W" :height="height" :viewBox="`0 0 ${W} ${height}`" role="img" @mouseleave="hover = null">
      <g class="grid">
        <template v-for="t in ticks" :key="t">
          <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(t)" :y2="y(t)" :class="{ target: t === 100 }" />
          <text :x="PAD.left - 6" :y="y(t) + 3" text-anchor="end">{{ t }}</text>
        </template>
        <text v-if="target" :x="W - PAD.right" :y="y(100) - 4" text-anchor="end">{{ target }}</text>
      </g>
      <g v-for="(label, i) in labels" :key="i">
        <rect :x="PAD.left + slot * i" :y="PAD.top" :width="slot" :height="plotH" class="hit" :class="{ on: hover === i }" @mouseenter="hover = i" />
        <text v-if="i % every === 0" :x="x(i)" :y="height - 8" text-anchor="middle" class="xl">{{ label }}</text>
      </g>
      <polyline v-for="(piece, i) in pieces" :key="i" :points="piece" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" pointer-events="none" />
      <!-- A bucket alone between two gaps has no line to be seen by: every point gets a dot. -->
      <circle v-for="p in points" :key="p.i" :cx="p.x" :cy="p.y" :r="hover === p.i ? 5 : 2.5" :fill="color" pointer-events="none" />
    </svg>
    <div v-if="hover !== null" class="tip" :style="{ left: `${(x(hover) / W) * 100}%` }">
      <b class="mono">{{ labels[hover] }}</b>
      <div class="mono">{{ has(data[hover]) ? `${data[hover]} %` : '–' }}</div>
      <div v-if="detail" class="hint">{{ detail(hover) }}</div>
    </div>
  </div>
</template>

<style scoped>
.rl { position: relative; }
svg { width: 100%; display: block; overflow: visible; }
.grid line { stroke: var(--cq-n100); stroke-width: 1; vector-effect: non-scaling-stroke; }
.grid line.target { stroke: var(--cq-n400); stroke-dasharray: 4 4; }
.grid text, .xl { fill: var(--cq-n500); font-family: var(--cq-mono); font-size: 10px; }
.hit { fill: transparent; }
.hit.on { fill: var(--cq-n50); }
.tip {
  position: absolute; top: 0; transform: translateX(-50%); min-width: 120px; padding: 8px 10px; pointer-events: none; z-index: 5;
  background: var(--cq-white); border: 1px solid var(--cq-n200, var(--cq-n100)); box-shadow: var(--cq-float-shadow); font-size: 12px;
}
</style>
