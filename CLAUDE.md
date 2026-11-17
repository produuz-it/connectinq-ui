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

## Rules

- **English everywhere**: code, comments, docs, commit messages.
- **No colour literal outside `src/tokens.css`**: a new colour is a new `--cq-*` token.
- **Modern web guidance**: the `modern-web-guidance` plugin is enabled in `.claude/settings.json`.
  Use it before writing or changing HTML, CSS or client-side JS. Browser policy: **Baseline Widely
  available**; a newer feature only with the fallback the guide gives.
- **Versions**: a change that alters how something looks or behaves gets a line in
  `CHANGELOG.md`, a version bump in `package.json` and a tag (`v0.2.0`). The fronts pin a tag.
- **Never commit and never push** unless the owner asks for that commit. No AI co-author or
  attribution in commits.

## Checking a change

```bash
npm install
npm run check   # vue-tsc over every .ts and .vue file
```

Then install the new tag in a front that uses it and look at the screen there.
