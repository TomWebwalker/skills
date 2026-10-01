#!/usr/bin/env node
// Copies package.json's version into .claude-plugin/plugin.json,
// .cursor-plugin/plugin.json, and this plugin's entry in
// .cursor-plugin/marketplace.json. With --check, exits 1 if any differ.
// (.claude-plugin/marketplace.json has no version: Claude reads plugin.json.)

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const { name, version } = JSON.parse(
  readFileSync(join(repo, "package.json"), "utf8"),
);

// Each target returns the object whose `version` field should match.
const targets = [
  { path: join(repo, ".claude-plugin", "plugin.json"), find: (json) => json },
  { path: join(repo, ".cursor-plugin", "plugin.json"), find: (json) => json },
  {
    path: join(repo, ".cursor-plugin", "marketplace.json"),
    find: (json) => json.plugins?.find((plugin) => plugin.name === name),
  },
];

const check = process.argv.includes("--check");
let mismatched = false;

for (const { path, find } of targets) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  const entry = find(json);

  if (!entry || typeof entry.version !== "string") {
    console.error(`Could not find a version field for ${name} in ${path}`);
    process.exit(1);
  }

  if (entry.version === version) {
    console.log(`${path}: ${version} — already in sync`);
    continue;
  }

  if (check) {
    console.error(`${path}: version is ${entry.version}, package.json is ${version}`);
    mismatched = true;
    continue;
  }

  entry.version = version;
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${path}: synced to ${version}`);
}

if (check && mismatched) {
  console.error("Run `npm run sync-plugin-version` to fix.");
  process.exit(1);
}
