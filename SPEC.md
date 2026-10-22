# `soul-trip.uk` — Site Contract & Verification Specification

## 1. Authority & Public-Site Boundary

[`VISION.md`](VISION.md) is the authority-0 document for `soul-trip.uk`. The site is a static, zero-build-step marketing and enquiry site (`index.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/js/sentry-init.js`) served on GitHub Pages at `https://soul-trip.uk/`.

**Hard Boundary:** Never modify visible public wording, imagery, typography, or layout without explicit client/owner instruction. Every automated change to the repository is gated by the static and behavioural contracts below before GitHub Actions publishes the artifact (`scripts/stage-site.mjs` stages the served tree only) to GitHub Pages.

## 2. Deterministic Served-Tree Fingerprint (`site-manifest.json`)

- [`scripts/site-contract-lib.mjs`](scripts/site-contract-lib.mjs) defines `isServedPath(relPath)` (any git-tracked path where no segment starts with `.` or `_`, except the repo-only `scripts/`, `docs/`, `AGENTS.md`, `SPEC.md`, `GLOSSARY.md`) and `FINGERPRINT_EXCLUDED_FILES = ["CHANGELOG.md", "VISION.md"]`.
- [`scripts/generate-manifest.mjs`](scripts/generate-manifest.mjs) computes the SHA-256 of every non-excluded served path in canonical sorted order and writes [`site-manifest.json`](site-manifest.json).
- [`scripts/check-manifest.mjs`](scripts/check-manifest.mjs) verifies in read-only mode that `site-manifest.json` matches the working tree byte-for-byte and that no untracked non-ignored served files make the tree ambiguous.

## 3. Eight Static Site-Contract Invariants (`scripts/check-site.mjs`)

[`scripts/check-site.mjs`](scripts/check-site.mjs) enforces eight named checks (`C1`–`C8`):
- **C1 (`internal references & fragment anchors`):** Every internal `href`, `src`, `srcset`, and `og:image` resolves to a served file, every `#fragment` resolves to an `id`/`name` in `index.html`, and any `#fragment?query` has a matching JS intercept in `assets/js/main.js`.
- **C2 (`image alt text`):** Every `<img>` has a non-empty `alt` attribute.
- **C3 (`enquiry form wiring`):** Exactly one `<form method="POST">` posting over HTTPS to an allowlisted Formspree host (`FORMSPREE_HOSTS`), containing honeypot `input[name="_gotcha"]`, required labelled fields (`name`, `phone`, `email`, `type`), `#form-success` and `#form-error` panels, `select#type` starting with a disabled empty placeholder option, classified service CTAs, and `assets/js/main.js` bindings (`REQUIRED_JS_SNIPPETS` + `showEnquirySuccess` honeypot parity).
- **C4 (`Sentry integration wired`):** `<script id="sentry-sdk">` loads from the committed local SDK asset, carries a `sha384-` `integrity` attribute and `https://` `data-dsn`, and `index.html` references `assets/js/sentry-init.js`.
- **C5 (`WCAG AA theme colour pairs`):** All 16 foreground/background token and rule pairs in `CONTRAST_PAIRS` meet their minimum WCAG AA contrast ratio (`4.5:1` normal text, `3.0:1` large dark-section heading).
- **C6 (`favicon / robots / sitemap references`):** All favicon links, `robots.txt` `Sitemap:` directives, and `sitemap.xml` `<loc>` URLs resolve to served files.
- **C7 (`structural a11y regressions`):** All headings inside `<footer>` are `<h3>` (preserving `h1 -> h2 -> h3` outline), and the single `.wa-float` link sits inside `<footer>`, is keyboard-focusable, and has a non-empty `aria-label`.
- **C8 (`privacy disclosure`):** `#privacy` names `Formspree` and `Sentry` (`error monitoring`) and is linked from both inside `<form>` and inside `<footer>`.

## 4. Sentry SRI & Privacy Contract (`scripts/check-sentry-integration.mjs`)

[`scripts/check-sentry-integration.mjs`](scripts/check-sentry-integration.mjs) verifies that:
- `<script id="sentry-sdk">` matches `PINNED_SDK_URL` (`assets/js/vendor/sentry-10.66.0.bundle.min.js`).
- The `integrity` attribute matches the recomputed `sha384` of the served SDK bytes (or `SENTRY_SDK_FIXTURE` in offline tests).
- `assets/js/sentry-init.js` enforces `sendDefaultPii: false` and `beforeSend` scrubbing of form values, query strings, and fragments.

## 5. Production Verifier & Gated Deploy (`.github/workflows/check.yml`)

- [`.github/workflows/check.yml`](.github/workflows/check.yml) runs `verify` (which runs `scripts/check` and uploads the Pages artifact on a push to `main`), then `deploy` (which ends with `verify-production`).
- [`scripts/verify-production.mjs`](scripts/verify-production.mjs) supports `--prove-verification` (built-in negative controls against three hostile fixtures) and `--base https://soul-trip.uk/` (fetches live `site-manifest.json` and verifies every served file's SHA-256 in production).
