---
# docs/agents/stack.md — what this project is built with and how to run it.
# Every value here is an EXAMPLE. Replace with what is true for your repo and
# delete the keys that don't apply. Skills read these keys, never literals.
language: typescript          # typescript | javascript | python | go | rust | java | kotlin | csharp | ruby | php | other
framework: ''                 # e.g. angular, nextjs, django, fastapi, spring, rails, gin — '' if none
layout: single-app            # single-app | monorepo | library | service | other
package_manager: ''           # npm | pnpm | yarn | bun | uv | poetry | pip | go | cargo | maven | gradle | bundler | composer | dotnet
source_paths: [src]           # where first-party code lives (used by dup checks, greps)
qa_mode: browser              # browser | api | cli | tui | none — how a human verifies a change
fix_agent: ''                 # subagent to delegate framework-specific fixes to ('' = fix directly)
commands:
  install: ''                 # e.g. npm ci | uv sync | go mod download | cargo fetch | mvn -q install
  dev: ''                     # starts the app/service for local QA ('' if not applicable)
  test: ''                    # e.g. npm test | pytest | go test ./... | cargo test | mvn test
  lint: ''                    # e.g. npm run lint | ruff check . | golangci-lint run | cargo clippy
  format_check: ''            # e.g. prettier --check . | ruff format --check . | gofmt -l . ('' to skip)
  typecheck: ''               # e.g. tsc --noEmit | mypy . ('' if folded into build or n/a)
  build: ''                   # e.g. npm run build | go build ./... | cargo build --release | mvn package
services: ''                  # command that brings up deps (db, queue) for local QA, e.g. 'docker compose up -d' ('' = none)
---

# Stack

Describe in one or two lines what this project is and where its code lives, so an
agent reading only this file has enough context. Example:

> **Framework:** FastAPI service, single app. First-party code lives under `src/`.
> Postgres and Redis come up via `docker compose up -d`.

## Commands

Skills use the `commands` map instead of hardcoding a runner. Leave a command empty
rather than inventing one — a skill that finds an empty command skips that step and
says so, which is better than running the wrong thing.

- `commands.dev` — used by qa-local to serve the app. Empty for libraries.
- `commands.test` / `lint` / `build` — used as pre-push gates.
- `services` — run before `dev` when local QA needs a database or broker.

## QA mode

`qa_mode` tells qa-local how a human verifies this project:

| value     | how the skill guides you                                                  |
|-----------|---------------------------------------------------------------------------|
| `browser` | start `commands.dev`, walk through UI steps in the browser                 |
| `api`     | start the service, exercise endpoints with `curl`/`httpie`, assert responses|
| `cli`     | build/install the binary, run commands with sample input, check output      |
| `tui`     | run the interface, walk through key flows                                   |
| `none`    | no manual QA — rely on the automated gates only                             |

## Fix agent

When a skill needs framework-specific code changes, it delegates to the `fix_agent`
subagent if one is set. Most repos have none — leave it `''` and fixes happen inline.

## Worked examples

<details><summary>TypeScript / Angular / Nx monorepo</summary>

```yaml
language: typescript
framework: angular
layout: monorepo
package_manager: npm
source_paths: [apps, libs]
qa_mode: browser
fix_agent: angular-keeper
commands: { install: npm ci, dev: npm start, test: npm test, lint: npm run lint, build: npm run build }
```
</details>

<details><summary>Python / FastAPI service</summary>

```yaml
language: python
framework: fastapi
layout: service
package_manager: uv
source_paths: [src]
qa_mode: api
commands:
  install: uv sync
  dev: uv run uvicorn app.main:app --reload
  test: uv run pytest
  lint: uv run ruff check .
  format_check: uv run ruff format --check .
  typecheck: uv run mypy src
  build: ''
services: docker compose up -d
```
</details>

<details><summary>Go CLI</summary>

```yaml
language: go
layout: single-app
package_manager: go
source_paths: [cmd, internal, pkg]
qa_mode: cli
commands:
  install: go mod download
  dev: ''
  test: go test ./...
  lint: golangci-lint run
  build: go build ./...
```
</details>

<details><summary>Java / Spring Boot</summary>

```yaml
language: java
framework: spring
layout: service
package_manager: maven
source_paths: [src/main/java]
qa_mode: api
commands:
  install: mvn -q -DskipTests install
  dev: mvn spring-boot:run
  test: mvn test
  lint: mvn -q checkstyle:check
  build: mvn -q package
```
</details>

<details><summary>Rust library</summary>

```yaml
language: rust
layout: library
package_manager: cargo
source_paths: [src]
qa_mode: none
commands: { install: cargo fetch, dev: '', test: cargo test, lint: cargo clippy -- -D warnings, build: cargo build --release }
```
</details>
