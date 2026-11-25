<script setup lang="ts">
/**
 * Stacked columns over time (one per bucket), drawn in SVG: thin bars, a 2px surface gap between
 * segments, the top segment rounded, one y axis with three recessive grid lines. Hovering a
 * column shows every series' value in it. A legend below for two series or more.
 * Presentation only.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface Series { name: string; color: string; data: (number | null)[] }

const props = withDefaults(defineProps<{ labels: string[]; series: Series[]; height?: number; unit?: string; format?: (n: number) => string }>(), {
  height: 220, unit: '', format: undefined,
})

const box = ref<HTMLElement | null>(null)
const W = ref(640)
let observer: ResizeObserver | null = null
onMounted(() => {
  observer = new ResizeObserver((entries) => { const entry = entries[0]; if (entry) W.value = Math.max(240, Math.round(entry.contentRect.width)) })
  if (box.value) observer.observe(box.value)
})
onBeforeUnmount(() => observer?.disconnect())
const PAD = { top: 10, right: 8, bottom: 26, left: 40 }
const fmt = (n: number) => (props.format ? props.format(n) : Math.round(n * 10) / 10).toString()

const totals = computed(() => props.labels.map((_, i) => props.series.reduce((s, x) => s + (Number(x.data[i]) || 0), 0)))
const max = computed(() => {
  const top = Math.max(1, ...totals.value)
  const step = 10 ** Math.floor(Math.log10(top))
  return Math.ceil(top / step) * step
})
const plotW = computed(() => W.value - PAD.left - PAD.right)
const plotH = computed(() => props.height - PAD.top - PAD.bottom)
const slot = computed(() => plotW.value / Math.max(1, props.labels.length))
const barW = computed(() => Math.max(4, Math.min(28, slot.value * 0.6)))
const y = (v: number) => PAD.top + plotH.value - (v / max.value) * plotH.value

interface Seg { x: number; y: number; h: number; color: string; top: boolean }
const columns = computed(() => props.labels.map((label, i) => {
  let acc = 0
  const segs: Seg[] = []
  const present = props.series.filter((s) => (Number(s.data[i]) || 0) > 0)
  present.forEach((s, k) => {
    const v = Number(s.data[i]) || 0
    const y0 = y(acc)
    acc += v
    const y1 = y(acc)
    segs.push({ x: PAD.left + slot.value * i + (slot.value - barW.value) / 2, y: y1, h: Math.max(0, y0 - y1 - (k < present.length - 1 ? 2 : 0)), color: s.color, top: k === present.length - 1 })
  })
  return { label, segs, total: acc, x: PAD.left + slot.value * i }
}))
const ticks = computed(() => [0, 0.5, 1].map((f) => ({ v: max.value * f, y: y(max.value * f) })))
const every = computed(() => Math.ceil(props.labels.length / Math.max(2, Math.floor(plotW.value / 70))))

/** A rect with its top corners rounded (4px), the data end. */
function topRounded(s: Seg): string {
  const r = Math.min(4, barW.value / 2, s.h)
  const { x, y: t, h } = s
  const w = barW.value
  return `M${x},${t + h} V${t + r} Q${x},${t} ${x + r},${t} H${x + w - r} Q${x + w},${t} ${x + w},${t + r} V${t + h} Z`
}

const hover = ref<number | null>(null)
const tip = computed(() => {
  if (hover.value === null) return null
  const i = hover.value
  return {
    label: props.labels[i] ?? '', total: totals.value[i] ?? 0, left: ((PAD.left + slot.value * (i + 0.5)) / W.value) * 100,
    rows: props.series.map((s) => ({ name: s.name, color: s.color, value: Number(s.data[i]) || 0 })).filter((r) => r.value > 0).reverse(),
  }
})
</script>

<template>
  <div ref="box" class="bc">
    <svg :width="W" :height="height" :viewBox="`0 0 ${W} ${height}`" role="img" @mouseleave="hover = null">
      <g class="grid">
        <template v-for="t in ticks" :key="t.v">
          <line :x1="PAD.left" :x2="W - PAD.right" :y1="t.y" :y2="t.y" />
          <text :x="PAD.left - 6" :y="t.y + 3" text-anchor="end">{{ fmt(t.v) }}</text>
        </template>
      </g>
      <g v-for="(c, i) in columns" :key="i">
        <rect :x="c.x" :y="PAD.top" :width="slot" :height="plotH" class="hit" :class="{ on: hover === i }" @mouseenter="hover = i" />
        <template v-for="(s, k) in c.segs" :key="k">
          <path v-if="s.top" :d="topRounded(s)" :fill="s.color" pointer-events="none" />
          <rect v-else :x="s.x" :y="s.y" :width="barW" :height="s.h" :fill="s.color" pointer-events="none" />
        </template>
        <text v-if="i % every === 0" :x="c.x + slot / 2" :y="height - 8" text-anchor="middle" class="xl">{{ c.label }}</text>
      </g>
    </svg>
    <div v-if="tip" class="tip" :style="{ left: `${tip.left}%` }">
      <b class="mono">{{ tip.label }}</b>
      <div v-for="r in tip.rows" :key="r.name" class="tr"><span class="sw" :style="{ background: r.color }" />{{ r.name }}<span class="grow" /><span class="mono">{{ fmt(r.value) }}{{ unit }}</span></div>
      <div v-if="series.length > 1" class="tr total"><span>Σ</span><span class="grow" /><span class="mono">{{ fmt(tip.total) }}{{ unit }}</span></div>
    </div>
    <div v-if="series.length > 1" class="legend">
      <span v-for="s in series" :key="s.name" class="li"><span class="sw" :style="{ background: s.color }" />{{ s.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.bc { position: relative; }
svg { width: 100%; display: block; overflow: visible; }
.grid line { stroke: var(--cq-n100); stroke-width: 1; vector-effect: non-scaling-stroke; }
.grid text, .xl { fill: var(--cq-n500); font-family: var(--cq-mono); font-size: 10px; }
.hit { fill: transparent; }
.hit.on { fill: var(--cq-n50); }
.tip {
  position: absolute; top: 0; transform: translateX(-50%); min-width: 160px; padding: 8px 10px; pointer-events: none; z-index: 5;
  background: var(--cq-white); border: 1px solid var(--cq-n200, var(--cq-n100)); box-shadow: 0 2px 10px rgb(0 0 0 / .12); font-size: 12px;
}
.tr { display: flex; align-items: center; gap: 6px; }
.tr.total { border-top: 1px solid var(--cq-n100); margin-top: 4px; padding-top: 4px; }
.sw { width: 10px; height: 10px; flex: none; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px; font-size: 12px; }
.li { display: inline-flex; align-items: center; gap: 6px; }
</style>
