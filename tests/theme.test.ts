/**
 * The theme (src/theme.ts): what a choice paints on <html>, the browser copy, and the panel of
 * the one button opening on Notifications.
 */
import { createApp, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, isThemeChoice, readLocalTheme, resolveTheme, saveLocalTheme } from '../src/theme'
import SupportPanel from '../src/help/SupportPanel.vue'
import type { SupportTab } from '../src/help/SupportPanel.vue'

function darkDevice(dark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark && query.includes('dark'), media: query, addEventListener() {}, removeEventListener() {},
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.cqTheme
  localStorage.clear()
})

describe('theme', () => {
  it('knows its three choices', () => {
    expect(isThemeChoice('auto')).toBe(true)
    expect(isThemeChoice('blue')).toBe(false)
    expect(isThemeChoice(null)).toBe(false)
  })

  it('resolves auto from the device', () => {
    darkDevice(true)
    expect(resolveTheme('auto')).toBe('dark')
    expect(resolveTheme('light')).toBe('light')
    darkDevice(false)
    expect(resolveTheme('auto')).toBe('light')
  })

  it('paints dark on <html> and keeps the color-scheme meta in step', () => {
    darkDevice(false)
    applyTheme('dark')
    expect(document.documentElement.dataset.cqTheme).toBe('dark')
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content).toBe('dark')
    applyTheme('light')
    expect(document.documentElement.dataset.cqTheme).toBeUndefined()
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content).toBe('light')
  })

  it('keeps a browser copy and ignores anything else in it', () => {
    expect(readLocalTheme('k')).toBeNull()
    saveLocalTheme('k', 'auto')
    expect(readLocalTheme('k')).toBe('auto')
    localStorage.setItem('k', 'purple')
    expect(readLocalTheme('k')).toBeNull()
  })
})

describe('SupportPanel', () => {
  const labels = {
    title: 'Help and notifications', close: 'Close', notifications: 'Notifications', help: 'Help', contents: 'Contents',
    tutorials: 'Tutorials', none: 'Nothing new', loading: 'Loading', readAll: 'Mark all as read', unread: 'Unread',
    reportIntro: '', issue: 'Problem', suggestion: 'Idea', reportTitle: 'Title', reportDescription: 'What happened',
    reportDetails: 'Sent with it', send: 'Send', sending: 'Sending', sent: 'Sent', sendAnother: 'Another', failed: 'Failed',
  }

  function mount(startTab?: SupportTab) {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', '') }
    const open = ref(false)
    const tab = ref<SupportTab>('help')
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      render: () => h(SupportPanel, {
        modelValue: open.value, 'onUpdate:modelValue': (v: boolean) => { open.value = v },
        tab: tab.value, 'onUpdate:tab': (v: SupportTab) => { tab.value = v },
        labels, book: { chapters: [{ id: 'units', title: 'Units', sections: [] }] }, notifications: [],
        send: async () => {}, startTab,
      }),
    })
    app.mount(host)
    return { open, tab, app }
  }

  it('always opens on Notifications', async () => {
    const { open, tab, app } = mount()
    open.value = true
    await nextTick()
    expect(tab.value).toBe('notifications')
    app.unmount()
  })

  it('opens on the tab the front asks for', async () => {
    const { open, tab, app } = mount('ticket')
    open.value = true
    await nextTick()
    expect(tab.value).toBe('ticket')
    app.unmount()
  })

  it('names the tab Tickets and opens the form from New ticket at the top', async () => {
    const { open, app } = mount('ticket')
    open.value = true
    await nextTick()
    await nextTick()
    const panel = document.body.lastElementChild as HTMLElement
    const tabs = [...panel.querySelectorAll('[role=tab]')].map((el) => el.textContent?.trim())
    expect(tabs).toEqual(['Notifications', 'Help', 'Tickets'])
    const add = panel.querySelector<HTMLButtonElement>('.tf-new')
    expect(add?.textContent).toContain('New ticket')
    expect(panel.querySelector('.tf-form')).toBeNull()
    add?.click()
    await nextTick()
    expect(panel.querySelector('.tf-form')).not.toBeNull()
    expect(add?.getAttribute('aria-expanded')).toBe('true')
    app.unmount()
  })
})
