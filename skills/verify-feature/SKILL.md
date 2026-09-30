---
name: verify-feature
description: Run this repo's quality gates (tests, types, lint, build, duplication) and report exactly what failed, without changing any code. Reads per-repo config from docs/agents/ (stack, quality gates), so it works in any language. Use after implementing a change, before finalizing it for review, or as the check half of /loop.
---

Model-invoked on purpose — `/loop`'s checker and other skills must be able to reach for this.

**Load config first.** Read `docs/agents/stack.md` and `docs/agents/quality-gates.md`.
If either is missing, suggest `/setup-project-skills`. Every command below comes from
those files — do not hardcode a package manager, a test runner, or a source path.

**This skill never edits code.** It runs checks and reports causes. Fixing is the
caller's job (`/loop` hands failures to the builder; `/finalize-feature` fixes them
itself). Keeping verification read-only is what makes its report trustworthy — a
verifier that also patches can report green on something it just papered over.

Track the gates as a task list and mark them as they complete.

## Steps

1. **Run each gate** in `quality-gates.md#gates`, in order, resolving any
   `stack.commands.*` reference against `stack.md`. Do not reorder them — the order
   encodes cost, so cheap checks fail fast.
   - If a gate's command is empty, skip it and name it as skipped in the report.
   - Keep going after a failure rather than stopping at the first one, unless a gate
     genuinely blocks the next (a failed build makes a later e2e gate meaningless —
     mark those `blocked`, not `failed`).
   - Some tools signal failure through output rather than exit code (`gofmt -l .`
     exits 0 while listing unformatted files). Check what `quality-gates.md` says the
     failure signal is.
2. **Duplication check** when `quality-gates.md#dup_check.enabled`: run
   `dup_check.cmd`. With `scope: changed-files`, only clones touching a file in
   `git diff --name-only <vcs.base_branch>...HEAD` count as failures; report
   pre-existing clones elsewhere as informational.
3. **App verification** when `quality-gates.md#app_verify.enabled`: run the
   project-local skill named in `app_verify.skill` as the **last** gate. It starts the
   app, drives the changed flows, and returns a report in this same format, plus an
   `evidence:` line. Merge its failure lines into yours.
   - Any earlier gate failed → mark it `blocked: app_verify (<gate> failed)`; driving
     an app that doesn't build proves nothing.
   - Skill not installed → `skipped: app_verify (skill <name> not found)` and suggest
     re-running `/setup-project-skills` to generate it.
4. **Report** in the exact format below. Nothing else — no summary paragraph, no
   suggested fixes.

## Report format

All gates passed:

```
ALL GREEN
```

Anything failed:

```
FAILED
<file>:<line> - <what broke> - <which gate caught it>
<file>:<line> - <what broke> - <which gate caught it>
```

Rules for the report:

- **Copy the real error.** Never paraphrase, never summarize. The caller fixes from
  this text alone, so a vague line costs a whole cycle.
- One line per **cause**, not per symptom. Forty failing tests from one bad import is
  one line, with the count noted.
- When a failure has no file or line (a build error, a missing binary, a service that
  wouldn't start), use the gate name in place of `<file>:<line>` and give the full
  command output.
- Append skipped and blocked gates after the failures, so the caller knows the run was
  partial:

  ```
  skipped: typecheck (no command configured)
  blocked: e2e (build failed)
  ```

- When app verification ran, end with its `evidence: <run dir>` line — green or not.
  `/finalize-feature` links it from the PR.
