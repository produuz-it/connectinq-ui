/**
 * What the application switcher draws. The front decides which entries an account sees, where
 * each one lives and what it is called; the switcher only draws them.
 */
export type SwitcherKind = 'application' | 'tool'

export interface SwitcherEntry {
  key: string
  /** Applications are rows; tools are a grid of cells under them. */
  kind: SwitcherKind
  /** Where the link goes; empty for the front the user is in, drawn with a check. */
  href: string
  name: string
  /** One line under the name of an application, and the tooltip of a tool. */
  what: string
  /** A logo (an image URL), drawn on white. When there is none, `glyph` on `tile`. */
  logo?: string
  /** A 24 x 24 SVG path, drawn in `ink` on a `tile` square. */
  glyph?: string
  tile?: string
  ink?: string
}

export interface SwitcherLabels {
  /** The button's name and the head of the applications. */
  title: string
  /** The head of the tools. */
  tools: string
  /** The note at the foot. */
  hint: string
  /** What the check on the current entry says to a screen reader. */
  current: string
}
