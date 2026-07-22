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
- **Minimal permissions:** `storage` and `contextMenus`, plus the host access
  required to run the override on the sites you visit.

## Features

- Reports custom latitude, longitude, and accuracy to any site that uses the
  Geolocation API
- Pick from a list of preset city locations, or enter your own
- Spoofs `getCurrentPosition`, `watchPosition`, and `permissions.query`
- Works even when no location device is present — polyfills
  `navigator.geolocation` when it is missing
- Allow or disallow location access from the toolbar's right-click menu
- Optional randomized jitter on each reading
- Keeps your last 10 coordinates for quick reuse
- Global on/off toggle with an ON/OFF badge on the toolbar icon
- Light and dark themes that follow your system

## Usage

1. Click the toolbar icon to open the popup. Enter the **latitude**,
   **longitude**, and **accuracy** to report. Use
   [latlong.net](https://www.latlong.net/) to look up coordinates.
2. Toggle **Global** on. Sites that request your location now receive the
   values you set.
3. Use **Save location** to keep coordinates in the recent list, and click a
   recent chip to switch back to it.
4. **Right-click the toolbar icon** for quick controls: allow/disallow GEO
   requests, reset the stored data, or open a test page.

### Testing

Open [webbrowsertools.com/geolocation](https://webbrowsertools.com/geolocation/)
(also reachable via **Test GEO location** in the right-click menu) and confirm
the reported location matches your settings. Toggle allow/disallow from the menu
and reload to see access denied.

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
