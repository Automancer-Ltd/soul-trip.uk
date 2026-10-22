# `soul-trip.uk` — Agent Instructions

[`VISION.md`](VISION.md) is authority 0 for this repository. See [`SPEC.md`](SPEC.md) for the site contract specification, [`GLOSSARY.md`](GLOSSARY.md) for ubiquitous domain vocabulary, [`docs/adr/0001-gated-pages-workflow-and-deterministic-manifest.md`](docs/adr/0001-gated-pages-workflow-and-deterministic-manifest.md) for architectural decisions, and [`.github/RELEASING.md`](.github/RELEASING.md) for the release-notes catch-up workflow. GLOSSARY.md maps every term and module to the file that owns it.

## Hard Public-Site Boundary

- `soul-trip.uk` is a live public client site (`https://soul-trip.uk/`). **Never make visible wording, design, palette, or imagery changes** to `index.html`, `assets/css/styles.css`, `assets/js/main.js`, or `images/**` unless explicitly instructed by Waseem.
- Whenever any served tracked file (any path where no segment starts with `.` or `_`, other than `CHANGELOG.md` and `VISION.md`) is added, edited, or removed, stage the change (`git add`) and run `node scripts/generate-manifest.mjs` to update [`site-manifest.json`](site-manifest.json).

## Commands

```bash
checkq -- ./scripts/check        # everything CI runs, about 20 s: mypy, repo meta, manifest, site contract C1-C8, Sentry SRI and privacy, verifier self-proof, negative controls
node scripts/generate-manifest.mjs   # after `git add` of any served-file change
.agents/skills/verify-soul-trip-uk/scripts/drive-enquiry.sh   # real browser walk of the enquiry form on a local copy; Formspree is stubbed, nothing is sent
node scripts/verify-production.mjs --base https://soul-trip.uk/   # live site serves exactly this tree
```

## Production signals

Sentry errors and the UptimeRobot monitor: commands in the Telemetry section of `.agents/skills/verify-soul-trip-uk/SKILL.md`.

## Release

A merge to `main` is the deploy: `.github/workflows/check.yml` runs `scripts/check`, publishes Pages, then its `deploy` job runs the production verifier, so a red run means production does not serve the merged tree. Release notes follow in [`.github/RELEASING.md`](.github/RELEASING.md).
