#!/usr/bin/env node
// Copies package.json's version into .claude-plugin/plugin.json and
// .cursor-plugin/plugin.json. With --check, exits 1 if any differ.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(
  readFileSync(join(repo, "package.json"), "utf8"),
);

const targets = [
  join(repo, ".claude-plugin", "plugin.json"),
  join(repo, ".cursor-plugin", "plugin.json"),
];

const check = process.argv.includes("--check");
let mismatched = false;

for (const pluginPath of targets) {
  const source = readFileSync(pluginPath, "utf8");
  const plugin = JSON.parse(source);

  if (plugin.version === version) {
    console.log(`${pluginPath}: ${version} — already in sync`);
    continue;
  }

  if (check) {
    console.error(
      `${pluginPath}: version is ${plugin.version}, package.json is ${version}`,
    );
    mismatched = true;
    continue;
  }

  const updated = source.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`);
  if (JSON.parse(updated).version !== version) {
    console.error(`Could not find a version field to replace in ${pluginPath}`);
    process.exit(1);
  }
  writeFileSync(pluginPath, updated);
  console.log(`${pluginPath}: synced to ${version}`);
}

if (check && mismatched) {
  console.error("Run `npm run sync-plugin-version` to fix.");
  process.exit(1);
}
