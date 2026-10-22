# Soul Trip site — handover roadmap

## Vision checked

- `VISION.md`: the site earns a conversation and keeps the enquiry path reliable; it is not a booking shop.
- `SPEC.md` and `AGENTS.md`: public wording, design, palette and imagery stay unchanged without explicit owner instruction; the live page is a static GitHub Pages tree with gated manifest verification. This slice changes only mobile menu dismissal behaviour.
- `GLOSSARY.md`: `#enquiry-form` is the product path; `main.js` owns navigation and form interaction.

## Current state

The service/navigation and enquiry paths are present. The menu already closes from its toggle, a link, or Escape; this slice adds the expected outside-click dismissal for mobile visitors. The latest recorded slice before this one is PR #27 (`dee1d7d`), which documented telemetry and kept the local enquiry browser walk from sending to Sentry; production state is verified by the repository's post-deploy job, not inferred here.

## Next three slices

1. **Mobile menu dismissal** (this slice): clicking outside an open menu closes it without altering copy or appearance; preserve toggle, link and Escape behavior.
2. **Enquiry delivery visibility**: after the read-only Formspree key and form id are provided via the existing owner handoff, check plan/cap/submission delivery without sending a test enquiry to the client.
3. **Mobile transfer weight**: inspect the existing responsive image candidates for an actual byte-saving opportunity; do not alter imagery unless the owner explicitly authorizes that change.

## Open questions / gates

- The read-only Formspree key and form hash are with the owner (tracker t5186); no test submission may reach the client's mailbox.
- Any new or changed public imagery/design/copy requires explicit owner instruction under `AGENTS.md`.
