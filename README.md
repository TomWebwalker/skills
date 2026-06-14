# Skills That Travel Between Repos

[![skills.sh](https://skills.sh/b/TomWebwalker/skills)](https://skills.sh/TomWebwalker/skills)

Agent skills for everyday delivery work—config-driven, so the same commands work in every repository you own.

Most workflow skills rot the moment you reuse them. They hardcode one issue tracker, one branch name, one framework—so `/start-issue` only works in the repo it was written for. Copy it elsewhere and it lies about your tooling.

These skills separate the *process* (universal) from the *parameters* (per-repo). The skill carries the steps; each repository supplies its own tooling knowledge through four small config files. Onboard a repo once, and `/start-issue`, `/qa-local`, and `/finalize-feature` adapt to it—Linear or GitHub, `develop` or `main`, Angular or Next.js, commitlint or not.

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
   for s in setup-project-skills start-issue qa-local finalize-feature; do
     ln -sfn "$PWD/skills/$s" ~/.claude/skills/"$s"
   done
   ```

   </details>

2. In any repo you want to onboard, run **`/setup-project-skills`**. It will:
   - Detect and confirm your **issue tracker** (Linear, GitHub, or none)
   - Detect and confirm your **branching model** (base branch, branch naming, PR target)
   - Detect and confirm your **stack** (framework, fix agent, run/test/build commands)
   - Detect and confirm your **quality gates** (commit rules, pre-push checks)

3. Ready to begin. `/start-issue`, `/qa-local`, and `/finalize-feature` now read that config.

## Why These Skills Exist

A workflow skill encodes a *process*—commit, rebase, run gates, push, open a PR, update the ticket. That process is the same everywhere. What changes between repos is the *parameters*: which tracker, which branch, which commands. Hardcoding the parameters into the process is what makes a skill non-portable.

### The seam: process is universal, parameters are per-repo

`setup-project-skills` writes four config files into the target repo under `docs/agents/`, plus a pointer block in `CLAUDE.md`/`AGENTS.md`. The other skills *read* that config at runtime instead of assuming anything.

```
skills/                                    each onboarded repo/
  setup-project-skills/   ──writes──>        docs/agents/
  start-issue/            ──reads───>          issue-tracker.md   # tracker, ticket ids, statuses
  qa-local/               ──reads───>          vcs.md             # base branch, branch naming, PR target
  finalize-feature/       ──reads───>          stack.md           # framework, fix agent, commands
                                              quality-gates.md   # commit rules, pre-push checks
                                            CLAUDE.md  (## Agent skills pointer block)
```

Knowledge that can't be inferred—like validating a full commit message against commitlint, or mirroring Sonar's duplication rule—stays in the skill as *procedure*. Only the project-specific values (the ticket-id suffix, the ignore globs, the source paths) move to config. Annotated schemas for every key live in [`skills/setup-project-skills/templates/`](./skills/setup-project-skills/templates/).

### Graceful when a repo isn't onboarded

Every skill opens by loading its config and naming a fallback. Run a skill in a repo that has never seen `/setup-project-skills` and it degrades sensibly (tracker → none, base → `main`) or points you at setup—it never hard-fails on a missing assumption.

### Proven across opposite repos

The same four skills drive a Linear + Angular/Nx monorepo (`develop` branch, `feature/PC-1234`, commitlint, jscpd) and a GitHub + Next.js app (`main`, `<type>/<slug>` branches, no commitlint) with no edits—only different `docs/agents/` files. The original tightly-coupled versions are kept under [`examples/linear-angular/`](./examples/linear-angular/) as the worked reference.

## Reference

### Setup

Run once per repo.

- **[setup-project-skills](./skills/setup-project-skills/SKILL.md)** — Detect, confirm, and write the repo's `docs/agents/` config (issue tracker, vcs, stack, quality gates) so the workflow skills adapt to it.

### Workflow

Config-driven, daily-use delivery skills.

- **[start-issue](./skills/start-issue/SKILL.md)** — Update the base branch, create a feature branch for a ticket, and set the ticket in progress.
- **[qa-local](./skills/qa-local/SKILL.md)** — Guide a developer through a ticket's QA steps locally in the browser, fixing issues as they surface.
- **[finalize-feature](./skills/finalize-feature/SKILL.md)** — Commit, rebase on the base branch, run quality gates, push, open a PR, and write QA notes on the ticket.

## Adding a new skill

1. Add `skills/<name>/SKILL.md`.
2. Open it with a **"Load config first"** block that reads the relevant `docs/agents/*.md` and defines a fallback when config is absent.
3. Reference config keys (e.g. `vcs.md#base_branch`) instead of literal values.
4. Symlink it into `~/.claude/skills/`.
