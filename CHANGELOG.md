# Changelog

## 0.8.1

- `lists/DataTable.vue`: `selecting` shows the phone rows' checkboxes before anything is
  selected, so a front can offer a *Select* button (on a phone selection is a mode).

## 0.8.0

- `help/SupportPanel.vue`: the third tab is **Tickets** (it was *New ticket*): the person's own
  tickets, with **New ticket** as a row at the top that opens the form under it. `TicketForm`
  takes `startOpen` for a place that is only the form (`HelpPanel` uses it).
- `SupportPanel` and `HelpPanel` are **760 px wide** (they were 460 and 520), so screenshots,
  diagrams and infographics can be read in the help, and take the whole window below 1000 px.
- `help/SupportButton.vue`: the dot is for what is unread and addressed to the person (a
  notification, an answer to a ticket). A front no longer lights it for what is new in the help.

## 0.7.1

- `lists/RowActions.vue`: an action takes `disabled` and `reason`. It stays in its place, as a
  disabled button whose tooltip says why, or a disabled menu row with the reason under its label.

## 0.7.0

- **Lists and charts**, moved here from produuz.it Manage: `lists/DataTable.vue`, `PhoneRow.vue`,
  `FilterBar.vue`, `SelectionBar.vue`, `PickField.vue`, `RowActions.vue`, `DetailDrawer.vue`,
  `StatusChip.vue`, `DynamicForm.vue`, `AppLink.vue`, and `charts/BarChart.vue`, `StackRows.vue`,
  `ChartCard.vue`.
- A switch style for `input[role=switch]` in `base.css`.

## 0.6.1

- The unread dots of `SupportButton` and `NotificationList` stay round in a front whose own styles
  force square corners with `!important`.

## 0.6.0

- **Dark theme.** `tokens.css` has a dark set of the same `--cq-*` names, switched on by
  `data-cq-theme="dark"` on `<html>`: the page (`--cq-white`) and the text (`--cq-ink`) swap, the
  neutral ramp turns over, the accent, the cool ramp and the marks stay. New tokens
  `--cq-on-strong` (text on the cool ramp, red and vermilion, white in both themes) and
  `--cq-on-accent` (text on the oranges, brand black in both themes); the components use them
  where they used `--cq-white` or `--cq-ink` on a strong colour.
- `connectinq-ui/theme`: `applyTheme(choice)` (`light`, `dark` or `auto`, which follows the
  device), `resolveTheme`, `readLocalTheme` and `saveLocalTheme` for the copy a front keeps in the
  browser to paint the first screen. Where the choice is kept is the front's.
- `AccountMenu`: a *Theme* row (Light, Dark, Auto) when the front passes `themes`; it emits `theme`.
- **The TEST tag is black** (`--cq-test-tag`, white text; light with dark text on the dark theme),
  so no application's colour reads as test.
- **One button for notifications, help and tickets**: `help/SupportButton.vue` (one glyph of its
  own, two speech bubbles, and an orange dot while anything is unread, never a number) and
  `help/SupportPanel.vue` (a drawer with three tabs, *Notifications*, *Help* and *New ticket*,
  opened on Notifications unless the front asks for another tab). Built from three pieces that
  are also exported: `HelpBook.vue` (the chapters), `TicketForm.vue` (the form and, under it, the
  person's own tickets with their status) and `NotificationList.vue` (the rows, the dot, *Mark all
  as read*). New types `TicketRow` and `NotificationRow` in `connectinq-ui/help`.
- **Ticket, never issue.** The report form is *New ticket* in every front and language, in
  `HelpPanel` too, so it is not taken for an issue of the product itself.
- `HelpPanel` is drawn with `HelpBook` and `TicketForm`; its props are unchanged and it takes
  `tickets` too. The dots of `HelpButton` stay round under `base.css`.
- `connectinq-ui/platform`: *produuz.it Manage* (`manage`), with its mark (`MARKS.produuzitManage`,
  the produuz.it mark in the cool half of the palette).

## 0.5.2

- `HelpPanel`: the report form is called NEW ISSUE in every front and language, on its button and
  as its title. `labels.report` is no longer read and is optional.

## 0.5.1

- `HelpPanel`: the report form opens from a button at the top of the panel, beside Close, in the
  accent colour with an icon, instead of the last tab of the chapters. Its text is still the
  front's `labels.report`.

## 0.5.0

- The help of a front, made general: `HelpPanel` and `HelpButton` (`connectinq-ui/help/*.vue`)
  and `connectinq-ui/help` (the book's types, `helpHtml`, `useHelpNews`, `collectContext`,
  `safePath`). The front gives its book (chapters, sections and blocks of text, steps, lists,
  tips, notes and pictures), the chapter of the screen the person is on and its words; the panel
  opens on that chapter, has a *Tutorials* tab when the front fills the `tutorials` slot, and a
  *Report* tab when the front passes `send`: an issue or a suggestion, with the page, the
  browser, the screen and what the front adds, all shown before it is sent. Where the report
  goes is the front's: the panel calls `send` and says whether it worked.

## 0.4.1

- `CompanySwitch.vue`: the company the account works in, under the application's name in the side
  menu. Staff open it to change company (a searchable list, the current one checked, a STAFF chip);
  anyone else sees the name. The front loads the list on `open` and moves on `pick`. New token
  `--cq-staff` for the STAFF chip.

## 0.4.0

- `connectinq-ui/platform`: the products of the platform as the switcher draws them, in the
  menu's order (`PLATFORM`, `PLATFORM_ORDER`, `isPlatformKey`), and their marks as image URLs
  (`MARKS`: produuz.it, ConnectinQ, Saw Splitter, MOB Generator, QR reader), so every front
  draws the same switcher from one copy. The QR reader is a mark now, a plain QR in the
  produuz.it orange, and the supplier portal's tile uses the tokens.
- AppSwitcher: a logo is drawn with nothing behind it, so it sits on a dark theme and the tinted
  cell of the current tool shows through it; a glyph's `ink` may be a `var(--cq-*)` token.

## 0.3.0

- The guided tutorial of a ConnectinQ front, made general: `createTourEngine`
  (`connectinq-ui/tour`), `TourLayer`, `TourOffer` and `TourList` (`connectinq-ui/tour/*.vue`).
  A front gives its tours as data (steps that point at `data-tour` elements), which of its routes
  are tour pages, how to reach a step's page, and its words; the engine remembers the offer and
  each tour's outcome in localStorage under the front's key.
- Tokens `--cq-tour-dim`, `--cq-art-bg`, `--cq-art-ink`.
- Tests: `npm test` (Vitest) for the engine, the memory and the geometry.

## 0.2.1

- PopButton on a phone with `side: 'above'` opens its sheet above the button: the account panel
  at the foot of a drawer no longer opens off the screen.
- AccountMenu: the avatar takes the first letters of the first and last word of the name (or an
  `initials` prop), and its default slot gets `close`.
- SideMenu: `brand.title` for the mark's tooltip, `labels.deskOnly` for the desk-only mark, typed
  slots (`head` gets `side: 'right' | 'below'`), and an empty company row is hidden in the rail.
- The frame components carry their own button, count and spacer styles, so a front that loads
  only `tokens.css` draws them right, whatever its own `.icon-btn` or `.count` look like.
- `useFrame().scroller`: the element the screen scrolls in.

## 0.2.0

- The frame: `AppLayout` (the menu on the left, a top bar and a drawer on a phone, the tabs strip
  of the open section), `SideMenu` (sections and their screens as groups that open and close,
  a rail of icons when folded, a drawer with tall rows on a phone, links at the foot) and
  `AccountMenu` (the avatar, the name and a badge; a panel with who is signed in, the front's own
  blocks, the language and the sign-out). The data and the texts come from the front
  (`connectinq-ui/frame`: `FrameSection`, `FrameEntry`, `FrameTab`, `useFolded`, `useFrame`).

## 0.1.1

- ModalDialog marks its shape as `cq-dialog--center`, `--side`, `--sheet` or `--full`, and
  PopButton its phone sheet as `pop-panel--sheet`. The bare `center`, `side`, `sheet` and `full`
  classes met the apps' own classes of the same name (an app's `.center` centred a dialog's text).
- A dialog no longer inherits text alignment, caps, tracking or weight from where it is mounted.
- Two branches, `test` and `main`: the fronts' test builds install `#test`, their production
  builds `#main`.

## 0.1.0

- First version: tokens, base styles, ModalDialog, PopButton, AppSwitcher (entries with a logo
  or a glyph), ToastMessage, TestTag, display helpers.
