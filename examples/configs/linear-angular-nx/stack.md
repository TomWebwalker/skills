---
language: typescript
framework: angular
layout: monorepo
package_manager: npm
source_paths: [apps, libs]
qa_mode: browser
fix_agent: angular-keeper
commands:
  install: npm ci
  dev: npm start
  test: npm test
  lint: npm run lint
  format_check: ''
  typecheck: ''
  build: npm run build
services: ''
---

# Stack

Angular in an Nx monorepo. First-party code lives under `apps/` and `libs/`.
No external services are needed for local QA.

## Commands

`npm start` serves the app for browser QA. Pre-push gates use `test`, `lint`, `build`.

## QA mode

`browser` — changes are verified by clicking through the UI.

## Fix agent

Framework-specific fixes are delegated to the `angular-keeper` subagent rather than
edited inline.
