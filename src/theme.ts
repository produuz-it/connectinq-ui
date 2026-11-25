/**
 * Light, dark or the device's choice. The front decides where the choice is kept (the account,
 * the browser); this file only applies it: `data-cq-theme` on <html>, which switches the tokens
 * (tokens.css), and the `color-scheme` meta, so the browser's own controls and scrollbars follow.
 *
 * To paint the first screen in the right theme, the front runs the same thing before its bundle
 * loads, from the copy it keeps in the browser (see the README):
 *
 *   <script>try{var t=localStorage.getItem('<key>');if(t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.dataset.cqTheme='dark'}catch(e){}</script>
 */

export type ThemeChoice = 'light' | 'dark' | 'auto'

export const THEME_CHOICES: ThemeChoice[] = ['light', 'dark', 'auto']

const DARK_QUERY = '(prefers-color-scheme: dark)'

export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  value === 'light' || value === 'dark' || value === 'auto'

/** The theme drawn for a choice: `auto` follows the device. */
export function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice !== 'auto') return choice
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

let current: ThemeChoice = 'light'
let following = false

function paint() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const theme = resolveTheme(current)
  if (theme === 'dark') root.dataset.cqTheme = 'dark'
  else delete root.dataset.cqTheme
  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'color-scheme'
    document.head.appendChild(meta)
  }
  meta.content = theme
}

/** Applies a choice now, and keeps `auto` in step with the device while it is chosen. */
export function applyTheme(choice: ThemeChoice): void {
  current = isThemeChoice(choice) ? choice : 'light'
  paint()
  if (!following && typeof matchMedia === 'function') {
    following = true
    matchMedia(DARK_QUERY).addEventListener('change', () => { if (current === 'auto') paint() })
  }
}

/** The choice kept in this browser under `key`, or null when there is none (or storage is blocked). */
export function readLocalTheme(key: string): ThemeChoice | null {
  try {
    const value = localStorage.getItem(key)
    return isThemeChoice(value) ? value : null
  } catch {
    return null
  }
}

/** Keeps a copy of the choice in this browser, for the first paint of the next visit. */
export function saveLocalTheme(key: string, choice: ThemeChoice): void {
  try { localStorage.setItem(key, choice) } catch { /* the next visit paints light first */ }
}
