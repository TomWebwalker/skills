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

Two ways in, two philosophies. **Pick one** — installing both leaves every skill
twice (bare `/loop` from skills.sh and namespaced `/delivery-skills:loop` from the
plugin), and updates will diverge.

- **Plugin** — subscribe to a managed bundle (skills + `builder` / `checker` /
  `reviewer` agents).
  Updates when you bump the plugin version.
- **skills.sh** — copy editable skill files you own. Pull updates with
  `npx skills update` when you choose.

### Option A — install as a plugin (recommended for teams)

Skills **and** the `builder` / `checker` / `reviewer` agents ship together. Invocations are
namespaced as `/delivery-skills:<skill>` (for example `/delivery-skills:loop`).

**Claude Code** — add the marketplace, then install:

```bash
claude plugin marketplace add TomWebwalker/skills
claude plugin install delivery-skills@tomwebwalker-skills
```

Or commit this into a product repo's `.claude/settings.json` so teammates get prompted:

```json
{
  "extraKnownMarketplaces": {
    "tomwebwalker-skills": {
      "source": { "source": "github", "repo": "TomWebwalker/skills" }
    }
  },
  "enabledPlugins": {
    "delivery-skills@tomwebwalker-skills": true
  }
}
```

Local smoke-test without installing:

```bash
claude --plugin-dir /path/to/skills
```

**Cursor** — import the GitHub repo as a Team Marketplace (Dashboard → Plugins), or
submit [`.cursor-plugin/`](./.cursor-plugin/) via
[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish). The
manifests live beside the Claude ones; `skills/` and `agents/` are shared.

### Option B — install individual skills with skills.sh

```bash
npx skills@latest add TomWebwalker/skills
```

Select the skills you want when prompted (or add `-g -y` for a non-interactive
install). Use `--list` to preview, or `--skill <name>` to pick specific ones.
Re-run later to pull updates.

<details>
<summary>Prefer to manage them yourself? Symlink instead.</summary>

```bash
git clone https://github.com/TomWebwalker/skills.git ~/projects/claude-skills
cd ~/projects/claude-skills
for s in setup-project-skills start-issue qa-local verify-feature finalize-feature loop retro handoff; do
  ln -sfn "$PWD/skills/$s" ~/.claude/skills/"$s"
done
ln -sfn "$PWD/agents/builder.md" ~/.claude/agents/builder.md
ln -sfn "$PWD/agents/checker.md" ~/.claude/agents/checker.md
ln -sfn "$PWD/agents/reviewer.md" ~/.claude/agents/reviewer.md
```

</details>

`npx skills` installs skills, not subagents. If you use this path, copy the loop
roles yourself (the plugin path already includes them):

```bash
mkdir -p ~/.claude/agents
curl -sL https://raw.githubusercontent.com/TomWebwalker/skills/main/agents/builder.md -o ~/.claude/agents/builder.md
curl -sL https://raw.githubusercontent.com/TomWebwalker/skills/main/agents/checker.md -o ~/.claude/agents/checker.md
curl -sL https://raw.githubusercontent.com/TomWebwalker/skills/main/agents/reviewer.md -o ~/.claude/agents/reviewer.md
```

Skip the agents if you like — `/loop` runs every role inline when they are absent.
Separate agents are better: the builder never sees the full gate output or the review
standards, and the checker and reviewer never see the diff rationale.

### Onboard a repo

In any repo you want to use these skills, run **`/setup-project-skills`** (or
`/delivery-skills:setup-project-skills` from the plugin). It will:

- Detect and confirm your **issue tracker** (Linear, GitHub, Jira, GitLab, or none)
- Detect and confirm your **branching model** (base branch, branch naming, PR target)
- Detect and confirm your **stack** (language, package manager, commands, QA mode)
- Detect and confirm your **topology** (full-stack, frontend, backend, or standalone —
  and where the companion API/UI repo lives when the stack is split)
- Detect and confirm your **quality gates** (commit rules, pre-push checks)
- Propose your **review standards** from `CONTRIBUTING.md`, conventions, and past PR
  comments, for the reviewer agent

It reads whichever manifest your repo actually has—`package.json`, `pyproject.toml`,
`go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, `Makefile`—and takes gates from your
CI config so local checks mirror what CI enforces. After that, every skill reads
that config.

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
  agents/reviewer         ──reads───>          standards.md       # review rules (builder never reads)
                                         CLAUDE.md  (## Agent skills pointer block)
```

Knowledge that can't be inferred—how to validate a full commit message against your
linter, or how your duplication rule is scoped—stays in the skill as *procedure*.
Only project-specific values (the ticket-id pattern, the command map, the source
paths) move to config. Annotated schemas for every key, each with worked examples
across ecosystems, live in
[`skills/setup-project-skills/templates/`](./skills/setup-project-skills/templates/).

### Green gates, then a running app

Tests passing is not the same as the app working. `/setup-project-skills` can
generate a project-local `verify-<app>` skill plus a **committed harness**
(`e2e/verify-<app>.mjs`) that starts the app, drives it — Playwright for a browser,
`fetch` for an API, a pseudo-terminal for a CLI — and tries to break it with empty and
1,000-item data, 300-character titles, right-to-left text, and a 500. Setup proves
every check can fail (`--self-test`) before relying on it, and the checker only runs
the harness: checks written on the fly by whoever verifies tend to pass by
construction. With `quality-gates.md#app_verify` enabled, `/verify-feature` runs it
as the last gate and reports in the same format, with a path to the screenshots or
transcripts.

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

It branches (or stays put if you're already on a feature branch), then writes the
brief. It looks up the facts itself and restates the goal and the problem in its own
words. Then it asks one round of numbered questions, each with a recommended answer.
Only decisions reach you, never facts it could find in the repo. Pass `--no-grill` to
skip the questions. Then it alternates **builder** → **checker** until `/verify-feature` returns
`ALL GREEN`. The two roles are deliberately separated: the builder writes code and
never runs the gates, the checker runs the gates and never writes code. A single agent
doing both drifts toward declaring itself done.

Green isn't the end. A **reviewer** then reads the diff twice, in parallel: once
against `docs/agents/standards.md` and once against the ticket's spec. Its findings
go back to the builder as a normal cycle. The builder never reads `standards.md`.
Code written to a checklist it has seen passes a review of that checklist without
being any better. Rules a tool could enforce are tagged `mechanical`, and `/retro`
proposes turning the ones that keep recurring into lint rules.

Each role can run on its own model (`quality-gates.md#loop.models`). By default the
checker runs on a small model, because it only runs commands and copies output. The
builder runs on `sonnet`, and the reviewer runs on the strongest model, because its
findings drive every cycle after it.

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

Eight skills under [`skills/`](./skills/) and three loop roles under [`agents/`](./agents/).
Install path for each skill is `skills/<name>/`; agents are single markdown files.
Plugin manifests: [`.claude-plugin/`](./.claude-plugin/) (Claude Code) and
[`.cursor-plugin/`](./.cursor-plugin/) (Cursor) list those paths explicitly.

**Invocation.** Orchestrators
(`setup-project-skills`, `start-issue`, `loop`, `qa-local`, `finalize-feature`, `retro`, `handoff`) set
`disable-model-invocation: true` — they run only when you type them.
`verify-feature` stays model-invoked so `/loop`'s checker can reach for it.

Version lives in [`package.json`](./package.json); bump it, run
`npm run sync-plugin-version`, and note the change in [`CHANGELOG.md`](./CHANGELOG.md).

### Setup

Run once per repo. **User-invoked.**

| Skill | What it does |
|---|---|
| **[setup-project-skills](./skills/setup-project-skills/SKILL.md)** | Detect, confirm, and write `docs/agents/` (issue tracker, vcs, stack, quality gates, topology) so every other skill can adapt. |

### Workflow

Daily delivery. Each skill loads only the config files it needs and degrades when they are missing.

| Skill | Invocation | What it does |
|---|---|---|
| **[start-issue](./skills/start-issue/SKILL.md)** | User | Update the base branch, create a feature branch for a ticket, set the ticket in progress. |
| **[verify-feature](./skills/verify-feature/SKILL.md)** | Model or user | Run every configured quality gate and report exactly what failed. Never edits code. |
| **[qa-local](./skills/qa-local/SKILL.md)** | User | Guide local QA — browser, API, or CLI — fixing issues as they surface. Mode comes from `stack.md#qa_mode`. |
| **[finalize-feature](./skills/finalize-feature/SKILL.md)** | User | Commit, rebase on the base branch, verify, push, open a PR, write QA notes on the ticket. |

### Automation

| Skill | Invocation | What it does |
|---|---|---|
| **[loop](./skills/loop/SKILL.md)** | User | Build → verify until green (or the cycle budget / stop conditions). Optionally pulls companion knowledge from `topology.md`. On green: ask for `/qa-local` (skip when `qa_mode` is `none`), then offer `/finalize-feature` — never push unattended. |

### Learning and handoff

| Skill | Invocation | What it does |
|---|---|---|
| **[handoff](./skills/handoff/SKILL.md)** | User | Write branch, ticket, loop state, last checker/reviewer reports, open decisions, and next suggested skills to a temp markdown file another session can resume from. Artifacts are referenced by path, not copied. |
| **[retro](./skills/retro/SKILL.md)** | User | Turn a session's failed checks, corrections, and stuck cycles into structural fixes — design > lint/test > gate > config > skill text — and apply only the ones you approve. |

Typical happy path:

```
/setup-project-skills   (once per repo)
        │
        ▼
/start-issue ──► implement ──► /verify-feature ──► /qa-local ──► /finalize-feature
                     ▲                │
                     └──── /loop ─────┘
   (builder ↔ checker until green, reviewer until clean, then QA ask)
```

### Agents (for `/loop`)

Optional subagents. `/loop` runs the same roles inline when these files are not installed.

| Agent | Role |
|---|---|
| **[builder](./agents/builder.md)** | Writes and fixes code. Never runs the gates. `/loop` may dispatch `stack.md#fix_agent` instead when set. |
| **[checker](./agents/checker.md)** | Runs `/verify-feature` and reports `ALL GREEN` or `FAILED`. Never edits. |
| **[reviewer](./agents/reviewer.md)** | After green, reviews the diff on one axis per dispatch — `standards.md` or the ticket spec — and reports findings. Never edits. |

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
5. List it in **both** `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json`,
   and in `USER_INVOKED` or `MODEL_INVOKED` in `scripts/validate-plugin-layout.mjs`
   (user-invoked skills set `disable-model-invocation: true`).
6. Credit any source of ideas under **Inspired by**, and add a `CHANGELOG.md` entry.
7. Run `npm run validate-plugin`.

### Sharing `docs/agents/` with other skill sets

[mattpocock/skills](https://github.com/mattpocock/skills)' setup also writes
`docs/agents/issue-tracker.md`. The file is **not namespaced** on purpose. Moving it
to `docs/agents/delivery/` would break every repo already onboarded, and the two
formats fit in one file: this repo reads the YAML frontmatter, and theirs reads the
prose sections. `/setup-project-skills` merges into an existing file instead of
overwriting it. It adds frontmatter and any missing procedure sections, and keeps
the rest.

With skills.sh, both sets also ship a bare `/handoff`. Install only one, or use the
plugin, whose commands are namespaced (`/delivery-skills:handoff`).

## Works well with

Generic helpers that don't need `docs/agents/`, so they aren't duplicated here:

- [mattpocock/skills](https://github.com/mattpocock/skills) `/grill-me` — a longer
  grilling session on a plan before you hand it to `/loop`.
- [humanlayer/skills](https://github.com/humanlayer/skills) `/show-me` — visual
  explanations of a change, beyond the one view `/finalize-feature` adds to a PR.

## Inspired by

Ideas below were reimplemented in our own words and fitted to the `docs/agents/`
config model; no text was copied.

- **retro** — Matt Pocock's `/retro` ([mattpocock/skills](https://github.com/mattpocock/skills)),
  and Lauren Tan's ([poteto](https://github.com/poteto)) `/reflect` and her rule to
  encode lessons in structure rather than prose.
- **handoff** — Matt Pocock's `/handoff`
  ([mattpocock/skills](https://github.com/mattpocock/skills)).
- **App verification** (`/setup-project-skills` → `verify-<app>`) — pstack's
  `create-verification-skill` by Lauren Tan, and Emil Kowalski's
  ([emilkowalski/skills](https://github.com/emilkowalski/skills)) break-it testing.
- **Restate-and-grill brief** (`/loop` step 2) — Lauren Tan's restate prompt, and
  Matt Pocock's `grilling` skill.
- **Reviewable PRs + decision log** (`/finalize-feature`, `/loop`) — Dex Horthy's
  `/show-me` ([humanlayer/skills](https://github.com/humanlayer/skills)), and pstack's
  `show-me-your-work`.
- **Models per role** (`loop.models`) — Emil Kowalski, and pstack's rule of matching
  model strength to the role.
- **reviewer + standards.md** — Matt Pocock's `/code-review`, and his point that the
  implementer shouldn't see the standards it will be reviewed against.

## License

MIT — see [LICENSE](./LICENSE).
