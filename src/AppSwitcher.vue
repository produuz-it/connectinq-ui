<script setup lang="ts">
/**
 * The application switcher: the applications and tools an account may open, as plain links in
 * the same tab. Applications are rows; tools are a grid of cells under them. The entry without
 * a link is the front the user is in, marked with a check. Hidden when there is nowhere else
 * to go. The front builds the entries and the texts (switcher.ts).
 */
import { computed } from 'vue'
import { GLYPH_CHECK, GLYPH_CHECK_CIRCLE, GLYPH_GRID } from './glyphs'
import PopButton from './PopButton.vue'
import type { SwitcherEntry, SwitcherLabels } from './switcher'

const props = defineProps<{ entries: SwitcherEntry[]; labels: SwitcherLabels; side?: 'below' | 'right'; phone?: boolean }>()

const apps = computed(() => props.entries.filter((entry) => entry.kind === 'application'))
const tools = computed(() => props.entries.filter((entry) => entry.kind === 'tool'))
const shown = computed(() => props.entries.some((entry) => entry.href))
</script>

<template>
  <PopButton v-if="shown" class="icon" :class="{ touch: phone }" :label="labels.title" :side="side" :phone="phone" :width="340">
    <template #button>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path :d="GLYPH_GRID" fill="currentColor" /></svg>
    </template>
    <template v-if="apps.length">
      <div class="pop-head">{{ labels.title }}</div>
      <component :is="app.href ? 'a' : 'div'" v-for="app in apps" :key="app.key" class="pop-row app" :class="{ here: !app.href }" :href="app.href || undefined">
        <span class="tile" :class="{ logo: app.logo }" :style="app.logo ? undefined : { background: app.tile }">
          <img v-if="app.logo" :src="app.logo" alt="" />
          <svg v-else viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path :d="app.glyph" :fill="app.ink" /></svg>
        </span>
        <span class="text"><b>{{ app.name }}</b><small>{{ app.what }}</small></span>
        <svg v-if="!app.href" class="check" viewBox="0 0 24 24" width="20" height="20" role="img" :aria-label="labels.current"><path :d="GLYPH_CHECK" fill="currentColor" /></svg>
      </component>
    </template>
    <template v-if="tools.length">
      <div class="tools-head" :class="{ divided: apps.length }">{{ labels.tools }}</div>
      <div class="tools">
        <component :is="tool.href ? 'a' : 'div'" v-for="tool in tools" :key="tool.key" class="tool" :class="{ here: !tool.href }"
                   :href="tool.href || undefined" :title="tool.what" :aria-label="tool.what">
          <span class="tile small" :class="{ logo: tool.logo }" :style="tool.logo ? undefined : { background: tool.tile }">
            <img v-if="tool.logo" :src="tool.logo" alt="" />
            <svg v-else viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path :d="tool.glyph" :fill="tool.ink" /></svg>
          </span>
          <span class="name">{{ tool.name }}</span>
          <svg v-if="!tool.href" class="mark" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path :d="GLYPH_CHECK_CIRCLE" fill="currentColor" /></svg>
        </component>
      </div>
    </template>
    <div class="pop-foot">{{ labels.hint }}</div>
  </PopButton>
</template>

<style scoped>
.app { gap: 14px; min-height: 60px; padding-top: 10px; padding-bottom: 10px; }
.pop-panel--sheet .app { min-height: 64px; }
.app.here { cursor: default; }
.app.here:hover { background: none; }
.tile { width: 36px; height: 36px; flex: none; display: flex; align-items: center; justify-content: center; }
.tile.small { width: 28px; height: 28px; }
/* A mark draws on what is under it: the tinted current tool, a hovered row. */
.tile.logo { background: none; }
.tile.logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
.text { flex: 1; min-width: 0; line-height: 1.3; }
.text b { display: block; font-size: 14px; font-weight: 500; }
.text small { display: block; font-size: 12px; color: var(--cq-n500); }
.check { flex: none; color: var(--cq-accent-hover); }

.tools-head { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cq-n500); padding: 10px 16px 4px; }
.tools-head.divided { border-top: 1px solid var(--cq-n100); }
.tools { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 0 8px 6px; }
.tool {
  position: relative; height: 72px; min-width: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6px; color: inherit; text-decoration: none;
}
a.tool:hover { background: var(--cq-hover); }
.tool .name { max-width: 100%; padding: 0 4px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tool.here { background: var(--cq-current); cursor: default; }
.tool.here .name { color: var(--cq-accent-hover); }
.tool .mark { position: absolute; top: 4px; right: 8px; color: var(--cq-accent-hover); }
</style>
