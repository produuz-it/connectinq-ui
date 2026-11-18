/**
 * What a tutorial remembers (src/tour/memory.ts): the offer's answer and each tour's outcome, in
 * localStorage under the front's key, and nothing else.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readMemory, writeMemory } from '../src/tour/memory'

const KEY = 'example.tours'

afterEach(() => localStorage.clear())

describe('reading', () => {
  it('starts empty when nothing is stored', () => {
    expect(readMemory(KEY)).toEqual({ v: 1, tours: {} })
  })

  it('reads what was written, under its own key only', () => {
    writeMemory(KEY, { v: 1, offer: 'declined', tours: { first: 'done', read: 'skipped' } })
    expect(readMemory(KEY)).toEqual({ v: 1, offer: 'declined', tours: { first: 'done', read: 'skipped' } })
    expect(readMemory('other.tours')).toEqual({ v: 1, tours: {} })
  })

  it('starts empty on something that is not its own: not JSON, another version, not an object', () => {
    for (const stored of ['{not json', JSON.stringify({ v: 2, tours: { first: 'done' } }), '"done"', 'null']) {
      localStorage.setItem(KEY, stored)
      expect(readMemory(KEY)).toEqual({ v: 1, tours: {} })
    }
  })

  it('starts empty when the browser refuses storage, and writing does not throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
    expect(readMemory(KEY)).toEqual({ v: 1, tours: {} })
    expect(() => writeMemory(KEY, { v: 1, tours: { first: 'done' } })).not.toThrow()
  })
})
