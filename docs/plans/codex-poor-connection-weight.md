# Poor-connection image delivery

Last verified: 2026-10-02 (`git log -1`; checks in `.github/workflows/check.yml`).

## Goal and boundaries

Reduce image transfer and improve the first screen on a poor connection. Preserve the approved photographs, framing, text, enquiry flow and static hosting. Deliver on a feature branch and pull request; no deployment or real enquiries.

## Decisions and ownership

- Native responsive WebP images; evergreen browsers and Safari 15 support this format. The hero additionally uses an AVIF `<source>` and typed responsive preload, with WebP as the older-browser fallback. Encode AVIF with Pillow quality 50 / speed 6 / two threads; retain all four widths and framing. Keep original JPEGs as source photographs and existing share metadata.
- Match `sizes` to existing CSS columns and breakpoints. For the untrimmed About and Hajj images, desktop hints include the source width needed by portrait cover frames. The tall stacked Vision section uses the original source resolution below 880 px; reducing its source to viewport width visibly softened the background. Fixed service cards, partnership image and Vision rail derivatives retain the existing centered cover crop; hero, background and breakpoint-dependent figures retain their full source aspect ratios. Derive with Pillow `ImageOps.exif_transpose`, `ImageOps.fit`, Lanczos resizing and WebP quality 82 / method 6; cap widths at source pixels. Hero loads eagerly at high priority; every other photograph remains lazy and decodes asynchronously.
- A responsive hero preload lets discovery begin in the head without downloading a second candidate. Only AVIF-capable browsers consume the AVIF preload; other browsers use the eager WebP image.
- No new runtime dependency or build step. Generated images are committed static assets. Serve the existing Latin brand fonts locally with their OFL licences; preload above-fold fonts and defer the error-reporting SDK at low priority while preserving deferred script order. Inter and Playfair retain their full Google-served variable font files. Cormorant retains every source glyph and the existing used italic weight 500, instantiated with `fontTools.varLib.instancer.instantiateVariableFont(font, {"wght": 500})`; no reserved font name applies to that family. This removes a font CSS round trip and retains the settled typography.
- Files: `index.html`, derived files under `images/`, local font assets/licences under `assets/fonts/`, font declarations in `assets/css/styles.css`, `site-manifest.json`, this plan. The existing broken-image negative control now derives its target from an image `src`, preserving its missing-file rejection without pinning a photograph filename. The enquiry JavaScript is unchanged. The brand link accessible name now includes its visible ampersand.
- This public implementation plan is committed as explicitly requested for this lane, overriding the older local convention that ignored all `docs/`. Private notes and generated evidence remain outside git.

## Cursor

- [x] Read vision, source copy/design brief, site checks and scout gap.
- [x] Record cold-cache baseline on a throttled mobile profile.
- [x] Generate responsive images and wire loading priority.
- [x] Compare matched mobile/desktop captures and transfer/paint measurements.
- [x] Run repository gates, open PR, publish measurements and read back CI.
- [x] Verify owned browser/server process and port cleanup. Remove disposable verification directories after the final checks and before handoff.

## Verification and evidence

Use the workflow's manifest, site, Sentry, production-verifier negative controls and hostile-control suite. Browser verification uses local previews only, blocks enquiry POSTs and reporting POSTs, and mutes audio. Measure cold contexts at 390×844, DPR 2, 1.6 Mbps down / 750 Kbps up, 150 ms latency and 4× CPU slowdown; compare multiple runs. Preview HTML/CSS/JS/SVG use gzip, matching the live GitHub Pages response encoding verified with read-only `curl -I -H "Accept-Encoding: gzip, br"` requests. Both sides use this same server/profile. Cold cache means the preview cache lifetime is irrelevant. Check layout at 320, 375, 768, 1024 and 1440 pixels and every lazy photograph after scrolling.

Detailed before/after measurements belong in the pull request description and evidence comment, never committed. Matched screenshots are used for visual review and remain outside git. The PR description/comment is the durable evidence index.

PR: https://github.com/Automancer-Ltd/soul-trip.uk/pull/11.
Evidence: https://github.com/Automancer-Ltd/soul-trip.uk/pull/11#issuecomment-5951276800 (individual before/after runs, Lighthouse comparison, layout review, fallback/interaction checks and implementation CI).
Live verification state: `gh pr checks 11`; detailed job steps: `gh run view <run-id> --json jobs`. CI results belong in PR comments rather than commits.

## Handoff

Implementation is complete. No additional runtime machinery is needed. Disposable previews enforce muted audio and block POSTs; their browser and server owners close in `finally`. Temporary clones, screenshots and reports are removed before handoff. The evidence comment holds the durable measurements.

Next: owner review of the PR. No merge or deployment is authorized in this lane. Actual production verification and physical iOS Safari 15 qualification remain outside this branch-only delivery; its native WebP fallback has been checked in a browser fixture.
