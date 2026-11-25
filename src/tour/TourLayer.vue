<script setup lang="ts" generic="S extends TourStep">
/**
 * A guided tutorial on the screen: the page dimmed, the step's element lit, and the card beside
 * it. The element is found by its `data-tour` attribute and followed on every frame, so
 * scrolling, a drawer or a layout change moves the light with it. Without its element, the card
 * goes to the middle with the step's drawing (the `art` slot).
 *
 * Teleported to the body, or into the open <dialog> while one is open: a modal dialog sits in the
 * top layer and makes the rest of the page inert, and a step can point into a dialog.
 * Keyboard: → or Enter go on (on a *try it* step they click the lit element), ← goes back, Esc
 * leaves; Tab stays in the card.
 *
 * The words are the front's: `describe(step)` gives the step's title and text (and the phone
 * text, and the text for when the element is not on its page), `tourTitle(id)` a tour's name.
 */
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { LucideArrowRight, LucideExternalLink, LucideGraduationCap, LucideMousePointerClick, LucidePointer, LucideRoute } from '@lucide/vue'
import { useIsPhone } from '../display'
import type { TourEngine, TourStep } from './engine'
import { blockersAround, lightAround, placeCard as cardPlace, type Box } from './geometry'

export interface StepWords { title: string; text: string; phone?: string; missing?: string }
export interface TourLabels {
  count: (n: number, total: number) => string
  skip: string
  back: string
  next: string
  done: string
  tryIt: string
  tryItPhone: string
  noTarget: string
  /** Needed only with `helpHref`. */
  readMore?: string
  nextTour: (title: string) => string
  allTutorials: string
}

const props = defineProps<{
  engine: TourEngine<S>
  describe: (step: S) => StepWords
  tourTitle: (id: string) => string
  /** A *Read more* link for a step, or '' for none. */
  helpHref?: (step: S) => string
  labels: TourLabels
}>()
defineSlots<{ art?: (props: { step: S }) => unknown }>()

/** How long a step waits for its element while its page loads. */
const WAIT_MS = 2000

const phone = useIsPhone()
const card = ref<HTMLElement | null>(null)
const light = ref<Box | null>(null)
const centred = ref(false)
const place = ref({ top: 0, left: 0, width: 320, shown: false })
const view = ref({ width: 0, height: 0 })
/** Where the layer is drawn: the body, or the open dialog (kept a plain element for Teleport). */
const host = shallowRef<HTMLElement | 'body'>('body')

/** The dialog opened last: the one on top of the top layer. */
function openDialog(): HTMLElement | null {
  const open = document.querySelectorAll<HTMLDialogElement>('dialog[open]')
  return open.length ? open[open.length - 1] ?? null : null
}

let element: HTMLElement | null = null
let since = 0
let revealed = false
let tryWasThere = false
let frame = 0

const state = props.engine.state
const step = props.engine.current
const active = computed(() => !!step.value)
const last = computed(() => state.index === state.steps.length - 1)
const trying = computed(() => !!step.value?.tryIt && !centred.value)
const words = computed(() => (step.value ? props.describe(step.value) : null))
/** The words for a missing element are about its page ("nothing blocks this job"): used only there. */
const missing = computed(() => centred.value && !!step.value && props.engine.onItsPage(step.value) && !!words.value?.missing)
const text = computed(() => {
  const w = words.value
  if (!w) return ''
  if (missing.value && w.missing) return w.missing
  if (phone.value && w.phone) return w.phone
  return w.text
})
const noTarget = computed(() => centred.value && !missing.value)
const help = computed(() => (step.value && props.helpHref ? props.helpHref(step.value) : ''))

/** The first visible element with this `data-tour` name, outside the tour itself. */
function find(name: string): HTMLElement | null {
  for (const node of document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)) {
    if (node.closest('.cq-tour')) continue
    const box = node.getBoundingClientRect()
    if (box.width > 0 && box.height > 0) return node
  }
  return null
}

/** Write a box only when it moved: the layer is checked on every frame, but redrawn only on a change. */
function same<T extends object>(a: T | null, b: T | null) {
  return !!a && !!b && (Object.keys(b) as (keyof T)[]).every((key) => a[key] === b[key])
}

function placeCard() {
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  if (view.value.width !== vw || view.value.height !== vh) view.value = { width: vw, height: vh }
  const height = card.value?.offsetHeight ?? 0
  const next = { ...cardPlace(centred.value ? null : light.value, view.value, height, phone.value), shown: height > 0 }
  if (!same(place.value, next)) place.value = next
}

function tick() {
  frame = requestAnimationFrame(tick)
  const top = openDialog() ?? 'body'
  if (top !== host.value) host.value = top
  const now = step.value
  if (!now || state.moving) return
  const name = phone.value && now.phoneTarget ? now.phoneTarget : now.target
  if (!element || !element.isConnected || element.dataset.tour !== name) element = props.engine.onItsPage(now) ? find(name) : null
  const box = element?.getBoundingClientRect()
  if (element && box && box.width > 0 && box.height > 0) {
    if (!revealed) {
      revealed = true
      // Not inside a drawer, sheet or dialog: those slide in on their own and never scroll the page.
      const outside = box.top < 0 || box.bottom > window.innerHeight
      if (outside && !element.closest('dialog, .side-panel, .pop-panel')) element.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    const lit = lightAround(box, document.documentElement.clientWidth)
    if (!same(light.value, lit)) light.value = lit
    centred.value = false
  } else {
    element = null
    if (light.value) light.value = null
    if (!props.engine.onItsPage(now) || performance.now() - since > WAIT_MS) centred.value = true
  }
  if (now.tryIt?.target) {
    const there = !!find(now.tryIt.target)
    if (there && !tryWasThere) {
      tryWasThere = true
      void props.engine.tried()
      return
    }
    tryWasThere = there
  }
  placeCard()
}

const blockers = computed(() => blockersAround(centred.value ? null : light.value, view.value, trying.value))

function px(box: Box) {
  return { top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px` }
}

function focusCard() {
  card.value?.focus({ preventScroll: true })
}

function forward() {
  if (trying.value) element?.click()
  else void props.engine.next()
}

function onKey(event: KeyboardEvent) {
  if (!active.value) return
  const stop = () => { event.preventDefault(); event.stopImmediatePropagation() }
  if (event.key === 'Escape') {
    stop()
    props.engine.leave()
    return
  }
  const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')
  if (typing && !card.value?.contains(event.target as Node)) return
  const focused = document.activeElement
  if (event.key === 'ArrowRight' || (event.key === 'Enter' && (focused === card.value || focused === document.body))) {
    stop()
    forward()
  } else if (event.key === 'ArrowLeft') {
    stop()
    void props.engine.back()
  } else if (event.key === 'Tab' && card.value) {
    const stops = [...card.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
    if (!stops.length) return
    const at = stops.indexOf(focused as HTMLElement)
    stop()
    const to = event.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : (at < 0 || at === stops.length - 1 ? 0 : at + 1)
    stops[to]?.focus()
  }
}

watch(() => state.shown, async () => {
  element = null
  light.value = null
  centred.value = false
  revealed = false
  since = performance.now()
  const target = step.value?.tryIt?.target
  tryWasThere = !!(target && find(target))
  await nextTick()
  focusCard()
})

/** Focus stays in the card; on a *try it* step it may also be on the lit element. */
function onFocus(event: FocusEvent) {
  const target = event.target as Node | null
  if (!active.value || !target || card.value?.contains(target) || (trying.value && element?.contains(target))) return
  // After the handlers that moved it there (a dialog moves it again on the next frame).
  requestAnimationFrame(() => { if (active.value) focusCard() })
}

function listen(on: boolean) {
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKey, true)
  document.removeEventListener('focusin', onFocus, true)
  if (!on) return
  frame = requestAnimationFrame(tick)
  window.addEventListener('keydown', onKey, true)
  document.addEventListener('focusin', onFocus, true)
}

watch(active, listen, { immediate: true })
onBeforeUnmount(() => listen(false))
</script>

<template>
  <Teleport :to="host">
    <div v-if="step" class="cq-tour">
      <div v-for="(box, index) in blockers" :key="index" class="tour-block" :class="{ clear: box.clear }" :style="px(box)" @click="focusCard" />
      <div v-if="light && !centred && !state.moving" class="tour-light" :style="px(light)" />
      <div v-show="!state.moving" ref="card" class="tour-card" role="dialog" aria-modal="true" aria-labelledby="cq-tour-title" tabindex="-1"
        :style="{ top: `${place.top}px`, left: `${place.left}px`, width: `${place.width}px`, visibility: place.shown ? 'visible' : 'hidden' }">
        <div class="tc-h"><span class="tc-n">{{ labels.count(state.index + 1, state.steps.length) }}</span> · {{ state.id ? tourTitle(state.id) : '' }}</div>
        <div v-if="centred && $slots.art" class="tc-art"><slot name="art" :step="step" /></div>
        <div id="cq-tour-title" class="tc-t">{{ words?.title }}</div>
        <div>{{ text }}</div>
        <div v-if="noTarget" class="tc-note">{{ labels.noTarget }}</div>
        <a v-if="help" :href="help" target="_blank" rel="noopener" class="tc-rm">{{ labels.readMore }}<LucideExternalLink :size="13" /></a>
        <template v-if="last && !trying">
          <button v-if="engine.following.value" type="button" class="tc-next" @click="engine.startNext()">
            <LucideRoute :size="18" /><span class="tc-grow">{{ labels.nextTour(tourTitle(engine.following.value)) }}</span><LucideArrowRight :size="18" />
          </button>
          <button v-else type="button" class="tc-next" @click="engine.toTutorials()">
            <LucideGraduationCap :size="18" /><span class="tc-grow">{{ labels.allTutorials }}</span><LucideArrowRight :size="18" />
          </button>
        </template>
        <div class="tc-f">
          <button v-if="!last || trying" type="button" class="tc-btn" @click="engine.leave()">{{ labels.skip }}</button>
          <span class="tc-grow" />
          <button v-if="state.index > 0" type="button" class="tc-btn" @click="engine.back()">{{ labels.back }}</button>
          <span v-if="trying" class="tc-try"><component :is="phone ? LucidePointer : LucideMousePointerClick" :size="18" />{{ phone ? labels.tryItPhone : labels.tryIt }}</span>
          <button v-else type="button" class="tc-btn primary" @click="engine.next()">{{ last ? labels.done : labels.next }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cq-tour { position: fixed; inset: 0; z-index: 95; pointer-events: none; font-family: var(--cq-font); color: var(--cq-ink); }
.tour-block { position: fixed; pointer-events: auto; background: var(--cq-tour-dim); }
.tour-block.clear { background: transparent; }
.tour-light { position: fixed; border: 2px solid var(--cq-accent); pointer-events: none; }
.tour-card {
  position: fixed; pointer-events: auto; background: var(--cq-white); border: 1px solid var(--cq-n200); padding: 12px 16px 10px; font-size: 13px; line-height: 1.5;
  color: var(--cq-n600); max-height: calc(100dvh - 32px); overflow: hidden auto; outline: none; box-shadow: var(--cq-float-shadow); text-align: left;
  text-transform: none; letter-spacing: normal; font-weight: 400;
}
.tc-h { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cq-n500); }
.tc-n { font-family: var(--cq-mono); color: var(--cq-ink); letter-spacing: 0; }
.tc-t { font-weight: 800; font-size: 14px; margin: 6px 0 2px; color: var(--cq-ink); }
.tc-art { display: flex; justify-content: center; background: var(--cq-art-bg); padding: 10px; margin: 6px 0 8px; }
.tc-note { font-size: 12px; color: var(--cq-n400); margin-top: 6px; }
.tc-rm {
  display: inline-flex; align-items: center; gap: 3px; margin-top: 4px; font-size: 12.5px; font-weight: 700; color: inherit;
  text-decoration: underline; text-decoration-color: var(--cq-accent); text-underline-offset: 3px;
}
.tc-rm:hover { color: var(--cq-accent-hover); }
.tc-next {
  display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 10px; padding: 8px 10px; border: 1px solid var(--cq-accent); background: var(--cq-selected);
  color: var(--cq-ink); font: inherit; font-weight: 700; font-size: 13px; text-align: left; cursor: pointer;
}
.tc-next:hover { background: var(--cq-n50); }
.tc-grow { flex: 1; min-width: 0; }
.tc-f { display: flex; align-items: center; gap: 4px; margin-top: 10px; }
/* Longer languages: the buttons keep to their text so three fit in 320 px. */
.tc-btn {
  display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 10px; border: 1px solid transparent; background: none;
  color: var(--cq-ink); font: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer;
}
.tc-btn:hover { background: var(--cq-n50); }
.tc-btn.primary { background: var(--cq-ink); border-color: var(--cq-ink); color: var(--cq-white); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.tc-btn.primary:hover { background: var(--cq-accent); border-color: var(--cq-accent); color: var(--cq-on-accent); }
.tc-try { display: inline-flex; align-items: center; gap: 6px; padding: 0 8px; color: var(--cq-accent-hover); font-weight: 700; font-size: 12.5px; line-height: 1.3; min-width: 0; }
@media (max-width: 599px) {
  .tc-btn { height: 44px; }
}
</style>
