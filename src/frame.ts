/**
 * The frame's data: what the menu lists, how the brand reads, and the texts. The front builds
 * these from its own routes and rules; the frame components only draw them.
 */
import { inject, ref, type Component, type InjectionKey, type Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

/** A screen inside a section of the menu. */
export interface FrameEntry {
  key: string
  label: string
  to: RouteLocationRaw
  /** The screen that is open. */
  current?: boolean
  /** A count after the label; `countTone: 'bad'` draws it on vermilion. */
  count?: number | string
  countTone?: 'bad'
  /** Made for the desk: greyed in the phone's drawer, with a monitor mark. */
  deskOnly?: boolean
}

/**
 * A section of the menu. With one entry (or none, and a `to`) it is a link; with more it is a
 * group that opens and closes, open while one of its screens is.
 */
export interface FrameSection {
  key: string
  label: string
  icon: Component
  /** Where the section's own link goes; without it, its first entry. */
  to?: RouteLocationRaw
  /** One of the section's screens is open. */
  here?: boolean
  /** The section's own screen is open (a section that is a single link). */
  current?: boolean
  count?: number | string
  countTone?: 'bad'
  entries?: FrameEntry[]
}

export interface FrameBrand {
  /** The mark, an image URL. */
  mark: string
  /** The application's name; drawn in tracked caps with an accent dot. */
  name: string
  to: RouteLocationRaw
  /** The mark's tooltip; the name by default. */
  title?: string
}

export interface MenuLabels {
  /** The menu's name for a screen reader. */
  menu: string
  close: string
  fold: string
  unfold: string
  /** What the monitor mark of a desk-only entry says to a screen reader. */
  deskOnly?: string
}

/** A tab of the strip above the screen (on a phone, and on the desk with the menu folded). */
export interface FrameTab {
  key: string
  label: string
  to: RouteLocationRaw
  current?: boolean
  count?: number | string
}

/** Whether the desk menu is folded to its rail, kept in this browser under `key`. */
export function useFolded(key: string): { folded: Ref<boolean>; setFolded: (value: boolean) => void } {
  let initial = false
  try {
    initial = localStorage.getItem(key) === '1'
  } catch { /* no storage: unfolded */ }
  const folded = ref(initial)
  function setFolded(value: boolean) {
    folded.value = value
    try {
      if (value) localStorage.setItem(key, '1')
      else localStorage.removeItem(key)
    } catch { /* kept for this page only */ }
  }
  return { folded, setFolded }
}

/** What AppLayout gives the screens: a screen that draws its own phone bar opens the menu with it. */
export interface FrameControls {
  openMenu: () => void
  /** The element the screen scrolls in (the frame scrolls the screen, not the window). */
  scroller: Ref<HTMLElement | null>
}

export const FRAME_KEY: InjectionKey<FrameControls> = Symbol('cq-frame')

/** The frame's controls, or a no-op outside AppLayout. */
export function useFrame(): FrameControls {
  return inject(FRAME_KEY, { openMenu: () => {}, scroller: ref<HTMLElement | null>(null) })
}
