/**
 * The help of a front: a book of chapters the front writes as data, what is new since the
 * person last looked, and what a ticket (a problem or a suggestion) carries with it. The one
 * button for notifications, help and tickets is connectinq-ui/help/SupportButton.vue and its
 * panel connectinq-ui/help/SupportPanel.vue; HelpPanel and HelpButton are the help alone.
 *
 * The library only draws: the front gives the book, its words and the function that sends a
 * report to wherever it goes.
 */
import { ref, type Ref } from 'vue'

/** One piece of a section. `**text**` marks a label of the screen; it is drawn in bold. */
export type HelpBlock =
  | { p: string }
  | { steps: string[] }
  | { list: string[] }
  | { tip: string }
  | { note: string }
  | { img: string; caption: string }

export interface HelpSection { id: string; title: string; blocks: HelpBlock[] }
export interface HelpChapter { id: string; title: string; sections: HelpSection[] }
export interface HelpBook { chapters: HelpChapter[] }

export type ReportKind = 'issue' | 'suggestion'

/** What the person writes in the report form. */
export interface ReportDraft { kind: ReportKind; title: string; description: string }

/** One of the person's own tickets, as the front words it. */
export interface TicketRow {
  key: string
  title: string
  /** `issue` or `suggestion`, and its word. */
  kind: ReportKind
  kindLabel: string
  /** Its state: `new`, `sent`, `closed` or `resolved`, and its word. */
  status: string
  statusLabel: string
  /** When it was sent, already formatted by the front. */
  when: string
  /** What the team answered, when the front has it. */
  reply?: string
}

/** One notification, as the front words it. */
export interface NotificationRow {
  key: string
  title: string
  /** A second line: the project, who, a figure. */
  facts?: string
  /** When, already formatted by the front. */
  when: string
  level?: 'info' | 'success' | 'warning' | 'error'
  unread: boolean
  /** Whether it opens something in this front; a row that opens nothing is not a button. */
  opens: boolean
}

/** What goes with a report: where the person was and on what. Read by people, never parsed. */
export type ReportContext = Record<string, string | number | boolean | null>

/** A help text as HTML: escaped, with `**label**` in bold. */
export function helpHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The address of the page without what could open something on its own: no query, no hash,
 * and a long path segment that is not a uuid (a link token) shown as `…`. A uuid names an
 * object and stays: it is what lets someone find the page again.
 */
export function safePath(path: string): string {
  return path.split('/').map((part) => (part.length > 16 && !UUID.test(part) ? '…' : part)).join('/')
}

/**
 * Where the person is and on what, read from the browser, plus what the front adds (its name,
 * version, the screen's name, the language chosen in the front). Nothing typed by the person.
 */
export function collectContext(extra: ReportContext = {}): ReportContext {
  const nav = typeof navigator === 'undefined' ? undefined : navigator
  const win = typeof window === 'undefined' ? undefined : window
  let zone = ''
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { zone = '' }
  return {
    path: win ? safePath(win.location.pathname) : '',
    viewport: win ? `${win.innerWidth}x${win.innerHeight}` : '',
    screen: win ? `${win.screen.width}x${win.screen.height}@${win.devicePixelRatio}` : '',
    user_agent: nav?.userAgent ?? '',
    browser_language: nav?.language ?? '',
    online: nav?.onLine ?? null,
    time_zone: zone,
    sent_at: new Date().toISOString(),
    ...extra,
  }
}

/**
 * What is new: `latest` names the newest entry (a date, `2026-11-19.2` for a second one that
 * day); until the person has opened it, `unseen` is true and the help button carries a dot.
 * Remembered in this browser under `storageKey`; a private window simply shows the dot again.
 */
export function useHelpNews(storageKey: string, latest: string): { unseen: Ref<boolean>; markSeen: () => void } {
  let seen = ''
  try { seen = localStorage.getItem(storageKey) ?? '' } catch { seen = latest }
  const unseen = ref(seen !== latest)
  function markSeen() {
    unseen.value = false
    try { localStorage.setItem(storageKey, latest) } catch { /* the dot comes back next time */ }
  }
  return { unseen, markSeen }
}
