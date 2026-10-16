---
name: verify-soul-trip-uk
description: End-to-end functional verification skill and feature map for soul-trip.uk (site-manifest determinism, C1-C8 static contract, Sentry SRI/privacy contract, production verifier self-proof, and repo metadata).
---

# Verify `soul-trip.uk`

Runs the functional verification harness for `soul-trip.uk` (`verify_repo_meta.py`, `check-manifest.mjs`, `check-site.mjs`, `check-sentry-integration.mjs --expect-active`, `verify-production.mjs --prove-verification`, and isolated fault-injection checks) and writes a structured evidence artifact to `.audit/verify-soul-trip-uk/latest.json`.

## Feature Map

- [`features/INDEX.md`](features/INDEX.md) — Feature index and verification status
- [`features/site-contract-and-a11y.md`](features/site-contract-and-a11y.md) — Eight static site-contract invariants (`C1`–`C8`: internal refs/anchors, alts, Formspree form + honeypot parity, Sentry loader, WCAG AA contrast, favicon/robots/sitemap, footer `<h3>`/WhatsApp landmark a11y, `#privacy` links)
- [`features/manifest-and-production-verifier.md`](features/manifest-and-production-verifier.md) — Canonical `site-manifest.json` determinism, `FINGERPRINT_EXCLUDED_FILES` isolation, `deploy.json`, and `verify-production.mjs` self-proof
- [`features/sentry-sri-and-privacy.md`](features/sentry-sri-and-privacy.md) — Pinned Sentry SDK URL, `sha384` subresource-integrity verification, and PII scrubbing (`sendDefaultPii: false`, `beforeSend`)

## How to Run

```bash
checkq -- python3 .agents/skills/verify-soul-trip-uk/scripts/verify_soul_trip_uk.py
```

Also run the unified repository check entrypoint:

```bash
checkq -- ./scripts/check
```

## Red Proof Protocol

1. Introduce a surgical fault in `deploy.json` (for example change `"kind": "auto"` to `"kind": "none"`) or in `scripts/verify_repo_meta.py`.
2. Run `checkq -- python3 .agents/skills/verify-soul-trip-uk/scripts/verify_soul_trip_uk.py` and confirm it exits non-zero (`RED_RC != 0`).
3. Revert the fault (`git checkout -- deploy.json`).
4. Re-run `checkq -- python3 .agents/skills/verify-soul-trip-uk/scripts/verify_soul_trip_uk.py` and confirm it exits `0` (`GREEN_RC=0`).
