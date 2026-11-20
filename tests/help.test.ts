import { describe, expect, it, beforeEach } from 'vitest'
import { collectContext, helpHtml, safePath, useHelpNews } from '../src/help'

describe('help', () => {
  beforeEach(() => localStorage.clear())

  it('draws labels in bold and never the markup it is given', () => {
    expect(helpHtml('Press **Save** <now>')).toBe('Press <b>Save</b> &lt;now&gt;')
  })

  it('keeps uuids in a path and hides link tokens', () => {
    expect(safePath('/orders/2f1c9a1e-8b7d-4c1e-9a3b-0d6e5f4a3b2c')).toBe('/orders/2f1c9a1e-8b7d-4c1e-9a3b-0d6e5f4a3b2c')
    expect(safePath('/gate/AbCdEfGhIjKlMnOpQrStUv')).toBe('/gate/…')
    expect(safePath('/planning/timeline')).toBe('/planning/timeline')
  })

  it('sends what the browser knows, and what the front adds wins', () => {
    const context = collectContext({ application: 'planner', path: '/override' })
    expect(context.application).toBe('planner')
    expect(context.path).toBe('/override')
    expect(typeof context.viewport).toBe('string')
    expect(String(context.sent_at)).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('shows the dot until the newest entry is read', () => {
    const news = useHelpNews('help-news', '2026-11-19')
    expect(news.unseen.value).toBe(true)
    news.markSeen()
    expect(news.unseen.value).toBe(false)
    expect(useHelpNews('help-news', '2026-11-19').unseen.value).toBe(false)
    expect(useHelpNews('help-news', '2026-11-20').unseen.value).toBe(true)
  })
})
