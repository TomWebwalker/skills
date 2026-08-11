---
name: start-issue
description: Update the base branch, create a feature branch for a ticket, and set the ticket in progress. Reads per-repo config from docs/agents/ (issue tracker, branching model), so it works in any repo and any language.
disable-model-invocation: true
---

**Load config first.** Read `docs/agents/issue-tracker.md` and `docs/agents/vcs.md`
from the repo. If they're missing, tell the user to run `/setup-project-skills` first
(or, if they decline, fall back to: tracker = `none`, base branch = the remote's
default branch, branch pattern = `<id>`). Use config values below instead of any
hardcoded names.

## Steps

1. Parse the ticket id from `$ARGUMENTS` using `issue-tracker.md#ticket_id_pattern`.
   If no ticket is given and tracker is not `none`, ask for one; if tracker is `none`,
   ask for a short kebab-case slug to name the branch.
2. If tracker is not `none`, **fetch the ticket** per `issue-tracker.md` to confirm it
   exists and read its title.
3. Check for uncommitted changes. If the working tree is dirty, stop and ask what to
   do (stash, commit, or abort) rather than switching branches under the user.
4. Check out **`vcs.md#base_branch`** and pull latest.
5. Create the branch from `vcs.md#branch_pattern`, substituting `<id>` with the ticket
   id or slug. If the branch already exists, check it out instead of failing, and say
   so.
6. If tracker is not `none` and `statuses.in_progress` is set, move the ticket to that
   status using the method described in `issue-tracker.md`.
7. Confirm the branch is ready and (if applicable) the ticket was updated.
