---
name: qa-local
description: Guide a developer through running a ticket's QA steps locally in the browser, fixing issues as they surface. Reads per-repo config from docs/agents/ (issue tracker, stack). Use for local QA before sending a change for review.
---

**Load config first.** Read `docs/agents/issue-tracker.md` and `docs/agents/stack.md`.
If missing, suggest `/setup-project-skills`; otherwise proceed with sensible defaults
and ask where needed. Use `stack.md#commands.dev` to serve the app and
`stack.md#fix_agent` to delegate fixes.

## Steps

1. Ask if the code is done and ready for testing.
2. If not, stop and ask the developer to come back when it's ready.
3. If the tracker is not `none`, check whether the ticket has a QA-instructions
   comment (per `issue-tracker.md`).
4. If there are no instructions, write them: derive QA steps from the change and post
   them as a ticket comment (or, if tracker is `none`, just present them in chat).
5. Start the app with **`stack.md#commands.dev`** and guide the developer through each
   QA step in the browser, including any setup or commands needed.
6. After each step, ask whether it passed. If an issue surfaces, fix it — delegate
   framework-specific fixes to **`stack.md#fix_agent`** (e.g. `angular-keeper`); if
   `fix_agent` is empty, fix it directly — then re-test that step.
