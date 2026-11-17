<script setup lang="ts">
/**
 * The menu on the left: the mark and the name, the front's head buttons (switcher, bell), the
 * company, the sections and their screens, and the account at the foot. A section with several
 * screens is a group that opens and closes; the group of the open screen opens by itself.
 * Folded (`rail`), it is a column of section icons, each opening the section's first screen.
 * In the phone's drawer (`drawer`) the rows are tall enough for a finger, a close button takes
 * the head buttons' place, and there is no fold button.
 *
 * Slots: `head` (buttons beside the name, given the side their panels open to), `company` (a row
 * under the head), `foot` (the account menu, under the `footSections` links).
 */
import { computed, ref, watch } from 'vue'
import { LucideChevronDown, LucideChevronsLeft, LucideChevronsRight, LucideMonitor, LucideX } from '@lucide/vue'
import type { FrameBrand, FrameSection, MenuLabels } from './frame'
import TestTag from './TestTag.vue'

const props = defineProps<{
  brand: FrameBrand
  sections: FrameSection[]
  /** Links at the foot, above the account (settings, for example): always single links. */
  footSections?: FrameSection[]
  labels: MenuLabels
  /** Shows the TEST tag under the name. */
  test?: boolean
  rail?: boolean
  drawer?: boolean
}>()
const emit = defineEmits<{ close: []; fold: [folded: boolean] }>()

const open = ref(new Set<string>())
const here = computed(() => props.sections.find((section) => section.here)?.key)
watch(here, (key) => { if (key) open.value = new Set([...open.value, key]) }, { immediate: true })

function toggle(key: string) {
  const next = new Set(open.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  open.value = next
}

const isGroup = (section: FrameSection) => (section.entries?.length ?? 0) > 1
const target = (section: FrameSection) => section.to ?? section.entries?.[0]?.to ?? '/'
const isCurrent = (section: FrameSection) => !!section.current || (!isGroup(section) && !!section.entries?.[0]?.current)
</script>

<template>
  <nav class="cq-menu" :class="{ rail, drawer }" :aria-label="labels.menu">
    <div class="head">
      <RouterLink :to="brand.to" class="brand" :title="brand.name">
        <img :src="brand.mark" alt="" />
        <span v-if="!rail" class="words">
          <span class="wordmark">{{ brand.name.toUpperCase() }}<span class="dot-mark">.</span></span>
          <TestTag :show="!!test" />
        </span>
      </RouterLink>
      <TestTag v-if="rail" :show="!!test" />
      <span v-if="!rail" class="grow" />
      <slot v-if="!drawer" name="head" :side="rail ? 'right' : 'below'" />
      <button v-else type="button" class="icon-btn plain" :title="labels.close" :aria-label="labels.close" @click="emit('close')">
        <LucideX :size="20" />
      </button>
    </div>

    <div v-if="$slots.company" class="company-row"><slot name="company" :rail="!!rail" :drawer="!!drawer" /></div>

    <div class="groups">
      <template v-for="section in sections" :key="section.key">
        <!-- Folded: one icon per section, which opens the section's first screen. -->
        <RouterLink v-if="rail" class="item" :class="{ here: section.here || isCurrent(section) }" :to="target(section)"
                    :title="section.label" :aria-label="section.label">
          <component :is="section.icon" :size="18" />
        </RouterLink>

        <!-- A section with one screen is a link. -->
        <RouterLink v-else-if="!isGroup(section)" class="item" :class="{ current: isCurrent(section), here: section.here }" :to="target(section)">
          <component :is="section.icon" :size="18" />
          <span class="label">{{ section.label }}</span>
          <span v-if="section.count !== undefined" class="count" :class="{ bad: section.countTone === 'bad' }">{{ section.count }}</span>
        </RouterLink>

        <template v-else>
          <button type="button" class="item" :class="{ here: section.here }" :aria-expanded="open.has(section.key)" @click="toggle(section.key)">
            <component :is="section.icon" :size="18" />
            <span class="label">{{ section.label }}</span>
            <span v-if="section.count !== undefined" class="count" :class="{ bad: section.countTone === 'bad' }">{{ section.count }}</span>
            <LucideChevronDown :size="14" class="chevron" :class="{ up: open.has(section.key) }" />
          </button>
          <template v-if="open.has(section.key)">
            <RouterLink v-for="entry in section.entries" :key="entry.key" class="entry"
                        :class="{ current: entry.current, desk: drawer && entry.deskOnly }" :to="entry.to" :title="entry.label">
              <span class="label">{{ entry.label }}</span>
              <span v-if="entry.count !== undefined" class="count" :class="{ bad: entry.countTone === 'bad' }">{{ entry.count }}</span>
              <LucideMonitor v-if="drawer && entry.deskOnly" :size="14" />
            </RouterLink>
          </template>
        </template>
      </template>
    </div>

    <div class="foot">
      <RouterLink v-for="section in footSections" :key="section.key" class="item" :class="{ current: isCurrent(section) || section.here }"
                  :to="target(section)" :title="rail ? section.label : undefined" :aria-label="rail ? section.label : undefined">
        <component :is="section.icon" :size="18" />
        <span v-if="!rail" class="label">{{ section.label }}</span>
      </RouterLink>
      <slot name="foot" :rail="!!rail" :drawer="!!drawer" />
      <button v-if="!drawer" type="button" class="fold" :title="rail ? labels.unfold : labels.fold"
              :aria-label="rail ? labels.unfold : labels.fold" @click="emit('fold', !rail)">
        <component :is="rail ? LucideChevronsRight : LucideChevronsLeft" :size="16" />
        <span v-if="!rail">{{ labels.fold }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.cq-menu {
  width: 232px; flex: none; height: 100%; display: flex; flex-direction: column; background: var(--cq-white);
  border-right: 1px solid var(--cq-n100); color: var(--cq-ink); font-size: 13px;
}
.cq-menu.rail { width: 56px; align-items: center; }
.cq-menu.drawer { width: min(300px, calc(100vw - 48px)); border-right: 0; }

.head { height: 52px; flex: none; display: flex; align-items: center; gap: 2px; padding: 0 8px 0 12px; }
.rail .head { height: auto; flex-direction: column; gap: 4px; padding: 14px 0 6px; }
.brand { display: flex; align-items: center; gap: 9px; text-decoration: none; color: inherit; min-width: 0; }
.brand img { height: 22px; display: block; }
/* On a test build the TEST tag sits under the wordmark. */
.words { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 0; }
.wordmark { font-weight: 800; font-size: 13px; letter-spacing: 0.08em; white-space: nowrap; }
.dot-mark { color: var(--cq-accent); }

.company-row { flex: none; padding: 0 8px 8px; border-bottom: 1px solid var(--cq-n100); }
.rail .company-row { padding: 0 0 6px; width: 100%; display: flex; justify-content: center; }

.groups { flex: 1; min-height: 0; overflow-y: auto; padding: 8px; scrollbar-width: thin; }
.rail .groups { padding: 8px 0; display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; }

.item {
  display: flex; align-items: center; gap: 10px; width: 100%; height: 32px; padding: 0 8px; border: 0; background: none;
  font: inherit; font-size: 13px; font-weight: 600; color: inherit; text-align: left; text-decoration: none; cursor: pointer;
}
.item:hover { background: var(--cq-n50); }
.item.here { font-weight: 800; }
.item.current { background: var(--cq-selected); font-weight: 800; box-shadow: inset 3px 0 0 var(--cq-accent); }
.item .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item .chevron { flex: none; color: var(--cq-n400); transition: transform 0.12s; }
.item .chevron.up { transform: rotate(180deg); }
.rail .item { width: 40px; height: 36px; padding: 0; justify-content: center; }
.rail .item.here, .rail .item.current { background: var(--cq-selected); color: var(--cq-accent-hover); box-shadow: none; }

.entry {
  display: flex; align-items: center; gap: 8px; height: 28px; padding: 0 8px 0 36px; font-size: 12.5px;
  color: inherit; text-decoration: none;
}
.entry:hover { background: var(--cq-n50); }
.entry.current { background: var(--cq-selected); font-weight: 700; box-shadow: inset 3px 0 0 var(--cq-accent); }
.entry .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entry.desk { color: var(--cq-n400); }
.count.bad { background: var(--cq-accent-hover); color: var(--cq-white); }

.foot { flex: none; padding: 6px 8px 8px; border-top: 1px solid var(--cq-n100); display: flex; flex-direction: column; gap: 2px; }
.rail .foot { padding: 6px 0 8px; align-items: center; width: 100%; }
.fold {
  display: flex; align-items: center; gap: 10px; height: 28px; padding: 0 9px; border: 0; background: none; cursor: pointer;
  font: inherit; font-size: 11.5px; color: var(--cq-n500); text-align: left;
}
.fold:hover { color: var(--cq-ink); background: var(--cq-n50); }
.rail .fold { width: 40px; padding: 0; justify-content: center; }

/* The drawer on a phone: rows a finger can hit. */
.drawer .item { height: 46px; font-size: 14px; }
.drawer .entry { height: 44px; font-size: 13.5px; padding-left: 38px; }
</style>
