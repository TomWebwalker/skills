---
name: qa-local
description: Guide a developer through a ticket's QA steps locally — in the browser, against an API, or via a CLI — fixing issues as they surface. Reads per-repo config from docs/agents/ (issue tracker, stack), so it works for frontend, backend, and CLI projects alike. Use for local QA before sending a change for review.
---

**Load config first.** Read `docs/agents/issue-tracker.md` and `docs/agents/stack.md`.
If missing, suggest `/setup-project-skills`; otherwise proceed with sensible defaults
and ask where needed. `stack.md#qa_mode` decides *how* you verify, `#commands.dev` and
`#services` decide *what you start*, and `#fix_agent` decides who fixes what breaks.

## Steps

1. Ask if the code is done and ready for testing. If not, stop and ask the developer
   to come back when it's ready.
2. If `qa_mode` is `none`, say so, run the automated gates from
   `quality-gates.md#gates` instead, and stop.
3. If the tracker is not `none`, check whether the ticket already has a QA-instructions
   comment.
4. If there are no instructions, derive QA steps from the actual change
   (`git diff <base_branch>...HEAD`) and post them as a ticket comment — or, if tracker
   is `none`, present them in chat.
5. Bring up dependencies with `stack.md#services` if it is set, then start the app with
   **`stack.md#commands.dev`**. If `commands.dev` is empty, this project isn't served —
   fall back to the `qa_mode` guidance below (build the binary, or run the test suite).
6. Guide the developer through each step in the mode the project uses:
   - **browser** — walk through the UI flow, naming the exact route and what to look for.
   - **api** — exercise each endpoint with a concrete, copy-pasteable `curl` (method,
     path, headers, body) and state the expected status and response shape.
   - **cli** — build/install per `commands.build`, then give exact invocations with
     sample input and expected stdout/exit code.
   - **tui** — walk through the key bindings and screens involved.
7. After each step, ask whether it passed. If an issue surfaces, fix it — delegate to
   **`stack.md#fix_agent`** if one is configured, otherwise fix directly — then re-test
   that step.
8. When all steps pass, summarize what was verified so it can go into the PR or ticket.
