#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./site-contract-lib.mjs";

const root = repoRoot();
const readJson = async (name) => JSON.parse(await readFile(path.join(root, name), "utf8"));
const problems = [];

// The estate's deploy verification reads the github-pages deployment sha from here.
const deploy = await readJson("deploy.json");
if (deploy.kind !== "auto" || deploy.json_path !== "0.sha" || !String(deploy.url).includes("Automancer-Ltd/soul-trip.uk/deployments")) {
  problems.push('deploy.json must be kind "auto", json_path "0.sha", url the soul-trip.uk github-pages deployments');
}

// Without "push" the hourly release-notes lane skips this repo (AUT-12527).
if ((await readJson(".release-notes.json")).deployTrigger !== "push") {
  problems.push('.release-notes.json must set "deployTrigger": "push"');
}

if (problems.length) {
  for (const p of problems) console.error(`check-meta: ${p}`);
  process.exit(1);
}
console.log("check-meta: deploy.json and .release-notes.json ok");
