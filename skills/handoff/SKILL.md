---
name: handoff
description: Hand off the current delivery work — write branch, ticket, loop state, last reports, open decisions, and suggested next skills to a markdown file another session can resume from. Reads per-repo config from docs/agents/.
argument-hint: '[note for the next session]'
disable-model-invocation: true
---

Write a handoff for this work. Extra note from the user: `$ARGUMENTS`

**Load config first.** Read `docs/agents/vcs.md`, `docs/agents/issue-tracker.md`, and
`docs/agents/quality-gates.md` if present. Without them, use the remote's default
branch as base and skip the ticket section.

The next session starts with none of this conversation. The handoff gives it
everything it can't rediscover cheaply, and points at everything it can. **Reference
artifacts by path, don't copy them** — logs, evidence, and files on disk stay where
they are. Copy only what exists nowhere but this conversation.

## Steps

1. **Collect state.**
   - Branch, base (`vcs.md#base_branch`), commits ahead
     (`git log --oneline <base>..HEAD`), and uncommitted files (`git status --short`).
   - Ticket id from the branch via `issue-tracker.md#ticket_id_pattern`, with title and
     status if the tracker is reachable.
   - `/loop` state from this conversation: cycle count against `loop.max_cycles`, and
     whether it ended green, clean, stopped, or mid-cycle.
   - The last checker report and last reviewer report, **verbatim** — they live only in
     this conversation.
   - Paths that exist: the loop decision log and app-verify evidence directory under
     `${TMPDIR:-/tmp}/delivery-skills/<repo>/<branch>/`, a PR URL if one is open
     (`gh pr view --json url` or the `vcs.md#pr_tool` equivalent).
   - Open decisions: questions the user hasn't answered, a disputed review finding, a
     stop condition that is waiting on a human.
2. **Suggest next skills** from the state, in order:
   - failing, or mid-cycle → `/loop` (or `/verify-feature` to re-check first)
   - green, not QA'd, `qa_mode` not `none` → `/qa-local`
   - green and QA'd, no PR → `/finalize-feature`
   - corrections or stuck cycles happened → `/retro`
3. **Write the file** to
   `${TMPDIR:-/tmp}/delivery-skills/<repo>/<branch>/handoff-<YYYYMMDDTHHMMSS>.md`
   (`<repo>` is the top-level folder name, `<branch>` has `/` replaced by `-`):

   ```markdown
   # Handoff: <branch> (<ticket id — title>)

   ## State
   base <base> · <n> commits ahead · uncommitted: <files | none>
   loop: cycle <n> of <max> · <green | clean | stopped: reason | mid-cycle>
   PR: <url | none>

   ## Last checker report
   <verbatim>

   ## Last reviewer report
   <verbatim, per axis | not run>

   ## Open decisions
   1. <question> — context: <one line>

   ## Artifacts
   - decision log: <path>
   - app-verify evidence: <path>

   ## Next
   1. <skill> — <why>

   ## Note
   <$ARGUMENTS, if any>
   ```

   Leave out a section that has nothing in it, rather than writing "none" under every
   heading.
4. **Report** the path and a one-line prompt to start the next session with:
   `Read <path> and continue from "Next".`
