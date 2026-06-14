---
name: finalize-feature
description: Commit with conventional commits, rebase the feature branch on the base branch, run quality gates, push, open a PR, and write QA notes on the ticket. Reads per-repo config from docs/agents/ (issue tracker, vcs, stack, quality gates). Use to finalize a feature for review.
---

**Load config first.** Read all four: `docs/agents/issue-tracker.md`,
`docs/agents/vcs.md`, `docs/agents/stack.md`, `docs/agents/quality-gates.md`. If any
are missing, suggest `/setup-project-skills`. Every branch name, command, status, and
commit rule below comes from these files — do not hardcode `develop`, `Linear`,
`PC-XXXX`, or `apps libs`.

Track the steps below as a task list and mark them done as you go. If unsure how to
implement a part, look for examples in the repo or ask.

## Steps

1. **Commit (conventional).** Stage and group changes logically. Follow
   `quality-gates.md#commit`: use the configured convention, place the ticket id per
   `ticket_ref` (e.g. header suffix `[PC-1234]`), and include `coauthor_line` if set.
   When `commitlint: true`, validate the **entire** message (header + body + footer)
   before committing — write it to a file and pipe through commitlint exactly as CI
   does; never `--no-verify`. See the commit + duplication procedures in
   `quality-gates.md`.
2. Check out **`vcs.md#base_branch`** and pull latest.
3. Check out the feature branch again and, if `vcs.md#rebase_on_base`, rebase it on the
   base branch.
4. **Run quality gates** from `quality-gates.md#gates` in order (typically
   test → lint → build via `stack.md#commands`). Fix any failures before proceeding.
5. **Duplication check** if `quality-gates.md#dup_check.enabled`: run jscpd with the
   configured `min_tokens`/`min_lines`/`ignore` over `stack.md#source_paths`, and
   refactor any clone touching a file this branch changed
   (`git diff --name-only <base>...HEAD`). See `quality-gates.md` for the exact command.
6. Push the feature branch to `vcs.md#remote`.
7. Open a PR targeting **`vcs.md#pr_target`** (`gh pr create`).
8. If tracker is not `none`, find the ticket from the branch name via
   `issue-tracker.md#ticket_id_pattern` (e.g. `feature/PC-1234` → `PC-1234`).
9. Write a QA-instructions comment on the ticket (per `issue-tracker.md`), and set it to
   `statuses.ready_for_qa` if that status is configured.
10. If `issue-tracker.md#version_label` is true, ensure the ticket has the release
    version label (read it from the app's version file, e.g. `package.json#version`).
