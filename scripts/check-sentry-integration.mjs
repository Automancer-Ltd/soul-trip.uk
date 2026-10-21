#!/usr/bin/env node
// Verifies the released page's Sentry wiring end to end:
//   pinned local SDK source -> SRI recomputed from the exact served bundle bytes ->
//   active/inert DSN posture -> privacy controls in assets/js/sentry-init.js.
//
// Offline test seam: setting SENTRY_SDK_FIXTURE to a file path substitutes synthetic
// bytes for the pinned local bundle, keeping the negative-control suite deterministic.

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { repoRoot, scanHtml } from "./site-contract-lib.mjs";

const PINNED_SDK_URL = "assets/js/vendor/sentry-10.66.0.bundle.min.js";
const PINNED_INIT_SRC = "assets/js/sentry-init.js";

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

// Mode and --root are order-independent; omitting the mode keeps the historical
// production default (--expect-active).
const modeFlags = process.argv.slice(2).filter((a) => a === "--expect-active" || a === "--expect-inert");
const knownArgs = new Set(["--expect-active", "--expect-inert", "--root"]);
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--root") knownArgs.add(process.argv[i + 1] ?? "");
}
const unknownFlags = process.argv.slice(2).filter((a) => !knownArgs.has(a));
if (modeFlags.length > 1 || unknownFlags.length) {
  console.error("Usage: node scripts/check-sentry-integration.mjs [--expect-active|--expect-inert] [--root <dir>]");
  process.exit(2);
}
const mode = modeFlags[0] ?? "--expect-active";

const root = path.resolve(argValue("--root") ?? repoRoot());

async function loadSdkBytes() {
  const fixturePath = process.env.SENTRY_SDK_FIXTURE;
  if (fixturePath) {
    try {
      return await readFile(fixturePath);
    } catch (error) {
      throw new Error(`SENTRY_SDK_FIXTURE "${fixturePath}" could not be read: ${error.message}`);
    }
  }
  try {
    return await readFile(path.join(root, PINNED_SDK_URL));
  } catch (error) {
    throw new Error(`Pinned local Sentry SDK could not be read: ${error.message}`);
  }
}

const failures = [];
function fail(message) {
  failures.push(message);
}

const index = await readFile(path.join(root, "index.html"), "utf8").catch(() => null);
if (index === null) {
  console.error(`check-sentry-integration: fatal: index.html not found under ${root}`);
  process.exit(2);
}

const { tags } = scanHtml(index);
const loader = tags.find((t) => t.name === "script" && t.attrs.id === "sentry-sdk");

// Stage 1: purely local assertions, ordered so each direction fails on its own named
// diagnostic and network conditions can never mask or mix causes.

if (!loader) {
  fail('Sentry loader <script id="sentry-sdk"> missing from index.html');
} else {
  if (loader.attrs.src !== PINNED_SDK_URL) {
    fail(`Sentry SDK is not pinned to ${PINNED_SDK_URL} (found "${loader.attrs.src ?? ""}")`);
  }
  const integrity = loader.attrs.integrity;
  if (typeof integrity !== "string" || !integrity.startsWith("sha384-")) {
    fail("Sentry SDK script has no sha384 subresource-integrity attribute");
  }

  const dsn = loader.attrs["data-dsn"];
  if (mode === "--expect-active") {
    if (typeof dsn !== "string" || !dsn.startsWith("https://")) {
      fail("Expected an active production browser DSN, but none was present.");
    } else if (!/^https:\/\/[^@/:]+@o\d+\.ingest(?:\.[a-z0-9-]+)*\.sentry\.io\/\d+$/i.test(dsn)) {
      fail("The active Sentry DSN is not a valid browser ingest DSN.");
    }
  } else if (dsn) {
    fail("Expected an inert pre-release page, but the Sentry DSN is active.");
  }
}

if (!tags.some((t) => t.name === "script" && t.attrs.src === PINNED_INIT_SRC)) {
  fail(`index.html does not reference ${PINNED_INIT_SRC}`);
}

const init = await readFile(path.join(root, PINNED_INIT_SRC), "utf8").catch(() => null);
if (init === null) {
  fail(`${PINNED_INIT_SRC} could not be read; privacy wiring unverifiable`);
} else {
  const requiredPrivacyControls = [
    "sendDefaultPii: false",
    "tracesSampleRate: 0",
    "profilesSampleRate: 0",
    "maxBreadcrumbs: 0",
    'integration.name !== "Breadcrumbs"',
    'integration.name !== "BrowserSession"',
    "beforeBreadcrumb",
    "beforeSend",
    "delete event.request",
    "delete event.user",
    "delete event.breadcrumbs",
    "delete event.contexts",
    "delete event.extra",
    "delete event.tags"
  ];
  for (const value of requiredPrivacyControls) {
    if (!init.includes(value)) fail(`Missing Sentry privacy control: ${value}`);
  }
}

// Stage 2: the one fetch-dependent assertion. The declared SRI is compared against a
// fresh sha384 of the exact bytes served at the pinned URL (or the offline fixture),
// so a tampered bundle or a stale/forged integrity attribute cannot both pass.
let sdkBytes = null;
try {
  sdkBytes = await loadSdkBytes();
} catch (error) {
  fail(error.message);
}
if (sdkBytes !== null && loader) {
  const integrity = loader.attrs.integrity;
  if (typeof integrity === "string" && integrity.startsWith("sha384-")) {
    const computed = `sha384-${createHash("sha384").update(sdkBytes).digest("base64")}`;
    if (integrity !== computed) {
      fail(
        `Declared SRI "${integrity}" does not match the sha384 of the bytes served at the pinned SDK URL (computed "${computed}")`
      );
    }
  }
}

if (failures.length) {
  console.error(`check-sentry-integration: ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `Sentry integration check passed: pinned SDK, ${mode === "--expect-active" ? "active browser DSN" : "inert pre-release DSN"}, and privacy controls verified${process.env.SENTRY_SDK_FIXTURE ? " (offline fixture seam)" : ""}.`
);
