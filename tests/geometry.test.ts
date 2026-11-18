/**
 * The geometry of a tutorial step (src/tour/geometry.ts): the light, what blocks the page, and
 * where the card goes on a desktop (1200 × 800) and on a phone (360 × 740).
 */
import { describe, expect, it } from 'vitest'
import { blockersAround, CARD_WIDTH, EDGE, GAP, lightAround, PAD, PHONE_TOP, placeCard, type Box } from '../src/tour/geometry'

const DESK = { width: 1200, height: 800 }
const PHONE = { width: 360, height: 740 }
const HEIGHT = 190

function overlaps(a: Box, b: Box) {
  return !(a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top)
}

function card(light: Box | null, view = DESK, phone = false): Box {
  return { ...placeCard(light, view, HEIGHT, phone), height: HEIGHT }
}

describe('the light', () => {
  it('leaves room around the element', () => {
    expect(lightAround({ top: 100, left: 200, width: 300, height: 40 }, 1200)).toEqual({ top: 96, left: 196, width: 308, height: 48 })
  })

  it('stays on the screen for an element as wide as it', () => {
    const light = lightAround({ top: 108, left: 0, width: 360, height: 64 }, 360)
    expect(light.left).toBe(0)
    expect(light.left + light.width).toBe(360)
    expect(light.height).toBe(64 + 2 * PAD)
  })
})

describe('what blocks the page', () => {
  const light = { top: 100, left: 200, width: 300, height: 48 }
  const area = (boxes: Box[]) => boxes.reduce((sum, box) => sum + box.width * box.height, 0)
  const covers = (boxes: Box[], x: number, y: number) => boxes.some((box) => x >= box.left && x < box.left + box.width && y >= box.top && y < box.top + box.height)

  it('is the whole page without a light', () => {
    expect(blockersAround(null, DESK, false)).toEqual([{ top: 0, left: 0, width: 1200, height: 800 }])
  })

  it('dims everything around the light and blocks the light too, clear', () => {
    const boxes = blockersAround(light, DESK, false)
    expect(area(boxes)).toBe(1200 * 800)
    expect(boxes.filter((box) => box.clear)).toEqual([{ ...light, clear: true }])
    expect(area(boxes.filter((box) => !box.clear))).toBe(1200 * 800 - 300 * 48)
  })

  it('lets the lit element be clicked on a try-it step, and nothing else', () => {
    const boxes = blockersAround(light, DESK, true)
    expect(covers(boxes, 350, 124)).toBe(false)
    for (const [x, y] of [[10, 10], [199, 124], [500, 124], [350, 99], [350, 148], [1199, 799]]) expect(covers(boxes, x!, y!)).toBe(true)
    expect(boxes.some((box) => box.clear)).toBe(false)
  })

  it('never has a box of negative size, at the edges of the screen', () => {
    const boxes = blockersAround({ top: -4, left: 0, width: 1200, height: 60 }, DESK, true)
    expect(boxes.every((box) => box.width >= 0 && box.height >= 0)).toBe(true)
  })
})

describe('the card on a desktop', () => {
  it('goes in the middle without a light', () => {
    expect(card(null)).toMatchObject({ top: (800 - HEIGHT) / 2, left: (1200 - CARD_WIDTH) / 2, width: CARD_WIDTH })
  })

  it('goes below a wide element, centred on it', () => {
    const light = { top: 100, left: 200, width: 700, height: 120 }
    const placed = card(light)
    expect(placed.top).toBe(100 + 120 + GAP)
    expect(placed.left).toBe(200 + 350 - CARD_WIDTH / 2)
    expect(overlaps(placed, light)).toBe(false)
  })

  it('goes above a wide element near the bottom', () => {
    const light = { top: 600, left: 200, width: 900, height: 120 }
    const placed = card(light)
    expect(placed.top).toBe(600 - GAP - HEIGHT)
    expect(overlaps(placed, light)).toBe(false)
  })

  it('goes to the right of a narrow element that has room there (a rail entry)', () => {
    const light = { top: 140, left: 6, width: 168, height: 40 }
    const placed = card(light)
    expect(placed.left).toBe(6 + 168 + GAP)
    expect(placed.top).toBe(140)
    expect(overlaps(placed, light)).toBe(false)
  })

  it('goes below a narrow element at the right edge (a button), kept on the screen', () => {
    const light = { top: 70, left: 1010, width: 170, height: 44 }
    const placed = card(light)
    expect(placed.top).toBe(70 + 44 + GAP)
    expect(placed.left + placed.width).toBeLessThanOrEqual(1200 - EDGE)
    expect(overlaps(placed, light)).toBe(false)
  })

  it('goes beside a tall element that leaves no room above or below (a drawer section)', () => {
    const light = { top: 60, left: 800, width: 390, height: 700 }
    const placed = card(light)
    expect(placed.left + placed.width).toBeLessThanOrEqual(800 - GAP)
    expect(overlaps(placed, light)).toBe(false)
  })
})

describe('the card on a phone', () => {
  it('spans the screen less the edges', () => {
    expect(card(null, PHONE, true).width).toBe(360 - 2 * EDGE)
    expect(card(null, PHONE, true).left).toBe((360 - (360 - 2 * EDGE)) / 2)
  })

  it('docks at the bottom for an element in the upper half (the pinned coverage bar)', () => {
    const light = { top: 52, left: 0, width: 360, height: 70 }
    const placed = card(light, PHONE, true)
    expect(placed).toMatchObject({ top: 740 - HEIGHT - EDGE, left: EDGE })
    expect(overlaps(placed, light)).toBe(false)
  })

  it('docks at the top, under the bar, for an element in the lower half (the sticky Generate)', () => {
    const light = { top: 686, left: 8, width: 344, height: 48 }
    const placed = card(light, PHONE, true)
    expect(placed.top).toBe(PHONE_TOP)
    expect(overlaps(placed, light)).toBe(false)
  })

  it('takes the other side when the usual one would cover the element (a tall card in the lower half)', () => {
    const light = { top: 220, left: 8, width: 344, height: 300 }
    const placed = card(light, PHONE, true)
    expect(placed.top).toBe(740 - HEIGHT - EDGE)
    expect(overlaps(placed, light)).toBe(false)
  })
})
