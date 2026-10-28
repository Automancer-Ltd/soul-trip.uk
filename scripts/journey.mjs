#!/usr/bin/env node
// User-harm journey for soul-trip.uk. Drives the real page in a browser against a local
// copy of the served tree (stage-site.mjs -> _site/). Synthetic and read-only: every
// non-local request is blocked, the Formspree POST is answered by a stub and recorded,
// so no enquiry reaches the company and nothing reaches Sentry or production.
// Usage: node scripts/journey.mjs [--out DIR]
// Env: PLAYWRIGHT_CORE_DIR (directory whose node_modules holds playwright-core),
//      CHROME_PATH (optional browser executable; default: Playwright "chrome" channel).
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const OUT = resolve(outArg > 0 ? process.argv[outArg + 1] : join(tmpdir(), "soul-trip-journey"));
mkdirSync(OUT, { recursive: true });
const FORM_URL = "https://formspree.io/p/3011773691026472174/f/enquiry";
const STEP_MS = 10000;

const { chromium } = createRequire(resolve(process.env.PLAYWRIGHT_CORE_DIR || ROOT) + "/")("playwright-core");

execFileSync("node", [join(ROOT, "scripts/stage-site.mjs")], { stdio: "inherit", timeout: 60000 });
const SITE = join(ROOT, "_site");
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer((rq, rs) => {
  const p = decodeURIComponent(new URL(rq.url, "http://x").pathname);
  let f = resolve(SITE, "." + (p.endsWith("/") ? p + "index.html" : p));
  try {
    if (!f.startsWith(SITE) || !statSync(f).isFile()) throw new Error("nf");
    rs.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
    rs.end(readFileSync(f));
  } catch { rs.writeHead(404); rs.end("not found"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : " :: " + detail}`); };

const browser = await chromium.launch({
  headless: true, timeout: 30000,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }),
});

// mode: "ok" | "fail" | "abort"
async function newPage(viewport, mode) {
  const ctx = await browser.newContext({ viewport, serviceWorkers: "block" });
  ctx.setDefaultTimeout(STEP_MS);
  const page = await ctx.newPage();
  const posts = [], problems = [];
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) problems.push("console: " + m.text()); });
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE)) return route.continue();
    if (u === FORM_URL && route.request().method() === "POST") {
      posts.push({ body: route.request().postData() || "" });
      if (mode === "abort") return route.abort("failed");
      return route.fulfill({ status: mode === "fail" ? 500 : 200, contentType: "application/json", body: "{}" });
    }
    return route.abort("blockedbyclient"); // Sentry, fonts, anything else: never leaves the box
  });
  await page.goto(BASE, { waitUntil: "load", timeout: 30000 });
  return { ctx, page, posts, problems };
}
async function fillForm(page) {
  await page.selectOption("#type", { label: "Umrah" }).catch(() => page.selectOption("#type", "Umrah"));
  await page.fill("#name", "Test Visitor");
  await page.fill("#phone", "07000000000");
  await page.fill("#email", "test@example.invalid");
  await page.fill("#message", "Synthetic journey check");
}
const visible = (page, sel) => page.locator(sel).first().isVisible();

try {
  // 1. Landing page renders on desktop and mobile: no JS errors, nothing off-screen, form reachable.
  for (const [label, vp] of [["desktop", { width: 1366, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const { ctx, page, problems } = await newPage(vp, "ok");
    check(`${label}: page title present`, (await page.title()).trim().length > 0);
    check(`${label}: header and enquiry form exist`, (await page.locator("#nav").count()) === 1 && (await page.locator("#enquiry-form").count()) === 1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${label}: no horizontal overflow`, overflow <= 1, `overflow ${overflow}px`);
    await page.locator("#enquiry").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // reveal animations
    check(`${label}: submit button visible and enabled`, (await visible(page, "#submit-btn")) && (await page.locator("#submit-btn").isEnabled()));
    const shotTop = await page.screenshot({ path: join(OUT, `${label}-enquiry.png`) });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const shot = await page.screenshot({ path: join(OUT, `${label}-top.png`) });
    // A blank or failed render compresses to almost nothing; real pages do not.
    check(`${label}: screenshots are not blank`, shot.length > 15000 && shotTop.length > 15000, `${shot.length}/${shotTop.length} bytes`);
    check(`${label}: no page errors`, problems.length === 0, problems.join(" | "));
    await ctx.close();
  }

  // 2. Success: exactly one POST to the live form id, success shown, no error shown.
  {
    const { ctx, page, posts } = await newPage({ width: 1366, height: 900 }, "ok");
    await fillForm(page);
    await page.click("#submit-btn");
    await page.waitForSelector("#form-success.is-visible", { timeout: STEP_MS });
    check("success: exactly one POST to the enquiry form", posts.length === 1, `${posts.length} posts`);
    check("success: details were sent", /Test\+Visitor|Test%20Visitor|Test Visitor/.test(posts[0]?.body || "") && /07000000000/.test(posts[0]?.body || ""));
    check("success: error box stays hidden", !(await visible(page, "#form-error.is-visible")));
    await page.screenshot({ path: join(OUT, "enquiry-success.png") });
    await ctx.close();
  }

  // 3. Failure (server 500 and network abort): visitor is told, keeps their text, can retry or call.
  for (const mode of ["fail", "abort"]) {
    const { ctx, page, posts } = await newPage({ width: 390, height: 844 }, mode);
    await fillForm(page);
    await page.click("#submit-btn");
    await page.waitForSelector("#form-error.is-visible", { timeout: STEP_MS });
    check(`${mode}: error shown, success not shown`, !(await visible(page, "#form-success.is-visible")));
    check(`${mode}: typed details kept`, (await page.inputValue("#name")) === "Test Visitor" && (await page.inputValue("#phone")) === "07000000000" && (await page.inputValue("#message")) === "Synthetic journey check");
    check(`${mode}: can retry (button re-enabled)`, await page.locator("#submit-btn").isEnabled());
    const links = await page.locator("#form-error .form-recovery a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    check(`${mode}: WhatsApp, email and phone fallbacks present`, links.some((h) => /^https:\/\/wa\.me\/\d+/.test(h)) && links.some((h) => /^mailto:info@soul-trip\.uk$/.test(h)) && links.some((h) => /^tel:\+\d+/.test(h)), links.join(","));
    check(`${mode}: exactly one attempt sent`, posts.length === 1, `${posts.length}`);
    await page.screenshot({ path: join(OUT, `enquiry-${mode}.png`) });
    await ctx.close();
  }

  // 4. Required fields and honeypot: nothing is sent for an empty form or a bot-filled one.
  {
    const { ctx, page, posts } = await newPage({ width: 1366, height: 900 }, "ok");
    await page.click("#submit-btn");
    await page.waitForTimeout(800);
    check("empty form: nothing sent", posts.length === 0, `${posts.length}`);
    await fillForm(page);
    await page.evaluate(() => { document.querySelector('input[name="_gotcha"]').value = "bot"; });
    await page.click("#submit-btn");
    await page.waitForTimeout(1200);
    check("honeypot filled: nothing sent", posts.length === 0, `${posts.length}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`journey: ${results.length - failed.length}/${results.length} passed (evidence in ${OUT})`);
process.exit(failed.length ? 1 : 0);
