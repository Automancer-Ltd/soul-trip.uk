# Feature: Sentry Subresource Integrity & Privacy Contract

## Owner Modules
- [`scripts/check-sentry-integration.mjs`](../../../../scripts/check-sentry-integration.mjs)
- [`assets/js/sentry-init.js`](../../../../assets/js/sentry-init.js)

## Invariants Verified
1. `node scripts/check-sentry-integration.mjs --expect-active` verifies that `<script id="sentry-sdk">` points to `PINNED_SDK_URL`, carries a matching `sha384` `integrity` digest, has an active HTTPS ingest `data-dsn`, and pairs with `assets/js/sentry-init.js` (`sendDefaultPii: false` and `beforeSend` scrubbing).
