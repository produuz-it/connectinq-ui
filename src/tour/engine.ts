/**
 * A guided tutorial's engine: which tour runs, which step it is on, going to a step's page, and
 * what is remembered. TourLayer.vue draws the step and finds its element; TourOffer.vue asks on a
 * first visit; TourList.vue lists the tours.
 *
 * The engine knows nothing of a front's screens. The front says which steps a person gets
 * (`steps`), which of its pages a route is (`pageOf`), and how to bring the screen to a step
 * (`go`): it may need a record to show, a query, a panel closed. A tour moves only between pages
 * the person could open, and the engine sends nothing anywhere.
 */
import { computed, reactive, watch, type ComputedRef } from 'vue'
import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'
import { readMemory, writeMemory, type TourMemory, type TourOutcome } from './memory'

export interface TourStep {
  /** The step's own name inside its tour (its words are the front's). */
  id: string
  /** The page the step is on: a name of the front's choosing, as `pageOf` returns it. */
  page: string
  /** The `data-tour` name of the element the step lights. */
  target: string
  /** The element's name in the phone layout, when it is another one. */
  phoneTarget?: string
  /**
   * *Try it*: the lit element can be clicked, and the step goes on by itself once the person is
   * on one of `route` (page names), or once the element `target` appears.
   */
  tryIt?: { route?: readonly string[]; target?: string }
  /** A step that asks for something first (open a record): it leaves the count once done. */
  drop?: boolean
}

export interface TourDefinition {
  /** The tour offered when this one ends. */
  next?: string
}

export interface TourOptions<S extends TourStep> {
  router: Router
  /** The localStorage key of what is remembered. */
  storageKey: string
  tours: Record<string, TourDefinition>
  /** The tour the first-visit offer starts. */
  first: string
  /** Where *All tutorials* goes. */
  tutorials: RouteLocationRaw
  /** The steps of a tour this person gets now (role, layout, a step that asks for a record first); none refuses it. */
  steps: (id: string, phone: boolean) => S[]
  /** The tour page a route is, or null for any other route. */
  pageOf: (route: RouteLocationNormalized) => string | null
  /** Bring the screen to a step (push or replace the route). `onPage`: the step's page is already open. */
  go: (step: S, context: { onPage: boolean }) => Promise<unknown> | void
  /** A *try it* step that waited for a page was answered on `to` (say, remember the record opened). */
  arrived?: (to: RouteLocationNormalized) => void
  /** Whether a tour may be offered to this person as the next one (a role). */
  allowed?: (id: string) => boolean
  /** The media query of the phone layout. */
  phoneQuery?: string
}

export interface TourEngine<S extends TourStep = TourStep> {
  state: { id: string | null; steps: S[]; index: number; moving: boolean; shown: number }
  memory: TourMemory
  current: ComputedRef<S | null>
  /** The tour offered when this one ends, when this person may take it. */
  following: ComputedRef<string | null>
  onItsPage: (step: S) => boolean
  start: (id: string) => Promise<void>
  next: () => Promise<void>
  back: () => Promise<void>
  leave: () => void
  tried: () => Promise<void>
  startNext: () => Promise<void>
  toTutorials: () => Promise<void>
  answerOffer: (take: boolean) => Promise<void>
}

export function createTourEngine<S extends TourStep>(options: TourOptions<S>): TourEngine<S> {
  const { router } = options
  const phoneQuery = options.phoneQuery ?? '(max-width: 599.98px)'

  const state = reactive({
    id: null as string | null,
    steps: [] as S[],
    index: 0,
    /** Going to a step's page: the layer waits. */
    moving: false,
    /** Bumped when a step is shown, so the layer looks for its element again. */
    shown: 0,
  }) as TourEngine<S>['state']

  const memory = reactive(readMemory(options.storageKey)) as TourMemory
  watch(memory, (value) => writeMemory(options.storageKey, value), { deep: true })

  const current = computed<S | null>(() => (state.id ? (state.steps[state.index] as S | undefined) ?? null : null))
  const following = computed(() => {
    const id = state.id ? options.tours[state.id]?.next : undefined
    return id && (options.allowed?.(id) ?? true) ? id : null
  })

  let returnFocus: HTMLElement | null = null

  const pageNow = () => options.pageOf(router.currentRoute.value)
  const onItsPage = (step: S) => pageNow() === step.page

  async function go(index: number) {
    const step = state.steps[index] as S | undefined
    if (!step) return
    state.index = index
    state.moving = true
    try {
      await options.go(step, { onPage: onItsPage(step) })
    } finally {
      state.moving = false
    }
    state.shown += 1
  }

  /** End the tour: `done`, `skipped` (never over a tour done before), or `null` to remember nothing. */
  function finish(outcome: TourOutcome | null) {
    const id = state.id
    if (!id) return
    if (outcome === 'done' || (outcome === 'skipped' && memory.tours[id] !== 'done')) memory.tours[id] = outcome
    state.id = null
    state.steps = []
    state.index = 0
    const focus = returnFocus
    returnFocus = null
    if (focus?.isConnected) focus.focus({ preventScroll: true })
  }

  async function start(id: string) {
    const phone = typeof matchMedia === 'function' && matchMedia(phoneQuery).matches
    const steps = options.steps(id, phone)
    if (!steps.length) return
    if (state.id) finish(null)
    if (!returnFocus) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    state.id = id
    state.steps = steps
    await go(0)
  }

  async function next() {
    if (!state.id) return
    if (state.index >= state.steps.length - 1) finish('done')
    else await go(state.index + 1)
  }

  async function back() {
    if (state.id && state.index > 0) await go(state.index - 1)
  }

  /** *Skip* or Esc: leave at once. */
  function leave() {
    finish('skipped')
  }

  /** *Done* with the next tour offered. */
  async function startNext() {
    const id = following.value
    finish('done')
    if (id) await start(id)
  }

  async function toTutorials() {
    finish('done')
    await router.push(options.tutorials)
  }

  /** A *try it* step was done: go on; a step that asked for something leaves the count; the last one goes on with the next tour. */
  async function tried() {
    const step = current.value
    if (step?.drop) {
      state.steps = state.steps.filter((_, i) => i !== state.index)
      await go(state.index)
    } else if (state.index < state.steps.length - 1) await go(state.index + 1)
    else await startNext()
  }

  /** The first-visit offer, answered once. */
  async function answerOffer(take: boolean) {
    memory.offer = take ? 'taken' : 'declined'
    if (take) await start(options.first)
  }

  // A *try it* step that waits for a page goes on when the person gets there; any other page the
  // person opens while a step shows (the browser's back button, a link) ends the tour.
  router.afterEach((to) => {
    const step = current.value
    if (!step || state.moving) return
    const page = options.pageOf(to)
    if (page && step.tryIt?.route?.includes(page)) {
      options.arrived?.(to)
      void tried()
    } else if (page !== step.page) {
      finish('skipped')
    }
  })

  return { state, memory, current, following, onItsPage, start, next, back, leave, tried, startNext, toTutorials, answerOffer }
}
