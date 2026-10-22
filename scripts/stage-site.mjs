#!/usr/bin/env node
// Copies exactly the served tree into _site/ for the Pages artifact.
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { repoRoot, listIntendedServedFiles } from "./site-contract-lib.mjs";

const root = repoRoot();
const out = path.join(root, "_site");
await rm(out, { recursive: true, force: true });
const served = await listIntendedServedFiles(root);
for (const rel of served) {
  await mkdir(path.dirname(path.join(out, rel)), { recursive: true });
  await cp(path.join(root, rel), path.join(out, rel));
}
console.log(`stage-site: ${served.length} files in ${out}`);
