# Examples

Two different things live here.

## `configs/` — filled-in `docs/agents/` sets

Each folder is what `/setup-project-skills` would produce for a given kind of repo.
Copy one into your repo's `docs/agents/` and edit, or just read it to see how the
config keys map onto a real project.

| example | shape |
|---|---|
| [`linear-angular-nx`](./configs/linear-angular-nx) | frontend monorepo, Linear via MCP, `develop` base, commitlint, jscpd, companion API |
| [`github-python-fastapi`](./configs/github-python-fastapi) | backend HTTP service, GitHub Issues via `gh`, `main` base, pre-commit, API QA, companion UI |
| [`no-tracker-go-cli`](./configs/no-tracker-go-cli) | Go CLI, no tracker at all, CLI QA, standalone topology |

The three are deliberately opposite along every axis — tracker, base branch,
language, package manager, QA mode, gates, topology — and the same skills drive all
of them with no edits.

## `linear-angular/` — the original hardcoded skills

Kept as a historical reference: this is what the workflow skills looked like before
the process/parameters split. Every value that is now config was baked into the
prose. Useful for seeing what the refactor actually bought. **Don't install these.**
