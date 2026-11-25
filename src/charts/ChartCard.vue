<script setup lang="ts">
/**
 * A dashboard card: its title, the figure it leads with, the chart, and a *Table* switch that
 * shows the same numbers as a table (the chart is never the only way to read them).
 * Presentation only.
 */
import { ref } from 'vue'

defineProps<{ title: string; figure?: string; caption?: string; loading?: boolean; empty?: string; tableLabel?: string; chartLabel?: string; hasTable?: boolean }>()
const table = ref(false)
</script>

<template>
  <section class="card cc">
    <div class="card-head">
      <h3>{{ title }}</h3>
      <span class="grow" />
      <button v-if="hasTable" type="button" class="btn text small" @click="table = !table">{{ table ? chartLabel : tableLabel }}</button>
    </div>
    <div class="card-body">
      <div v-if="figure" class="fig"><b class="mono">{{ figure }}</b><span v-if="caption" class="hint">{{ caption }}</span></div>
      <p v-if="loading" class="hint">…</p>
      <p v-else-if="empty" class="hint">{{ empty }}</p>
      <slot v-else-if="table && hasTable" name="table" />
      <slot v-else />
    </div>
  </section>
</template>

<style scoped>
.cc { min-width: 0; }
.fig { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
.fig b { font-size: 26px; }
.small { height: 26px; font-size: 12px; }
</style>
