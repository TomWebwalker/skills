#!/usr/bin/env node
// Structural checks for the delivery-skills plugin that don't need the Claude CLI.
// - Every skills/agents path in both plugin manifests exists
// - Orchestrators declare disable-model-invocation: true
// - verify-feature does not

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");

const USER_INVOKED = [
  "setup-project-skills",
  "start-issue",
  "loop",
  "qa-local",
  "finalize-feature",
];
const MODEL_INVOKED = ["verify-feature"];

const manifests = [
  join(repo, ".claude-plugin", "plugin.json"),
  join(repo, ".cursor-plugin", "plugin.json"),
];

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
