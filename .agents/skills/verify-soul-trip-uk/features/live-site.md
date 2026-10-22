# Production serves this tree

- **Reach it:** `https://soul-trip.uk/site-manifest.json` and every file it lists.
- **Drive:** `node scripts/verify-production.mjs --base https://soul-trip.uk/ --verbose`.
- **Proves it worked:** exit 0 means the live manifest equals the repo's and every served file's SHA-256 matches.
- **Gotchas:** `CHANGELOG.md` and `VISION.md` are not fingerprinted, so a release-notes commit does not change what is verified. Pages can take a few seconds to serve a new deploy; the verifier retries transient 5xx.
