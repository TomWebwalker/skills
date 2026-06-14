---
# docs/agents/stack.md — what this project is built with and how to run it.
framework: angular            # angular | nextjs | react | node | other
layout: nx-monorepo           # nx-monorepo | single-app | other
source_paths: [apps, libs]    # where first-party code lives (used by dup checks etc.)
fix_agent: angular-keeper     # subagent to delegate framework-specific fixes to ('' = none)
commands:
  install: npm ci
  dev: npm start              # serves the app for local/browser QA
  test: npm test
  lint: npm run lint
  build: npm run build
  typecheck: ''               # e.g. 'npm run typecheck' (or '' if folded into build)
---

# Stack

**Framework:** Angular in an Nx monorepo. First-party code lives under
`apps/` and `libs/`.

## Fix agent
When a skill needs framework-specific code changes (e.g. fixing a failing QA step
or a build error), delegate to the **`fix_agent`** subagent (`angular-keeper`)
rather than editing inline. If `fix_agent` is empty, do the fix directly.

## Commands
Use the `commands` map above instead of hardcoding. A skill that needs to run the
app for browser QA uses `commands.dev`; pre-push gates use `test`/`lint`/`build`.

## Adapting
- **nextjs/react** — `framework: nextjs`, `layout: single-app`,
  `source_paths: [app, components, lib]`, `fix_agent: ''` (or a react keeper),
  `dev: npm run dev`.
- **node lib** — drop `dev`; keep `test`/`lint`/`build`.
