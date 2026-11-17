<script setup lang="ts">
/**
 * The frame: the menu on the left and the open screen beside it, with no header. Below 600 px the
 * menu is a drawer behind a top bar (the title, the TEST tag, the front's bar buttons). With the
 * menu folded, and on a phone, the tabs of the open section sit in a strip above the screen.
 *
 * The front draws its menu in the `menu` slot (an instance of SideMenu), which the frame places
 * on the desk or in the drawer and tells which: `{ rail, drawer, close }`. A screen that draws its
 * own phone bar (`phoneBar: false`) opens the drawer with `useFrame().openMenu`. The screen
 * scrolls inside the frame, not the window: `useFrame().scroller` is that element.
 * Slots: `menu`, `bar` (buttons at the end of the phone bar), the screen (default), `after`
 * (layers outside the frame, such as a guided tour).
 */
import { onBeforeUnmount, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { LucideMenu } from '@lucide/vue'
import { useIsPhone } from './display'
import { FRAME_KEY, type FrameTab } from './frame'
import TestTag from './TestTag.vue'

const props = withDefaults(defineProps<{
  /** The phone bar's title: the open section or the application. */
  title: string
  test?: boolean
  /** The desk menu is folded to its rail. */
  folded?: boolean
  tabs?: FrameTab[]
  /** The strip's caption on the desk, before the tabs. */
  tabsTitle?: string
  /** False when every screen draws its own phone bar. */
  phoneBar?: boolean
  labels: { openMenu: string }
}>(), { test: false, folded: false, tabs: () => [], tabsTitle: '', phoneBar: true })

const route = useRoute()
const phone = useIsPhone()
const drawer = ref(false)
const scroller = ref<HTMLElement | null>(null)

function openMenu() {
  drawer.value = true
}
function closeMenu() {
  drawer.value = false
}
provide(FRAME_KEY, { openMenu, scroller })

// The drawer closes when a screen opens, on Escape, and never stays open on the desk.
watch(() => route.fullPath, closeMenu)
watch(phone, (isPhone) => { if (!isPhone) closeMenu() })
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}
watch(drawer, (open) => {
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const showTabs = () => (phone.value || props.folded) && props.tabs.length > 0
</script>

<template>
  <div class="cq-frame" :class="{ phone }">
    <slot v-if="!phone" name="menu" :rail="folded" :drawer="false" :close="closeMenu" />

    <header v-else-if="phoneBar" class="bar">
      <button type="button" class="cq-menu-btn" :title="labels.openMenu" :aria-label="labels.openMenu" :aria-expanded="drawer" @click="openMenu">
        <LucideMenu :size="20" />
      </button>
      <span class="title">{{ title }}</span>
      <TestTag :show="test" />
      <slot name="bar" />
    </header>

    <div class="work">
      <nav v-if="showTabs()" class="tabs" :aria-label="tabsTitle || title">
        <b v-if="!phone && tabsTitle" class="section">{{ tabsTitle }}</b>
        <RouterLink v-for="tab in tabs" :key="tab.key" class="tab" :class="{ on: tab.current }" :to="tab.to">
          {{ tab.label }}<span v-if="tab.count !== undefined" class="cq-count" :class="{ on: tab.current }">{{ tab.count }}</span>
        </RouterLink>
      </nav>
      <main ref="scroller" class="screen"><slot /></main>
    </div>

    <template v-if="phone && drawer">
      <div class="scrim" @click="closeMenu" />
      <div class="drawer">
        <slot name="menu" :rail="false" :drawer="true" :close="closeMenu" />
      </div>
    </template>
  </div>
  <slot name="after" />
</template>

<style scoped>
.cq-frame { height: 100vh; height: 100dvh; display: flex; background: var(--cq-white); color: var(--cq-ink); }
.cq-frame.phone { flex-direction: column; }
.work { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.screen { flex: 1; min-height: 0; overflow: auto; }

.bar { height: 52px; flex: none; display: flex; align-items: center; gap: 2px; padding: 0 6px 0 4px; border-bottom: 1px solid var(--cq-n100); }
.title { flex: 1; min-width: 0; font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tabs {
  flex: none; min-height: 44px; display: flex; align-items: center; gap: 6px; padding: 0 12px;
  background: var(--cq-n50); border-bottom: 1px solid var(--cq-n100); overflow-x: auto; scrollbar-width: none;
}
.section { font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; margin-right: 6px; }
.tab {
  flex: none; display: inline-flex; align-items: center; gap: 8px; padding: 5px 10px; font-size: 11.5px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; border: 1px solid var(--cq-n200);
  background: var(--cq-white); color: inherit; text-decoration: none;
}
.tab:hover { border-color: var(--cq-ink); }
.tab.on { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); }
.cq-count {
  min-width: 20px; height: 18px; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--cq-mono); font-size: 11px; font-weight: 500; background: var(--cq-n100); color: var(--cq-ink);
}
.tab .cq-count.on { background: var(--cq-white); color: var(--cq-ink); }
.cq-menu-btn {
  width: 44px; height: 44px; flex: none; display: flex; align-items: center; justify-content: center;
  border: 0; background: none; padding: 0; color: inherit; cursor: pointer;
}
.cq-menu-btn:hover { background: var(--cq-n50); color: var(--cq-accent-hover); }
.phone .tabs { min-height: 52px; }
.phone .tab { min-height: 36px; padding: 0 12px; }

.scrim { position: fixed; inset: 0; z-index: 40; background: var(--cq-scrim); }
.drawer { position: fixed; z-index: 41; top: 0; bottom: 0; left: 0; display: flex; box-shadow: var(--cq-float-shadow); }
</style>
