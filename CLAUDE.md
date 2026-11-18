# CLAUDE.md — connectinq-ui

The shared look of the ConnectinQ front-ends. Read `README.md` first.

## This repository is public

Everything here can be read by anyone. Before every change, check that it holds **presentation
only**:

- No business logic: no rules about who may see or open what, no licences, roles, prices,
  quantities or production data.
- No API routes, hosts, environment names, client ids, tokens or keys.
- No customer, company or person names, no internal document or repository paths in comments.
- What a front shows is passed in as props by the front; the components never decide it.

When in doubt, it stays in the front.

## 🧭 Modern web guidance — use it for every change

This repository follows [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance)
(Chrome, Edge, Firefox and MDN teams). The plugin is enabled in `.claude/settings.json`. Everything
here is HTML, CSS or client-side JS, so every change starts with it: search the guides for what you
are about to build, and follow them, so the components use current web platform features and not
the old patterns in an agent's training data.

- **Browser policy: Baseline Widely available.** Features that are Baseline Widely available are
  used without fallbacks. A newer feature is used only with the fallback the guide gives (for
  example `<dialog closedby>`, which ModalDialog replaces with a backdrop click handler, and the
  Popover API, which PopButton replaces with fixed positioning).
- Native elements first: `<dialog>`, `<details>`, form controls, before any script of our own.
- The skill runs `npx -y modern-web-guidance@latest search|retrieve …` (`npx.cmd` on Windows). If
  it has to be allowlisted, allow that command only, never a bare `npx *`.
- `npx -y modern-web-guidance@latest legacy-scan src` lists legacy patterns. Run it before a new
  version is tagged.

## Rules

- **English everywhere**: code, comments, docs, commit messages.
- **No colour literal outside `src/tokens.css`**: a new colour is a new `--cq-*` token.
- **Branches `test` and `main`**: work on `test`, merge into `main` once the fronts' test builds
  have been checked with it. A front's `test` branch installs `#test`, its `main`/`master` branch
  installs `#main`. A change that alters how something looks or behaves gets a line in
  `CHANGELOG.md` and a version bump in `package.json`.
- **The fronts' `main` depends on this repo's `main`.** A front (planner-front, mob-lite,
  saw-splitter-front, delivery-front) may push or merge its `test` into `main` only after this
  repo's `test` has been merged into `main`: merge here first, then the front.
- **Never commit and never push** unless the owner asks for that commit. No AI co-author or
  attribution in commits.

## Checking a change

```bash
npm install
npm run check   # vue-tsc over every .ts and .vue file
npm test        # Vitest: the tutorial engine, memory and geometry (run it from PowerShell on Windows)
```

Then, in a front that uses it, run `npm update connectinq-ui` on its `test` branch and look at
the screen there.
