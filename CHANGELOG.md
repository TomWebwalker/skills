# Changelog

All notable changes to this skill set are documented here. Version numbers live in
`package.json` and are synced into `.claude-plugin/plugin.json` and
`.cursor-plugin/plugin.json` via `npm run sync-plugin-version`.

## Unreleased

### Added

- `/retro` skill (user-invoked): routes session lessons to the strongest fix — design
  change > lint rule or test > gate > `docs/agents/` config > skill text — and applies
  only approved proposals. Inspired by Matt Pocock's `/retro` and Lauren Tan's
  `/reflect`.
- Layout check fails when a `skills/` or `agents/` entry on disk is missing from either
  manifest, or a skill is in neither (or both) invocation lists.
- README "Inspired by" section.
- App verification: `/setup-project-skills` can generate a project-local
  `verify-<app>` skill (template `templates/verify-app.md`) that starts the app,
  drives changed flows per `qa_mode` (Playwright / `curl` / pseudo-terminal), runs an
  adversarial input pass, and saves evidence. New optional key
  `quality-gates.md#app_verify: { enabled, skill }`; when enabled, `/verify-feature`
  runs it as the last gate. Inspired by pstack `create-verification-skill` and Emil
  Kowalski's break-it testing.
- `reviewer` agent: read-only. After `ALL GREEN`, `/loop` dispatches it twice in
  parallel, once on the **standards** axis (`docs/agents/standards.md`) and once on
  the **spec** axis (the ticket). Findings go back to the builder as a normal cycle.
  New key `loop.reviewer_agent` (`''` = skip). Inspired by Matt Pocock's
  `/code-review`.
- `docs/agents/standards.md` template plus example standards for all three example
  configs. Rules are tagged `judgment` or `mechanical` (candidates for lint).

### Changed

- `builder` must not read `standards.md`. `/loop` keeps it out of every brief.
- `/loop` also loads `issue-tracker.md` (for the spec review) and stops when the same
  review finding repeats or the builder disputes a finding.

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