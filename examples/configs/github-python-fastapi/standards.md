---
scope: changed-lines
---

# Standards

The reviewer holds every change to these. The builder never reads this file.

- **P1** `judgment` — Route handlers validate input with a Pydantic model, never by
  hand. *Why: hand validation drifts from the OpenAPI schema.*
- **P2** `mechanical` — No `print()` under `src/`; use the module logger.
  *Why: prints bypass log levels and structured output.*
- **P3** `judgment` — Database access goes through `src/app/repositories/`, not from
  handlers. *Why: transactions are managed in one place.*
- **P4** `judgment` — A new endpoint has a test for the happy path and one for its
  main error response. *Why: the error contract is part of the API.*
