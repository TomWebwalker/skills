---
name: setup-project-skills
description: Configure a repository so the generic workflow skills (start-issue, qa-local, finalize-feature) know its issue tracker, branching model, stack, and quality gates. Works for any language or framework. Use when onboarding these skills to a new repo, or when their assumptions don't match the project.
---

This skill writes per-repo configuration that the generic workflow skills read at
runtime. It is **prompt-driven**: detect what you can, show findings, confirm with
the user, then write the files. Do not silently guess — confirm each axis.

The configuration lives in four files under `docs/agents/` in the **target repo**
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

2. **Confirm.** Present what you detected per axis and ask the user to correct
   anything. Resolve at minimum: tracker type + id pattern + status names; base
   branch + branch pattern + PR target; language + layout + source paths + qa mode +
   the command map; commit convention + which gates CI enforces. Say explicitly which
   values you are leaving empty and why.

3. **Write `docs/agents/`.** Create the four files from the bundled `templates/`,
   substituting confirmed values into the frontmatter and rewriting the prose body to
   describe *this* repo. Delete the "Worked examples" and "Adapting" sections — they
   belong to the template, not to the generated config:
   - `docs/agents/issue-tracker.md`
   - `docs/agents/vcs.md`
   - `docs/agents/stack.md`
   - `docs/agents/quality-gates.md`

4. **Write the pointer block.** Add (or update) an `## Agent skills` section in
   `CLAUDE.md` (or `AGENTS.md` if that's what the repo uses):

   ```markdown
   ## Agent skills

   Workflow skills read their configuration from `docs/agents/`:
   - `issue-tracker.md` — how to fetch/update/comment on tickets
   - `vcs.md` — base branch, branch naming, PR target
   - `stack.md` — language, commands, QA mode, fix agent
   - `quality-gates.md` — commit rules, pre-push checks, and /loop settings

   To re-run setup: `/setup-project-skills`.
   ```

5. **Verify.** Before reporting, dry-run the cheapest configured command (e.g.
   `commands.lint` or `--version` on the toolchain) to confirm the command map is
   real, not aspirational. Report anything that failed instead of leaving it to be
   discovered mid-workflow.

6. **Report.** Summarize the four files, note which steps the workflow skills will
   skip given the config (no tracker → no ticket steps; `qa_mode: none` → no manual
   QA; empty `dev` → qa-local can't serve the app). If `/loop` will be used, say
   whether the configured builder/checker subagents are actually installed — if not,
   it runs both roles inline, which works but shares this conversation's context.

## Notes

- Idempotent: if `docs/agents/*.md` already exist, read them, show current values, and
  update in place rather than clobbering.
- Keep each file minimal and true to the repo — delete options that don't apply
  instead of leaving dead config.
- Prefer commands the repo already scripts (`make test`) over raw toolchain
  invocations, so config doesn't drift from what humans run.
