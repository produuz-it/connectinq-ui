# connectinq-ui

The shared look of the ConnectinQ front-ends: design tokens, base styles, and a few Vue 3
components. Raleway and Roboto Mono, the ConnectinQ palette, square corners, no shadows except
on floating panels.

## What is in it

| Import | What |
|---|---|
| `connectinq-ui/tokens.css` | The colour, font and shadow tokens (`--cq-*`). The only file with colour literals. |
| `connectinq-ui/base.css` | Type, buttons (`.btn`, `.btn.primary`, `.icon-btn`), fields, cards, tables (`table.cq`), chips, banners, progress, dialog and toast styles. |
| `connectinq-ui/cq.css` | Both of the above. |
| `connectinq-ui/AppLayout.vue` | The frame: the menu on the left, a top bar with the menu as a drawer on a phone, the tabs strip of the open section. |
| `connectinq-ui/SideMenu.vue` | The menu: the mark and the name, sections and their screens (groups that open and close), a rail when folded, links and the account at the foot. |
| `connectinq-ui/AccountMenu.vue` | The user area: avatar, name, badge; a panel with who is signed in, the front's blocks, the language and the sign-out. |
| `connectinq-ui/frame` | The frame's types (`FrameSection`, `FrameEntry`, `FrameTab`, `FrameBrand`), `useFolded(key)` and `useFrame()`. |
| `connectinq-ui/tour` | A guided tutorial: `createTourEngine` (which tour runs, its steps, going to a step's page, what is remembered), the memory and the geometry of a step. The front gives its tours, its pages and how to reach them. |
| `connectinq-ui/tour/TourLayer.vue` | The tutorial on the screen: the page dimmed, the step's element (`data-tour`) lit, a card beside it, keyboard, a drawing when the element is missing (`art` slot). |
| `connectinq-ui/tour/TourOffer.vue` | The first-visit offer, asked once. |
| `connectinq-ui/tour/TourList.vue` | The tours, one row each, with *Start* or *Again*. |
| `connectinq-ui/help` | The help of a front: the book's types (chapters, sections, blocks), `helpHtml`, `useHelpNews` (the dot until the newest entry is read), `collectContext` and `safePath` (what a report carries). |
| `connectinq-ui/help/HelpPanel.vue` | The help in a drawer: the book opened on the screen's chapter, a *Tutorials* tab (`tutorials` slot) and a *Report* tab for an issue or a suggestion when the front passes `send`. |
| `connectinq-ui/help/HelpButton.vue` | The `?` that opens it, with a dot while something new is unread. |
| `connectinq-ui/help/SupportButton.vue` | The one button for notifications, help and tickets: its own glyph (two speech bubbles) and an orange dot while anything is unread. |
| `connectinq-ui/help/SupportPanel.vue` | Its panel: *Notifications*, *Help* and *New ticket* tabs, opened on Notifications. The front passes the rows, the book and `send`, and reacts to the events. |
| `connectinq-ui/help/HelpBook.vue`, `TicketForm.vue`, `NotificationList.vue` | The three pieces of the panel, for a front that draws them elsewhere. |
| `connectinq-ui/ModalDialog.vue` | A modal on the native `<dialog>`: centred, side drawer, bottom sheet or full screen. |
| `connectinq-ui/PopButton.vue` | A button that opens a floating panel (menus, switchers); a sheet on a phone. |
| `connectinq-ui/CompanySwitch.vue` | The company the account works in, in the side menu; staff change it from a searchable list. |
| `connectinq-ui/AppSwitcher.vue` | The application switcher. The front passes the entries and the texts (`connectinq-ui/switcher`). |
| `connectinq-ui/platform` | The platform's products as the switcher draws them (`PLATFORM`, in the menu's order) and their marks (`MARKS`). The front still decides which entries an account sees, and where each one lives. |
| `connectinq-ui/ToastMessage.vue` | One short message at the bottom of the screen. |
| `connectinq-ui/TestTag.vue` | The `TEST` tag of a build that does not talk to production. |
| `connectinq-ui/theme` | Light, dark or the device's choice: `applyTheme`, `resolveTheme`, and a browser copy for the first paint (`readLocalTheme`, `saveLocalTheme`). |
| `connectinq-ui/display` | `useIsPhone()` (below 600 px), `useIsWide()` (960 px and up). |
| `connectinq-ui/glyphs` | The SVG paths the components draw (Material Design Icons, Apache 2.0). |

Fonts are not bundled: the front loads Raleway (400, 600, 700, 800) and Roboto Mono (400, 500),
for example with `@fontsource`.

## Using it

The package ships its source (`.vue`, `.ts`, `.css`); the front's Vite compiles it. It has two
branches, as the fronts do: **`test`** and **`main`**. A front's `test` branch installs the
library's `test` branch, and its `main` (or `master`) branch installs the library's `main`:

```bash
# on the front's test branch
npm install --save-exact github:produuz-it/connectinq-ui#test
# on the front's main branch
npm install --save-exact github:produuz-it/connectinq-ui#main
```

The lock file pins the commit, so a front moves to the latest library commit only when someone
runs `npm update connectinq-ui` there and commits the lock. When a front merges `test` into
`main`, the dependency is switched back to `#main` in the same merge.

```ts
// main.ts
import 'connectinq-ui/cq.css'
```

The dark theme is `data-cq-theme="dark"` on `<html>`, set by `applyTheme`. To paint the first
screen in the right theme, put this before the bundle in `index.html`, with the front's key:

```html
<script>try{var t=localStorage.getItem('app-theme');if(t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.dataset.cqTheme='dark'}catch(e){}</script>
```

```ts
// vite.config.ts: the .vue files are compiled by the front, not pre-bundled
optimizeDeps: { exclude: ['connectinq-ui'] },
```

```ts
// vitest.config.ts: the same for the tests
test: { server: { deps: { inline: ['connectinq-ui'] } } },
```

Peer dependencies: `vue` 3.5, `vue-router` (PopButton closes on navigation) and `@lucide/vue`.

## Rules

- **Presentation only.** No business rules, no API calls, no hosts, no product data. What a
  front shows and to whom is decided in the front and passed in as props.
- **No colour literal outside `src/tokens.css`.**
- **Modern web guidance.** Every change follows
  [modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance): native elements
  and current web platform features instead of old patterns.
- **Browser support: Baseline Widely available.** Newer features only with the fallback the
  guide gives.
- Changes go to `test` first; `test` is merged into `main` when the fronts' `test` builds have
  been checked with it. A change that alters how a component looks or behaves gets a line in
  `CHANGELOG.md` and a version bump in `package.json`.
