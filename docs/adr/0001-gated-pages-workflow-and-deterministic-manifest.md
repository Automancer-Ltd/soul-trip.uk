# ADR 0001: Gated GitHub Pages Workflow, Deterministic Site Manifest, and Two-Sided Negative Controls

- **Status:** Accepted
- **Date:** 2026-10-16

## Context

`soul-trip.uk` is a hand-authored static site served from the repository root on GitHub Pages. Three operational failure modes were observed in early operation:

1. **Ungated legacy Pages deploys:** When GitHub Pages was configured to "Deploy from a branch", pushing to `main` published the site even when the `site-contract` check workflow failed (observed 2026-08-22).
2. **Unverified production bytes:** Without a cryptographic manifest of all served files, a partial CDN cache or stale Pages artifact could serve outdated HTML/CSS/JS while CI reported green.Conversely, including `CHANGELOG.md` or `VISION.md` in the manifest caused release-notes commits and board vision updates to break the manifest gate.
3. **Silent checker regressions:** A static checker (`check-site.mjs`, `check-manifest.mjs`, `check-sentry-integration.mjs`, `verify-production.mjs`) could lose discriminative power if a regex or parser change stopped catching broken links, contrast drops, or SRI mismatches.

## Decision

1. **Single Gated Workflow (`.github/workflows/check.yml`):**
   GitHub Pages is set to `build_type == "workflow"`. Within [`.github/workflows/check.yml`](../../.github/workflows/check.yml), the `deploy` job `needs:` the `verify` job, which runs `scripts/check` and uploads the Pages artifact, and `deploy` ends with `verify-production`, so a failing check physically prevents publication.
2. **Deterministic SHA-256 Manifest (`site-manifest.json`):**
   [`scripts/generate-manifest.mjs`](../../scripts/generate-manifest.mjs) hashes every git-tracked file where `isServedPath(relPath)` is true (no path segment starts with `.` or `_`) except `FINGERPRINT_EXCLUDED_FILES` (`CHANGELOG.md`, `VISION.md`). Post-deploy, [`scripts/verify-production.mjs`](../../scripts/verify-production.mjs) fetches `https://soul-trip.uk/site-manifest.json` and verifies every served file's SHA-256 against the local tree.
3. **Hostile Negative-Control Suite (`scripts/test-negative-controls.mjs`) and Strict Meta Verifier (`scripts/verify_repo_meta.py`):**
   Every check in `check-site.mjs`, `check-manifest.mjs`, `check-sentry-integration.mjs`, and `verify-production.mjs` is paired with sabotage fixtures in [`scripts/test-negative-controls.mjs`](../../scripts/test-negative-controls.mjs), and repository metadata (`deploy.json`, `.release-notes.json`, `.gitleaks.toml`, `site-manifest.json`) is verified by [`scripts/verify_repo_meta.py`](../../scripts/verify_repo_meta.py) via [`scripts/check`](../../scripts/check).

## Consequences

- Any change to a served file (not starting with `.` or `_` and not in `FINGERPRINT_EXCLUDED_FILES`) requires staging (`git add`) and running `node scripts/generate-manifest.mjs` before committing.
- Hidden directories (`.github/`, `.githooks/`, `.agents/`) are automatically omitted from `isServedPath` and `site-manifest.json`.
- Guardian `served-vs-main` tracks live GitHub Pages deployments via [`deploy.json`](../../deploy.json) (`https://api.github.com/repos/Automancer-Ltd/soul-trip.uk/deployments?environment=github-pages&per_page=1`, `0.sha`).
