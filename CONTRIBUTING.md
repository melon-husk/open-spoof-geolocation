# Contributing to Open Spoof Geolocation

Thanks for your interest in improving Open Spoof Geolocation! This project is
built to be **private by design** — minimal permissions, no network calls, no
telemetry. Please keep that principle in mind for every change.

## Project principles

These are non-negotiable and define the identity of the project:

- **Local only.** The spoofed location lives in the browser's `storage` API and
  never leaves the device. Do not add any code that transmits it.
- **No network calls.** Zero outbound requests — no analytics, no remote
  config, no telemetry.
- **No location history.** Nothing is persisted except the coordinates the user
  sets.
- **Minimal permissions.** Only `storage` and `scripting`, plus the host access
  required to apply the override. Adding a permission needs a strong
  justification in the PR.

## Getting started

Requirements: [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/) 10+.

```sh
pnpm install
pnpm dev          # run in Chrome (WXT dev server)
pnpm dev:firefox  # run in Firefox
```

## Development workflow

```sh
pnpm compile   # typecheck (tsc --noEmit)
pnpm build     # production build
pnpm zip       # package the Chrome extension into .output/
```

Before opening a pull request, make sure both of these pass:

```sh
pnpm compile
pnpm build
```

### Project structure

- `entrypoints/background.ts` — background service worker (coordination seam).
- `entrypoints/content.ts` — page-context script that overrides
  `navigator.geolocation`.
- `entrypoints/popup/` — the React popup UI (`App.tsx`, `style.css`).
- `lib/types.ts` — core data model (`AppState`, `Coordinates`).
- `lib/storage.ts` — load/save state and state-change events.

## Commit messages

This repository uses **[Conventional Commits](https://www.conventionalcommits.org/)**.
Commit messages drive automated versioning and releases, so the format matters:

| Prefix                                     | Effect                                 |
| ------------------------------------------ | -------------------------------------- |
| `fix:`                                     | Patch release (e.g. `1.2.3` → `1.2.4`) |
| `feat:`                                    | Minor release (e.g. `1.2.3` → `1.3.0`) |
| `feat!:` / `fix!:`                         | Major release (breaking change)        |
| `docs:` `chore:` `refactor:` `test:` `ci:` | No release                             |

A breaking change can also be signalled with a `BREAKING CHANGE:` footer.

Examples:

```
feat: add a location search box
fix: preserve accuracy after toggling off and on
docs: clarify permission model in README
```

If you use squash merges, make sure the **squash commit title** follows this
format, since that becomes the commit recorded on `main`.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your change, keeping it focused and small where possible.
3. Run `pnpm compile` and `pnpm build`.
4. Open a PR with a clear description of the what and why. Note any permission
   or data-handling implications explicitly.

## Releases

Releases are automated. When commits are merged to `main`,
[semantic-release](https://semantic-release.gitbook.io/) analyzes the commit
messages, bumps the version, generates release notes, and publishes a GitHub
Release with the Chrome zip attached. You do not need to bump versions or tag
releases manually.

## Reporting issues

When filing a bug, please include:

- Browser and version
- Steps to reproduce
- What you expected vs. what happened
- The coordinates/configuration in use (if relevant)

## License

By contributing, you agree that your contributions will be licensed under the
same license as this project.
