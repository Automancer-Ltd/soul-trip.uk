# Visitor sends an enquiry

The product (`VISION.md`: "the enquiry path is the product").

- **Reach it:** `#enquiry` on the home page, or any "get a quote" link to it.
- **Drive:** `scripts/drive-enquiry.sh` selects a type, fills name, phone and email, submits.
- **Proves it worked:** `#form-success` becomes visible and `window.__posts` holds exactly one `POST` to `https://formspree.io/p/3011773691026472174/f/enquiry`.
- **Gotchas:** the live form is never submitted from a test (it reaches a real person), so `fetch` is stubbed in the page. The honeypot field `_gotcha` short-circuits to the success panel without a POST; fill it only to test that path. A real Formspree failure shows `#form-error` and reports a Sentry event with no visitor data.
