# Releasing soul-trip.uk

Last verified: 2026-10-03 on automancer-vps (AUT-12528).

This file lives under `.github/` so GitHub Pages does not publish it and the
site manifest does not fingerprint it.

## What a release is here

A push to `main` is the deploy. `.github/workflows/check.yml` runs the site
contract, uploads the repository root with `actions/upload-pages-artifact`,
publishes it with `actions/deploy-pages`, and then runs
`scripts/verify-production.mjs --base https://soul-trip.uk/` against the live
site. There is no deploy script on the VPS, so nothing on the VPS can write the
release notes at deploy time. The Codex writer that the estate uses runs only on
the VPS, so a hosted runner cannot call it either.

The notes are written after the deploy instead, by the estate's hourly
catch-up lane. `.release-notes.json` declares `"deployTrigger": "push"` for this
reason. Without that key the repository uses the legacy `ref` model, and the
lane skips it. That is how five shipped user-facing commits after
`v2026.09.01.1` went without notes until AUT-12527 found them.

## The hourly contract

- `automancer-release-notes-catchup.timer` (a systemd user unit, hourly, up to 5
  minutes' random delay) starts `automancer-release-notes-catchup.service`.
- The service runs
  `/opt/automancer/srv/detectors/auto/scripts/release-notes-catchup-all.sh`.
  That script lists repositories with `release-notes.mjs configured-repos` and
  selects only `push`, `mixed` and `live`.
- `configured-repos` reads this file from `origin/main` in the primary clone,
  `/opt/automancer/projects/soul-trip/st-web1`. It does not fetch. The daily
  checkout-sync and audit timers fetch, so a config change on `main` can take up
  to a day to reach the lane.
- The lane keeps its own clone at
  `/opt/automancer/var/release-notes-catchup/st-web1-23187aceb2c8`. The suffix
  is the first 12 hex characters of the SHA-256 of
  `https://github.com/Automancer-Ltd/soul-trip.uk.git`. In that clone it runs
  `release-notes-catchup.sh --repo <clone> --branch main`.
- `release-notes-catchup.sh` treats "`origin/main` is ahead of the last `v` tag"
  as the deploy signal. It writes the notes, commits `CHANGELOG.md` as
  `release: <version>`, reserves the tag, and runs `publish`. `publish` pushes
  straight to `main` when `main` is unprotected and not ahead of the release
  commit. Otherwise it opens a `release/<version>` pull request with auto-merge.
  It then pushes the tag and creates the GitHub release.
- A release commit changes only `CHANGELOG.md`. The manifest excludes that file
  (`FINGERPRINT_EXCLUDED_FILES` in `scripts/site-contract-lib.mjs`), so the
  deploy it triggers serves the same fingerprinted tree.
- The lane alerts through the service's `OnFailure=` route when a release fails
  or leaves a user-facing commit without a line. The daily
  `automancer-release-notes-audit.timer` is the backstop. It reports this
  repository after seven days with unwritten user-facing commits.

Check that the lane can see this repository:

```sh
git -C /opt/automancer/projects/soul-trip/st-web1 fetch --quiet origin main
node /opt/automancer/srv/detectors/auto/scripts/release-notes.mjs configured-repos \
  --root /opt/automancer/projects,/opt/automancer/ops | grep soul-trip
# push	main	https://github.com/Automancer-Ltd/soul-trip.uk.git	/opt/automancer/projects/soul-trip/st-web1
```

## Releasing by hand

Use this route when the notes must be read before they are published, or when
the lane is down. Run it in the lane's clone, never in a developer clone.

1. Prove that production serves the commit you are about to release:

   ```sh
   SHA=$(git rev-parse origin/main)
   gh run list --repo Automancer-Ltd/soul-trip.uk --workflow site-contract \
     --branch main --event push --commit "$SHA" \
     --json conclusion,headSha,url
   # conclusion must be "success": verify, build, deploy and verify-production passed
   git worktree add --detach "$TMP/st-verify" "$SHA"
   node "$TMP/st-verify/scripts/verify-production.mjs" --base https://soul-trip.uk/ --verbose
   git worktree remove "$TMP/st-verify"
   ```

2. Write and read the notes. Check every line against the diff. If a line
   overclaims, correct it with `accept` and give a reason:

   ```sh
   RN=/opt/automancer/srv/detectors/auto/scripts/release-notes.mjs
   C=/opt/automancer/var/release-notes-catchup/st-web1-23187aceb2c8
   [ -d "$C/.git" ] || git clone --quiet --single-branch --branch main \
     https://github.com/Automancer-Ltd/soul-trip.uk.git "$C"
   exec 9>"$C/.git/release-notes-catchup.lock" && flock -w 300 9   # the lane's lock
   git -C "$C" fetch --quiet --no-tags origin main && git -C "$C" merge --ff-only origin/main
   node /opt/automancer/srv/detectors/auto/scripts/release-notes-tag-publication.mjs sync "$C"
   node "$RN" preview --repo "$C"
   node "$RN" accept --repo "$C" --edited corrected.md --reason "why"   # only if needed
   ```

3. Release and publish the reviewed bytes, still holding the lock so the hourly
   run cannot write over you:

   ```sh
   node "$RN" release --repo "$C" --yes --no-publish
   node "$RN" publish --repo "$C" --ref "$(git -C "$C" rev-parse HEAD)" \
     --tag "$(git -C "$C" describe --tags --exact-match HEAD)"
   ```

   Release the lock with `exec 9>&-`. Alternatively, skip steps 2 and 3 and run
   the lane's own script for this repository alone. It takes the lock itself,
   writes fresh notes, and does not keep an `accept`ed correction:

   ```sh
   /opt/automancer/srv/detectors/auto/scripts/release-notes-catchup.sh --repo "$C" --branch main
   ```

4. Read the result back: the tag on origin, the GitHub release body, and
   `CHANGELOG.md` on `main`.

Do not rewrite a published release body. Do not set `RELEASE_NOTES_SKIP` and do
not relabel a user-facing commit as internal to clear a finding.
