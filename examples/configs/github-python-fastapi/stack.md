---
language: python
framework: fastapi
layout: service
package_manager: uv
source_paths: [src]
qa_mode: api
fix_agent: ''
commands:
  install: uv sync
  dev: uv run uvicorn app.main:app --reload --port 8000
  test: uv run pytest
  lint: uv run ruff check .
  format_check: uv run ruff format --check .
  typecheck: uv run mypy src
  build: ''
services: docker compose up -d
---

# Stack

FastAPI HTTP service, single app. First-party code lives under `src/`. Postgres and
Redis come up with `docker compose up -d` and must be running before `dev`.

## Commands

There is no build step — the service runs from source. `typecheck` and `format_check`
are separate gates because CI runs them separately.

## QA mode

`api` — changes are verified by calling endpoints. Base URL for local QA is
`http://localhost:8000`; interactive docs at `/docs`.

## Fix agent

None. Fixes are made inline.
