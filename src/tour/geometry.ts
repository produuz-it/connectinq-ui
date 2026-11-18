/**
 * The geometry of a tutorial step, apart from the screen so it can be tested: the light around
 * the element, what dims and blocks the page, and where the card goes. TourLayer.vue measures
 * the page and draws what these return.
 */

export interface Box { top: number; left: number; width: number; height: number }
export interface View { width: number; height: number }

/** Room around the lit element, the gap to the card, and the card's distance from the edges. */
export const PAD = 4
export const GAP = 12
export const EDGE = 16
/** On a phone, a card at the top sits under the 56 px bar. */
export const PHONE_TOP = 64
/** The card's width on a desktop. */
export const CARD_WIDTH = 320
/** A narrower element (a rail entry, a star, a button) gets the card beside it when it fits. */
export const NARROW = 220

/** The light: the element with some room around it, kept on the screen across (a full-width row on a phone). */
export function lightAround(element: Box, viewWidth: number): Box {
  const left = Math.max(Math.round(element.left - PAD), 0)
  const right = Math.min(Math.round(element.left + element.width + PAD), viewWidth)
  return { top: Math.round(element.top - PAD), left, width: right - left, height: Math.round(element.height + 2 * PAD) }
}

/**
 * What dims and blocks the page: four boxes around the light, and the light itself, clear and
 * still blocking, unless the person is to click it (*try it*). Without a light, the whole page.
 */
export function blockersAround(light: Box | null, view: View, tryIt: boolean): (Box & { clear?: boolean })[] {
  if (!light) return [{ top: 0, left: 0, width: view.width, height: view.height }]
  const bottom = light.top + light.height
  const right = light.left + light.width
  const list: (Box & { clear?: boolean })[] = [
    { top: 0, left: 0, width: view.width, height: Math.max(light.top, 0) },
    { top: bottom, left: 0, width: view.width, height: Math.max(view.height - bottom, 0) },
    { top: light.top, left: 0, width: Math.max(light.left, 0), height: light.height },
    { top: light.top, left: right, width: Math.max(view.width - right, 0), height: light.height },
  ]
  if (!tryIt) list.push({ ...light, clear: true })
  return list
}

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(value, Math.max(low, high)))
}

/**
 * Where the card goes, beside the light and never over it when it can be helped.
 * Desktop: to the right of a narrow element, else below, above, right or left; the middle
 * of the screen without a light. Phone: the screen's width less the edges, docked at the
 * bottom for an element in the upper half and at the top for one in the lower half, the
 * other side when that would cover it.
 */
export function placeCard(light: Box | null, view: View, cardHeight: number, phone: boolean): { top: number; left: number; width: number } {
  const { width: vw, height: vh } = view
  const width = phone ? vw - 2 * EDGE : Math.min(CARD_WIDTH, vw - 2 * EDGE)
  const height = cardHeight
  let top: number
  let left: number
  if (!light) {
    top = (vh - height) / 2
    left = (vw - width) / 2
  } else if (phone) {
    left = EDGE
    const bottom = vh - height - EDGE
    const coversBottom = light.top + light.height > bottom
    const coversTop = light.top < PHONE_TOP + height
    const upper = light.top + light.height / 2 < vh / 2
    top = upper ? (coversBottom && !coversTop ? PHONE_TOP : bottom) : (coversTop && !coversBottom ? bottom : PHONE_TOP)
  } else {
    const right = light.left + light.width
    const below = light.top + light.height
    const across = clamp(light.left + light.width / 2 - width / 2, EDGE, vw - width - EDGE)
    const beside = clamp(light.top, EDGE, vh - height - EDGE)
    const roomRight = vw - right - GAP - EDGE >= width
    if (light.width < NARROW && roomRight) [top, left] = [beside, right + GAP]
    else if (vh - below - GAP - EDGE >= height) [top, left] = [below + GAP, across]
    else if (light.top - GAP - EDGE >= height) [top, left] = [light.top - GAP - height, across]
    else if (roomRight) [top, left] = [beside, right + GAP]
    else if (light.left - GAP - EDGE >= width) [top, left] = [beside, light.left - GAP - width]
    else [top, left] = [vh - below > light.top ? vh - height - EDGE : EDGE, across]
  }
  return { top: Math.round(top), left: Math.round(left), width }
}
