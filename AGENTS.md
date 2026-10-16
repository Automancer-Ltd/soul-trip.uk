# `soul-trip.uk` — Agent Instructions

[`VISION.md`](VISION.md) is authority 0 for this repository. See [`SPEC.md`](SPEC.md) for the site contract specification, [`GLOSSARY.md`](GLOSSARY.md) for ubiquitous domain vocabulary, [`docs/adr/0001-gated-pages-workflow-and-deterministic-manifest.md`](docs/adr/0001-gated-pages-workflow-and-deterministic-manifest.md) for architectural decisions, and [`.github/RELEASING.md`](.github/RELEASING.md) for the release-notes catch-up workflow.

## Hard Public-Site Boundary

- `soul-trip.uk` is a live public client site (`https://soul-trip.uk/`). **Never make visible wording, design, palette, or imagery changes** to `index.html`, `assets/css/styles.css`, `assets/js/main.js`, or `images/**` unless explicitly instructed by Waseem.
- Whenever any served tracked file (any path where no segment starts with `.` or `_`, other than `CHANGELOG.md` and `VISION.md`) is added, edited, or removed, stage the change (`git add`) and run `node scripts/generate-manifest.mjs` to update [`site-manifest.json`](site-manifest.json).

## Single-Owner Module Map

| File / Module | Single Responsibility & Key Entrypoints |
|---|---|
| [`scripts/site-contract-lib.mjs`](scripts/site-contract-lib.mjs) | Shared parser & manifest primitives: `isServedPath()`, `FINGERPRINT_EXCLUDED_FILES` (`["CHANGELOG.md", "VISION.md"]`), `isFingerprintExcluded()`, `listIntendedServedFiles()`, `scanHtml()`, `extractCssTokens()`, `resolveCssColor()`, `compositeOver()`, `contrastRatio()`. |
| [`scripts/generate-manifest.mjs`](scripts/generate-manifest.mjs) | Builds canonical SHA-256 [`site-manifest.json`](site-manifest.json) (`buildManifest(root)`) from all non-excluded served paths; rejects untracked non-ignored files. |
| [`scripts/check-manifest.mjs`](scripts/check-manifest.mjs) | Read-only check verifying `site-manifest.json` matches working-tree SHA-256 digests and canonical key ordering. |
| [`scripts/check-site.mjs`](scripts/check-site.mjs) | Enforces the 8 static site-contract checks (`CHECK_LABELS` `C1`–`C8`): internal links/fragments (`C1`), image alts (`C2`), Formspree enquiry form + honeypot parity (`C3`), Sentry loader tag (`C4`), 16 WCAG AA `CONTRAST_PAIRS` (`C5`), favicon/robots/sitemap (`C6`), footer `<h3>` & `.wa-float` landmark accessibility (`C7`), and `#privacy` disclosure links (`C8`). |
| [`scripts/check-sentry-integration.mjs`](scripts/check-sentry-integration.mjs) | Verifies `<script id="sentry-sdk">` against `PINNED_SDK_URL`, recomputes `sha384` SRI against served bundle bytes (or `SENTRY_SDK_FIXTURE`), and checks `sendDefaultPii: false` + `beforeSend` scrubbing in [`assets/js/sentry-init.js`](assets/js/sentry-init.js). |
| [`scripts/verify-production.mjs`](scripts/verify-production.mjs) | Verifies live `https://soul-trip.uk/site-manifest.json` and every served file's SHA-256 (`--base https://soul-trip.uk/`), plus built-in hostile-fixture self-proof (`--prove-verification`). |
| [`scripts/test-negative-controls.mjs`](scripts/test-negative-controls.mjs) | Two-sided negative-control and read-only purity test suite (`T01`–`T50`, `makeCopy`, `detachCopyRepo`). |
| [`scripts/verify_repo_meta.py`](scripts/verify_repo_meta.py) | Strict-typed Python verifier (`MetaFinding`, `MetaVerificationReport`, `run_meta_verification()`) checking [`deploy.json`](deploy.json), [`.release-notes.json`](.release-notes.json), [`.gitleaks.toml`](.gitleaks.toml), and [`site-manifest.json`](site-manifest.json). |
| [`scripts/check`](scripts/check) | Unified check entrypoint running `mypy`, `verify_repo_meta.py`, Python unit tests (`tests/test_verify_repo_meta.py`), `check-manifest.mjs`, `check-site.mjs`, `check-sentry-integration.mjs`, and `verify-production.mjs --prove-verification`. |
| [`.github/workflows/check.yml`](.github/workflows/check.yml) | Single gated GitHub Actions workflow: `verify` -> `build` (`upload-pages-artifact`) -> `deploy` (`deploy-pages`) -> `verify-production`. |

## Verification Commands

Always run local checks via `checkq`:

```bash
checkq -- ./scripts/check
checkq -- node scripts/test-negative-controls.mjs
checkq -- python3 .agents/skills/verify-soul-trip-uk/scripts/verify_soul_trip_uk.py
```
