# Skills That Travel Between Repos

[![Install with npx skills](https://img.shields.io/badge/install-npx%20skills-black?logo=npm)](https://www.skills.sh/TomWebwalker/skills)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Agent skills for everyday delivery work—config-driven, so the same commands work in
every repository you own, whatever it's built with.

Most workflow skills rot the moment you reuse them. They hardcode one issue tracker,
one branch name, one package manager—so `/start-issue` only works in the repo it was
written for. Copy it elsewhere and it lies about your tooling.

These skills separate the *process* (universal) from the *parameters* (per-repo). The
skill carries the steps; each repository supplies its own tooling knowledge through
small config files under `docs/agents/`. Onboard a repo once, and `/start-issue`,
`/verify-feature`, `/qa-local`, `/loop`, and `/finalize-feature` adapt to it—Linear,
GitHub Issues, Jira or nothing; `develop` or `main`; npm, uv, cargo, go or maven; a
browser UI, an HTTP API or a CLI; full-stack or a split UI/API with a companion repo.

**Nothing here assumes a language or a frontend.** The only hard requirements are
`git` and an agent that can run shell commands.

## Quickstart

1. Install the skills into your agent with the [`skills`](https://github.com/vercel-labs/skills) CLI:

   ```bash
   npx skills@latest add TomWebwalker/skills
   ```

   Select the skills and agent you want when prompted (or add `-g -y` for a
   non-interactive install). Use `--list` to preview, or `--skill <name>` to pick
   specific ones. Re-run the command later to pull updates.

   <details>
   <summary>Prefer to manage them yourself? Symlink instead.</summary>

   ```bash
   git clone https://github.com/TomWebwalker/skills.git ~/projects/claude-skills
   cd ~/projects/claude-skills
   for s in setup-project-skills start-issue qa-local verify-feature finalize-feature loop; do
     ln -sfn "$PWD/skills/$s" ~/.claude/skills/"$s"
   done
   ln -sfn "$PWD/agents/builder.md" ~/.claude/agents/builder.md
   ln -sfn "$PWD/agents/checker.md" ~/.claude/agents/checker.md
   ```

   </details>

2. In any repo you want to onboard, run **`/setup-project-skills`**. It will:
   - Detect and confirm your **issue tracker** (Linear, GitHub, Jira, GitLab, or none)
   - Detect and confirm your **branching model** (base branch, branch naming, PR target)
   - Detect and confirm your **stack** (language, package manager, commands, QA mode)
   - Detect and confirm your **topology** (full-stack, frontend, backend, or standalone —
     and where the companion API/UI repo lives when the stack is split)
   - Detect and confirm your **quality gates** (commit rules, pre-push checks)

   It reads whichever manifest your repo actually has—`package.json`, `pyproject.toml`,
   `go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, `Makefile`—and takes gates from your
   CI config so local checks mirror what CI enforces.

3. **Optional — install the subagents for `/loop`.** `npx skills` installs skills, not
   subagents, so copy the two bundled roles in yourself:

   ```bash
   mkdir -p ~/.claude/agents
   curl -sL https://raw.githubusercontent.com/TomWebwalker/skills/main/agents/builder.md -o ~/.claude/agents/builder.md
   curl -sL https://raw.githubusercontent.com/TomWebwalker/skills/main/agents/checker.md -o ~/.claude/agents/checker.md
   ```

   Skip it if you like — `/loop` runs both roles inline when the subagents are absent.
   Separate agents are better, though: the builder never sees the full gate output and
   the checker never sees the diff rationale, which is most of why the split works.

4. Ready to begin. Every skill now reads that config.

## Why These Skills Exist

A workflow skill encodes a *process*—commit, rebase, run gates, push, open a PR,
update the ticket. That process is the same everywhere. What changes between repos is
the *parameters*: which tracker, which branch, which commands. Hardcoding the
parameters into the process is what makes a skill non-portable.

### The seam: process is universal, parameters are per-repo

`setup-project-skills` writes config files into the target repo under
`docs/agents/`, plus a pointer block in `CLAUDE.md`/`AGENTS.md`. The other skills
*read* that config at runtime instead of assuming anything.

```
skills/                                    each onboarded repo/
  setup-project-skills/   ──writes──>        docs/agents/
  start-issue/            ──reads───>          issue-tracker.md   # tracker, ticket ids, statuses
  verify-feature/         ──reads───>          vcs.md             # base branch, branch naming, PR target
  qa-local/               ──reads───>          stack.md           # language, commands, QA mode
  finalize-feature/       ──reads───>          quality-gates.md   # commit rules, gates, loop settings
  loop/                   ──reads───>          topology.md        # full-stack vs companion UI/API
                                         CLAUDE.md  (## Agent skills pointer block)
```

Knowledge that can't be inferred—how to validate a full commit message against your
linter, or how your duplication rule is scoped—stays in the skill as *procedure*.
Only project-specific values (the ticket-id pattern, the command map, the source
paths) move to config. Annotated schemas for every key, each with worked examples
across ecosystems, live in
[`skills/setup-project-skills/templates/`](./skills/setup-project-skills/templates/).

### QA isn't only a browser

`stack.md#qa_mode` tells `/qa-local` how a human verifies this project: `browser` for
a UI, `api` for an HTTP service (concrete `curl` calls and expected responses), `cli`
for a binary, `tui`, or `none` for a library where the automated gates are the whole
story. A backend repo gets backend QA, not "open localhost in Chrome".

### The loop is config-driven too

`/loop` takes a task and drives it to green without supervision:

```
/loop add rate limiting to the token refresh endpoint
```

It branches (or stays put if you're already on a feature branch), writes a one-line
brief, then alternates **builder** → **checker** until `/verify-feature` returns
`ALL GREEN`. The two roles are deliberately separated: the builder writes code and
never runs the gates, the checker runs the gates and never writes code. A single agent
doing both drifts toward declaring itself done.

What stops it is in `quality-gates.md#loop`, not in a `CLAUDE.md` paragraph:
`max_cycles` caps the budget, and the loop also bails early when the same failure
repeats twice, when the builder says it's blocked, or when the only way to green would
be to weaken a check. On success it asks whether `/qa-local` is needed (skipped when
`qa_mode` is `none`), then *offers* `/finalize-feature` rather than pushing — an
unattended loop that opens PRs just turns a wrong brief into a wrong PR faster.

When `topology.md` says the repo is a split **frontend** or **backend**, `/loop`
optionally reads the companion API or UI repo before building — only if the task needs
that knowledge. Full-stack and standalone repos skip that step.

### Graceful when a repo isn't onboarded

Every skill opens by loading its config and naming a fallback. Run a skill in a repo
that has never seen `/setup-project-skills` and it degrades sensibly (tracker →
`none`, base → the remote's default branch) or points you at setup—it never hard-fails
on a missing assumption. Commands that don't apply are left empty, and skills skip
those steps out loud rather than inventing a command.

### Proven across opposite repos

The same skills drive a Linear + Angular/Nx monorepo (`develop`,
`feature/PC-1234`, commitlint, jscpd, browser QA), a GitHub Issues + Python/FastAPI
service (`main`, pre-commit, `uv`, API QA against `curl`), and a Go CLI with no
tracker at all (slug branches, `go test -race`, CLI QA)—with no edits, only different
`docs/agents/` files. All three config sets are in
[`examples/configs/`](./examples/configs/). The original tightly-coupled skills are
kept under [`examples/linear-angular/`](./examples/linear-angular/) as the before-shot.

## Skills in this repo

Six skills under [`skills/`](./skills/) and two loop roles under [`agents/`](./agents/).
Install path for each skill is `skills/<name>/`; agents are single markdown files.

### Setup

Run once per repo.

| Skill | What it does |
|---|---|
| **[setup-project-skills](./skills/setup-project-skills/SKILL.md)** | Detect, confirm, and write `docs/agents/` (issue tracker, vcs, stack, quality gates, topology) so every other skill can adapt. |

### Workflow

Daily delivery. Each skill loads only the config files it needs and degrades when they are missing.

| Skill | What it does |
|---|---|
| **[start-issue](./skills/start-issue/SKILL.md)** | Update the base branch, create a feature branch for a ticket, set the ticket in progress. |
| **[verify-feature](./skills/verify-feature/SKILL.md)** | Run every configured quality gate and report exactly what failed. Never edits code. |
| **[qa-local](./skills/qa-local/SKILL.md)** | Guide local QA — browser, API, or CLI — fixing issues as they surface. Mode comes from `stack.md#qa_mode`. |
| **[finalize-feature](./skills/finalize-feature/SKILL.md)** | Commit, rebase on the base branch, verify, push, open a PR, write QA notes on the ticket. |

### Automation

| Skill | What it does |
|---|---|
| **[loop](./skills/loop/SKILL.md)** | Build → verify until green (or the cycle budget / stop conditions). Optionally pulls companion knowledge from `topology.md`. On green: ask for `/qa-local` (skip when `qa_mode` is `none`), then offer `/finalize-feature` — never push unattended. |

Typical happy path:

```
/setup-project-skills   (once per repo)
        │
        ▼
/start-issue ──► implement ──► /verify-feature ──► /qa-local ──► /finalize-feature
                     ▲                │
                     └──── /loop ─────┘
              (builder ↔ checker until green, then QA ask)
```

### Agents (for `/loop`)

Optional subagents. `/loop` runs the same roles inline when these files are not installed.

| Agent | Role |
|---|---|
| **[builder](./agents/builder.md)** | Writes and fixes code. Never runs the gates. `/loop` may dispatch `stack.md#fix_agent` instead when set. |
| **[checker](./agents/checker.md)** | Runs `/verify-feature` and reports `ALL GREEN` or `FAILED`. Never edits. |

### Examples

| Path | Purpose |
|---|---|
| [`examples/configs/`](./examples/configs/) | Filled-in `docs/agents/` for Angular/Nx, FastAPI, and a Go CLI. |
| [`examples/linear-angular/`](./examples/linear-angular/) | Pre-refactor hardcoded skills — historical reference only; do not install. |

## Adding a new skill

1. Add `skills/<name>/SKILL.md`.
2. Open it with a **"Load config first"** block that reads the relevant
   `docs/agents/*.md` and defines a fallback when config is absent.
3. Reference config keys (e.g. `vcs.md#base_branch`, `stack.md#commands.test`) instead
   of literal values. If you catch yourself typing `npm`, `develop`, `Linear`, or
   `localhost:4200`, that value belongs in config. Stop conditions and budgets are
   config too — they're the first thing that differs between teams.
4. Handle the empty case: an unset command means skip the step and say so, not guess.
5. Symlink it into `~/.claude/skills/`.

## License

MIT — see [LICENSE](./LICENSE).
