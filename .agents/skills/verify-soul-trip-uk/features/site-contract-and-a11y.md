# Feature: Static Site Contract & Accessibility Guards (`C1`–`C8`)

## Owner Modules
- [`scripts/check-site.mjs`](../../../../scripts/check-site.mjs)
- [`scripts/site-contract-lib.mjs`](../../../../scripts/site-contract-lib.mjs)

## Invariants Verified
1. `node scripts/check-site.mjs` passes all 8 contract groups (`C1` internal references & fragment anchors, `C2` image alt text, `C3` Formspree enquiry form + honeypot `showEnquirySuccess` parity, `C4` Sentry loader tag, `C5` 16 WCAG AA contrast pairs, `C6` favicon/robots/sitemap references, `C7` footer `<h3>` & `.wa-float` landmark accessibility, `C8` `#privacy` disclosure links).
