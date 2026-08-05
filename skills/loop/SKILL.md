---
name: loop
description: Run a build-then-verify loop until the repo's quality gates pass. Dispatches a builder to implement the task and a checker to run the gates, feeding failures back until green or the cycle budget runs out. Reads per-repo config from docs/agents/, so it works in any language. Use to drive a task to done hands-off.
argument-hint: <task>
---

Run this task as a loop: `$ARGUMENTS`

**Load config first.** Read `docs/agents/vcs.md`, `docs/agents/stack.md`, and
`docs/agents/quality-gates.md`. If they're missing, suggest `/setup-project-skills`
and fall back to `loop.max_cycles: 5`. Every command, branch name, and stop condition
below comes from config — nothing about this loop is repo-specific.

**Roles.** The loop dispatches two subagents, named in `quality-gates.md#loop`:

- **builder** (`loop.builder_agent`, default `builder`) — writes and fixes code.
- **checker** (`loop.checker_agent`, default `checker`) — runs `/verify-feature` and
  reports. Never edits.

If a named subagent isn't installed, don't fail: run that role inline as a phase of
this conversation, holding to the same contract (the build phase edits code and
reports one line; the check phase runs `/verify-feature` and reports its output
verbatim). Say once, up front, that you're running inline and how to install the
bundled agents. If `stack.md#fix_agent` is set, prefer it over the generic builder —
it knows the framework.

## Steps

1. **Branch.** Check the current branch against `vcs.md#branch_pattern`. If it already
   matches, stay on it and say so. Otherwise run `/start-issue` to create one. Never
   create a second branch mid-loop.
2. **Brief.** Write a one-line brief: goal, files in scope, definition of done. The
   definition of done is "every gate in `quality-gates.md#gates` passes" plus whatever
   the task itself requires. Show the brief before starting — a wrong brief burns
   every cycle after it.
3. **Build.** Dispatch the builder with the brief. On later cycles, dispatch it with
   the checker's failure report instead, unchanged.
4. **Check.** Dispatch the checker. It runs `/verify-feature` and returns either
   `ALL GREEN` or `FAILED` with one line per cause.
5. **Branch on the result.**
   - `ALL GREEN` → go to step 7.
   - `FAILED` → go back to step 3 with the failures.
6. **Count out loud.** Announce the cycle number before each build ("cycle 2 of 5").
   Stop at `loop.max_cycles`.
7. **Finish.** On green, stop and show the result: what changed, which gates ran, and
   anything skipped. Then offer `/finalize-feature` — do not commit, push, or open a
   PR on your own. A loop that pushes unattended turns a wrong brief into a wrong PR.

## Stop conditions

Stop immediately, before the budget is spent, when:

- The **same failure** appears in two consecutive checker reports. The builder isn't
  converging; more cycles won't help. Report the stuck failure and hand it back.
- The builder reports it **can't make the change** (missing dependency, ambiguous
  requirement, a decision that isn't yours to make).
- A fix would require **weakening a check** — deleting a test, loosening a lint rule,
  lowering a coverage threshold. Surface it and ask; never let the loop earn its green
  that way.
- The task turns out to need a **decision the brief doesn't cover**. Ask rather than
  guess, then resume.

When `loop.max_cycles` is exhausted, follow `loop.on_exhausted`:

- `stop-and-report` (default) — stop, show the last failure report and what was tried.
- `ask` — show the same, then ask whether to spend more cycles.

Either way, leave the branch and working tree intact. The point of stopping is that a
human looks at it.
