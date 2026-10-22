#!/usr/bin/env bash
# Drive the real enquiry form in a browser against a local copy of the site.
# fetch is stubbed in the page, so no enquiry reaches the company.
# Usage: drive-enquiry.sh [evidence-dir]   (default: $TMPDIR/soul-trip-evidence)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OUT="${1:-${TMPDIR:-/tmp}/soul-trip-evidence}"
PORT="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])')"
export AGENT_BROWSER_SESSION="soul-trip-drive-$PORT"
mkdir -p "$OUT"

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" >/dev/null 2>&1 &
SERVER=$!
cleanup() { agent-browser close >/dev/null 2>&1 || true; kill "$SERVER" 2>/dev/null || true; }
trap cleanup EXIT

for _ in $(seq 20); do curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1 && break; sleep 0.25; done

agent-browser open "http://127.0.0.1:$PORT/"
# Stub fetch in the page: Formspree answers 200, and the POST target is recorded.
agent-browser eval 'window.__posts = []; window.fetch = (u, o) => { window.__posts.push([String(u), o.method]); return Promise.resolve(new Response("{}", { status: 200 })); }' >/dev/null
agent-browser select '#type' Umrah
agent-browser fill '#name' "Test Visitor"
agent-browser fill '#phone' "07000000000"
agent-browser fill '#email' "test@example.invalid"
agent-browser click '#submit-btn'
agent-browser wait '#form-success.is-visible'
agent-browser screenshot "$OUT/enquiry-success.png"
# The form must have sent exactly one POST, to the live Formspree enquiry form.
agent-browser eval 'JSON.stringify(window.__posts)' | tee "$OUT/enquiry-requests.txt"
grep -qF '[[\"https://formspree.io/p/3011773691026472174/f/enquiry\",\"POST\"]]' "$OUT/enquiry-requests.txt"
echo "enquiry journey: PASS (evidence in $OUT)"
