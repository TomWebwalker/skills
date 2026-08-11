# Changelog

All notable changes to this skill set are documented here. Version numbers live in
`package.json` and are synced into `.claude-plugin/plugin.json` and
`.cursor-plugin/plugin.json` via `npm run sync-plugin-version`.

## 1.0.0

### Added

- Plugin manifests for Claude Code (`.claude-plugin/`) and Cursor (`.cursor-plugin/`),
  with explicit `skills` and `agents` path lists.
- Config-driven delivery skills: `setup-project-skills`, `start-issue`,
  `verify-feature`, `qa-local`, `loop`, `finalize-feature`.
- `builder` and `checker` agents for the build-verify loop.
- Topology-aware companion knowledge in `/loop`.
- `/qa-local` handoff on green before offering `/finalize-feature`.
- `package.json` version source of truth, `scripts/sync-plugin-version.mjs`,
  layout validation, and a GitHub Actions `Validate` workflow.
- `CHANGELOG.md`.

### Changed

- Orchestrator skills (`setup-project-skills`, `start-issue`, `loop`, `qa-local`,
  `finalize-feature`) set `disable-model-invocation: true` so they only run when
  explicitly invoked. `verify-feature` stays model-invoked for `/loop`'s checker.
- README documents the dual-install rule: pick plugin **or** skills.sh, not both.