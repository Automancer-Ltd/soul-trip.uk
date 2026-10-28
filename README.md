# Soul Trip website — operator guide

This repository contains the static site published at <https://soul-trip.uk/>.
It is a live public client site: do not change visitor-facing wording, design,
colour or imagery without explicit authorization. See [AGENTS.md](AGENTS.md)
for the repository boundary and [VISION.md](VISION.md) for project authority.

## How releases work

A merge to `main` is the release trigger. The `site-contract` GitHub Actions
workflow runs `scripts/check`; only if that succeeds does it publish the Pages
artifact. Its deploy job then runs the production verifier against the live
site. Do not deploy by copying files to a server or by pushing directly to
`main`.

Before proposing a change:

```sh
checkq -- ./scripts/check
```

For the exact local check (and its prerequisites), see `AGENTS.md`. Changes to
served files must be staged and followed by `node scripts/generate-manifest.mjs`
before checking; this README and repository engineering files are intentionally
not part of the public site.

After merging, verify the `site-contract` run for the merge commit is green,
including its deploy job. That job runs:

```sh
node scripts/verify-production.mjs --base https://soul-trip.uk/ --verbose
```

A green `verify` job alone does not prove a release: confirm the deploy job and
its production-verifier step succeeded. If the workflow is red or production
verification fails, treat the release as failed and follow the rollback below.

## Roll back a failed live release

Rollback is a new, reviewed change—not a force-push or a manual edit to the
published site. Identify the bad change from the successful `site-contract`
run and its merge commit. Open a revert pull request for that merge commit
(using GitHub's **Revert** action where available, or a branch with
`git revert -m 1 <merge-commit-sha>`), then let the normal pull-request checks
run. Merge the revert PR only when its checks are green. The merge to `main`
triggers the same gated Pages workflow and production verification.

Confirm the revert commit's `site-contract` run is successful, especially the
deploy job and its live production-verifier step. If it fails, do not claim the
rollback succeeded: inspect the run and current live state, fix the cause in a
new PR, and repeat the gated process. Do not force-push, bypass checks, or
manually publish an artifact. If the rollback itself must be undone after the
site is healthy, submit a separate reviewed PR that reverts the rollback commit
and verify that release through the same workflow.

## Release notes

Release notes are caught up after publication by the estate's release-notes
lane. See [`.github/RELEASING.md`](.github/RELEASING.md) for that process and
its manual recovery procedure. Release notes do not replace the production
verification gate.
