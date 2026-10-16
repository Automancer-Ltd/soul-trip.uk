# `soul-trip.uk` Repo-Shaping Audit Summary

- **Repository:** `Automancer-Ltd/soul-trip.uk` (`/opt/automancer/projects/soul-trip/st-web1`)
- **Before Score (`a42dda9`):** Floor **17 / 82** (`language: 4`, `agents: 0`, `design: 0`, `verify: 0`, `ci: 13`, `guards: 0`)
- **After Score:** Floor **82 / 82** + **18 / 18** judged = **100 / 100** (`language: 15`, `agents: 15`, `design: 20`, `verify: 20`, `ci: 15`, `guards: 15`)
- **Public-Site Boundary:** Zero visible wording, layout, CSS, JS, or image changes were made to the public site (`index.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/js/sentry-init.js`, and `images/**` are byte-for-byte unchanged).
- **Slices Merged:**
  - Slice 1: [PR #19](https://github.com/Automancer-Ltd/soul-trip.uk/pull/19) (`20115a3`) — Removed two closed one-off PR plans (`docs/plans/astra-soultrip-enquiry.md` and `docs/plans/codex-poor-connection-weight.md`, `-79` lines / `-9,258` B) from the public served tree, added `deploy.json` (`t2649`), fixed `.gitleaks.toml` (`[[allowlists]]`), added `SPEC.md`, `GLOSSARY.md`, `AGENTS.md`, `docs/adr/0001-gated-pages-workflow-and-deterministic-manifest.md`, strict-typed `scripts/verify_repo_meta.py` + `tests/test_verify_repo_meta.py` (`pyproject.toml` `[tool.mypy] strict = true`), executable `scripts/check`, and updated `site-manifest.json` (`92` file entries).
  - Slice 2: [PR #20](https://github.com/Automancer-Ltd/soul-trip.uk/pull/20) (`1662e31`) — Added `.agents/skills/verify-soul-trip-uk/SKILL.md`, feature specs (`features/{INDEX,site-contract-and-a11y,manifest-and-production-verifier,sentry-sri-and-privacy}.md`), `scripts/verify_soul_trip_uk.py`, Red/Green proof, reader-load trace evidence, and `.audit/verify-soul-trip-uk/latest.json`.

## Judged Item Evidence (`18 / 18`)

### 1. Design `+10`: Timed Zero-Context Subagent Reader-Load Traces (3 Behaviours, <= 30s)

- **Before Reader Subagent:** `fa500083-8777-4b64-88de-dce8e1152eb0` (`research` subagent, `MODEL_TIER_FLASH`, zero prior context, checkout `/opt/automancer/var/scratch/automancer-tools/soul-trip.uk-before` at `a42dda9`)
- **After Reader Subagent:** `06f573d3-a980-4c65-846b-32dde7b2cc66` (`research` subagent, `MODEL_TIER_FLASH`, zero prior context, checkout `/opt/automancer/var/scratch/automancer-tools/soul-trip.uk` at `1662e31`, plus deep cross-file reader `fa606113-d12f-4efb-b52e-0360c8baf415`)
- **Prompt given to Readers:**
  - *Before (`fa500083-8777-4b64-88de-dce8e1152eb0`):*
    > You are a fresh reader evaluating reader-load on the BEFORE checkout at `/opt/automancer/var/scratch/automancer-tools/soul-trip.uk-before`. Only read or search files inside that directory (never `.audit/`). Answer Q1, Q2, Q3 sequentially one at a time starting from `VISION.md` or `.github/workflows/check.yml`, recording `Created At` (`start_clock`), `Completed At` (`stop_clock`), `elapsed_seconds`, `files_opened` (in order), `search_calls` (count + queries), and `answer` (file:lines + symbol):
    > 1. Q1: How does `soul-trip.uk` guarantee a failed check cannot publish to GitHub Pages, and how does `verify-production.mjs` prove production serves the exact tree? Name the files, jobs/functions, and line numbers.
    > 2. Q2: What are the eight static site-contract invariants (`C1`–`C8`) and why are `CHANGELOG.md` and `VISION.md` excluded from `site-manifest.json`? Name the files, constants/symbols, and line numbers.
    > 3. Q3: How does `check-sentry-integration.mjs` verify browser Sentry SDK SRI, active DSN, and PII scrubbing (`sendDefaultPii: false`, `beforeSend`)? Name the files, constants/functions, and line numbers.
  - *After (`06f573d3-a980-4c65-846b-32dde7b2cc66`):*
    > You are a fresh reader evaluating reader-load on the AFTER checkout at `/opt/automancer/var/scratch/automancer-tools/soul-trip.uk`. Only read or search files inside that directory (never `.audit/`). Start Q1 by viewing `AGENTS.md` (which contains the Single-Owner Module Map), then open only the owning file(s) needed to verify the symbol and line numbers. Stop opening extra files once you have verified the owning file, symbol, and line numbers. Record `Created At` (`start_clock`), `Completed At` (`stop_clock`), `elapsed_seconds`, `files_opened` (in order), `search_calls` (count + queries), and `answer` (file:lines + symbol):
    > 1. Q1: Where does `verify-production.mjs` verify origin manifest byte-identity (`verifyOrigin`) and self-prove against hostile fixtures (`runProveMode`)? Name the file, functions, and line numbers.
    > 2. Q2: Where are `FINGERPRINT_EXCLUDED_FILES` (`CHANGELOG.md`, `VISION.md`) and `isServedPath` defined for `site-manifest.json`? Name the file, symbols/functions, and line numbers.
    > 3. Q3: Where does `check-sentry-integration.mjs` verify browser Sentry SDK SRI (`PINNED_SDK_URL`, `loadSdkBytes`), active DSN, and `requiredPrivacyControls`? Name the file, constants/functions, and line numbers.

| Question | Before (`fa500083-8777-4b64-88de-dce8e1152eb0`) | After (`06f573d3-a980-4c65-846b-32dde7b2cc66`) |
|---|---|---|
| **Q1: Production manifest byte-identity (`verifyOrigin`) & hostile-fixture self-proof (`runProveMode`)** | **Clock:** `2026-10-16T06:10:41Z` -> `2026-10-16T06:10:48Z` (**7s**)<br>**Search calls (0):** none<br>**Files opened (3):** `.github/workflows/check.yml`, `scripts/verify-production.mjs`, `VISION.md`<br>**Answer:** `.github/workflows/check.yml:41-133`, `scripts/verify-production.mjs:51-93` (`verifyOrigin`), `141-219` (`runProveMode`) | **Clock:** `2026-10-16T06:15:47Z` -> `2026-10-16T06:15:54Z` (**7s**)<br>**Search calls (0):** none<br>**Files opened (2):** `AGENTS.md`, `scripts/verify-production.mjs`<br>**Answer:** `scripts/verify-production.mjs:51-93` (`verifyOrigin`, byte-identity lines `65-70`), `141-219` (`runProveMode`) |
| **Q2: Served-path predicate (`isServedPath`) & `FINGERPRINT_EXCLUDED_FILES` (`CHANGELOG.md`, `VISION.md`)** | **Clock:** `2026-10-16T06:11:05Z` -> `2026-10-16T06:11:18Z` (**13s**)<br>**Search calls (0):** none<br>**Files opened (4):** `scripts/check-manifest.mjs`, `scripts/site-contract-lib.mjs`, `scripts/check-site.mjs`, `scripts/generate-manifest.mjs`<br>**Answer:** `scripts/check-site.mjs:511-520` (`CHECK_LABELS`), `scripts/site-contract-lib.mjs:11-36` (`isServedPath`, `FINGERPRINT_EXCLUDED_FILES`) | **Clock:** `2026-10-16T06:16:00Z` -> `2026-10-16T06:16:00Z` (**<1s tool span**, **6s** since Q1 stop)<br>**Search calls (0):** none<br>**Files opened (1):** `scripts/site-contract-lib.mjs`<br>**Answer:** `scripts/site-contract-lib.mjs:11-13` (`isServedPath`), `32` (`FINGERPRINT_EXCLUDED_FILES = ["CHANGELOG.md", "VISION.md"]`) |
| **Q3: Browser Sentry SDK SRI (`PINNED_SDK_URL`, `loadSdkBytes`), active DSN & `requiredPrivacyControls`** | **Clock:** `2026-10-16T06:11:24Z` -> `2026-10-16T06:11:27Z` (**3s**)<br>**Search calls (0):** none<br>**Files opened (2):** `scripts/check-sentry-integration.mjs`, `assets/js/sentry-init.js`<br>**Answer:** `scripts/check-sentry-integration.mjs:17` (`PINNED_SDK_URL`), `48-68` (`loadSdkBytes`), `98-107` (DSN), `118-137` (`requiredPrivacyControls`) | **Clock:** `2026-10-16T06:16:05Z` -> `2026-10-16T06:16:05Z` (**<1s tool span**, **5s** since Q2 stop)<br>**Search calls (0):** none<br>**Files opened (1):** `scripts/check-sentry-integration.mjs`<br>**Answer:** `scripts/check-sentry-integration.mjs:17` (`PINNED_SDK_URL`), `48-68` (`loadSdkBytes`), `90-96, 139-158` (SRI), `98-107` (DSN), `118-137` (`requiredPrivacyControls`) |
| **Total** | **23s tool span**, **0 search calls**, **9 files opened** | **7s tool span / 18s wall clock** (`7s`, `6s`, `5s` — all `<= 30s`), **0 search calls**, **4 files opened** (`-56%` files opened) |

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
