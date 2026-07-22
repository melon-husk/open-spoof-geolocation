# Privacy Policy

_Last updated: 22 July 2026_

**Open Spoof Geolocation** is designed to be private by default. It collects,
stores, and transmits **no personal data**.

## What we collect

Nothing. Open Spoof Geolocation does not collect, log, sell, or share any user
data.

## What is stored

The only data the extension stores is **your own configuration** — the spoofed
coordinates (latitude, longitude, accuracy) and whether spoofing is enabled.
This is kept **locally in your browser** using the browser's `storage` API. It
never leaves your device and is never sent to us or any third party.

## Network activity

Open Spoof Geolocation makes **no network requests**. There are no analytics, no
telemetry, no remote configuration, and no outbound connections of any kind.

## Your location and browsing

The extension overrides the browser's Geolocation API so that sites you visit
receive the coordinates **you** set instead of your real location. It does not
read, record, or transmit your real location, your requests, or your browsing
activity.

## Permissions

- **`storage`** — saves your spoofed coordinates and on/off state locally.
- **`scripting`** — injects the geolocation override into pages that use the
  Geolocation API.
- **Host access (`<all_urls>`)** — required so the override can apply on any
  site you choose. Used only to apply your spoofed location, never to read data.

## Remote code

Open Spoof Geolocation executes only the code bundled in its published package.
It does not download or run any remote code.

## Open source

Open Spoof Geolocation is fully open source and auditable. You can review every
line at https://github.com/melon-husk/open-spoof-geolocation.

## Contact

Questions about this policy? Open an issue at
https://github.com/melon-husk/open-spoof-geolocation/issues.
