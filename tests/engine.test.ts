/**
 * The tutorial engine (src/tour/engine.ts) with a made-up front: two pages, a router in memory,
 * a tour that asks for a record first. No screen is mounted.
 */
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter, type RouteLocationNormalized } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import { createTourEngine, type TourStep } from '../src/tour/engine'

const KEY = 'example.tours'
const page = { render: () => null }

async function setup(path = '/list') {
  localStorage.removeItem(KEY)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/list', name: 'list', component: page },
      { path: '/item/:id', name: 'item', component: page },
      { path: '/settings', name: 'settings', component: page },
      { path: '/tutorials', name: 'tutorials', component: page },
    ],
  })
  await router.push(path)
  let record = ''
  const pick: TourStep = { id: 'pick', page: 'list', target: 'row', tryIt: { route: ['item'] }, drop: true }
  const tours: Record<string, TourStep[]> = {
    first: [
      { id: 'a', page: 'list', target: 'upload' },
      { id: 'b', page: 'list', target: 'row' },
    ],
    item: [
      { id: 'c', page: 'item', target: 'summary' },
      { id: 'd', page: 'item', target: 'button' },
    ],
    admin: [{ id: 'e', page: 'settings', target: 'form' }],
  }
  const engine = createTourEngine({
    router,
    storageKey: KEY,
    tours: { first: { next: 'item' }, item: { next: 'admin' }, admin: {} },
    first: 'first',
    tutorials: { name: 'tutorials' },
    steps: (id) => {
      const steps = tours[id] ?? []
      if (id === 'item' && !record) return [pick, ...steps]
      return steps
    },
    pageOf: (route: RouteLocationNormalized) => (['list', 'item', 'settings'].includes(String(route.name)) ? String(route.name) : null),
    go: async (step, { onPage }) => {
      if (onPage) return
      if (step.page === 'item') { if (record) await router.push({ name: 'item', params: { id: record } }) } else await router.push({ name: step.page })
    },
    arrived: (to) => { record = String(to.params.id ?? '') },
    allowed: (id) => id !== 'admin',
  })
  const ids = () => engine.state.steps.map((step) => step.id)
  const stored = async () => { await nextTick(); return JSON.parse(localStorage.getItem(KEY) ?? 'null') }
  return { engine, router, ids, stored }
}

afterEach(() => localStorage.clear())

describe('a tour', () => {
  it('starts on its first step and goes to its page', async () => {
    const { engine, router, ids } = await setup('/settings')
    await engine.start('first')
    expect(ids()).toEqual(['a', 'b'])
    expect(engine.current.value?.id).toBe('a')
    expect(router.currentRoute.value.name).toBe('list')
  })

  it('goes on and back, and remembers it done at the end', async () => {
    const { engine, stored } = await setup()
    await engine.start('first')
    await engine.next()
    expect(engine.current.value?.id).toBe('b')
    await engine.back()
    expect(engine.current.value?.id).toBe('a')
    await engine.next()
    await engine.next()
    expect(engine.state.id).toBeNull()
    expect((await stored()).tours).toEqual({ first: 'done' })
  })

  it('remembers a skip, but never over a tour done before', async () => {
    const { engine, stored } = await setup()
    await engine.start('first')
    engine.leave()
    expect((await stored()).tours.first).toBe('skipped')
    await engine.start('first')
    await engine.next()
    await engine.next()
    await engine.start('first')
    engine.leave()
    expect((await stored()).tours.first).toBe('done')
  })

  it('ends as skipped when the person opens a page the step is not on', async () => {
    const { engine, router, stored } = await setup()
    await engine.start('first')
    await router.push({ name: 'settings' })
    expect(engine.state.id).toBeNull()
    expect((await stored()).tours.first).toBe('skipped')
  })
})

describe('a step that asks for something first', () => {
  it('goes on once the person opens a record, and leaves the count', async () => {
    const { engine, router, ids } = await setup()
    await engine.start('item')
    expect(ids()).toEqual(['pick', 'c', 'd'])
    await router.push({ name: 'item', params: { id: '42' } })
    await nextTick()
    expect(ids()).toEqual(['c', 'd'])
    expect(engine.current.value?.id).toBe('c')
    expect(router.currentRoute.value.params.id).toBe('42')
  })
})

describe('the next tour and the offer', () => {
  it('offers the next tour only when the person may take it', async () => {
    const { engine } = await setup()
    await engine.start('first')
    expect(engine.following.value).toBe('item')
    await engine.startNext()
    expect(engine.state.id).toBe('item')
    expect(engine.following.value).toBeNull()
  })

  it('takes the offer into the first tour, and a refusal is remembered', async () => {
    const taken = await setup()
    await taken.engine.answerOffer(true)
    expect(taken.engine.state.id).toBe('first')
    expect((await taken.stored()).offer).toBe('taken')
    const refused = await setup()
    await refused.engine.answerOffer(false)
    expect(refused.engine.state.id).toBeNull()
    expect((await refused.stored()).offer).toBe('declined')
  })

  it('ends on the tutorials page', async () => {
    const { engine, router } = await setup()
    await engine.start('first')
    await engine.toTutorials()
    expect(router.currentRoute.value.name).toBe('tutorials')
    expect(engine.state.id).toBeNull()
  })
})
