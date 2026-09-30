---
name: setup-project-skills
description: Set up a repo for the delivery skills — detect, confirm, and write docs/agents/ config (issue tracker, branching, stack, quality gates, review standards, topology). Run once per repo, before the other skills.
disable-model-invocation: true
---

This skill writes per-repo configuration that the generic workflow skills read at
runtime. It is **prompt-driven**: detect what you can, show findings, confirm with
the user, then write the files. Do not silently guess — confirm each axis.

The configuration lives in six files under `docs/agents/` in the **target repo**
(the current working directory), plus a pointer block in `CLAUDE.md`/`AGENTS.md`.
Annotated schemas for each file are bundled at `templates/` next to this SKILL.md —
read them first; they define every key the skills depend on, and each ends with
worked examples across several ecosystems.

**Stay stack-neutral while detecting.** This repo may be backend, frontend, a CLI, a
library, or none of those, in any language. Do not assume Node, a browser, or a
particular tracker. If a key doesn't apply (no dev server, no duplication check, no
tracker), write the empty/`false`/`none` value rather than inventing something.

## Steps

1. **Detect.** Inspect the repo without writing anything yet.

   *Language and package manager* — look for the manifest that exists:

   | file | language / manager |
   |---|---|
   | `package.json` (+ `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb`) | JS/TS |
   | `pyproject.toml`, `requirements*.txt`, `Pipfile`, `uv.lock`, `poetry.lock` | Python |
   | `go.mod` | Go |
   | `Cargo.toml` | Rust |
   | `pom.xml`, `build.gradle{,.kts}` | JVM |
   | `*.csproj`, `*.sln`, `Directory.Build.props` | .NET |
   | `Gemfile` | Ruby |
   | `composer.json` | PHP |
   | `mix.exs`, `Package.swift`, `pubspec.yaml`, `CMakeLists.txt`, `Makefile` | Elixir / Swift / Dart / C++ / make |

   Read the manifest's script/task section (npm `scripts`, `Makefile` targets,
   `pyproject` tool sections, Gradle tasks, `justfile`, `Taskfile.yml`) for the real
   install/dev/test/lint/build commands. Prefer a `Makefile`/`justfile` target over
   guessing a raw toolchain command when one exists.

   *Layout and source paths* — monorepo markers (`nx.json`, `turbo.json`, `pnpm-workspace.yaml`,
   `go.work`, Cargo workspace, Gradle multi-project) vs a single app. Derive
   `source_paths` from where first-party code actually lives (`src`, `app`, `lib`,
   `cmd`, `internal`, `pkg`, `apps`+`libs`, `src/main/java`).

   *QA mode* — is there a UI to click (`qa_mode: browser`), an HTTP surface
   (OpenAPI spec, route files, `Dockerfile` exposing a port → `api`), a binary entry
   point (`cmd/`, `bin/`, console-script entry → `cli`), or is it a library with no
   manual QA (`none`)?

   *Topology* — does this repo own both UI and API (`full-stack`), only the UI
   (`frontend`), only the API/service (`backend`), or neither (`standalone` for a
   CLI/library/infra)? Heuristics: UI framework deps with no server routes →
   frontend; HTTP framework / OpenAPI with no UI app → backend; both present in
   one tree → full-stack; binary/`cmd/`/library layout → standalone. Look for
   sibling checkouts next to this repo (`../…-backend`, `../…-frontend`,
   `../…-api`, `../…-ui`) and README links to a companion remote.

   *Services* — `docker-compose.y*ml`, `compose.y*ml`, dev container config, or a
   `Makefile` target that starts dependencies.

   *Issue tracker* — tracker references in `CLAUDE.md`/`AGENTS.md`, README, PR and
   issue templates, recent branch names, `.github/` config; and which tracker MCP
   tools or CLIs (`gh`, `glab`, `jira`) are actually available in this session.

   *VCS* — `git symbolic-ref refs/remotes/origin/HEAD` and `git branch -a` for the
   base branch; `git log --oneline -30 --format=%s` and recent branch names for the
   commit and branch conventions actually in use.

   *Quality gates* — CI workflow files are the source of truth (`.github/workflows/`,
   `.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml`). Also check
   `.pre-commit-config.yaml`, `.husky/`, `lefthook.yml`, `commitlint.config.*`,
   `.gitlint`, and any Sonar/Qodana config. **Gates should mirror what CI runs** —
   nothing more, nothing less.

   *Review standards* — `CONTRIBUTING.md`, style guides under `docs/`, conventions
   in `CLAUDE.md`/`AGENTS.md`, and recurring themes in recent PR review comments
   (`gh pr list --state merged -L 20` then `gh pr view <n> --comments`). Drop
   anything a linter or formatter in the gates already enforces. Always keep one rule
   that a behavior change comes with a test that fails without it (the template's
   `S4`) — without it the reviewer has nothing to cite when new behavior ships with
   only end-to-end coverage.

2. **Confirm.** Present what you detected per axis and ask the user to correct
   anything. Resolve at minimum: tracker type + id pattern + status names; base
   branch + branch pattern + PR target; language + layout + source paths + qa mode +
   the command map; **topology role** (full-stack / frontend / backend / standalone)
   and, when the role is frontend or backend, the companion path and/or URL; commit
   convention + which gates CI enforces; the proposed `standards.md` rules, each
   tagged `judgment` or `mechanical`. Say explicitly which values you are leaving
   empty and why.

   For topology, ask explicitly — do not infer this alone from `qa_mode`:

   - Is this a **full-stack** repo (UI and API in one tree)?
   - Or a **frontend** repo? If yes: where is the backend/API repo (local path and,
     optionally, remote URL)?
   - Or a **backend** repo? If yes: where is the frontend/UI repo (local path and,
     optionally, remote URL)?
   - Or **standalone** (CLI, library, infra — no UI/API sibling)?

3. **Write `docs/agents/`.** Create the six files from the bundled `templates/`,
   substituting confirmed values into the frontmatter and rewriting the prose body to
   describe *this* repo. Delete the "Worked examples" and "Adapting" sections — they
   belong to the template, not to the generated config:
   - `docs/agents/issue-tracker.md`
   - `docs/agents/vcs.md`
   - `docs/agents/stack.md`
   - `docs/agents/quality-gates.md`
   - `docs/agents/topology.md`
   - `docs/agents/standards.md` — the reviewer reads it; the builder never does

4. **Generate app verification (optional).** Skip when `qa_mode` is `none`, or when
   the app can't be started (`commands.dev` empty and, for `cli`, `commands.build`
   empty too). Otherwise offer to write a project-local skill that proves the app
   works, not just that its tests pass:
   - Name it `verify-<app>` after the app (`verify-web`, `verify-api`, `verify-tool`)
     and write it to `.claude/skills/verify-<app>/SKILL.md` in the target repo from
     the bundled `templates/verify-app.md`.
   - Write its **committed harness**, `e2e/verify-<app>.mjs`, as the template's "The
     harness" section describes: one function per check, the fixed hostile pass, and a
     `--self-test` mode. Tailor the checks to the screens, endpoints, or flags this app
     has. Whoever runs verification later only runs this file — nobody writes checks
     on the fly, because on-the-fly checks tend to pass by construction.
   - Fill in the real start command and the readiness check (a health URL, a port, or a
     log line — find it in the code, don't guess).
   - For `browser`, the harness needs `playwright` as a devDependency. Ask before
     adding it; if the user declines, set `app_verify.enabled: false`.
   - **Prove it can fail:** run `--self-test` and confirm every check fails on its bad
     fixture. A check that passes a bad fixture is rewritten before setup continues.
   - On yes, set `quality-gates.md#app_verify` to `{ enabled: true, skill: verify-<app> }`.
     On no, write `enabled: false` and move on.

5. **Write the pointer block.** Add (or update) an `## Agent skills` section in
   `CLAUDE.md` (or `AGENTS.md` if that's what the repo uses):

   ```markdown
   ## Agent skills

   Workflow skills read their configuration from `docs/agents/`:
   - `issue-tracker.md` — how to fetch/update/comment on tickets
   - `vcs.md` — base branch, branch naming, PR target
   - `stack.md` — language, commands, QA mode, fix agent
   - `quality-gates.md` — commit rules, pre-push checks, and /loop settings
   - `topology.md` — full-stack vs split UI/API, and where the companion repo lives
   - `standards.md` — review rules for the reviewer agent (builders don't read it)

   To re-run setup: `/setup-project-skills`.
   ```

6. **Verify.** Before reporting, dry-run the cheapest configured command (e.g.
   `commands.lint` or `--version` on the toolchain) to confirm the command map is
   real, not aspirational. If a `verify-<app>` skill was generated, run it once so
   the readiness check is proven before `/verify-feature` depends on it. Report
   anything that failed instead of leaving it to be discovered mid-workflow. If `topology.md` names a companion `path`, check that it
   exists on disk; if missing, note that `/loop` will fall back to `url`.

7. **Report.** Summarize the six files, note which steps the workflow skills will
   skip given the config (no tracker → no ticket steps; `qa_mode: none` → no manual
   QA; empty `dev` → qa-local can't serve the app; `app_verify.enabled: false` → no
   end-to-end gate; `topology.role` full-stack or
   standalone → `/loop` skips companion knowledge). If `/loop` will be used, say
   whether the configured builder/checker subagents are actually installed — if not,
   it runs both roles inline, which works but shares this conversation's context.
   Same for `reviewer`: with `loop.reviewer_agent` set but the agent missing, review
   runs inline. Name the `mechanical` standards as candidates for a lint rule.

## Notes

- Idempotent: if `docs/agents/*.md` already exist, read them, show current values, and
  update in place rather than clobbering.
- Shared files: other skill sets write `docs/agents/` too — mattpocock/skills' setup
  writes a prose-only `issue-tracker.md` (and `domain.md`, `triage-labels.md`). When
  an existing file has no YAML frontmatter, **merge**: add this skill's frontmatter
  on top and append any of the four procedure sections it lacks, keeping every
  existing section as it is. Never delete a section or a file you didn't write.
- Keep each file minimal and true to the repo — delete options that don't apply
  instead of leaving dead config.
- Prefer commands the repo already scripts (`make test`) over raw toolchain
  invocations, so config doesn't drift from what humans run.
