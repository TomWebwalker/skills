---
# docs/agents/topology.md — how this repo relates to its sibling UI/API.
# Knowledge source for /loop (and any skill that needs the other half of a split stack).
# Every value is an EXAMPLE. Replace with what is true for your repo.
role: full-stack              # full-stack | frontend | backend | standalone
companion:
  kind: ''                    # api | ui | '' — set when role is frontend or backend
  path: ''                    # local path to the sibling repo (relative or absolute)
  url: ''                     # remote fallback if the local path is missing
---

# Topology

Say in one line what this repo owns and, if split, where the other half lives.

> **Role:** frontend. API lives at `../pc-backend` (fallback:
> `https://github.com/org/pc-backend`).

## Roles

| value        | meaning                                                                 |
|--------------|-------------------------------------------------------------------------|
| `full-stack` | UI and API (or all surfaces) live in this repo — no companion needed    |
| `frontend`   | UI only — API contracts, schemas, and handlers live in `companion`      |
| `backend`    | API/service only — screens and client flows live in `companion`         |
| `standalone` | Self-contained (CLI, library, infra) — no UI/API sibling                 |

`full-stack` and `standalone` both mean: skip companion lookups. Prefer
`standalone` when "full-stack" would be misleading (a Go CLI is not a full-stack app).

## Companion

Required when `role` is `frontend` or `backend`:

- `kind: api` — the sibling is the backend/API (typical for a frontend repo)
- `kind: ui` — the sibling is the frontend/UI (typical for a backend repo)
- `path` — prefer a local checkout so skills can read OpenAPI specs, route files,
  DTOs, or screens without cloning
- `url` — used only when `path` does not exist on disk

Leave `companion` empty (`kind`/`path`/`url` all `''`) for `full-stack` and
`standalone`.

## How skills use this

`/loop` reads this file before building. If the role is `full-stack` or
`standalone`, it ignores the companion step. Otherwise, when the current task needs
knowledge of the other half (request/response shapes, auth headers, screen flows,
feature flags owned elsewhere), it opens the companion repo at `path` (or clones/
fetches via `url`) and pulls only what the brief requires — it does not implement
in the companion unless the user asked to.

## Worked examples

<details><summary>Full-stack monorepo</summary>

```yaml
role: full-stack
companion: { kind: '', path: '', url: '' }
```
</details>

<details><summary>Frontend repo with a sibling API</summary>

```yaml
role: frontend
companion:
  kind: api
  path: ../pc-backend
  url: https://github.com/org/pc-backend
```
</details>

<details><summary>Backend service with a sibling UI</summary>

```yaml
role: backend
companion:
  kind: ui
  path: ../pc-frontend
  url: https://github.com/org/pc-frontend
```
</details>

<details><summary>Go CLI (no sibling)</summary>

```yaml
role: standalone
companion: { kind: '', path: '', url: '' }
```
</details>
