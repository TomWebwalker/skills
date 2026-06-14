---
name: start-issue
description: Update the base branch, create a feature branch for a ticket, and set the ticket in progress. Reads per-repo config from docs/agents/ (issue tracker, branching model). Use when starting work on a ticket.
---

**Load config first.** Read `docs/agents/issue-tracker.md` and `docs/agents/vcs.md`
from the repo. If they're missing, tell the user to run `/setup-project-skills` first
(or, if they decline, fall back to: tracker = none, base branch = `main`, branch
pattern = `feature/<id>`). Use the config values below instead of any hardcoded names.

## Steps

1. Parse the ticket id from `$ARGUMENTS` using `issue-tracker.md#ticket_id_pattern`
   (e.g. `PC-1234`). If no ticket is given and tracker is not `none`, ask for one;
   if tracker is `none`, ask for a short slug to name the branch.
2. If tracker is not `none`, **fetch the ticket** per `issue-tracker.md` to confirm it
   exists and read its title.
3. Check out **`vcs.md#base_branch`** and pull latest.
4. Create the branch from `vcs.md#branch_pattern`, substituting `<id>` with the ticket
   id or slug (e.g. `feature/PC-1234`).
5. If tracker is not `none`, set the ticket to **`issue-tracker.md#statuses.in_progress`**
   using the method described in that file.
6. Confirm the branch is ready and (if applicable) the ticket was updated.
