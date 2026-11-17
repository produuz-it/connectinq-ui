/**
 * Phone or desk: below 600 px a frame draws a top bar and its menu as a drawer. `useIsWide`
 * says whether two cards fit side by side (960 px and up).
 */
import { onBeforeUnmount, ref, type Ref } from 'vue'

export const PHONE_QUERY = '(max-width: 599px)'
export const WIDE_QUERY = '(min-width: 960px)'

export function useMedia(query: string): Ref<boolean> {
  const list = typeof matchMedia === 'function' ? matchMedia(query) : null
  const matches = ref(list?.matches ?? false)
  const follow = (event: MediaQueryListEvent) => { matches.value = event.matches }
  list?.addEventListener('change', follow)
  onBeforeUnmount(() => list?.removeEventListener('change', follow))
  return matches
}

export const useIsPhone = () => useMedia(PHONE_QUERY)
export const useIsWide = () => useMedia(WIDE_QUERY)
