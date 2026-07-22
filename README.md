# Open Spoof Geolocation

An open source, auditable tool to spoof your browser's geolocation. Built to be
private by design — no tracking, no telemetry, and nothing stored except the
location you set.

## Why

Location-spoofing tools sit in a sensitive spot: they see where you are and run
on every site. That makes a closed-source one a poor thing to trust. Open Spoof
Geolocation is built to be safe by design:

- **Local only.** Your spoofed location is stored in the browser's `storage`
  API and never leaves your device.
- **No network calls.** Zero outbound requests, no analytics endpoints.
- **No location history.** Nothing is stored except the coordinates you set.
- **Minimal permissions:** `storage` and `scripting`, plus the host access
  required to apply the override on the sites you visit.

## Features

- Report a fixed latitude, longitude, and accuracy to any site that uses the
  Geolocation API
- Global on/off toggle
- Light and dark themes that follow your system

> Status: early scaffolding. The geolocation override is being built.

## Develop

```sh
pnpm install
pnpm dev          # run in Chrome
pnpm build        # production build
pnpm compile      # typecheck
```

Built with [WXT](https://wxt.dev) and React. Chrome (Manifest V3) is the current
target.

## Releasing

Releases are fully automated with
[semantic-release](https://semantic-release.gitbook.io/). Every push to `main`
runs the [release workflow](.github/workflows/release.yml), which inspects the
commit messages since the last release and decides what to publish.

Versioning follows [Conventional Commits](https://www.conventionalcommits.org/):

| Commit type                                | Release         |
| ------------------------------------------ | --------------- |
| `fix:`                                     | Patch (`1.0.1`) |
| `feat:`                                    | Minor (`1.1.0`) |
| `feat!:` / `fix!:` / `BREAKING CHANGE:`    | Major (`2.0.0`) |
| `docs:` `chore:` `ci:` `refactor:` `test:` | No release      |

When a releasable commit lands on `main`, the workflow bumps the version,
updates `CHANGELOG.md`, tags the release, and publishes a GitHub Release with the
built Chrome zip attached. If no commit warrants a release, the workflow succeeds
without publishing anything.

Commit messages are linted locally via a Husky `commit-msg` hook, so
non-conforming messages are rejected before they reach `main`. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for details.
