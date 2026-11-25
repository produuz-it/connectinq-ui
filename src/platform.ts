/**
 * The products of the platform as the application switcher draws them, in the menu's order:
 * the applications first (rows), then the tools (a grid). Each one is a mark (`logo`, drawn
 * as it is, with nothing behind it, on a light or a dark theme) or a 24 x 24 glyph on a tile.
 * Which entries an account sees, where each one lives and what it is called stay in the front.
 */
import type { SwitcherEntry } from './switcher'
import connectinq from './marks/connectinq.png'
import mob from './marks/mob.svg'
import produuzit from './marks/produuzit.png'
import produuzitManage from './marks/produuzit-manage.svg'
import qr from './marks/qr.svg'
import sawSplitter from './marks/saw-splitter.svg'

export type PlatformKey = 'produuzit' | 'manage' | 'planner' | 'qr' | 'sawsplit' | 'moblite' | 'supplier_portal'

export type PlatformLook = Pick<SwitcherEntry, 'kind' | 'logo' | 'glyph' | 'tile' | 'ink'>

/** The marks as image URLs, also for a front's own brand (side menu, sign-in page). */
export const MARKS = { produuzit, produuzitManage, connectinq, sawSplitter, mob, qr }

/** Material Design Icons (Pictogrammers, Apache License 2.0): truck-delivery. */
const GLYPH_TRUCK = 'M3,4A2,2 0 0,0 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8H17V4M10,6L14,10L10,14V11H4V9H10M17,9.5H19.5L21.47,12H17M6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5M18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5Z'

export const PLATFORM: Record<PlatformKey, PlatformLook> = {
  produuzit: { kind: 'application', logo: produuzit },
  manage: { kind: 'application', logo: produuzitManage },
  planner: { kind: 'application', logo: connectinq },
  qr: { kind: 'tool', logo: qr },
  sawsplit: { kind: 'tool', logo: sawSplitter },
  moblite: { kind: 'tool', logo: mob },
  supplier_portal: { kind: 'tool', glyph: GLYPH_TRUCK, tile: 'var(--cq-indigo)', ink: 'var(--cq-on-strong)' },
}

/** The keys in the menu's order. */
export const PLATFORM_ORDER = Object.keys(PLATFORM) as PlatformKey[]

export const isPlatformKey = (key: unknown): key is PlatformKey =>
  typeof key === 'string' && Object.prototype.hasOwnProperty.call(PLATFORM, key)
