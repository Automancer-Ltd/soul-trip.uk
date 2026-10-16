# `soul-trip.uk` Feature Verification Index

| Feature Spec | Scope | Verification Script Check | Status |
|---|---|---|---|
| [`site-contract-and-a11y.md`](site-contract-and-a11y.md) | `scripts/check-site.mjs`, `scripts/site-contract-lib.mjs` (`C1`–`C8`) | `site_contract_c1_c8_green` | Verified |
| [`manifest-and-production-verifier.md`](manifest-and-production-verifier.md) | `site-manifest.json`, `scripts/check-manifest.mjs`, `scripts/verify-production.mjs`, `scripts/verify_repo_meta.py` | `manifest_canonical_green`, `production_verifier_self_proof`, `repo_meta_valid` | Verified |
| [`sentry-sri-and-privacy.md`](sentry-sri-and-privacy.md) | `scripts/check-sentry-integration.mjs`, `assets/js/sentry-init.js` | `sentry_sri_and_privacy_green`, `synthetic_meta_fault_detected` | Verified |
