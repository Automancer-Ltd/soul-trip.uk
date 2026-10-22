---
name: verify-soul-trip-uk
description: Drive and verify the real soul-trip.uk site: the enquiry form in a browser on a local copy, and the live site against the repo. Use to prove a change to the page works before or after release.
---

# Verify `soul-trip.uk`

Static site, no build: the repo root is what visitors get. Two surfaces, one journey each (see [`features/INDEX.md`](features/INDEX.md)).

## Launch and drive

```bash
.agents/skills/verify-soul-trip-uk/scripts/drive-enquiry.sh [evidence-dir]
```

Serves the repo root on a random `127.0.0.1` port, opens it with `agent-browser`, fills and submits the enquiry form with `fetch` stubbed (nothing is sent to Formspree), and requires the success panel and exactly one POST to the live enquiry form URL. Run it on auto-vps: auto-vault has no `agent-browser`.

## Doctor

`checkq -- ./scripts/check` (about 20 s) is the read-only "is this tree sound" check, the same command CI runs. Run it first when anything looks off.

## Evidence

`enquiry-success.png` (success panel) and `enquiry-requests.txt` (the POST target) land in the evidence dir, default `$TMPDIR/soul-trip-evidence`. They survive cleanup.

## Live site

```bash
node scripts/verify-production.mjs --base https://soul-trip.uk/ --verbose
```

Requires the live manifest to equal this tree's and hashes every served file. CI's `deploy` job runs it after publishing, so a green run on `main` already proves production serves that commit.

## Telemetry

Unresolved browser errors (the Sentry project id is the last path segment of `data-dsn` in `index.html`; enquiry failures arrive as `EnquirySubmit*` with no visitor data):

```bash
executor-tool run 'const r = await tools["sentry-guarded"].events.listOrganizationIssues({path:{organization_id_or_slug:"automancer"}, query:{project:[<project id>], statsPeriod:"7d", query:"is:unresolved"}}); return (r.value??r).map(i=>[i.shortId,i.title,i.count])'
```

Uptime (UptimeRobot monitor on `https://soul-trip.uk/`):

```bash
executor-tool run 'return (await tools["uptimerobot-guarded"]["list-monitors"]({accountId:"acc_500886bf-27a8-4c23-8b8f-4d0a59d35c41", input:{url:"soul-trip.uk"}})).structuredContent.monitors'
```

`obs` does not know this site yet (tracker t6461); use it instead once registered. A local run never reports to Sentry: `drive-enquiry.sh` blocks the ingest host.

## Cleanup

The script's `trap` closes its `agent-browser` session and stops its server on every exit path, including failure.

## Red proof (22 Oct 2026)

Copy the tree to scratch and break the copy, then run the copy's script: mispointing the form `action` (`/f/enquiry` to `/f/enquirx`) fails on the POST target; changing `if (response.ok)` to `if (false)` in `assets/js/main.js` fails on the missing success panel. The unbroken tree passes.
