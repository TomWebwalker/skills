---
name: finalize-feature
description: Commit, rebase the feature branch on the base branch, verify via /verify-feature, push, open a PR, and write QA notes on the ticket. Reads per-repo config from docs/agents/ (issue tracker, vcs, stack, quality gates), so it works in any repo and any language. Use to finalize a feature for review.
---

**Load config first.** Read all four: `docs/agents/issue-tracker.md`,
`docs/agents/vcs.md`, `docs/agents/stack.md`, `docs/agents/quality-gates.md`. If any
are missing, suggest `/setup-project-skills`. Every branch name, command, status, and
commit rule below comes from these files — do not hardcode a branch, a tracker, a
ticket format, a package manager, or a source path.

Track the steps below as a task list and mark them done as you go. If unsure how to
implement a part, look for examples in the repo or ask.

## Steps

1. **Commit.** Stage and group changes logically. Follow `quality-gates.md#commit`:
   use the configured `convention`, place the ticket id per `ticket_ref`, and append
   `coauthor_line` if set. When `commit.validator` is non-empty, validate the **entire**
   message (header + body + footer) through that validator before committing — write it
   to a file and pipe it in exactly as CI does. Never `--no-verify`. Respect the limits
   recorded in `commit.rules`.
2. Check out **`vcs.md#base_branch`** and pull latest.
3. Check out the feature branch again and, if `vcs.md#rebase_on_base`, rebase it on the
   base branch. If the rebase conflicts, stop and resolve with the user rather than
   guessing.
4. **Verify.** Run `/verify-feature`. It executes every gate in
   `quality-gates.md#gates` (and the duplication check when enabled) and reports
   `ALL GREEN` or a list of causes. Fix each cause and re-run until green — do not
   proceed on a partial pass, and never weaken a check to get there. If a gate was
   skipped for missing config, carry that into the report in step 10.
5. Push the feature branch to `vcs.md#remote`.
6. Open a PR targeting **`vcs.md#pr_target`** with `vcs.md#pr_tool` (`gh pr create`,
   `glab mr create`, or — for `manual` — push and print the compare URL). Use
   `vcs.md#pr_template` for the body if one is configured; otherwise summarize the
   change, the reasoning, and how to verify it.
7. If tracker is not `none`, find the ticket from the branch name via
   `issue-tracker.md#ticket_id_pattern`.
8. Write a QA-instructions comment on the ticket (per `issue-tracker.md`), and set it to
   `statuses.ready_for_qa` if that status is configured.
9. If `issue-tracker.md#version_label` is true, read the version from
   `issue-tracker.md#version_source` and ensure the ticket carries that label.
10. Report the PR URL, which gates ran, and anything skipped.
