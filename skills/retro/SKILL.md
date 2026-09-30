---
name: retro
description: Retro a session — turn failed checks, user corrections, and stuck cycles into structural fixes (design > lint/test > gate > config > skill text), applying only the ones you approve.
argument-hint: '[transcript path | "last session"]'
disable-model-invocation: true
---

Run a retrospective on: `$ARGUMENTS` (empty = this conversation).

**Load config first.** Read every `docs/agents/*.md` that exists — each one is a
place a lesson can land. If none exist, still run the retro, but a lesson whose fix is
"record this in config" becomes "run `/setup-project-skills`, then record it".

The point of a retro is that the **next** session doesn't repeat this one. A lesson
that lives only in prose has to be read and remembered to help; a lesson that lives in
structure (a type, a test, a gate) helps whether anyone remembers it or not. So every
lesson is pushed as far up the ladder below as it will go.

## Steps

1. **Gather evidence.** Read the session: this conversation, or the transcript the
   user names (Claude Code keeps them as `~/.claude/projects/<repo-slug>/*.jsonl`).
   Collect, with a short quote or reference for each:
   - `FAILED` reports from the checker, especially a cause that came back more than
     once, and any `/loop` stop condition that fired.
   - User corrections — "no", "don't", "actually", "I said", a reverted edit, a
     re-explained requirement.
   - Questions the agent had to ask that the repo or config should have answered.
   - Reviewer findings that recurred across cycles, when `/loop` ran a reviewer.
2. **Filter.** Keep only lessons that would happen again in a fresh session on this
   repo. A typo, a flaky network call, or a one-time decision is not a lesson — drop
   it and don't list it.
3. **Route each lesson to the strongest fix** that would have prevented it. Try the
   rungs in order and stop at the first that applies:
   1. **Design change** — make the mistake impossible: a type that rejects the bad
      value, an API that can't be called wrong, one module instead of two that must
      stay in sync.
   2. **Lint rule or test** — make the mistake loud: a lint rule for a mechanical
      pattern, a regression test for a behavior. A `standards.md` rule tagged
      `mechanical` that the reviewer keeps flagging belongs here.
   3. **New gate** in `quality-gates.md#gates` — when a tool that already exists
      would have caught it but nobody ran it. Gates mirror CI, so the proposal must
      add the same check to CI; a local-only gate is a surprise later.
   4. **Config edit** in `docs/agents/*.md` — a wrong command, a missing
      `commit.rules` limit, a status name, a standard the reviewer should know.
   5. **Skill text** — last resort, when the lesson is about *process* and none of the
      above can hold it. If the skill belongs to an installed plugin, propose an
      upstream issue instead of editing the installed copy; the next update would
      overwrite it.

   When a lesson lands below rung 1, say in one clause why the stronger rungs don't
   fit. That clause is what keeps the ladder honest.
4. **Propose.** Show a numbered list, most valuable first:

   ```
   1. <lesson in one line>
      evidence: <quote or reference>
      fix (<rung>): <the concrete change>
      files: <paths>
   ```

   Then ask which to apply (`1,3`, `all`, or `none`). Nothing is changed before the
   user answers.
5. **Apply only what was approved.** Code changes (rungs 1–2) go through
   `stack.md#fix_agent` or the `builder` agent when installed, then `/verify-feature`
   — a new lint rule or test must fail on the old mistake and pass on the fixed code.
   Config and skill edits are made directly.
6. **Report** what was applied, what was declined, and whether anything is left
   uncommitted. Don't commit; offer `/finalize-feature` if the changes belong on the
   current branch.
