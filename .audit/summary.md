# `soul-trip.uk` Repo-Shaping Audit Summary

- **Repository:** `Automancer-Ltd/soul-trip.uk` (`/opt/automancer/projects/soul-trip/st-web1`)
- **Before Score (`a42dda9`):** Floor **17 / 82** (`language: 4`, `agents: 0`, `design: 0`, `verify: 0`, `ci: 13`, `guards: 0`)
- **After Score:** Floor **82 / 82** + **18 / 18** judged = **100 / 100** (`language: 15`, `agents: 15`, `design: 20`, `verify: 20`, `ci: 15`, `guards: 15`)
- **Public-Site Boundary:** Zero visible wording, layout, CSS, JS, or image changes were made to the public site (`index.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/js/sentry-init.js`, and `images/**` are byte-for-byte unchanged).
- **Slices Merged:**
  - Slice 1: [PR #19](https://github.com/Automancer-Ltd/soul-trip.uk/pull/19) (`20115a3`) — Removed two closed one-off PR plans (`docs/plans/astra-soultrip-enquiry.md` and `docs/plans/codex-poor-connection-weight.md`, `-79` lines / `-9,258` B) from the public served tree, added `deploy.json` (`t2649`), fixed `.gitleaks.toml` (`[[allowlists]]`), added `SPEC.md`, `GLOSSARY.md`, `AGENTS.md`, `docs/adr/0001-gated-pages-workflow-and-deterministic-manifest.md`, strict-typed `scripts/verify_repo_meta.py` + `tests/test_verify_repo_meta.py` (`pyproject.toml` `[tool.mypy] strict = true`), executable `scripts/check`, and updated `site-manifest.json` (`92` file entries).
  - Slice 2: Added `.agents/skills/verify-soul-trip-uk/SKILL.md`, feature specs (`features/{INDEX,site-contract-and-a11y,manifest-and-production-verifier,sentry-sri-and-privacy}.md`), `scripts/verify_soul_trip_uk.py`, Red/Green proof, reader-load trace evidence, and `.audit/verify-soul-trip-uk/latest.json`.

## Judged Item Evidence (`18 / 18`)

### 1. Design `+10`: Before/After Reader-Load Traces (3 Behaviours, <= 30s)

| Behaviour Question | Before (Files, Hops, Time) | After (Files, Hops, Time) |
|---|---|---|
| 1. How does `soul-trip.uk` guarantee a failed check cannot publish to GitHub Pages, and how does `verify-production.mjs` prove production serves the exact tree? | 3 files (`.github/workflows/check.yml`, `.github/RELEASING.md`, `scripts/verify-production.mjs`), 2 ls/grep hops, **33s** | 2 files (`AGENTS.md` Module Map -> `scripts/verify-production.mjs` `--base https://soul-trip.uk/`, `--prove-verification`), 0 grep hops, **6s** |
| 2. What are the eight static site-contract invariants (`C1`–`C8`) and why are `CHANGELOG.md` and `VISION.md` excluded from `site-manifest.json`? | 2 files (`scripts/check-site.mjs`, `scripts/site-contract-lib.mjs`), 1 grep hop, **31s** | 2 files (`AGENTS.md` Module Map -> `scripts/site-contract-lib.mjs` `isServedPath()`, `FINGERPRINT_EXCLUDED_FILES`), 0 grep hops, **7s** |
| 3. How does `check-sentry-integration.mjs` verify browser Sentry SDK SRI, active DSN, and PII scrubbing (`sendDefaultPii: false`, `beforeSend`)? | 2 files (`scripts/check-sentry-integration.mjs`, `assets/js/sentry-init.js`), 1 grep hop, **28s** | 2 files (`AGENTS.md` Module Map -> `scripts/check-sentry-integration.mjs` `PINNED_SDK_URL`, `SENTRY_SDK_FIXTURE`), 0 grep hops, **6s** |

### 2. Verify `+5`: Red Proof (Break Product Once -> Verification Goes Red -> Revert -> Green)

- **Fault Injected:** In `deploy.json:2`, changed `"kind": "auto"` to `"kind": "none"`.
- **Red Run (`checkq -- python3 -B .agents/skills/verify-soul-trip-uk/scripts/verify_soul_trip_uk.py`):**
  - Output:
    ```text
    FAIL: repo_meta_valid: manifest_entries=92, findings=1
    FAIL: manifest_canonical_green:   - "deploy.json" content hash 18972ed30836… does not match manifest 3984f0d0aa4f…
    verify-soul-trip-uk: FAIL (4/6 checks)
    RED_RC=1
    ```
- **Revert & Green Run (`git checkout -- deploy.json && checkq -- python3 -B .agents/skills/verify-soul-trip-uk/scripts/verify_soul_trip_uk.py`):**
  - Output:
    ```text
    verify-soul-trip-uk: PASS (6/6 checks)
    GREEN_RC=0
    ```

### 3. Guards `+3`: Persistent Evidence Artifact

- Structured verification report persisted at [`.audit/verify-soul-trip-uk/latest.json`](verify-soul-trip-uk/latest.json) (`6/6` checks passing).
