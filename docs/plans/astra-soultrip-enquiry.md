# A clear route from a service to an enquiry

Last verified: 2026-10-03 on auto-vps.

## Goal and boundaries

Make the first minute useful to both a family considering pilgrimage and a business visitor. Carry their service choice into an enquiry and help them recover from a failed send. Preserve the approved claims, photographs, typography and palette. Branch and PR only; no deployment, client contact or real enquiries.

## Direction and decisions

- Use the two existing hero actions for the two audiences already named by the site. Give existing service cards direct enquiry links. No new marketing claims, prices, licences or religious/entry advice.
- Keep one native form. Put the service choice first and offer optional, service-specific message prompts using existing services. No extra required data, storage, tracking, chatbot or booking machinery.
- On phones, put the two hero routes before the long approved introduction and anchor the hero at the top during font loading. Use a noscript-only navigation fallback so enhancement never collapses an initially expanded menu.
- Make service links real fragment destinations without JavaScript; continue accepting legacy typed hashes safely. Move keyboard focus to the destination. Malformed percent escapes must never prevent form setup.
- Preserve typed values after failures, prevent duplicate concurrent sends, focus visible outcomes, and put direct email/phone/WhatsApp recovery beside the failed form. A timeout cannot prove non-delivery; recovery wording must acknowledge that uncertainty.
- Preserve native HTML validation if JavaScript is absent. Keep the enquiry independent of the remote error-monitoring SDK becoming ready.
- Own `index.html`, `assets/js/main.js`, `assets/css/styles.css`, affected site contract/negative-control assertions, `site-manifest.json`, and this plan. Generated evidence stays outside git.

## Cursor

- [x] Read vision, previous performance PR, source, form callers and repository gates.
- [x] Capture baseline hero, form and broken-link behaviour.
- [x] Implement the complete enquiry route and recovery.
- [x] Verify desktop/mobile, keyboard, no JavaScript, failure/retry, timeout, duplicate submission and malformed links with intercepted requests.
- [ ] Run all repository gates; open PR and attach measurements, then read back CI.
- [ ] Stop owned processes and remove scratch after evidence is published.

## Verification and evidence

Commands are in `.github/workflows/check.yml`; no build/package dependency exists. The manifest enumerates tracked files, including public plans: stage a newly added plan before regenerating the manifest, and regenerate after later plan edits. The clone uses `.githooks/pre-push` to enforce this. Also check JavaScript syntax. Browser tests use loopback previews with muted audio. All non-local POSTs are intercepted, never delivered. Use the same browser and viewports for before/after captures; measure first-screen transfer to protect the improvement from PR #11. Screenshots and scripts are in `/opt/automancer/var/scratch/soultrip-enquiry-astra-20261003/` until the PR evidence is published.

Test changes must retain classification coverage while asserting actual fragment destinations. The test owner for submission interactions is the browser boundary: intercepted HTTP responses and real native form validation/focus, with no production test hooks. Repository negative controls remain the owner for static contract checks.

## Next step

Implementation and intercepted browser checks pass. Matched transfer/paint measurements and the repository gates are complete. Publish the first milestone. The previous performance plan now points at the actual workflow filename. No policy decision is pending.
