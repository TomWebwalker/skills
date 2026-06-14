# claude-skills

Generic, configurable workflow skills for Claude Code. The skills carry the
*process*; each repository supplies the *knowledge* via config files, so the same
`/start-issue`, `/qa-local`, and `/finalize-feature` work whether a project uses
Linear or GitHub, `develop` or `main`, Angular or Next.js.

## How it works

```
claude-skills/                         each target repo/
  skills/                                docs/agents/
    setup-project-skills/   ──writes──>    issue-tracker.md   # tracker, ticket ids, statuses
    start-issue/            ──reads───>     vcs.md             # base branch, branch naming, PR target
    qa-local/               ──reads───>     stack.md           # framework, fix agent, commands
    finalize-feature/       ──reads───>     quality-gates.md   # commit rules, pre-push checks
  examples/                              CLAUDE.md  (## Agent skills pointer block)
    linear-angular/  # the original tightly-coupled skills, kept for reference
```

`setup-project-skills` explores a repo, confirms findings with you, and writes the
four `docs/agents/` config files. The other three skills read that config at runtime
instead of hardcoding tooling. Annotated schemas for every config key live in
`skills/setup-project-skills/templates/`.

## Install

The skills are picked up by Claude Code via symlinks from `~/.claude/skills/`:

```bash
for s in setup-project-skills start-issue qa-local finalize-feature; do
  ln -sfn "$PWD/skills/$s" ~/.claude/skills/"$s"
done
```

## Onboarding a repo

Run `/setup-project-skills` in the repo once. Then `/start-issue`, `/qa-local`, and
`/finalize-feature` all read `docs/agents/` and adapt to that project.

## Adding a new generic skill

1. Add `skills/<name>/SKILL.md`.
2. Start it with a **"Load config first"** block that reads the relevant
   `docs/agents/*.md` and defines a fallback when config is absent.
3. Reference config keys (e.g. `vcs.md#base_branch`) instead of literal values.
4. Symlink it into `~/.claude/skills/`.
