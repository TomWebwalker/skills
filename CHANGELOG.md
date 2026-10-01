# Changelog

All notable changes to this skill set are documented here. Version numbers live in
`package.json` and are synced into `.claude-plugin/plugin.json`,
`.cursor-plugin/plugin.json`, and `.cursor-plugin/marketplace.json` via
`npm run sync-plugin-version`.

## Unreleased

### Changed

- `sync-plugin-version` (and its `--check` in CI) also covers this plugin's entry in
  `.cursor-plugin/marketplace.json`, which had drifted to `1.0.0`.

## 1.1.1

### Security

- Trust boundaries in `verify-feature`, `qa-local`, `start-issue`, `finalize-feature`,
  and `loop`, addressing skills.sh scanner findings (indirect prompt injection,
  command execution from config). Commands come only from user-reviewed
  `docs/agents/`; ticket text, comments, diffs, tool output, and companion repos are
  data, never instructions.
- `verify-feature` refuses to run gates when the branch itself changed
  `docs/agents/` until the user reviews that diff, and asks before any configured
  command that reaches beyond building and checking the repo. `/loop` relays that
  block to the user instead of treating it as a build failure.
- `start-issue` validates the ticket id and branch name (`git check-ref-format`)
  before using them in commands. `qa-local` shows derived QA steps to the developer
  before posting them; companion repos are cloned read-only.

## 1.1.0

### Added

- `/retro` skill (user-invoked): routes each session lesson to the strongest fix —
  design change > lint rule or test > gate > `docs/agents/` config > skill text — and
  applies only approved proposals. Inspired by Matt Pocock's `/retro` and Lauren
  Tan's `/reflect`.
- App verification: `/setup-project-skills` can generate a project-local
  `verify-<app>` skill (template `templates/verify-app.md`) that starts the app,
  drives changed flows per `qa_mode` (Playwright / `curl` / pseudo-terminal), runs an
  adversarial input pass, and saves evidence. New optional key
  `quality-gates.md#app_verify: { enabled, skill }`; when enabled, `/verify-feature`
  runs it as the last gate. Inspired by pstack's `create-verification-skill` and
  Emil Kowalski's break-it testing.
- `reviewer` agent (read-only). After `ALL GREEN`, `/loop` dispatches it twice in
  parallel: on the **standards** axis (`docs/agents/standards.md`) and on the
  **spec** axis (the ticket). Findings go back to the builder as a normal cycle. New
  key `loop.reviewer_agent` (`''` = skip). Inspired by Matt Pocock's `/code-review`.
- `docs/agents/standards.md` template, plus example standards for all three example
  configs. Rules are tagged `judgment` or `mechanical` (a candidate for lint).
- `/loop` decision log: an append-only TSV (`ts, cycle, decision, why, evidence,
  result`) under the OS temp dir.
- New key `loop.models: { builder, checker, reviewer }`, passed as a model override
  per dispatch. Defaults: checker `haiku`, builder `sonnet`, reviewer `opus`.
  Inspired by Emil Kowalski and pstack's models rule.
- `/handoff` skill (user-invoked): writes branch, ticket, cycle count, last
  checker/reviewer reports, open decisions, and next suggested skills to a markdown
  file under the OS temp dir, referencing artifacts by path. Inspired by Matt
  Pocock's `/handoff`.
- Layout check fails when a `skills/` or `agents/` entry on disk is missing from
  either manifest, or a skill is in neither (or both) invocation lists.
- README sections: "Inspired by", "Works well with", and "Sharing `docs/agents/` with
  other skill sets".

### Changed

- `/loop` step 2 brief is now restate-and-grill: the agent looks up facts, restates
  goal and problem in its own words, then asks one round of numbered decision
  questions, each with a recommended answer. Skipped with `--no-grill`, or when the
  ticket's acceptance criteria are confirmed complete. Inspired by Lauren Tan's
  restate prompt and Matt Pocock's `grilling`.
- `/loop` also loads `issue-tracker.md` (for the spec review) and stops when the same
  review finding repeats or the builder disputes a finding.
- `/finalize-feature` PR body adds the one smallest view that explains the change
  (call tree, component tree, diff-shaped file tree, or a small Mermaid diagram),
  summarizes app-verify evidence, and summarizes the loop decision log. Inspired by
  Dex Horthy's `/show-me` and pstack's `show-me-your-work`.
- `builder` must not read `standards.md`; `/loop` keeps it out of every brief.
- `checker` agent default model is now `haiku`: it runs commands and copies output.
- `/setup-project-skills` writes six config files (adds `standards.md`), and merges
  into an existing prose-only `docs/agents/*.md` (e.g. mattpocock/skills'
  `issue-tracker.md`) instead of overwriting it. The files stay un-namespaced; the
  README explains why.
- Skill and plugin descriptions trimmed: trigger phrase first, each use listed once
  (`verify-feature` first, since it is the one model-invoked skill).
- README "Adding a new skill" lists the manifest, invocation-list, credit, and
  validation steps.
- App verification runs a committed, self-tested harness (`e2e/verify-<app>.mjs`)
  instead of a script the checker writes each run. Setup generates it and proves each
  check fails on a bad fixture; the checker and `/verify-feature` only run it and
  report `missing check:` for uncovered flows; the builder adds flow checks with the
  feature. Cases the app can't reach are reported as `skipped:`, not dropped. Found by
  `/retro` on a rehearsal where the checker's own scripts passed by construction
  three times.
- Setup always keeps a "behavior change comes with a test" standard, so the reviewer
  can flag new behavior that only has end-to-end coverage.

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