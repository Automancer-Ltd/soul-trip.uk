# Poor-connection image delivery

Last verified: 2026-10-02 (`git log -1`; checks in `.github/workflows/site-contract.yml`).

## Goal and boundaries

Reduce image transfer and improve the first screen on a poor connection. Preserve the approved photographs, framing, text, enquiry flow and static hosting. Deliver on a feature branch and pull request; no deployment or real enquiries.

## Decisions and ownership

- Native responsive WebP images; evergreen browsers and Safari 15 support this format. Keep original JPEGs as source photographs and existing share metadata.
- Match `sizes` to existing CSS columns and breakpoints. Fixed service cards, partnership image and Vision rail derivatives retain the existing centered cover crop; hero, background and breakpoint-dependent figures retain their full source aspect ratios. Derive with Pillow `ImageOps.exif_transpose`, `ImageOps.fit`, Lanczos resizing and WebP quality 82 / method 6; cap widths at source pixels. Hero loads eagerly at high priority; every other photograph remains lazy and decodes asynchronously.
- A responsive hero preload lets discovery begin in the head without downloading a second candidate.
- No new runtime dependency or build step. Generated images are committed static assets.
- Files: `index.html`, derived files under `images/`, `site-manifest.json`, this plan. The existing broken-image negative control now derives its target from an image `src`, preserving its missing-file rejection without pinning a photograph filename. CSS and enquiry logic require no change.
- This public implementation plan is committed as explicitly requested for this lane, overriding the older local convention that ignored all `docs/`. Private notes and generated evidence remain outside git.

## Cursor

- [x] Read vision, source copy/design brief, site checks and scout gap.
- [x] Record cold-cache baseline on a throttled mobile profile.
- [x] Generate responsive images and wire loading priority.
- [x] Compare matched mobile/desktop captures and transfer/paint measurements.
- [ ] Run repository gates, open PR, attach evidence and read back CI.
- [ ] Stop owned processes and remove scratch files.

## Verification and evidence

Use the workflow's manifest, site, Sentry, production-verifier negative controls and hostile-control suite. Browser verification uses local previews only, blocks enquiry POSTs and reporting POSTs, and mutes audio. Measure cold contexts at 390×844, DPR 2, 1.6 Mbps down / 750 Kbps up, 150 ms latency and 4× CPU slowdown; compare multiple runs. Check layout at 320, 375, 768, 1024 and 1440 pixels and every lazy photograph after scrolling.

Detailed before/after measurements belong in the pull request description and evidence comment, never committed. Matched screenshots are used for visual review and remain outside git. The PR description/comment is the durable evidence index.

Manifest, site contracts, JavaScript syntax, active Sentry integrity, production-verifier controls and all 55 negative controls pass. Matched browser checks at all five widths confirm identical visible text and image bounds, loaded photographs and no horizontal overflow. The throttled profile fetches one high-priority hero candidate and no offscreen photographs.

Next: open PR, read back CI and publish the measurement evidence there. No deployment is authorized.
