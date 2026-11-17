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
| `connectinq-ui/ModalDialog.vue` | A modal on the native `<dialog>`: centred, side drawer, bottom sheet or full screen. |
| `connectinq-ui/PopButton.vue` | A button that opens a floating panel (menus, switchers); a sheet on a phone. |
| `connectinq-ui/AppSwitcher.vue` | The application switcher. The front passes the entries and the texts (`connectinq-ui/switcher`). |
| `connectinq-ui/ToastMessage.vue` | One short message at the bottom of the screen. |
| `connectinq-ui/TestTag.vue` | The `TEST` tag of a build that does not talk to production. |
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
