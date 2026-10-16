# Feature: Deterministic Site Manifest & Production Verifier

## Owner Modules
- [`site-manifest.json`](../../../../site-manifest.json)
- [`scripts/generate-manifest.mjs`](../../../../scripts/generate-manifest.mjs)
- [`scripts/check-manifest.mjs`](../../../../scripts/check-manifest.mjs)
- [`scripts/verify-production.mjs`](../../../../scripts/verify-production.mjs)
- [`scripts/verify_repo_meta.py`](../../../../scripts/verify_repo_meta.py)

## Invariants Verified
1. `node scripts/check-manifest.mjs` confirms `site-manifest.json` matches all non-excluded served files (`isServedPath`) in canonical order.
2. `node scripts/verify-production.mjs --prove-verification` proves the production verifier rejects stale manifests, missing assets, and tampered asset bytes.
3. `python3 scripts/verify_repo_meta.py` validates `deploy.json`, `.release-notes.json`, `.gitleaks.toml`, and `site-manifest.json` exclusion invariants.
