/**
 * What a front's tutorial remembers: whether the first-visit offer was answered, and which tours
 * were done or skipped. Kept in this browser's localStorage under the front's own key, never a
 * token, a name or a record. Everything goes through these two functions, so moving it to a
 * server later is a change in this file only.
 */

export type TourOutcome = 'done' | 'skipped'

export interface TourMemory {
  v: 1
  offer?: 'taken' | 'declined'
  tours: Record<string, TourOutcome>
}

export function readMemory(key: string): TourMemory {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<TourMemory> | null
    if (saved?.v === 1) return { v: 1, offer: saved.offer, tours: { ...saved.tours } }
  } catch { /* no storage or not ours: start empty */ }
  return { v: 1, tours: {} }
}

export function writeMemory(key: string, memory: TourMemory): void {
  try {
    localStorage.setItem(key, JSON.stringify(memory))
  } catch { /* kept for this page only */ }
}
