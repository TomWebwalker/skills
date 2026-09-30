---
name: loop
description: Run a build-then-verify loop until the repo's quality gates pass. Dispatches a builder to implement the task and a checker to run the gates, feeding failures back until green or the cycle budget runs out. Reads per-repo config from docs/agents/, so it works in any language.
argument-hint: '[--no-grill] <task>'
disable-model-invocation: true
---

Run this task as a loop: `$ARGUMENTS`

If the arguments contain `--no-grill`, remove it from the task text and remember it
for step 2.

**Load config first.** Read `docs/agents/vcs.md`, `docs/agents/stack.md`,
`docs/agents/quality-gates.md`, and — if present — `docs/agents/issue-tracker.md`
and `docs/agents/topology.md`. If the first three are missing, suggest
`/setup-project-skills` and fall back to `loop.max_cycles: 5`. Every command, branch
name, and stop condition below comes from config — nothing about this loop is
repo-specific. Missing `topology.md` means treat the repo as self-contained (same as
`role: standalone`). **Don't read `docs/agents/standards.md`** and never put it in a
brief: only the reviewer sees it.

**Roles.** The loop dispatches up to three subagents, named in `quality-gates.md#loop`:

- **builder** (`loop.builder_agent`, default `builder`) — writes and fixes code.
- **checker** (`loop.checker_agent`, default `checker`) — runs `/verify-feature` and
  reports. Never edits.
- **reviewer** (`loop.reviewer_agent`, default `reviewer`; `''` skips review) —
  reviews the green diff against `standards.md` and against the spec. Never edits.

If a named subagent isn't installed, don't fail: run that role inline as a phase of
this conversation, holding to the same contract (the build phase edits code and
reports one line; the check phase runs `/verify-feature` and reports its output
verbatim; the review phase reads `standards.md` only when it starts and reports
findings in the reviewer's format). Say once, up front, that you're running inline and how to install the
bundled agents. If `stack.md#fix_agent` is set, prefer it over the generic builder —
it knows the framework.

## Decision log

Keep an append-only TSV of the loop's decisions, so a reviewer (and
`/finalize-feature`) can see *why* the branch looks the way it does. Path:

```bash
repo=$(basename "$(git rev-parse --show-toplevel)")
branch=$(git branch --show-current | tr '/' '-')
log="${TMPDIR:-/tmp}/delivery-skills/$repo/$branch/loop-decisions.tsv"
mkdir -p "$(dirname "$log")"
[ -f "$log" ] || printf 'ts\tcycle\tdecision\twhy\tevidence\tresult\n' > "$log"
```

A re-run on the same branch appends. Add one row per decision, not per tool
call: each grill answer, skipping or using companion knowledge, each build dispatch
(what was asked), each check and review outcome, a disputed finding, and any stop
condition. `ts` is ISO-8601, `cycle` is `0` for the brief, `evidence` is a checker
line, finding, or file path. Replace tabs and newlines inside values with spaces.

## Steps

1. **Branch.** Check the current branch against `vcs.md#branch_pattern`. If it already
   matches, stay on it and say so. Otherwise run `/start-issue` to create one. Never
   create a second branch mid-loop.
2. **Brief: restate, then grill.** A wrong brief burns every cycle after it, so get
   it right before building.
   1. **Look up facts yourself.** Read the ticket (per `issue-tracker.md`, id from
      the branch name or the task), the code the task points at, and the config.
      Anything the repo can answer — which file, which function, what the current
      behavior is — you answer. Don't ask the user.
   2. **Restate** in your own words, not the ticket's:
      - **Goal** — what is true when this is done.
      - **Problem** — why it isn't true now.
      - **Scope** — files or modules you expect to touch, and what's out of scope.
      - **Done** — every gate in `quality-gates.md#gates` passes, plus what the task
        itself requires.
   3. **Grill, one round.** List the *decisions* the facts didn't settle as numbered
      questions, each with your recommended answer and a one-clause reason:

      ```
      1. Expired refresh token: log out or retry once? → Recommended: log out —
         a retry hides a revoked session.
      2. ...
      ```

      Ask them all at once, then wait. The user can answer `ok` to take every
      recommendation, or override by number. No open decisions → say so and skip
      the questions.
   4. **Fold the answers in** and show the final brief. That brief is what the
      builder gets and what the spec reviewer checks against when there's no ticket.

   **Skip the grill** (write the restated brief and go) when the user passed
   `--no-grill`, or when the ticket already has acceptance criteria and the user
   confirms they're complete — then those criteria are the definition of done.
3. **Companion knowledge (optional).** Read `topology.md#role`.
   - If `full-stack` or `standalone`, or `topology.md` is missing → **skip** this
     step entirely. Say nothing about companions.
   - If `frontend` or `backend` → decide whether *this* task needs knowledge from the
     other half (API contracts, OpenAPI/DTO shapes, auth, screen flows, copy, feature
     flags owned elsewhere). If the brief is fully answerable inside this repo, skip.
   - When needed: open the companion at `companion.path` if it exists on disk;
     otherwise use `companion.url` (clone or browse) and say which you used. Pull
     only what the brief requires into a short "companion notes" addendum on the
     brief. Do **not** edit the companion repo unless the user asked to.
   - `frontend` → companion is the API (`kind: api`). `backend` → companion is the
     UI (`kind: ui`). If `path` and `url` are both empty, ask once for the location,
     then continue.
4. **Build.** Dispatch the builder with the brief (plus companion notes, if any). On
   later cycles, dispatch it with the checker's failure report instead, unchanged —
   do not re-fetch companion knowledge unless the failure shows the prior notes were
   wrong or incomplete.
5. **Check.** Dispatch the checker. It runs `/verify-feature` and returns either
   `ALL GREEN` or `FAILED` with one line per cause.
6. **Branch on the result.**
   - `ALL GREEN` → go to step 7.
   - `FAILED` → go back to step 4 with the failures.
7. **Review.** If `loop.reviewer_agent` is `''`, go to step 9. Otherwise dispatch the
   reviewer **twice, in parallel** (both calls in one message), each with the diff
   range `<base_branch>...HEAD`:
   - `axis: standards` — skip, and say so, when `standards.md` is missing or has no
     rules.
   - `axis: spec` — include the ticket text (fetched per `issue-tracker.md` from the
     id in the branch name) or, with no tracker, the brief from step 2.

   Pass the diff range and the spec only — never the builder's reasoning, or the
   review inherits its blind spots.
   - Both `REVIEW CLEAN` (or skipped) → go to step 9.
   - Any `FINDINGS` → go back to step 4 with the findings, unchanged, as a normal
     cycle: build, check, then review again. It counts toward `loop.max_cycles`.
8. **Count out loud.** Announce the cycle number before each build ("cycle 2 of 5").
   Stop at `loop.max_cycles`.
9. **Finish.** On green and clean review, stop and show the result: what changed,
   which gates ran, the review result per axis, and anything skipped (including
   whether companion knowledge was used), and the decision log path.
   - If `stack.md#qa_mode` is `none`, skip local QA.
   - Otherwise ask whether `/qa-local` is needed; if yes, run it (fixes that surface
     there go through the same builder/`fix_agent` path — do not reopen the build
     cycle unless the user asks).
   - Then offer `/finalize-feature` — do not commit, push, or open a PR on your own.
     A loop that pushes unattended turns a wrong brief into a wrong PR.

## Stop conditions

Stop immediately, before the budget is spent, when:

- The **same failure** appears in two consecutive checker reports, or the **same
  finding** in two consecutive reviews. The builder isn't converging; more cycles
  won't help. Report the stuck item and hand it back.
- The builder **disputes a review finding** (the rule is wrong for this case, or the
  spec is). That's a decision for a human — show both sides and ask.
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
