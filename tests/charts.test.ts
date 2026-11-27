/**
 * The charts that hold a rule of their own: the heat grid's scale (one scale for the whole grid,
 * nothing for an empty cell) and the rate line, which breaks at a bucket with no value instead of
 * drawing it as a zero.
 */
import { createApp, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import HeatGrid, { heatLevel } from '../src/charts/HeatGrid.vue'
import RateLine from '../src/charts/RateLine.vue'

let host: HTMLElement | null = null
async function mount(component: unknown, props: Record<string, unknown>) {
  host = document.createElement('div')
  document.body.appendChild(host)
  createApp({ render: () => h(component as never, props) }).mount(host)
  await nextTick()
  return host
}
afterEach(() => { host?.remove(); host = null })

describe('heat grid', () => {
  it('puts a value on four steps against the largest one, nothing for none', () => {
    expect([0, 1, 10, 11, 30, 40, 50].map((v) => heatLevel(v, 40))).toEqual([0, 1, 1, 2, 3, 4, 4])
    expect(heatLevel(-3, 40)).toBe(0)
    expect(heatLevel(5, 0)).toBe(0)
    expect(heatLevel(5, 10, 2)).toBe(1)
  })
  it('draws one cell per bucket on one scale, the figure only when it can be read', async () => {
    const el = await mount(HeatGrid, { labels: ['Mon', 'Tue', 'Wed'], rows: [{ key: 'a', name: 'Framing', data: [0, 4, 8], total: 12 }, { key: 'b', name: 'Plating', data: [2], total: 2 }] })
    const cells = [...el.querySelectorAll('.cells:not(.axis) .cell')]
    expect(cells.map((c) => c.className.match(/l\d/)?.[0])).toEqual(['l0', 'l2', 'l4', 'l1', 'l0', 'l0'])
    expect(cells.map((c) => c.textContent)).toEqual(['', '4', '8', '2', '', ''])
    expect(cells[1]?.getAttribute('title')).toBe('Framing · Tue: 4')
  })
})

describe('rate line', () => {
  it('breaks the line at a bucket with no value, and still marks a lone point', async () => {
    const el = await mount(RateLine, { labels: ['W1', 'W2', 'W3', 'W4', 'W5'], data: [80, 90, null, 70, null], color: 'currentColor' })
    expect(el.querySelectorAll('polyline')).toHaveLength(2)
    expect(el.querySelectorAll('circle')).toHaveLength(3)
  })
})
