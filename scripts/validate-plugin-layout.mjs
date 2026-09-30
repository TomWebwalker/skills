#!/usr/bin/env node
// Structural checks for the delivery-skills plugin that don't need the Claude CLI.
// - Every skills/agents path in both plugin manifests exists
// - Orchestrators declare disable-model-invocation: true
// - verify-feature does not
// - Every skills/<name>/ and agents/*.md on disk is listed in both manifests,
//   and every skill is in exactly one invocation list

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");

const USER_INVOKED = [
  "setup-project-skills",
  "start-issue",
  "loop",
  "qa-local",
  "finalize-feature",
  "retro",
];
const MODEL_INVOKED = ["verify-feature"];

const manifests = [
  join(repo, ".claude-plugin", "plugin.json"),
  join(repo, ".cursor-plugin", "plugin.json"),
];

const skillsOnDisk = readdirSync(join(repo, "skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const agentsOnDisk = readdirSync(join(repo, "agents")).filter((f) =>
  f.endsWith(".md"),
);

let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

for (const manifestPath of manifests) {
  const plugin = JSON.parse(readFileSync(manifestPath, "utf8"));
  const label = manifestPath.replace(repo + "/", "");

  for (const skillPath of plugin.skills ?? []) {
    const abs = join(repo, skillPath);
    const skillMd = join(abs, "SKILL.md");
    if (!existsSync(skillMd)) {
      fail(`${label}: missing ${skillPath}/SKILL.md`);
    }
  }

  for (const agentPath of plugin.agents ?? []) {
    const abs = join(repo, agentPath);
    if (!existsSync(abs)) {
      fail(`${label}: missing ${agentPath}`);
    }
  }

  for (const name of skillsOnDisk) {
    if (!(plugin.skills ?? []).includes(`./skills/${name}`)) {
      fail(`${label}: skills/${name} exists but is not listed in "skills"`);
    }
  }

  for (const file of agentsOnDisk) {
    if (!(plugin.agents ?? []).includes(`./agents/${file}`)) {
      fail(`${label}: agents/${file} exists but is not listed in "agents"`);
    }
  }
}

for (const name of skillsOnDisk) {
  const lists = [USER_INVOKED, MODEL_INVOKED].filter((l) => l.includes(name));
  if (lists.length !== 1) {
    fail(`${name}: must be in exactly one of USER_INVOKED / MODEL_INVOKED`);
  }
}

for (const name of USER_INVOKED) {
  const body = readFileSync(join(repo, "skills", name, "SKILL.md"), "utf8");
  const fm = body.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail(`${name}: missing frontmatter`);
    continue;
  }
  if (!/^disable-model-invocation:\s*true\s*$/m.test(fm[1])) {
    fail(`${name}: expected disable-model-invocation: true`);
  }
}

for (const name of MODEL_INVOKED) {
  const body = readFileSync(join(repo, "skills", name, "SKILL.md"), "utf8");
  const fm = body.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail(`${name}: missing frontmatter`);
    continue;
  }
  if (/^disable-model-invocation:\s*true\s*$/m.test(fm[1])) {
    fail(`${name}: must stay model-invoked (no disable-model-invocation)`);
  }
}

if (failed) process.exit(1);
console.log("Plugin layout OK");
